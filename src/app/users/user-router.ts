
import { Hono } from "hono"
import { NotFoundError } from "@/common/error.js"
import { UserService } from "./user-service.js"
import { UserRepository } from "./user-repository.js"
import { TransactionManager } from "@/common/database/index.js"
import { logger } from "@/common/logger.js"


const userRepository = new UserRepository()
const transactionManager = new TransactionManager()
const userService = new UserService(userRepository, transactionManager)


const router = new Hono()

// router.use(checkAuth())

router.get("/", async (c) => {
  logger.info("list users")
  const { page, limit, keyword } = c.req.query()
  const result = await userService.list(page, limit, keyword)
  return c.json(result)
})

router.post("/", async (c) => {
  const body = await c.req.json()
  const { name, email, password } = body
  await userService.create({ name, email, password })
  return c.json({ message: "Successfully create data" }, 201)
})

router.get("/:id", async (c) => {
  const userId = Number.parseInt(c.req.param("id"))
  const user = await userService.detail(userId)
  if (!user) {
    throw new NotFoundError("User not found")
  }
  return c.json(user)
})

export default router
