import { createJob } from "@/lib/job.js"
import { z } from "zod"

// Define schemas outside for reusability and better organization
const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string(),
  priority: z.number().optional()
})

// Infer types from schemas for better type safety
type EmailJobData = z.infer<typeof emailSchema>

// Create a job with type-safe input and handler
const emailJob = createJob("send_email")
  .input(emailSchema)
  .handle(async (jobs) => {
    for (const job of jobs) {
      // job.data is fully typed based on the zod schema
      console.log(`Sending email to ${job.data.to}`)
      console.log(`Subject: ${job.data.subject}`)
      console.log(`Body: ${job.data.body}`)
      if (job.data.priority) {
        console.log(`Priority: ${job.data.priority}`)
      }
    }
  })

// Usage examples:

// Send a job (with full type safety and autocomplete)
export async function sendWelcomeEmail(userEmail: string) {
  // The data parameter is now fully typed as EmailJobData
  const emailData: EmailJobData = {
    to: userEmail,
    subject: "Welcome!",
    body: "Welcome to our platform!",
    priority: 1
  }

  await emailJob.send(emailData)
}

// Start the worker
export async function startEmailWorker() {
  return emailJob.worker()
}

// Export the job for use elsewhere
export { emailJob }
