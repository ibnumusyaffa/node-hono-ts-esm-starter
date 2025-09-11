import { faker } from "@faker-js/faker"
import { auth } from "@/lib/auth.js"

export async function createUser() {
  const body = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 8 }),
  }

  await auth.api.signUpEmail({
    body,
  })

  return body
}
