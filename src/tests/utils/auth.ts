import { createToken, Payload } from "@/common/auth.js"

export async function createBearerToken(payload: Payload) {
  return `Bearer ${await createToken(payload)}`
}
