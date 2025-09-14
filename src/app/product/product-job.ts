import { createJob } from "@/lib/job.js"
import { z } from "zod"

export const welcomeEmailJob = createJob("welcome_email")
  .input(
    z.object({
      message: z.string().min(1),
    })
  )
  .handle(async (jobs) => {
    for (const job of jobs) {
      console.log("[worker] processing job", job.name, "with data:", job.data)
    }
  })
