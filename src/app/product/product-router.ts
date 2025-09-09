import { Hono } from "hono"
import { NotFoundError } from "@/lib/error.js"
import { checkAuth } from "@/lib/auth.js"

import * as productService from "./product-service.js"

const r = new Hono()

r.use(checkAuth)

r.get("/", async (c) => {
  const { page, limit, keyword } = c.req.query()
  const result = await productService.list(page, limit, keyword)
  return c.json(result)
})

r.post("/", async (c) => {
  const body = await c.req.json()
  const { name } = body
  await productService.create({ name })
  return c.json({ message: "Successfully create data" }, 201)
})

r.get("/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"))
  const product = await productService.detail(id)
  if (!product) {
    throw new NotFoundError("Product not found")
  }
  return c.json(product)
})

export default r
