import { auth } from "@/lib/auth.js"
import app from "@/app.js"

async function getCookie(data: { email: string; password: string }) {
  const { headers } = await auth.api.signInEmail({
    body: data,
    asResponse: true,
  })

  const cookie = headers.get("set-cookie")
  return cookie?.split(";")[0] as string
}

/*
create a fetch function that automatically includes the authentication cookie
*/
export const createFetch =
  async (data: {
    email: string
    password: string
  }): Promise<typeof app.request> =>
  async (input, init) => {
    const headers = new Headers(init?.headers)
    headers.set("Cookie", await getCookie(data))

    return app.request(input, { ...init, headers })
  }
