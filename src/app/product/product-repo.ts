import { type Trx } from "@/lib/db/index.js"
import type { Product } from "@/lib/db/types.js"
import { withSpan } from "@/lib/otel.js"
import type { Insertable } from "kysely"

export async function findAll(
  trx: Trx,
  limit: number,
  offset: number,
  keyword?: string
) {
  return withSpan("product-repository", "findAll", async (span) => {
    let query = trx.selectFrom("product")

    if (keyword) {
      query = query.where("name", "like", `%${keyword}%`)
    }

    const [products, countResult] = await Promise.all([
      query.selectAll().orderBy("id").limit(limit).offset(offset).execute(),
      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return {
      products,
      total: Number(countResult?.total ?? 0),
    }
  })
}

export async function create(trx: Trx, data: Insertable<Product>) {
  return trx
    .insertInto("product")
    .values(data)
    .returningAll()
    .executeTakeFirst()
}

export async function findById(trx: Trx, id: number) {
  return trx
    .selectFrom("product")
    .where("id", "=", String(id))
    .selectAll()
    .executeTakeFirst()
}
