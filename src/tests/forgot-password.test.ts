import { expect, it, describe, vi, afterAll } from "vitest"
import { createUser } from "./seeders/user.js"
import { db } from "@/common/database/index.js"
import app from "@/app.js"

// Mock the entire module
vi.mock("@/common/rabbit-mq/publisher.js", () => ({
  Publisher: vi.fn(() => ({
    publish: vi.fn(() => {
      // console.log(
      //   `Mock publish called with exchange: ${exchange}, message: ${JSON.stringify(message)}`
      // )
    }),
  })),
}))

const loginUser = await createUser()

describe("forgot Password", () => {
  it("should send reset password email for valid user", async () => {
    // Request forgot password email
    const forgotPasswordResponse = await app.request("/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginUser.email,
      }),
    })

    const body = (await forgotPasswordResponse.json()) as any

    const token = body.token
    expect(forgotPasswordResponse.status).toBe(200)

    // Reset password with token
    const newPassword = "Something123*"
    const resetPasswordResponse = await app.request("/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginUser.email,
        token: token,
        password: newPassword,
        password_confirmation: newPassword,
      }),
    })

    expect(resetPasswordResponse.status).toBe(200)

    // Check new password with login
    const loginResponse = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginUser.email,
        password: newPassword,
      }),
    })

    expect(loginResponse.status).toBe(200)
    const loginBody = (await loginResponse.json()) as any

    expect(loginBody).toHaveProperty("token")

    // Profile
    const profileResponse = await app.request("/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    })

    const profileBody = (await profileResponse.json()) as any
    expect(profileBody.name).toBe(loginUser.name)
    expect(profileBody.email).toBe(loginUser.email)
  })
})

afterAll(async () => {
  await db.destroy()
})
