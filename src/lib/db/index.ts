import { Kysely, PostgresDialect, Migrator, Transaction } from "kysely"
import path from "node:path"
import { TSFileMigrationProvider } from "kysely-ctl"
import env from "../../config/env.js"
import { type DB } from "./types.js"

import { Pool } from "pg"

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
})

export const migrator = new Migrator({
  db,
  provider: new TSFileMigrationProvider({
    migrationFolder: path.join(import.meta.dirname, "./migrations"),
  }),
  allowUnorderedMigrations: true,
})

export type Trx = Transaction<DB>
