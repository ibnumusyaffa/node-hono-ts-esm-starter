import { Database } from "@/common/database/types/index.js"
import { Transaction } from "kysely"
import bcrypt from "bcrypt"

export class AuthRepository {
  async findUserByEmail(trx: Transaction<Database>, email: string) {
    return trx
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst()
  }

  async findById(trx: Transaction<Database>, id: number) {
    return trx
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst()
  }

  async createPasswordReset(
    trx: Transaction<Database>,
    email: string,
    token: string
  ) {
    await trx
      .insertInto("password_resets")
      .values({
        email,
        token: await bcrypt.hash(token, 10)
      })
      .execute()
  }

  async findPasswordReset(trx: Transaction<Database>, email: string) {
    return trx
      .selectFrom("password_resets")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst()
  }

  async deletePasswordReset(trx: Transaction<Database>, email: string) {
    await trx.deleteFrom("password_resets").where("email", "=", email).execute()
  }

  async updateUserPassword(
    trx: Transaction<Database>,
    email: string,
    password: string
  ) {
    await trx
      .updateTable("users")
      .set({ password: await bcrypt.hash(password, 10) })
      .where("email", "=", email)
      .executeTakeFirst()
  }
}
