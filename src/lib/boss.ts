import pgBoss from "pg-boss"
import env from "@/config/env.js"
import { logger } from "better-auth"

export const boss = new pgBoss(env.DATABASE_URL)

boss.on("error", (err) => logger.error("pg-boss error", err))

// await boss.start()


