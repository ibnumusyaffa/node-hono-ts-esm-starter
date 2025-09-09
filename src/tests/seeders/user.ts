import { faker } from "@faker-js/faker"
import { db } from "@/lib/db/index.js"
import bcrypt from "bcrypt"

export async function createUser() {
  const user = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 8 }),
  }
  const result = await db
    .insertInto("users")
    .values({
      name: user.name,
      email: user.email,
      password: await bcrypt.hash(user.password, 10),
    })
    .executeTakeFirst()

  return { ...user, id: Number(result.insertId) }
}
