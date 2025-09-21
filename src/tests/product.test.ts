import { it, describe, expect, test } from "vitest"
import { createFetch } from "./utils/auth.js"
import { createUser } from "./seeders/user.js"

describe("product", () => {
  describe("POST /product", () => {
    it("should successfully create product with valid data", async () => {
      const user = await createUser()
      const fetch = await createFetch(user)

      const res = await fetch("/product", {
        method: "POST",
        body: JSON.stringify({ name: "Product 1" }),
      })

      expect(res.status).toBe(201)
      expect({ name: "Product 1" }).toHaveRowInTable("product")
    })

    it("should fail to create product with invalid data", async () => {
      const user = await createUser()
      const fetch = await createFetch(user)

      const res = await fetch("/product", {
        method: "POST",
        body: JSON.stringify({ name: "a" }),
      })

      const responseBody = await res.json()
      expect(responseBody).toHaveProperty("errors", {
        name: ["Minimum 3 characters"],
      })
      expect(res.status).toBe(422)
      expect({ name: "a" }).not.toHaveRowInTable("product")
    })
  })
  describe("GET /product/:id", () => {
    it("should successfully get product detail with valid id", async () => {
      const user = await createUser()
      const fetch = await createFetch(user)

      const createResp = await fetch("/product", {
        method: "POST",
        body: JSON.stringify({ name: "Product 1" }),
      })
      const createRespBody = (await createResp.json()) as any

      const detailResp = await fetch(`/product/${createRespBody.data.id}`, {
        method: "GET",
      })
      const detailRespBody = await detailResp.json()
      expect(detailResp.status).toBe(200)
      expect(detailRespBody).toHaveProperty("name", "Product 1")
    })

    it("should fail to get product detail with invalid id", async () => {
      const user = await createUser()
      const fetch = await createFetch(user)
      const detailResp = await fetch(`/product/99999`, {
        method: "GET",
      })

      expect(detailResp.status).toBe(404)
    })
  })
})
