import { BentoCache, bentostore } from "bentocache"
import { redisDriver } from "bentocache/drivers/redis"
import { Redis } from "ioredis"
import env from "@/config/env.js"
import { logger } from "./logger.js"

const client = new Redis(env.REDIS_URL)

client.on("error", (err) => {
  logger.error(err, err.message)
})

export const bento = new BentoCache({
  default: "redis",
  stores: {
    redis: bentostore().useL2Layer(
      redisDriver({
        connection: client,
      })
    ),
  },
})
