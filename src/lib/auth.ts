import { betterAuth } from "better-auth"
import { createMiddleware } from "hono/factory"
import env from "@/config/env.js"
import { UnauthorizedError } from "@/lib/error.js"
import { Pool } from "pg"
import { sendEmail } from "@/emails/verify-email.js"

export const auth = betterAuth({
  logger: {
    disabled: env.NODE_ENV === "test",
  },
  database: new Pool({ connectionString: env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        url: url,
      })
    },
  },
})

export const checkAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    throw new UnauthorizedError()
  }

  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})
