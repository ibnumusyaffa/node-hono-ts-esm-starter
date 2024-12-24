/* eslint-disable unicorn/no-process-exit */
import "dotenv/config"
import { logger } from "@/common/logger.js"
import { Worker } from "@/common/rabbit-mq/worker.js"
import { transporter } from "@/common/node-mailer.js"
import { Template } from "@/app/auth/email/forgot-password-email.js"
import { render } from "jsx-email"
import env from "@/config/env.js"

export type ForgotPasswordMessage = {
  name: string
  link: string
  email: string
}
export const forgotPasswordWorker = new Worker<ForgotPasswordMessage>({
  exchangeName: "forgot-password",
  queueName: "forgot-password-queue",
  handler: async (data) => {
    const html = await render(Template(data))
    await transporter.sendMail({
      from: {
        name: env.MAIL_FROM_NAME,
        address: env.MAIL_FROM_ADDRESS,
      },
      to: data.email,
      subject: "Forgot Password",
      html: html,
    })
    logger.info(`Sent forgot password email to ${data.email}`)
  },
})
