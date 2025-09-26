import { boss } from "@/lib/job.js"
import { logger } from "@/lib/logger.js"
import { z } from "zod"

//define job
export const welcomeEmailJob = boss
  .define("product-job")
  .input(
    z.object({
      message: z.string().min(1),
    })
  )
  .workOptions({
    batchSize: 3,
    pollingIntervalSeconds: 1,
  })
  .handle(async (jobs) => {
    await Promise.all(
      jobs.map(async (job) => {
        logger.info("[worker] start job")
        logger.info(job.data, "job data")
        await new Promise((resolve) => setTimeout(resolve, 1000 * 5))
      })
    )
  })
