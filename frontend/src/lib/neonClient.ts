import { createClient } from '@neondatabase/neon-js'

const authUrl = import.meta.env.NEXT_PUBLIC_NEON_AUTH_URL as string | undefined
const dataApiUrl = import.meta.env.NEXT_PUBLIC_NEON_DATA_API_URL as string | undefined

if (!authUrl || !dataApiUrl) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing NEXT_PUBLIC_NEON_AUTH_URL / NEXT_PUBLIC_NEON_DATA_API_URL. ' +
      'Copy .env.example to .env.local and fill in your Neon project URLs.',
  )
}

/**
 * Single browser-side Neon client. Handles Managed Better Auth (sign up / in /
 * out / session) and direct, RLS-scoped reads against the Neon Data API.
 */
export const neon = createClient({
  auth: { url: authUrl ?? '' },
  dataApi: { url: dataApiUrl ?? '' },
})

/**
 * Returns the current user's JWT for calling our own backend, or null if
 * signed out. Isolated here because the exact Better Auth client method that
 * exposes the raw JWT (as opposed to the httpOnly session cookie) can only be
 * confirmed against a live Neon Auth server — verify this call once your
 * project is connected (see README "Known limitations").
 */
export async function getBearerToken(): Promise<string | null> {
  const authClient = neon.auth as unknown as {
    token?: () => Promise<{ data: { token: string } | null; error: unknown }>
  }
  if (typeof authClient.token === 'function') {
    const { data } = await authClient.token()
    return data?.token ?? null
  }
  return null
}
