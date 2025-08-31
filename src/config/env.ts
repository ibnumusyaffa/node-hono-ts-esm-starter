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
  DB_USER: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: port(),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),





  //Test container
  TEST_CONTAINER: z.boolean().default(false),



  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().default("http://localhost:4318/v1/traces"),
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z.string().default("http://localhost:4318/v1/metrics"),
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: z.string().default("http://localhost:4318/v1/logs"),

  OTEL_SERVICE_NAME: z.string().default("hono-api"),
  OTEL_SERVICE_VERSION: z.string().default("1.0.0"),

  // OTEL_RESOURCE_ATTRIBUTES="service.name=my-application,service.version=1.2.3,host.name=my-server-01"
  OTEL_RESOURCE_ATTRIBUTES: z.string().default("service.name=hono-api,service.version=1.0.0"),

  //OTEL service name standard ?
})

export default env
