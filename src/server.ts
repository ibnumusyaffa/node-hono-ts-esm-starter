import { serve } from "@hono/node-server"
import app from "@/app.js"
import env from "@/config/env.js"
import { logger } from "@/lib/logger.js"
import { boss } from "@/lib/job.js"

import {
  welcomeEmailJob,
} from "./app/product/product-job.js"

boss.mountWorker(welcomeEmailJob)


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
