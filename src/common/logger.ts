import { pino } from "pino"
import { type Context } from "hono"
import { createMiddleware } from "hono/factory"
import { getContext } from "./context-storage.js"
import env from "@/config/env.js"

const serializeReq = (c: Context) => ({
  id: c.get("requestId"),
  method: c.req.method,
  url: c.req.url,
  query: c.req.query(),
  headers: c.req.header(),
})

const serializeRes = (c: Context) => ({
  statusCode: c.res.status,
})

export const logger = pino({
  enabled: env.LOG,
  redact: {
    paths: ["req.headers"],
    censor: "**censored**",
  },
  mixin: () => {
    const c = getContext()
    return {
      req: c ? serializeReq(c) : undefined,
    }
  },
})

export const HttpLog = createMiddleware(async (c, next) => {
  const startTime = Date.now()
  await next()
  const responseTime = Date.now() - startTime
  const res = c ? serializeRes(c) : undefined

  if (c.error) {
    logger.error({ res, err: c.error, responseTime }, "request errored")
    return
  }

  logger.info({ res, responseTime }, "request completed")
})
