import { Hono } from "hono"
import { logger, HttpLog } from "@/common/logger.js"
import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { z } from "zod"
import { HTTPError, ValidationError } from "@/common/error.js"
import { contextStorage } from "@/common/context-storage.js"
import { otel } from "@hono/otel"

import userRouter from "@/app/users/user-router.js"
import authRouter from "@/app/auth/auth-router.js"
import env from "@/config/env.js"

import { trace } from "@opentelemetry/api"
import { routePath } from "hono/route"
import { auth } from "@/lib/auth.js"

const app = new Hono()


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
app.use(contextStorage)
app.use(HttpLog)
app.use(cors())

//features routes
app.get("/", async (c) => {
  logger.info("hello from root")
  return c.json({ message: "hello" })
})

app.get("/error", async (c) => {
  throw new Error("sample error")
  return c.json({ message: "hello" })
})

app.get("/validation-error", async (c) => {
  throw new ValidationError("sample error")
  return c.json({ message: "hello" })
})

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.route("/users", userRouter)
app.route("/auth", authRouter)

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
