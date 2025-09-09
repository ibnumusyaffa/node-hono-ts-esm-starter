import type { auth } from "./auth.js";
import { getContext as _getContext } from 'hono/context-storage'

export type AppContext = {
  Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}


export function getContext() {
	return _getContext<AppContext>()
}