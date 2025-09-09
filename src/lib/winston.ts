import winston from "winston"
import { createMiddleware } from "hono/factory"


export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ]
})



export const HttpLog = createMiddleware(async (c, next) => {
  const startTime = Date.now()
  await next()
  const responseTime = Date.now() - startTime
  const res = c
    ? {
        statusCode: c.res.status,
      }
    : undefined

  if (c.error) {
    logger.error("request errored", { res, err: c.error, responseTime })
    return
  }

  logger.info("request completed", { res, responseTime })
})
