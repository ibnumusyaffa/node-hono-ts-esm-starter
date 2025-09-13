/* eslint-disable unicorn/no-process-exit */
import { migrator, db } from "@/lib/db/index.js"
import { type StartedTestContainer } from "testcontainers"
import { rabbitMQ, mysql } from "@/tests/utils/container.js"
import env from "@/config/env.js"
import { sql } from "kysely"
import { getMigrations } from "better-auth/db"
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
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()

  const timeTaken = performance.now() - startTime
  console.info(`setup took ${timeTaken.toFixed(0)} ms.`)
}

export async function teardown() {
  const startTime = performance.now()
  await truncateAllTables()

  for (const item of containers) {
    item.stop()
  }

  const timeTaken = performance.now() - startTime
  console.info(`teardown took ${timeTaken.toFixed(0)} ms.`)
  process.exit(0)
}

export async function truncateAllTables(): Promise<void> {
  await sql`SET SESSION FOREIGN_KEY_CHECKS = 0`.execute(db)

  try {
    const tables = await sql<{ TABLE_NAME: string }>`
      SELECT TABLE_NAME FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name NOT IN ('kysely_migration', 'kysely_migration_lock')
        AND table_type = 'BASE TABLE'
    `.execute(db)

    // These TRUNCATE operations run in parallel
    await Promise.all(
      tables.rows.map((row) =>
        sql`TRUNCATE TABLE ${sql.table(row.TABLE_NAME)}`.execute(db)
      )
    )
  } finally {
    await sql`SET SESSION FOREIGN_KEY_CHECKS = 1`.execute(db)
  }
}
