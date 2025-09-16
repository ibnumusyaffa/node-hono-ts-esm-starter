import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"
import { config } from "@dotenvx/dotenvx"

config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  quiet: true,
})

const env = createEnv({
  server: {
    //App
    NODE_ENV: z
      .enum(["production", "development", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3000),

    APP_NAME: z.string().default("MyApp"),
    APP_DEBUG: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default(true),
    APP_URL: z.string().default("http://localhost:3000"),
    FRONTEND_URL: z.string().default("http://localhost:5000"),

    DATABASE_URL: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().default("http://localhost:4000"),

    MAIL_HOST: z.string().min(1).default("sandbox.smtp.mailtrap.io"),
    MAIL_PORT: z.coerce.number().min(1).default(2525),
    MAIL_USER: z.string().min(1).default("54e318bc5d0918"),
    MAIL_PASSWORD: z.string().min(1).default("b5c503d4fecda0"),

    TEST_CONTAINER: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true")
      .default(false),

    // OpenTelemetry Configuration
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z
      .string()
      .default("http://localhost:4318/v1/traces"),
    OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z
      .string()
      .default("http://localhost:4318/v1/metrics"),
    OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: z
      .string()
      .default("http://localhost:4318/v1/logs"),

    OTEL_SERVICE_NAME: z.string().default("hono-api"),
    OTEL_SERVICE_VERSION: z.string().default("1.0.0"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

export default env
