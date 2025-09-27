import { z } from "zod"
import pgBoss from "pg-boss"
import env from "@/config/env.js"
import type { Job as JobData, SendOptions, WorkOptions } from "pg-boss"
import { logger } from "./logger.js"
import {
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  propagation,
} from "@opentelemetry/api"

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
    logger.warn({ error }, "Failed to inject trace context")
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
      `job.send ${this.jobName}`,
      {
        kind: SpanKind.PRODUCER,
        attributes: {
          "job.name": this.jobName,
          "job.data": JSON.stringify(validatedData),
        },
      },
      async (span) => {
        try {
          logger.info(validatedData, `Sending job ${this.jobName} with data`)

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

  async worker(): Promise<string> {
    await this.boss.createQueue(this.jobName)

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
          `job.execute ${this.jobName}`,
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

export class Boss<T extends z.ZodType> {
  readonly boss: pgBoss
  jobs: Job<T>[]
  private schedules: any[] = []

  constructor(connection: string) {
    this.boss = new pgBoss({
      connectionString: connection,
    })
    this.jobs = []
  }

  register(newJob: Job<T>) {
    const isJobExists = this.jobs.find(
      (item) => item.jobName === newJob.jobName
    )

    if (isJobExists) {
      logger.warn("job name already exists")
      return this
    }

    this.jobs.push(newJob)

    return this
  }

  define(jobName: string): JobBuilder {
    return new JobBuilder(this.boss, jobName)
  }

  async start() {
    await this.boss.start()
    await Promise.all([
      ...this.jobs.map((job) => job.worker()),
      ...this.schedules.map((schedule) => schedule()),
    ])
  }

  async schedule(
    name: string,
    cron: string,
    handler: pgBoss.WorkHandler<unknown>
  ) {
    let newSchedule = async () => {
      logger.info(`Scheduling job ${name} with cron ${cron}`)
      await this.boss.unschedule(name)
      await this.boss.createQueue(name)
      await this.boss.schedule(name, cron, undefined, { retryLimit: 0 })

      // Wrap scheduled job handler with OpenTelemetry tracing
      await this.boss.work(name, async (job) => {
        const tracer = trace.getTracer("job-queue")

        return tracer.startActiveSpan(
          `scheduled.job.execute ${name}`,
          {
            kind: SpanKind.CONSUMER,
            attributes: {
              "job.name": name,
              "job.id": (job as any).id,
              "job.type": "scheduled",
              "job.cron": cron,
              "job.attempt": ((job as any).retryCount || 0) + 1,
              "job.data": JSON.stringify((job as any).data),
            },
          },
          async (span) => {
            try {
              await handler(job)

              span.setStatus({ code: SpanStatusCode.OK })
              logger.info(
                `Scheduled job ${name} (${(job as any).id}) completed successfully`
              )
            } catch (error) {
              span.recordException(error as Error)
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: (error as Error).message,
              })
              logger.error(
                error as Error,
                `Scheduled job ${name} (${(job as any).id}) failed`
              )
              throw error
            } finally {
              span.end()
            }
          }
        )
      })
    }

    this.schedules.push(newSchedule)
  }
}

export const boss = new Boss(env.DATABASE_URL)
