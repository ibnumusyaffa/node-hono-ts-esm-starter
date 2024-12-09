import "dotenv/config"
import { defineConfig } from "kysely-ctl"
import { createPool } from "mysql2"
export default defineConfig({
  dialect: "mysql2",
  dialectConfig: {
    pool: createPool({
      database: process.env.DB_NAME as string,
      host: process.env.DB_HOST as string,
      user: process.env.DB_USER as string,
      port: Number.parseInt(process.env.DB_PORT as string),
      password: process.env.DB_PASSWORD as string,
      connectionLimit: 10,
    }),
  },
  migrations: {
    migrationFolder: "./src/common/database/migrations",
  },
  plugins: [],
  seeds: {
    seedFolder: "./src/common/database/seeds",
  },
})
