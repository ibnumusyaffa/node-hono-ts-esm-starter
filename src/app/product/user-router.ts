import { Hono } from "hono"
import { NotFoundError } from "@/lib/error.js"
import { checkAuth } from "@/lib/auth.js"

import * as userService from "./user-service.js"

const r = new Hono()

r.use(checkAuth)

r.get("/", async (c) => {
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
