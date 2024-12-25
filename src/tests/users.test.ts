import { faker } from "@faker-js/faker"
import { createUser } from "./seeders/user.js"
import { expect, it, describe, afterAll } from "vitest"
import { db } from "@/common/database/index.js"
import app from "@/app.js"
import { createBearerToken } from "./utils/auth.js"

const loginUser = await createUser()
const token = await createBearerToken({ userId: loginUser.id })
describe("user management", () => {
  describe("create user", () => {
    it("should successfully create user with valid data", async () => {
      const fake = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      }
      //fetch
      const response = await app.request("/users", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fake),
      })

      expect(response.status).toBe(201)

      await expect({ name: fake.name, email: fake.email }).toHaveRowInTable(
        "users"
      )
    })

    it("should reject user creation with invalid data", async () => {
      const fake = {
        name: "",
        email: faker.internet.email(),
        password: "",
      }

      const response = await app.request("/users", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "" }),
      })
      expect(response.status).toBe(422)
      await expect({ name: fake.email }).not.toHaveRowInTable("users")
    })
  })

  describe("list users", () => {
    it("should return list of users for authenticated request", async () => {
      const response = await app.request("/users", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      const body = (await response.json()) as any
      expect(Array.isArray(body.data)).toBe(true)
    })
  })

  describe("detail user", () => {
    it("should return user details for valid user ID", async () => {
      const detailResponse = await app.request(`/users/${loginUser.id}`, {
        method: "GET",
        headers: {
          Authorization: await createBearerToken({ userId: loginUser.id }),
        },
      })
      const body = (await detailResponse.json()) as any
      expect(detailResponse.status).toBe(200)
      expect(body?.email).toBe(loginUser.email)
      expect(body?.name).toBe(loginUser.name)
    })

    it("should return 404 for invalid user ID", async () => {
      const detailResponse = await app.request(`/users/0`, {
        method: "GET",
        headers: {
          Authorization: await createBearerToken({ userId: loginUser.id }),
        },
      })

      expect(detailResponse.status).toBe(404)
    })
  })
})

afterAll(async () => {
  await db.destroy()
})
