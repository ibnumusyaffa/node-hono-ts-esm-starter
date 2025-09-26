import { z } from "zod"
import pgBoss from "pg-boss"
import env from "@/config/env.js"
import type {
  Job as JobData,
  SendOptions,
  WorkOptions,
} from "pg-boss"
import { logger } from "./logger.js"

class Job<T extends z.ZodType> {
  private boss: pgBoss
  public jobName: string
  private schema: T
  private handler: (jobs: Array<JobData<z.infer<T>>>) => Promise<void>
  private workOptions?: WorkOptions

  constructor(
    boss: pgBoss,
    jobName: string,
    schema: T,
    handler: (jobs: Array<JobData<z.infer<T>>>) => Promise<void>,
    workOptions?: WorkOptions
  ) {
    this.boss = boss
    this.jobName = jobName
    this.schema = schema
    this.handler = handler
    this.workOptions = workOptions
  }

  async send(data: z.infer<T>, options?: SendOptions): Promise<string | null> {
    const validatedData = await this.schema.parseAsync(data)

    logger.info(`Sending job ${this.jobName} with data`)

    if (options) {
      return this.boss.send(this.jobName, validatedData as object, options)
    }
    return this.boss.send(this.jobName, validatedData as object)
  }

  async worker(): Promise<string> {
    await this.boss.createQueue(this.jobName)

    if (this.workOptions) {
      return this.boss.work<z.infer<T>>(
        this.jobName,
        this.workOptions,
        this.handler
      )
    }
    return this.boss.work<z.infer<T>>(this.jobName, this.handler)
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

  handle(handler: (jobs: Array<JobData<z.infer<T>>>) => Promise<void>): Job<T> {
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
    const isJobExists = this.jobs.find((item) => item.jobName === newJob.jobName)

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
      ...this.schedules.map((schedule) => schedule())
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
      await this.boss.work(name, async (job) => {
        await handler(job)
      })
    }

    this.schedules.push(newSchedule)
  }
}

export const boss = new Boss(env.DATABASE_URL)
