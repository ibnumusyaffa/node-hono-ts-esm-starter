import pgBoss from "pg-boss"
import env from "@/config/env.js"

export const boss = new pgBoss(env.DATABASE_URL)

boss.on("error", (err) => console.error("[pg-boss] error", err))
