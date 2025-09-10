import { Hono } from "hono"
import { NotFoundError } from "@/lib/error.js"
import { checkAuth } from "@/lib/auth.js"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import * as productService from "./product-service.js"


const router = new Hono()

router.use(checkAuth)


const productSchema = z.object({
  name: z.string(),
})


router.get("/", async (c) => {
  const { page, limit, keyword } = c.req.query()
  const result = await productService.list(page, limit, keyword)
  return c.json(result)
})

router.post("/", zValidator("json", productSchema), async (c) => {
  const body = c.req.valid("json")
  await productService.create(body)
  return c.json({ message: "Successfully create data" }, 201)
})

router.get("/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"))
  const product = await productService.detail(id)
  if (!product) {
    throw new NotFoundError("Product not found")
  }
  return c.json(product)
})




export default router
