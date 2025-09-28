import { Hono } from "hono"
import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { otel } from "@hono/otel"
import { routePath } from "hono/route"
import { trace } from "@opentelemetry/api"
import { logger, HttpLog } from "@/lib/logger.js"
import { errorHandler } from "@/lib/error.js"
import { auth } from "@/lib/auth.js"

import product from "@/app/product/product-router.js"
import upload from "@/app/upload/upload-router.js"

const app = new Hono()

//rename http instrumentation name to "METHOD /path:id" format
app.use(async (c, next) => {
  const result = await next()
  const span = trace.getActiveSpan()
  if (span) {
    span.updateName(`${c.req.method} ${routePath(c)}`)
  }
  return result
})

app.use("*", otel())
app.use("*", requestId())
app.use(HttpLog)
app.use(cors())

//auth
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
app.get("/", async (c) => {
  logger.info("hello from root")
  return c.json({ message: "hello" })
})

app.route("/product", product)

app.route("/file", upload)

app.onError(errorHandler)

export default app
