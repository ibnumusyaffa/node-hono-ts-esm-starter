import { logger } from "@/lib/logger.js"
import { boss } from "@/lib/job.js"

// boss.schedule(`newsletter-a-1`, "*/2 * * * *", async () => {
//   logger.info("A:Start")
//   await new Promise((resolve) => setTimeout(resolve, 1000 * 3))
//   throw new Error("Simulated failure")
//   logger.info("A:Completed")
// })

boss.schedule("newsletter-b-1", "*/2 * * * *", async () => {
  logger.info("B:Start")
  await new Promise((resolve) => setTimeout(resolve, 1000 * 3))
  logger.info("B:Completed")
})
