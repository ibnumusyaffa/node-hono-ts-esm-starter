import { createPool } from "mysql2"
import { Kysely, MysqlDialect, Migrator, Transaction } from "kysely"
import path from "node:path"
import { TSFileMigrationProvider } from "kysely-ctl"
import env from "../../config/env.js"
import { type DB } from "./types.js"

const pool = createPool(env.DATABASE_URL)

export const db = new Kysely<DB>({
  // @ts-expect-error - TODO: fix this
  dialect: new MysqlDialect({ pool }),
})

export const migrator = new Migrator({
  db,
  provider: new TSFileMigrationProvider({
    migrationFolder: path.join(import.meta.dirname, "./migrations"),
  }),
  allowUnorderedMigrations: true,
})

export type Trx = Transaction<DB>
