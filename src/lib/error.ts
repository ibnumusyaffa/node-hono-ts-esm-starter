/* eslint-disable unicorn/no-useless-error-capture-stack-trace */
import env from "@/config/env.js"
import { type Context } from "hono"
import { type ContentfulStatusCode } from "hono/utils/http-status"
import { z } from "zod/v4"

export class HTTPError extends Error {
  statusCode: ContentfulStatusCode

  constructor(message: string, statusCode: ContentfulStatusCode) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class BadRequestError extends HTTPError {
  constructor(message: string = "Bad Request") {
    super(message, 400)
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(message: string = "Unauthorized") {
    super(message, 401)
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message: string = "Forbidden") {
    super(message, 403)
  }
}

export class NotFoundError extends HTTPError {
  constructor(message: string = "Not Found") {
    super(message, 404)
  }
}

export class ValidationError extends HTTPError {
  constructor(message: string = "Unprocessable Entity") {
    super(message, 422)
  }
}

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root"

    if (!errors[path]) {
      errors[path] = []
    }

    const message = issue.message
    errors[path].push(message)
  }

  return errors
}

export function errorHandler(error: Error, c: Context) {
  if (error instanceof z.ZodError) {
    return c.json(
      { message: "Validation error", errors: formatZodErrors(error) },
      422
    )
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
}
