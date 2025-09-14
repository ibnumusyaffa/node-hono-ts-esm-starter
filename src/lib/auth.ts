import { betterAuth } from "better-auth"

import { createMiddleware } from "hono/factory"
import env from "@/config/env.js"
import { UnauthorizedError } from "@/lib/error.js"
import { Pool } from "pg"
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
