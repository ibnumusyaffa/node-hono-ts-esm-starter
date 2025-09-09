import { betterAuth } from "better-auth"
import { createPool } from "mysql2/promise"
import { createMiddleware } from "hono/factory"
import env from "@/config/env.js"
import { UnauthorizedError } from "@/lib/error.js"

export const auth = betterAuth({
  database: createPool(env.DATABASE_URL),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
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
