import { faker } from "@faker-js/faker"
import { auth } from "@/lib/auth.js"

export async function createUser() {
  const user = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 8 }),
  }

  await auth.api.signUpEmail({
    body: {
      email: user.email,
      password: user.password,
      name: user.name,
    },
  })

  return user
}
