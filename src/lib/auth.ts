import { betterAuth } from "better-auth"
import { createMiddleware } from "hono/factory"
import env from "@/config/env.js"
import { UnauthorizedError } from "@/lib/error.js"
import { Pool } from "pg"
import { send as sendVerifyEmail } from "@/emails/verify-email.js"
import { send as sendResetPasswordEmail } from "@/emails/reset-password-email.js"

export const auth = betterAuth({
  logger: {
    disabled: env.NODE_ENV === "test",
  },
  database: new Pool({ connectionString: env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        to: user.email,
        url: url,
        name: user.name,
      })
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerifyEmail({
        to: user.email,
        name: user.name,
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
