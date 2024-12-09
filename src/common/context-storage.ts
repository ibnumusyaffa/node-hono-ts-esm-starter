import { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { AsyncLocalStorage } from "node:async_hooks"

const asyncLocalStorage = new AsyncLocalStorage<Context>()

export const getContext = () => {
  const context = asyncLocalStorage.getStore()
  return context
}

export const contextStorage = createMiddleware(async (c, next) => {
  return await asyncLocalStorage.run(c, next)
})
