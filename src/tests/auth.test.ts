import app from "@/app.js"
import { createUser } from "./seeders/user.js"
import { expect, it, describe, beforeAll, afterAll } from "vitest"
import { db } from "@/lib/db/index.js"

beforeAll(() => {})

describe("authentication", () => {
  it("should successfully login with valid credentials", async () => {
    // arrange
    const user = await createUser()
    // act
    const loginResponse = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    })

    const loginBody = await loginResponse.json() as any

    // assert
    expect(loginBody).toHaveProperty("token")

    // profile
    const profileResponse = await app.request("/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    })

    const profileBody = await profileResponse.json() as any

    // assert profile response
    expect(user.name).toBe(profileBody.name)
    expect(user.email).toBe(profileBody.email)
  })

  it("should reject login with invalid credentials", async () => {
    const response = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "invalid@example.com",
        password: "Password123*",
      }),
    })

    const body = await response.json()

    expect(body).toHaveProperty("message")
    expect(response.status).toBe(401)
  })
})

afterAll(async () => {
  await db.destroy()
})