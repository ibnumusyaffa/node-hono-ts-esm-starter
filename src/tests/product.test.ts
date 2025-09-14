import { it, describe, expect } from "vitest"
import { createFetch } from "./utils/auth.js"
import { createUser } from "./seeders/user.js"

describe("product", () => {
  it("should successfully create product with valid data", async () => {
    const user = await createUser()

    const fetch = await createFetch({
      email: user.email,
      password: user.password,
    })

    const res = await fetch("/product", {
      method: "POST",
      body: JSON.stringify({ name: "Product 1" }),
    })

    expect(res.status).toBe(201)
    expect({ name: "Product 1" }).toHaveRowInTable("product")
  })

  it("should fail to create product with invalid data", async () => {
    const user = await createUser()

    const fetch = await createFetch({
      email: user.email,
      password: user.password,
    })

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
