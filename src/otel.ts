/*instrumentation.ts*/
import { NodeSDK } from "@opentelemetry/sdk-node"

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { resourceFromAttributes } from "@opentelemetry/resources"
import env from "./config/env.js"

import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions"

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http"
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs"

import { createAddHookMessageChannel } from "import-in-the-middle"
import { register } from "node:module"


//ESM hooks: see https://github.com/open-telemetry/opentelemetry-js/issues/4933
const { registerOptions, waitForAllMessagesAcknowledged } =
  createAddHookMessageChannel()

register("import-in-the-middle/hook.mjs", import.meta.url, registerOptions)

// Configure exporters
const traceExporter = new OTLPTraceExporter({
  url: `${env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}`,
})

const metricExporter = new OTLPMetricExporter({
  url: `${env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`,
})

const logExporter = new OTLPLogExporter({
  url: `${env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`,
})

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: env.OTEL_SERVICE_VERSION,
})

const sdk = new NodeSDK({
  resource,
  traceExporter,
  resourceDetectors: [],
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10_000, // 10 seconds
  }),
  logRecordProcessor: new BatchLogRecordProcessor(logExporter, {
    maxQueueSize: 2048,
    scheduledDelayMillis: 1000, // Export batch every 1 second
    exportTimeoutMillis: 30_000,
    maxExportBatchSize: 512,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-pg": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-pino": {
        enabled: true,
      },
    }),
  ],
})

sdk.start()

await waitForAllMessagesAcknowledged()
