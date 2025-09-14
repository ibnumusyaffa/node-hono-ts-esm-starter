import * as productRepo from "./product-repo.js"
import z from "zod"
import { db } from "@/lib/db/index.js"
import { welcomeEmailJob } from "./product-job.js"

export async function list({
  page,
  limit,
  keyword,
}: {
  page?: string
  limit?: string
  keyword?: string
}) {
  return db.transaction().execute(async (trx) => {
    const pageNum = page ? Number(page) : 1
    const limitNum = limit ? Number(limit) : 10
    const offset = (pageNum - 1) * limitNum

    await welcomeEmailJob.send({ message: "Hello" })

    const { products, total } = await productRepo.findAll(
      trx,
      limitNum,
      offset,
      keyword
    )
    const meta = {
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
    }
    return { meta, data: products }
  })
}

const createProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Required" })
    .refine((val) => val.length >= 3, { message: "Minimum 3 characters" }),
})

// Infer the type from the schema
type CreateProductInput = z.infer<typeof createProductSchema>

export async function create(userId: string, data: CreateProductInput) {
  return db.transaction().execute(async (trx) => {
    const validatedData = await createProductSchema.parseAsync(data)
    return productRepo.create(trx, validatedData)
  })
}

export async function detail(id: number) {
  return db.transaction().execute(async (trx) => {
    return productRepo.findById(trx, id)
  })
}
