import pino from "pino"
import { type Context } from "hono"
import { createMiddleware } from "hono/factory"

const serializeRes = (c: Context) => ({
  statusCode: c.res.status,
})


export const logger = pino()

export const HttpLog = createMiddleware(async (c, next) => {
  const startTime = Date.now()
  await next()
  const responseTime = Date.now() - startTime
  const res = c ? serializeRes(c) : undefined

  if (c.error) {
    logger.error({ res, err: c.error, responseTime }, "request errored pino")
    return
  }

  logger.info({ res, responseTime }, "request completed pino")
})
