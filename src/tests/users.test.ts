/* eslint-disable sonarjs/no-hardcoded-passwords */
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

    const testCases = [
      {
        name: "should fail when email format is invalid",
        input: {
          name: "John Doe",
          email: "invalid-email",
          password: "123456",
        },
        errors: {
          email: ["Invalid email address"],
        },
      },
      {
        name: "should fail when email already exists",
        input: {
          name: "John Doe",
          email: loginUser.email,
          password: "123456",
        },
        errors: {
          email: ["Email already in use"],
        },
      },
      {
        name: "should fail when password is too short",
        input: {
          name: "John Doe",
          email: "john@example.com",
          password: "12345",
        },
        errors: {
          password: ["Must be at least 6 characters"],
        },
      },
      {
        name: "should return multiple errors when multiple fields are required",
        input: {
          name: "",
          email: "",
          password: "12345",
        },
        errors: {
          name: ["Required"],
          email: ["Required", "Invalid email address"],
          password: ["Must be at least 6 characters"],
        },
      },
    ]

    it.each(testCases)("$name", async ({ input, errors }) => {
      const response = await app.request("/users", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      const body = (await response.json()) as any
      expect(response.status).toBe(422)
      expect(body.errors).toEqual(errors)
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
