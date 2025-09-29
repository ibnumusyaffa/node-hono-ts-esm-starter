import { type Trx } from "@/lib/db/index.js"
import type { Product } from "@/lib/db/types.js"
import { SpanStatusCode, trace, type Span } from "@opentelemetry/api"
import type { Insertable } from "kysely"

const tracer = trace.getTracer("product-repository")

export async function findAll(
  trx: Trx,
  limit: number,
  offset: number,
  keyword?: string
) {
  return tracer.startActiveSpan("findAll", async (span: Span) => {
    try {
      span.setAttributes({ limit, offset, keyword: keyword ?? "" })
      let query = trx.selectFrom("product")

      if (keyword) {
        query = query.where("name", "like", `%${keyword}%`)
      }

      const [products, countResult] = await Promise.all([
        query.selectAll().orderBy("id").limit(limit).offset(offset).execute(),
        query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
      ])

      span.setStatus({ code: SpanStatusCode.OK })
      return {
        products,
        total: Number(countResult?.total ?? 0),
      }
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      })
      throw error
    } finally {
      span.end()
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
    .where("id", "=", id.toString())
    .selectAll()
    .executeTakeFirst()
}
