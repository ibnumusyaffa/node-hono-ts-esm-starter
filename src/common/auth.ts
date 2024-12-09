import env from "@/config/env.js"
import { jwt, sign } from "hono/jwt"

export type Payload = { userId: number }

export async function createToken(payload: Payload) {
  const SECONDS_IN_DAY = 86_400
  const DAYS = 7
  const exp = Math.floor(Date.now() / 1000) + SECONDS_IN_DAY * DAYS
  return sign({ ...payload, exp }, env.APP_KEY)
}

export const checkAuth = () => jwt({ secret: env.APP_KEY })
