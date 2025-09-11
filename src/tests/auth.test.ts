import { it, describe, expect } from "vitest"
import { createFetch } from "./utils/auth.js"
import { createUser } from "./seeders/user.js"
import app from "@/app.js"
describe("auth", () => {
  it("should fail to fetch protected route without auth", async () => {

    const res = await app.request("/product", {
      method: "GET",
    })

    expect(res.status).toBe(401)
  })

  it("should successfully fetch protected route with auth", async () => {
    const user = await createUser()

    const fetch = await createFetch({
      email: user.email,
      password: user.password,
    })

    const res = await fetch("/product", {
      method: "GET",
    })

    expect(res.status).toBe(200)
  })
})
