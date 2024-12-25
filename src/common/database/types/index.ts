import { type PasswordResetTable } from "./password-reset.js"
import { type UserTable } from "./user.js"

export interface Database {
  users: UserTable
  password_resets: PasswordResetTable
}
