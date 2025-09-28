import { z } from "zod"
import pgBoss from "pg-boss"
import env from "@/config/env.js"
import type {
  Job as JobData,
  ScheduleOptions,
  SendOptions,
  WorkOptions,
} from "pg-boss"
import {
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  propagation,
} from "@opentelemetry/api"
import { logger } from "./logger.js"

const tracer = trace.getTracer("job-queue")

type Carrier = {
  traceparent?: string
  tracestate?: string
}

function getCurrentTraceparent(): Carrier | undefined {
  try {
    const headers: Record<string, string> = {}
    propagation.inject(context.active(), headers)
    return headers
  } catch (error) {
    return undefined
  }
}

class Job<T extends z.ZodType> {
  private boss: pgBoss
  public jobName: string
  private schema: T
  private handler: (jobs: JobData<z.infer<T>>) => Promise<void>
  private workOptions?: WorkOptions

  constructor(
    boss: pgBoss,
    jobName: string,
    schema: T,
    handler: (jobs: JobData<z.infer<T>>) => Promise<void>,
    workOptions?: WorkOptions
  ) {
    this.boss = boss
    this.jobName = jobName
    this.schema = schema
    this.handler = handler
    this.workOptions = workOptions
  }

  async send(data: z.infer<T>, options?: SendOptions): Promise<string | null> {
    const validatedData = (await this.schema.parseAsync(data)) as object

    return tracer.startActiveSpan(
      `job.producer ${this.jobName}`,
      {
        kind: SpanKind.PRODUCER,
        attributes: {
          "job.name": this.jobName,
          "job.data": JSON.stringify(validatedData),
        },
      },
      async (span) => {
        try {
          // Create job payload with traceparent (W3C standard)
          const jobPayload = {
            ...validatedData,
            __traceparent: getCurrentTraceparent(),
          }

          let jobId: string | null
          if (options) {
            jobId = await this.boss.send(this.jobName, jobPayload, options)
          } else {
            jobId = await this.boss.send(this.jobName, jobPayload)
          }

          span.setAttributes({
            "job.id": jobId || "unknown",
          })

          span.setStatus({ code: SpanStatusCode.OK })
          logger.info(`Sending job ${this.jobName}`)
          return jobId
        } catch (error) {
          span.recordException(error as Error)
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          })
          throw error
        } finally {
          span.end()
        }
      }
    )
  }

  async listen(): Promise<string> {
    const wrappedHandler = async (job: JobData<z.infer<T>>) => {
      // Extract traceparent from job data with proper typing
      const jobData = job.data as z.infer<T> & {
        __traceparent?: Carrier | undefined
      }

      const activeContext = propagation.extract(
        context.active(),
        jobData?.__traceparent
      )

      return context.with(activeContext, () => {
        return tracer.startActiveSpan(
          `job.consumer ${this.jobName}`,
          {
            kind: SpanKind.CONSUMER,
            attributes: {
              "job.name": this.jobName,
              "job.id": job.id,
              "job.data": JSON.stringify(job.data),
            },
          },
          activeContext,
          async (span) => {
            try {
              await this.handler(job)
              span.setStatus({ code: SpanStatusCode.OK })
            } catch (error) {
              span.recordException(error as Error)
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: (error as Error).message,
              })
              throw error
            } finally {
              span.end()
            }
          }
        )
      })
    }

    if (this.workOptions) {
      return this.boss.work<z.infer<T>>(
        this.jobName,
        this.workOptions,
        async (jobs) => {
          await Promise.all(
            jobs.map(async (job) => {
              await wrappedHandler(job)
            })
          )
        }
      )
    }
    return this.boss.work<z.infer<T>>(this.jobName, async (jobs) => {
      await Promise.all(
        jobs.map(async (job) => {
          await wrappedHandler(job)
        })
      )
    })
  }
}

