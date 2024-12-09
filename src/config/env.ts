import "@dotenvx/dotenvx"
import { parseEnv, z, port } from "znv"

export const env = parseEnv(process.env, {
  //App
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: port().default(3000),
  LOG_MODE: z
    .enum(["production", "development", "test"])
    .default("development"),

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

  //Redis
  REDIS_HOST: z.string().min(1),
  REDIS_PASSWORD: z.string(),
  REDIS_PORT: port(),

  //rabbitMQ
  RABBITMQ_HOST: z.string().min(1),
  RABBITMQ_PORT: port(),
  RABBITMQ_USERNAME: z.string().min(1),
  RABBITMQ_PASSWORD: z.string().min(1),

  //Mail
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.number(),
  MAIL_USERNAME: z.string().min(1),
  MAIL_PASSWORD: z.string().min(1),
  MAIL_FROM_NAME: z.string(),
  MAIL_FROM_ADDRESS: z.string().min(1),

  //Test container
  TEST_CONTAINER: z.boolean().default(false),
})

export default env
