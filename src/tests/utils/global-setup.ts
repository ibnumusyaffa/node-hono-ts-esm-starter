/* eslint-disable unicorn/no-process-exit */
import { migrator, db } from "@/lib/db/index.js"

import { sql } from "kysely"
import { getMigrations } from "better-auth/db"
import { auth } from "@/lib/auth.js"

export async function setup() {
  const startTime = performance.now()


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


  const timeTaken = performance.now() - startTime
  console.info(`teardown took ${timeTaken.toFixed(0)} ms.`)
  process.exit(0)
}

export async function truncateAllTables(): Promise<void> {
  // 1. Build a single statement that truncates every table in one shot
  //    (PostgreSQL can do this in a single TRUNCATE … CASCADE call.)
  const tables = await sql<{ tablename: string }>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = current_schema()
      AND tablename <> ALL (ARRAY['kysely_migration', 'kysely_migration_lock'])
  `.execute(db)

  if (tables.rows.length === 0) return

  const tableRefs = tables.rows.map((r) => sql.table(r.tablename))

  // 2. Run it – CASCADE drops the rows even when FKs reference them.
  await sql`TRUNCATE TABLE ${sql.join(tableRefs)} CASCADE`.execute(db)
}
