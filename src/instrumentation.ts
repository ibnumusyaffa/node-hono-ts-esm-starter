/*instrumentation.ts*/
import { NodeSDK } from "@opentelemetry/sdk-node"

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import {
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics"
import { resourceFromAttributes } from "@opentelemetry/resources"
import env from "./config/env.js"

import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions"

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http"


import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs"

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
  resourceDetectors:[],
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10_000, // 10 seconds
  }),
  logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-mysql2': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-winston': {
        enabled: true,
      },
    }),
  ],
})

sdk.start()
