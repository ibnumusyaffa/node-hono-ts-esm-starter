import { serve } from "@hono/node-server"
import app from "@/app.js"
import env from "@/config/env.js"
import { logger } from "@/lib/logger.js"
import { boss } from "@/lib/job.js"

await boss.start()

boss.on("error", (err) => logger.error({ error: err }, "pg-boss error"))
serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  () => {
    logger.info(`Server started at port ${env.PORT}`)
  }
)
