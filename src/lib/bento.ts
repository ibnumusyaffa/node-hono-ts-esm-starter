import { BentoCache, bentostore } from "bentocache"
import { redisDriver } from "bentocache/drivers/redis"
import { Redis } from "ioredis";
import env from "@/config/env.js";


const client = new Redis(env.REDIS_URL);

export const bento = new BentoCache({
  default: 'redis',
  stores: {
    redis: bentostore().useL2Layer(redisDriver({
      connection: client
    }))
  }
})