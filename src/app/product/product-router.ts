import { Hono } from "hono"
import { checkAuth } from "@/lib/auth.js"

import * as productService from "./product-service.js"
import type { AuthenticatedContext } from "@/lib/context.js"
const router = new Hono<AuthenticatedContext>()

router.use(checkAuth)

router.get("/", async (c) => {
  const { page, limit, keyword } = c.req.query()
  const result = await productService.list({ page, limit, keyword })
  return c.json(result)
})

router.post("/", async (c) => {
  const body = await c.req.json()
  const user = c.get("user")
  const data = await productService.create(user.id, body)
  return c.json({ message: "Successfully create data", data }, 201)
})

router.get("/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"))
  const product = await productService.detail(id)
  return c.json(product)
})

export default router
