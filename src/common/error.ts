import { StatusCode } from "hono/utils/http-status"

export class HTTPError extends Error {
  statusCode: StatusCode

  constructor(message: string, statusCode: StatusCode) {
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
