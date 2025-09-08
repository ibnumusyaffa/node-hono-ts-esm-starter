import { defineConfig } from "kysely-ctl"
import { db, migrator } from "./src/common/database"

export default defineConfig({
  kysely:db,
  migrations: {
    migrator,
  },
  plugins: [],
  seeds: {
    seedFolder: "./src/common/database/seeds",
  },
})
