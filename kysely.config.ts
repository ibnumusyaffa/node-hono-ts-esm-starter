import { defineConfig } from "kysely-ctl"
import { db, migrator } from "./src/lib/db/index.js"

export default defineConfig({
  kysely:db,
  migrations: {
    migrationFolder: "./src/lib/db/migrations",
    //@ts-ignore
    migrator:migrator,
  },
  plugins: [],
  seeds: {
    seedFolder: "./src/lib/db/seeds",
  },
})
