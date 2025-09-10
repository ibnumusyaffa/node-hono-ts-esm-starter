import { migrator, db } from "@/lib/db/index.js"
import { type StartedTestContainer } from "testcontainers"
import { rabbitMQ, mysql } from "@/tests/utils/container.js"
import env from "@/config/env.js"
import { sql } from "kysely"
import { getMigrations } from "better-auth/db";
import { auth } from "@/lib/auth.js"

let containers: StartedTestContainer[] = []

export async function setup() {
  const startTime = performance.now()

  if (env.TEST_CONTAINER) {
    containers = await Promise.all([rabbitMQ(), mysql()])
  }

  const { results } = await migrator.migrateToLatest()

  if (results) {
    for (const item of results) {
      if (item.status === "Error") {
        console.error(`failed to execute migration "${item.migrationName}"`)
      }
    }
  }

  //better-auth migrations
  const { runMigrations } = await getMigrations(auth.options);
	await runMigrations();

  const timeTaken = performance.now() - startTime
  console.info(`setup took ${timeTaken.toFixed(0)} ms.`)
}

export async function teardown() {
  await truncateAllTables()

  for (const item of containers) {
    item.stop()
  }
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}

async function truncateAllTables() {
  try {
    // Disable foreign key checks
    await sql`SET FOREIGN_KEY_CHECKS = 0`.execute(db)

    // Get all table names except kysely migration tables
    const result = await sql<{ TABLE_NAME: string }>`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME NOT IN ('kysely_migration', 'kysely_migration_lock')
    `.execute(db)

    const tableNames = result.rows.map((row) => row.TABLE_NAME)

    // Truncate all application tables
    await Promise.all(
      tableNames.map((tableName) =>
        sql`TRUNCATE TABLE ${sql.table(tableName)}`.execute(db)
      )
    )

    // Re-enable foreign key checks
    await sql`SET FOREIGN_KEY_CHECKS = 1`.execute(db)

    console.log(`${tableNames.length} tables truncated successfully`)
  } catch (error) {
    console.error("Error truncating tables:", error)
    throw error
  }
}
