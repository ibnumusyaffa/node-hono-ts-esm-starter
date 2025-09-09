import { Hono } from "hono"
import { NotFoundError } from "@/lib/error.js"
import { TransactionManager } from "@/lib/db/index.js"
import { logger } from "@/lib/logger.js"
import { checkAuth } from "@/lib/auth.js"

import { UserService } from "./user-service.js"
import { UserRepository } from "./user-repository.js"

const userRepository = new UserRepository()
const transactionManager = new TransactionManager()
const userService = new UserService(userRepository, transactionManager)

const r = new Hono()

r.use(checkAuth)

r.get("/", async (c) => {
  logger.info("list users")
  const { page, limit, keyword } = c.req.query()
  const result = await userService.list(page, limit, keyword)
  return c.json(result)
})

r.post("/", async (c) => {
  const body = await c.req.json()
  const { name, email, password } = body
  await userService.create({ name, email, password })
  return c.json({ message: "Successfully create data" }, 201)
})

r.get("/:id", async (c) => {
  const userId = Number.parseInt(c.req.param("id"))
  const user = await userService.detail(userId)
  if (!user) {
    throw new NotFoundError("User not found")
  }
  return c.json(user)
})

export default r
