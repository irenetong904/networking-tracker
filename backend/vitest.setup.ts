// Tests never talk to a real Neon project — routes/contacts.test.ts mocks
// `fetch` directly — but the Data API client still needs a syntactically
// valid base URL to construct requests against.
process.env.NEXT_PUBLIC_NEON_DATA_API_URL ??= 'https://example-test.apirest.neon.tech/neondb/rest/v1'
