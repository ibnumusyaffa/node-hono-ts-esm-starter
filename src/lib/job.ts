import { boss } from "@/lib/boss.js"
import { z } from "zod"
import type { Job, SendOptions, WorkOptions } from "pg-boss"

export class ConfiguredJob<T extends z.ZodType> {
  private jobName: string
  private schema: T
  private handler: (jobs: Array<Job<z.infer<T>>>) => Promise<void>
  private workOptions?: WorkOptions

  constructor(
    jobName: string,
    schema: T,
    handler: (jobs: Array<Job<z.infer<T>>>) => Promise<void>,
    workOptions?: WorkOptions
  ) {
    this.jobName = jobName
    this.schema = schema
    this.handler = handler
    this.workOptions = workOptions
  }

  async send(data: z.infer<T>, options?: SendOptions): Promise<string | null> {
    const validatedData = await this.schema.parseAsync(data)

    if (!options) {
      return boss.send(this.jobName, validatedData as object)
    }
    return boss.send(this.jobName, validatedData as object, options)
  }

  async worker(): Promise<string> {
    if (!this.workOptions) {
      return boss.work<z.infer<T>>(this.jobName, this.handler)
    }
    return boss.work<z.infer<T>>(this.jobName, this.workOptions, this.handler)
  }
}

export class JobBuilder<T extends z.ZodType = z.ZodNever> {
  private jobName: string
  private schema?: T

  constructor(jobName: string) {
    this.jobName = jobName
  }

  input<Input extends z.ZodType>(schema: Input): JobBuilder<Input> {
    const newBuilder = new JobBuilder<Input>(this.jobName)
    newBuilder.schema = schema
    return newBuilder
  }

  handle(
    handler: (jobs: Array<Job<z.infer<T>>>) => Promise<void>,
    workOptions?: WorkOptions
  ): ConfiguredJob<T> {
    if (!this.schema) {
      throw new Error(
        `Job "${this.jobName}" requires input schema to be defined before handle`
      )
    }
    return new ConfiguredJob(this.jobName, this.schema, handler, workOptions)
  }
}

export function createJob(jobName: string): JobBuilder {
  return new JobBuilder(jobName)
}
