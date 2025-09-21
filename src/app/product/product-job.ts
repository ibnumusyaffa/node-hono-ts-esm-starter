import { createJob } from "@/lib/job.js"
import { logger } from "@/lib/logger.js"
import { z } from "zod"

export const welcomeEmailJob = createJob("welcome_email")
  .input(
    z.object({
      message: z.string().min(1),
    })
  )
  .handle(
    async (jobs) => {
      await Promise.all(
        jobs.map(async (job) => {
          logger.info(job, "[worker] start job")
          await new Promise((resolve) => setTimeout(resolve, 1000 * 5))
          if (Math.random() < 0.5) {
            throw new Error("test")
          }
          logger.info(job, "[worker] completed job")
        })
      )
    },
    {
      batchSize: 3,
      pollingIntervalSeconds: 1,
    }
  )
