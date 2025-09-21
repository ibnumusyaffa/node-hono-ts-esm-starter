import { BentoCache, bentostore } from "bentocache"
import { memoryDriver } from "bentocache/drivers/memory"
import { redisDriver, redisBusDriver } from "bentocache/drivers/redis"

const redisConnection = { host: "localhost", port: 6379 }
export const bento = new BentoCache({
  default: "multitier",
  stores: {
    multitier: bentostore()
      .useL1Layer(memoryDriver({ maxSize: "20mb" }))
      .useL2Layer(redisDriver({ connection: redisConnection }))
      .useBus(redisBusDriver({ connection: redisConnection })),
  },
})
