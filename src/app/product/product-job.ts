import { boss } from "@/lib/job.js"
import { logger } from "@/lib/logger.js"
import { z } from "zod"
import { delay } from "es-toolkit"
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
  async () => {
    logger.info("B:Start")
    await delay(1000)
    logger.info("B:Completed")
  },
  {
    tz: "Asia/Jakarta",
  }
)
