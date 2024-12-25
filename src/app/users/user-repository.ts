import { type Database } from "@/common/database/types/index.js"
import { Transaction } from "kysely"

export class UserRepository {
  async findAll(
    trx: Transaction<Database>,
    limit: number,
    offset: number,
    keyword?: string
  ) {
    let query = trx.selectFrom("users")

    if (keyword) {
      query = query.where("name", "like", `%${keyword}%`)
    }

    const [users, countResult] = await Promise.all([
      query.selectAll().orderBy("id").limit(limit).offset(offset).execute(),
      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return {
      users,
      total: Number(countResult?.total ?? 0),
    }
  }

  async create(
    trx: Transaction<Database>,
    userData: { name: string; email: string; password: string }
  ) {
    return trx.insertInto("users").values(userData).execute()
  }

  async findById(trx: Transaction<Database>, userId: number) {
    return trx
      .selectFrom("users")
      .where("id", "=", userId)
      .selectAll()
      .executeTakeFirst()
  }

  async emailExists(
    trx: Transaction<Database>,
    email: string
  ): Promise<boolean> {
    const result = await trx
      .selectFrom("users")
      .where("email", "=", email)
      .select("id")
      .executeTakeFirst()

    return !!result
  }
}
