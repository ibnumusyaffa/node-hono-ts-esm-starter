import * as productRepo from "./product-repo.js"
import z from "zod"
import { db } from "@/lib/db/index.js"


export async function list(page?: string, limit?: string, keyword?: string) {
  return db.transaction().execute(async (trx) => {
    const pageNum = page ? Number(page) : 1
    const limitNum = limit ? Number(limit) : 10
    const offset = (pageNum - 1) * limitNum

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

export async function create(data: { name: string }) {
  return db.transaction().execute(async (trx) => {
    const schema = z.object({
      name: z
        .string()
        .min(1, { message: "Required" })
        .refine((val) => val.length >= 3, { message: "Minimum 3 characters" }),
    })

    const validatedData = await schema.parseAsync(data)

    return productRepo.create(trx, validatedData)
  })
}

export async function detail(id: number) {
  return db.transaction().execute(async (trx) => {
    return productRepo.findById(trx, id)
  })
}
