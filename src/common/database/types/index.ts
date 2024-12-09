import { PasswordResetTable } from "./password-reset.js"
import { UserTable } from "./user.js"

export interface Database {
  users: UserTable
  password_resets: PasswordResetTable
}
