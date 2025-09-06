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

  if (c.error) {
    logger.error(
      { status: c.res.status, responseTime, params: c.req.param, err: c.error },
      "request errored pino"
    )
    return
  }

  logger.info(
    { status: c.res.status, responseTime, params: c.req.param },
    "request completed pino"
  )
})
