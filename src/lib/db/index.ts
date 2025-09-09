import { createPool, type QueryOptions } from "mysql2"
import { Kysely, MysqlDialect, Migrator, Transaction } from "kysely"
import path from "node:path"
import { TSFileMigrationProvider } from "kysely-ctl"
import { promisify } from "node:util"
import { env } from "../../config/env.js"
import { type DB } from "./types.js"

export const pool = createPool(env.DATABASE_URL)

export const dialect = new MysqlDialect({
  pool,
})

export const db = new Kysely<DB>({
  dialect,
})

export const migrator = new Migrator({
  db,
  provider: new TSFileMigrationProvider({
    migrationFolder: path.join(import.meta.dirname, "./migrations"),
  }),
  allowUnorderedMigrations: true,
})

export async function migrate() {
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
      [env.DATABASE_URL.split("/").pop()]
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
  async transaction<T>(callback: (trx: Transaction<DB>) => Promise<T>) {
    return db.transaction().execute(callback)
  }
}
