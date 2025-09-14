import { boss } from "@/lib/boss.js"
import { z } from "zod"
import type { Job } from "pg-boss"

export class JobBuilder<TInput = never> {
  private jobName: string
  private schema?: z.ZodSchema<TInput>
  private handler?: (jobs: Array<Job<TInput>>) => Promise<void>

  constructor(jobName: string) {
    this.jobName = jobName
  }

  input<T>(schema: z.ZodSchema<T>): JobBuilder<T> {
    const newBuilder = new JobBuilder<T>(this.jobName)
    newBuilder.schema = schema
    return newBuilder
  }

  handle(handler: (jobs: Array<Job<TInput>>) => Promise<void>): JobBuilder<TInput> {
    this.handler = handler
    return this
  }

  async send(data: TInput): Promise<string | null> {
    if (!this.schema) {
      throw new Error(`Job "${this.jobName}" requires input schema to be defined`)
    }
    
    const validatedData = await this.schema.parseAsync(data)
    return boss.send(this.jobName, validatedData)
  }

  async worker(): Promise<string> {
    if (!this.handler) {
      throw new Error(`Job "${this.jobName}" requires handler to be defined`)
    }
    if (!this.schema) {
      throw new Error(`Job "${this.jobName}" requires input schema to be defined`)
    }

    return boss.work<TInput>(this.jobName, async (jobs) => {
      // Validate all job data before processing
      const validatedJobs = await Promise.all(
        jobs.map(async (job) => ({
          ...job,
          data: await this.schema!.parseAsync(job.data)
        }))
      )
      
      await this.handler!(validatedJobs)
    })
  }
}

export function createJob(jobName: string): JobBuilder {
  return new JobBuilder(jobName)
}
