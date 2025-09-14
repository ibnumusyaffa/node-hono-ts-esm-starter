import { serve } from "@hono/node-server"
import app from "@/app.js"
import env from "@/config/env.js"
import { logger } from "@/lib/logger.js"
import { boss } from "@/lib/boss.js"

await boss.start()
serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  () => {
    logger.info(`Server started at port ${env.PORT}`)
  }
)
