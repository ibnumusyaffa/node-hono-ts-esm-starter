import type { auth } from "./auth.js"

export type AuthenticatedContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}
