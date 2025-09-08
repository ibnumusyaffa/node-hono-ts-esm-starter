import env from "@/config/env.js"
import { betterAuth } from "better-auth"
import { createPool } from "mysql2/promise"
import { parseDatabaseUrl } from "@/common/database/utils.js"

const dbConfig = parseDatabaseUrl(env.DATABASE_URL)

export const auth = betterAuth({
  database: createPool({
    database: dbConfig.database,
    host: dbConfig.host,
    user: dbConfig.user,
    port: dbConfig.port,
    password: dbConfig.password,
    connectionLimit: 10,
    timezone: "Z",
  }),
  emailAndPassword: {
    enabled: true,
  },
})
