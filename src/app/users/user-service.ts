import bcrypt from "bcrypt"
import { UserRepository } from "./user-repository.js"
import z from "zod"
import { TransactionManager } from "@/lib/db/index.js"

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private transactionManager: TransactionManager
  ) {}

  async list(page?: string, limit?: string, keyword?: string) {
    return this.transactionManager.transaction(async (trx) => {
      const pageNum = page ? Number(page) : 1
      const limitNum = limit ? Number(limit) : 10
      const offset = (pageNum - 1) * limitNum

      const { users, total } = await this.userRepository.findAll(
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

  async create(userData: { name: string; email: string; password: string }) {
    return this.transactionManager.transaction(async (trx) => {
      const schema = z.object({
        name: z.string().min(1, "Required"),
        email: z
          .string()
          .min(1, "Required")
          .email("Invalid email address")
          .refine(
            async (email) =>
              !(await this.userRepository.emailExists(trx, email)),
            "Email already in use"
          ),
        password: z.string().min(6, "Must be at least 6 characters"),
      })

      const validatedData = await schema.parseAsync(userData)
      const hashedPassword = await bcrypt.hash(validatedData.password, 10)
      return this.userRepository.create(trx, {
        ...validatedData,
        password: hashedPassword,
      })
    })
  }

  async detail(userId: number) {
    return this.transactionManager.transaction(async (trx) => {
      return this.userRepository.findById(trx, userId)
    })
  }
}
