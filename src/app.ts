import { Hono } from "hono"
import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { contextStorage } from 'hono/context-storage'
import { otel } from "@hono/otel"
import { routePath } from "hono/route"
import { z } from "zod"
import { trace } from "@opentelemetry/api"

import env from "@/config/env.js"

import { logger, HttpLog } from "@/lib/logger.js"
import { HTTPError } from "@/lib/error.js"
import { auth } from "@/lib/auth.js"

import user from "@/app/product/product-router.js"

const app = new Hono();

//rename http instrumentation name to "GET /users" format
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
app.use(contextStorage())
app.use(HttpLog)
app.use(cors())

//auth
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.get("/", async (c) => {
  logger.info("hello from root")
  return c.json({ message: "hello" })
})

app.route("/users",user)


//error handling
app.onError((error, c) => {
  if (error instanceof z.ZodError) {
    return c.json({ errors: error.flatten().fieldErrors }, 422)
  }

  if (error instanceof HTTPError) {
    return c.json({ message: error.message }, error.statusCode)
  }

  return c.json(
    {
      message: "Internal server error",
      error: env.APP_DEBUG
        ? {
            message: error.message,
            stack: error.stack?.split("\n").map((item) => item.trim()),
          }
        : undefined,
    },
    500
  )
})

export default app
