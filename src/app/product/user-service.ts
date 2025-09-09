import bcrypt from "bcrypt"
import * as userRepo from "./user-repository.js"
import z from "zod"
import { db } from "@/lib/db/index.js"

export async function list(page?: string, limit?: string, keyword?: string) {
  return db.transaction().execute(async (trx) => {
    const pageNum = page ? Number(page) : 1
    const limitNum = limit ? Number(limit) : 10
    const offset = (pageNum - 1) * limitNum

    const { users, total } = await userRepo.findAll(
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

    return { meta, data: users }
  })
}

export async function create(userData: {
  name: string
  email: string
  password: string
}) {
  return db.transaction().execute(async (trx) => {
    const schema = z.object({
      name: z.string().min(1, "Required"),
      email: z
        .string()
        .min(1, "Required")
        .email("Invalid email address")
        .refine(
          async (email) => !(await userRepo.emailExists(trx, email)),
          "Email already in use"
        ),
      password: z.string().min(6, "Must be at least 6 characters"),
    })

    const validatedData = await schema.parseAsync(userData)
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    return userRepo.create(trx, {
      ...validatedData,
      password: hashedPassword,
    })
  })
}

export async function detail(userId: number) {
  return db.transaction().execute(async (trx) => {
    return userRepo.findById(trx, userId)
  })
}