class JobBuilder<T extends z.ZodType = z.ZodNever> {
  private jobName: string
  private schema?: T
  private boss: pgBoss
  private _workOptions?: WorkOptions

  constructor(boss: pgBoss, jobName: string) {
    this.jobName = jobName
    this.boss = boss
  }

  input<Input extends z.ZodType>(schema: Input) {
    const newBuilder = new JobBuilder<Input>(this.boss, this.jobName)
    newBuilder.schema = schema
    newBuilder._workOptions = this._workOptions
    return newBuilder
  }

  workOptions(workOptions: WorkOptions) {
    this._workOptions = workOptions
    return this
  }

  handle(handler: (jobs: JobData<z.infer<T>>) => Promise<void>): Job<T> {
    if (!this.schema) {
      throw new Error(
        `Job "${this.jobName}" requires input schema to be defined before handle`
      )
    }
    return new Job(
      this.boss,
      this.jobName,
      this.schema,
      handler,
      this._workOptions
    )
  }
}

class Schedule {
  private boss: pgBoss
  private name: string
  private cron: string
  private handler: (job: JobData<unknown>) => Promise<any>
  private options?: ScheduleOptions

  constructor(
    boss: pgBoss,
    name: string,
    cron: string,
    handler: (job: JobData<unknown>) => Promise<any>,
    options?: ScheduleOptions
  ) {
    this.boss = boss
    this.name = name
    this.cron = cron
    this.handler = handler
    this.options = options
  }

  async listen(): Promise<void> {
    await this.boss.unschedule(this.name)
    await this.boss.createQueue(this.name)
    await this.boss.schedule(this.name, this.cron, undefined, this.options)

    // Wrap scheduled job handler with OpenTelemetry tracing
    await this.boss.work(this.name, { batchSize: 1 }, async ([job]) => {
      return tracer.startActiveSpan(
        `job.scheduled ${this.name}`,
        {
          kind: SpanKind.INTERNAL,
          attributes: {
            "job.name": this.name,
            "job.cron": this.cron,
          },
        },
        async (span) => {
          try {
            if (!job) {
              throw new Error("Job is undefined")
            }

            await this.handler(job)
            span.setStatus({ code: SpanStatusCode.OK })
          } catch (error) {
            span.recordException(error as Error)
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error).message,
            })
            throw error
          } finally {
            span.end()
          }
        }
      )
    })
  }

  get jobName(): string {
    return this.name
  }
}

export class Boss<T extends z.ZodType> {
  private boss: pgBoss
  private jobs: Job<T>[]
  private schedule: Schedule[] = []
  private queues: string[] = []

  constructor(connection: string) {
    this.boss = new pgBoss({
      connectionString: connection,
    })
    this.jobs = []
  }

  mountWorker(job: Job<T> | Schedule) {
    if (job instanceof Schedule) {
      const existingJob = this.schedule.find(
        (item) => item.jobName === job.jobName
      )

      if (existingJob) {
        throw new Error(`Scheduled job ${job.jobName} already exists`)
      }

      this.schedule.push(job)
    } else {
      const isJobExists = this.jobs.find((item) => item.jobName === job.jobName)

      if (isJobExists) {
        throw new Error(`Job ${job.jobName} already exists`)
      }

      this.jobs.push(job)
    }

    return this
  }

  createJob(jobName: string): JobBuilder {
    this.queues.push(jobName)
    return new JobBuilder(this.boss, jobName)
  }

  async start() {
    await this.boss.start()
    await Promise.all(this.queues.map((item) => this.boss.createQueue(item)))
    await Promise.all([
      ...this.jobs.map((item) => item.listen()),
      ...this.schedule.map((item) => item.listen()),
    ])
  }

  createSchedule(
    name: string,
    cron: string,
    handler: (job: JobData<unknown>) => Promise<any>,
    options?: ScheduleOptions
  ): Schedule {
    return new Schedule(this.boss, name, cron, handler, options)
  }
}

export const boss = new Boss(env.DATABASE_URL)
