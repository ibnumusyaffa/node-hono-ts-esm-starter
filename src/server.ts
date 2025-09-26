import { serve } from "@hono/node-server"
import app from "@/app.js"
import env from "@/config/env.js"
import { logger } from "@/lib/logger.js"
import { boss } from "@/lib/job.js"
import "./cron.js"
import { welcomeEmailJob } from "./app/product/product-job.js"

boss.register(welcomeEmailJob)

boss.start()

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  () => {
    logger.info(`Server started at port ${env.PORT}`)
  }
)
