import { boss } from "@/lib/boss.js"
import { z } from "zod"

const schema = z.object({
  message: z.string().min(1),
})

type Payload = z.infer<typeof schema>

const jobName = "welcome_email"

export async function send(data: Payload) {
  const validatedData = await schema.parseAsync(data)
  await boss.send(jobName, validatedData)
}

export async function worker() {
  return boss.work<Payload>(jobName, async (jobs) => {
    for (const job of jobs) {
      // Now job.data is properly typed as Payload
      const validatedData = await schema.parseAsync(job.data)
      console.log(
        "[worker] processing job",
        job.id,
        "with data:",
        validatedData
      )
    }
  })
}
