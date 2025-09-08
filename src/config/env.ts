import "@dotenvx/dotenvx"
import { parseEnv, z, port } from "znv"

export const env = parseEnv(process.env, {
  //App
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: port().default(3000),
  LOG: z.boolean().default(false),

  APP_NAME: z.string().default("MyApp"),
  APP_KEY: z.string().min(1),
  APP_DEBUG: z.boolean().default(true),
  APP_URL: z.string().default("http://localhost:3000"),
  FRONTEND_URL: z.string().default("http://localhost:5000"),

  //DB
  DATABASE_URL: z.string().min(1),

  //Test container
  TEST_CONTAINER: z.boolean().default(false),


  // OpenTelemetry Configuration
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().default("http://localhost:4318/v1/traces"),
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z.string().default("http://localhost:4318/v1/metrics"),
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: z.string().default("http://localhost:4318/v1/logs"),

  OTEL_SERVICE_NAME: z.string().default("hono-api"),
  OTEL_SERVICE_VERSION: z.string().default("1.0.0"),

  // SigNoz Configuration
  SIGNOZ_OTLP_ENDPOINT: z.string().default("http://localhost:4317"),
  SIGNOZ_ACCESS_TOKEN: z.string().optional(),
  SIGNOZ_INSECURE: z.boolean().default(true),



})

export default env
