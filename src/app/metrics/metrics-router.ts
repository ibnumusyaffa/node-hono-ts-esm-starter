import { Hono } from "hono"
import { performance } from "node:perf_hooks"

import {
  exampleActiveRequests,
  exampleItemsProcessedHistogram,
  exampleRequestCounter,
  exampleRequestDurationHistogram,
} from "@/lib/metrics.js"

const metricsRouter = new Hono()

metricsRouter.get("/example", (c) => {
  const flavor = c.req.query("flavor") ?? "vanilla"

  const attributes = {
    flavor,
    http_method: "GET",
    http_route: "/metrics/example",
  }

  exampleActiveRequests.add(1, attributes)
  const startTime = performance.now()

  try {
    const processedItems = Math.floor(Math.random() * 5) + 1

    exampleRequestCounter.add(1, attributes)
    exampleItemsProcessedHistogram.record(processedItems, attributes)

    const durationMs = performance.now() - startTime
    exampleRequestDurationHistogram.record(durationMs, attributes)

    return c.json({
      message: "Recorded OpenTelemetry example metrics.",
      flavor,
      processedItems,
      durationMs,
    })
  } finally {
    exampleActiveRequests.add(-1, attributes)
  }
})

export default metricsRouter
