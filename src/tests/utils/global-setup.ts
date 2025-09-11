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



export async function truncateAllTables(): Promise<void> {
	await sql`CALL TruncateAllTables()`.execute(db)
}