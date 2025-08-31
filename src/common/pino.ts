import { pino, transport } from "pino"
import { type Context } from "hono"
import { createMiddleware } from "hono/factory"
import { trace } from "@opentelemetry/api"


const t = transport({
  targets: [
    {
      target: "pino-opentelemetry-transport",
      options: {
        level: "info",
      },
    },
    //transport to console
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        translateTime: "SYS:standard",
      },
    }
  ],
})

const serializeRes = (c: Context) => ({
  statusCode: c.res.status,
})

export const logger = pino(
  {
    messageKey: "message",
    mixin() {
      const span = trace.getActiveSpan()
      if (!span) return {}
      const spanContext = span.spanContext()
      return {
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
      }
    },
  },
  t
)

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
