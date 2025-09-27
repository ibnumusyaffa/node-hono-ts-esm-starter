import { boss } from "@/lib/job.js"
import { logger } from "@/lib/logger.js"
import { z } from "zod"

//define job
export const welcomeEmailJob = boss
  .createJob("job-11")
  .input(
    z.object({
      message: z.string().min(1),
    })
  )
  .workOptions({
    batchSize: 3,
    pollingIntervalSeconds: 1,
  })
  .handle(async (job) => {
    logger.info("[worker] start job")
  })

export const newsletterSchedule = boss.createSchedule(
  "newsletter",
  "* * * * *",
  async (_job) => {
    logger.info("B:Start")
    await new Promise((resolve) => setTimeout(resolve, 1000 * 3))
    logger.info("B:Completed")
  },
  {
    tz: "Asia/Jakarta",
  }
)
