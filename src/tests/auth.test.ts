import { it, describe, afterAll, expect } from "vitest"
import { withAuthFetch } from "./utils/auth.js"
import { createUser } from "./seeders/user.js"

describe("auth", () => {
  describe("sign up", () => {
    it("should successfully sign up with valid data", async () => {
      const user = await createUser()

      const fetch = await withAuthFetch({
        email: user.email,
        password: user.password,
      })
      const res = await fetch("/product", {
        method: "GET",
      })

      expect(res.status).toBe(200)
      expect({
        email: user.email,
      }).toHaveRowInTable("user")
    })
  })
})

afterAll(async () => {
  // await db.destroy()
})
