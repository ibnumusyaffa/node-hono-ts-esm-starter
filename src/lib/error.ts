/* eslint-disable unicorn/no-useless-error-capture-stack-trace */
import { type ContentfulStatusCode } from "hono/utils/http-status"
import type z from "zod/v4"

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

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
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
