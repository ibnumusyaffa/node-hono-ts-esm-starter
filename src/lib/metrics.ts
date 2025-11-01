import { metrics } from "@opentelemetry/api"

import env from "@/config/env.js"

const meter = metrics.getMeter(env.OTEL_SERVICE_NAME, env.OTEL_SERVICE_VERSION)

const exampleRequestCounter = meter.createCounter("example_requests_total", {
  description: "Total number of example metric API requests processed.",
})

const exampleRequestDurationHistogram = meter.createHistogram(
  "example_request_duration_ms",
  {
    description: "Duration of example metric API requests in milliseconds.",
    unit: "ms",
  }
)

const exampleActiveRequests = meter.createUpDownCounter(
  "example_active_requests",
  {
    description: "Number of in-flight example metric API requests.",
  }
)

const exampleItemsProcessedHistogram = meter.createHistogram(
  "example_items_processed",
  {
    description:
      "Synthetic count of items processed within the example metric API.",
    unit: "items",
  }
)

export {
  exampleActiveRequests,
  exampleItemsProcessedHistogram,
  exampleRequestCounter,
  exampleRequestDurationHistogram,
  meter,
}
