import { faker } from "@faker-js/faker"
import type { Kysely } from "kysely"
import bcrypt from "bcrypt"
import { type NewUser } from "../types/user.js"

export async function seed(db: Kysely<any>): Promise<void> {
  const users: Array<NewUser> = []

  users.push({
    name: "Admin",
    email: "admin@example.com",
    password: await bcrypt.hash("Password123*", 10),
  })

  for (let i = 0; i < 100; i++) {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await bcrypt.hash("Password123*", 10),
    }
    users.push(user)
  }

  await db.insertInto("users").values(users).execute()
}
