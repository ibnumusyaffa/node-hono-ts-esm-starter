import env from "@/config/env.js"
import { type Database } from "@/common/database/types/index.js"
import { createPool, type QueryOptions } from "mysql2"
import { Kysely, MysqlDialect, Migrator, Transaction } from "kysely"
import path from "node:path"
import { TSFileMigrationProvider } from "kysely-ctl"
import { promisify } from "node:util"

export const pool = createPool({
  database: env.DB_NAME,
  host: env.DB_HOST,
  user: env.DB_USER,
  port: env.DB_PORT,
  password: env.DB_PASSWORD,
  connectionLimit: 10,
  timezone: "Z",
})

export const dialect = new MysqlDialect({
  pool,
})

export const db = new Kysely<Database>({
  dialect,
})

export async function migrate() {
  const migrator = new Migrator({
    db,
    provider: new TSFileMigrationProvider({
      migrationFolder: path.join(import.meta.dirname, "./migrations"),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  if (results)
    for (const item of results) {
      if (item.status === "Error") {
        console.error(`failed to execute migration "${item.migrationName}"`)
      }
    }

  if (error) {
    console.error("failed to run `migrateToLatest`")
    console.error(error)
  }
}

export async function truncateAllTables() {
  try {
    const query = promisify(pool.query).bind(pool) as (
      sql: string | QueryOptions,
      values?: any
    ) => Promise<any>
    
    await query("SET FOREIGN_KEY_CHECKS = 0")

    // Get all table names except kysely_migration and kysely_migration_lock
    const rows = await query(
      `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME NOT IN ('kysely_migration', 'kysely_migration_lock')
    `,
      [env.DB_NAME]
    )

    await Promise.all(
      rows.map((row: { TABLE_NAME: string }) =>
        query({ sql: `TRUNCATE TABLE ${row.TABLE_NAME}` })
      )
    )

    await query("SET FOREIGN_KEY_CHECKS = 1")
    console.log("All tables truncated successfully")
  } catch (error) {
    console.error("Error truncating tables:", error)
    throw error
  }
}

export class TransactionManager {
  async transaction<T>(callback: (trx: Transaction<Database>) => Promise<T>) {
    return db.transaction().execute(callback)
  }
}
