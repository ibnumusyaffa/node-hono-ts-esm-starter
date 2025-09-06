import "dotenv/config"

import { Hono } from "hono"
import { logger, HttpLog } from "@/common/logger.js"
import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { z } from "zod"
import { HTTPError } from "@/common/error.js"
import { contextStorage } from "@/common/context-storage.js"
import { otel } from "@hono/otel"

import userRouter from "@/app/users/user-router.js"
import authRouter from "@/app/auth/auth-router.js"
import env from "@/config/env.js"

import { tasks } from "@trigger.dev/sdk"
import type { firstScheduledTask } from "@/trigger/example.js"
import { trace } from "@opentelemetry/api"
import { routePath } from "hono/route"

const app = new Hono()

//standard middleware

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
  await tasks.trigger<typeof firstScheduledTask>("first-scheduled-task", {
    seconds: 10,
  })

  logger.info("hello from root")
  return c.json({ message: "hello" })
})

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
