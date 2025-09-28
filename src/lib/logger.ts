import { pino } from "pino"
import { type Context } from "hono"
import { createMiddleware } from "hono/factory"
import { routePath } from "hono/route"

import env from "@/config/env.js"

const serializeReq = (c: Context) => ({
  method: c.req.method,
  route: routePath(c),
  requestId: c.get("requestId"),
  userAgent: c.req.header("user-agent"),
  ip: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
})

const serializeRes = (c: Context) => ({
  statusCode: c.res.status,
})

export const logger = pino({ enabled: env.NODE_ENV !== "test" })

export const HttpLog = createMiddleware(async (c, next) => {
  const startTime = Date.now()
  await next()
  const duration = Date.now() - startTime
  const res = serializeRes(c)
  const req = serializeReq(c)

  if (c.error) {
    const payload = { res, req, duration, error: c.error.message }
    const message = `${req.method} ${req.route} failed in ${duration}ms with status code ${res.statusCode}`

    if (res.statusCode < 500) {
      logger.warn(payload, message)
      return
    }

    logger.error(payload, message)
    return
  }

  logger.info(
    { res, req, duration },
    `${req.method} ${req.route} completed in ${duration}ms with status code ${res.statusCode}`
  )

  logger.info({ test: "t" }, "hhh")
})
