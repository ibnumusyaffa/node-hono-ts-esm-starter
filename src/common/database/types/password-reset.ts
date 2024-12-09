import { ColumnType, Insertable, Selectable, Updateable } from "kysely"

/* users table */
export interface PasswordResetTable {
  email: string
  token: string
  created_at: ColumnType<Date, Date | undefined, never>
}
export type PasswordReset = Selectable<PasswordResetTable>
export type NewPasswordReset = Insertable<PasswordResetTable>
export type PasswordResetUpdate = Updateable<PasswordResetTable>
