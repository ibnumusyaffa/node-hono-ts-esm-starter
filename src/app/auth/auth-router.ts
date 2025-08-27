import { Hono } from "hono"
import { AuthService } from "./auth-service.js"
import { AuthRepository } from "./auth-repository.js"
import { TransactionManager } from "@/common/database/index.js"
import { checkAuth, type Payload } from "@/common/auth.js"
import { UnauthorizedError } from "@/common/error.js"
import env from "@/config/env.js"

const router = new Hono()

const authRepo = new AuthRepository()
const transactionManager = new TransactionManager()
const authService = new AuthService(authRepo, transactionManager)

router.post("/login", async (c) => {
  const { email, password } = await c.req.json()
  const token = await authService.login(email, password)
  return c.json({ token })
})

router.get("/profile", checkAuth(), async (c) => {
  const payload = c.get("jwtPayload") as Payload

  if (!payload.userId) {
    throw new UnauthorizedError()
  }
  const user = await authService.getProfile(payload.userId)
  return c.json(user)
})

router.post("/forgot-password", async (c) => {
  const { email } = await c.req.json()
  const token = await authService.forgotPassword(email)
  return c.json({
    token: env.NODE_ENV === "test" ? token : "",
    message: "We'll send a reset email if the account existss",
  })
})

router.post("/reset-password", async (c) => {
  const { token, email, password } = await c.req.json()
  await authService.resetPassword(email, token, password)
  return c.json({ message: "Successfully updated the password" })
})

export default router
