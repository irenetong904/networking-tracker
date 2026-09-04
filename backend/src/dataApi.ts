import { createClient } from '@neondatabase/neon-js'

const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL

if (!dataApiUrl) {
  // eslint-disable-next-line no-console
  console.error(
    'NEXT_PUBLIC_NEON_DATA_API_URL is not set. Copy .env.example to .env.local and fill in your Neon project URL.',
  )
}

/**
 * Builds a Data API client scoped to one incoming request's bearer token.
 *
 * We use the "external auth provider" form of createClient: no `auth` block,
 * just `dataApi.getToken`. That returns a plain NeonPostgrestClient which
 * attaches the caller's own JWT to every query — the same JWT Managed Better
 * Auth issued to the browser, which we simply forward. Row Level Security in
 * Postgres (see db/schema.sql) is what actually scopes every row to that
 * user; this backend never elevates privileges.
 */
export function createRequestScopedClient(bearerToken: string) {
  return createClient({
    dataApi: {
      url: dataApiUrl ?? '',
      getToken: async () => bearerToken,
    },
  })
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null
  const [scheme, token] = authHeader.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}
