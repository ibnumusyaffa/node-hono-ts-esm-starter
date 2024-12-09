import { AuthRepository } from "./auth-repository.js"
import bcrypt from "bcrypt"
import { randomUUID } from "node:crypto"
import { createToken } from "@/common/auth.js"
import env from "@/config/env.js"
import { TransactionManager } from "@/common/database/index.js"
import { UnauthorizedError } from "@/common/error.js"
import { z } from "zod"
import { Publisher } from "@/common/rabbit-mq/publisher.js"
import { ForgotPasswordMessage } from "./auth-worker.js"

export class AuthService {
  constructor(
    private userRepository: AuthRepository,
    private transactionManager: TransactionManager,
    private eventPublisher: Publisher
  ) {}

  async login(email: string, password: string) {
    return this.transactionManager.transaction(async (trx) => {
      const loginSchema = z.object({
        email: z
          .string({
            required_error: "Email is required",
          })
          .email("Email is not valid"),
        password: z.string({
          required_error: "Password is required",
        }),
      })

      loginSchema.parse({ email, password })

      const user = await this.userRepository.findUserByEmail(trx, email)
      if (!user) {
        throw new UnauthorizedError("Invalid email or password")
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        throw new UnauthorizedError("Invalid email or password")
      }

      return createToken({ userId: user.id })
    })
  }

  async getProfile(userId: number) {
    return this.transactionManager.transaction(async (trx) => {
      const user = await this.userRepository.findById(trx, userId)
      if (!user) {
        throw new UnauthorizedError("User not found")
      }
      return user
    })
  }

  async forgotPassword(email: string) {
    return this.transactionManager.transaction(async (trx) => {
      const forgotPasswordSchema = z.object({
        email: z
          .string({
            required_error: "Email is required",
          })
          .email("Email is not valid"),
      })

      forgotPasswordSchema.parse({ email })

      const user = await this.userRepository.findUserByEmail(trx, email)
      if (!user) {
        return ""
      }

      await this.userRepository.deletePasswordReset(trx, email)

      const token = randomUUID()
      await this.userRepository.createPasswordReset(trx, email, token)

      this.eventPublisher.publish<ForgotPasswordMessage>("forgot-password", {
        name: user.name,
        email: user.email,
        link: `${env.FRONTEND_URL}/reset-password/${token}?email=${user.email}`,
      })

      return token
    })
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    return this.transactionManager.transaction(async (trx) => {
      const resetPasswordSchema = z.object({
        token: z.string({
          required_error: "Token is required",
        }),
        email: z
          .string({
            required_error: "Email is required",
          })
          .email("Email is not valid"),

        password: z
          .string({
            required_error: "Password is required",
          })
          .min(8, "Password must be at least 8 characters long")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
          ),
      })

      resetPasswordSchema.parse({
        email,
        token,
        password: newPassword,
      })

      const reset = await this.userRepository.findPasswordReset(trx, email)
      if (!reset) {
        throw new UnauthorizedError("Reset not found")
      }

      const passwordMatch = await bcrypt.compare(token, reset.token)
      if (!passwordMatch) {
        throw new UnauthorizedError("Invalid token")
      }

      const EXPIRATION_TIME_MINUTES = 60
      const currentTime = Date.now()
      const elapsedMinutes =
        (currentTime - reset.created_at.getTime()) / (1000 * 60)
      const isExpired = elapsedMinutes > EXPIRATION_TIME_MINUTES

      if (isExpired) {
        await this.userRepository.deletePasswordReset(trx, email)
        throw new UnauthorizedError(
          "Password reset token has expired. Please request a new one."
        )
      }

      await this.userRepository.updateUserPassword(trx, email, newPassword)
      await this.userRepository.deletePasswordReset(trx, email)
    })
  }
}
