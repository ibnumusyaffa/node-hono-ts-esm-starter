import { boss } from "@/lib/boss.js"
import { z } from "zod"
import type { Job } from "pg-boss"

export class JobBuilder<T extends z.ZodType = z.ZodNever> {
  private jobName: string
  private schema?: T
  private handler?: (jobs: Array<Job<z.infer<T>>>) => Promise<void>

  constructor(jobName: string) {
    this.jobName = jobName
  }

  input<Input extends z.ZodType>(schema: Input): JobBuilder<Input> {
    const newBuilder = new JobBuilder<Input>(this.jobName)
    newBuilder.schema = schema
    return newBuilder
  }

  handle(
    handler: (jobs: Array<Job<z.infer<T>>>) => Promise<void>
  ): JobBuilder<T> {
    this.handler = handler
    return this
  }

  async send(data: z.infer<T>): Promise<string | null> {
    if (!this.schema) {
      throw new Error(
        `Job "${this.jobName}" requires input schema to be defined`
      )
    }

    const validatedData = await this.schema.parseAsync(data)
    return boss.send(this.jobName, validatedData as object)
  }

  async worker(): Promise<string> {
    if (!this.handler) {
      throw new Error(`Job "${this.jobName}" requires handler to be defined`)
    }
    if (!this.schema) {
      throw new Error(
        `Job "${this.jobName}" requires input schema to be defined`
      )
    }

    return boss.work<z.infer<T>>(this.jobName, this.handler)
  }
}

export function createJob(jobName: string): JobBuilder {
  return new JobBuilder(jobName)
}
