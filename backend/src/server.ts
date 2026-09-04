import { config } from 'dotenv'

// A dynamic import (unlike a static one) runs after this line, so .env.local
// is loaded into process.env before app.js and its dependents read from it.
config({ path: '.env.local' })
const { app } = await import('./app.js')

const port = process.env.PORT ? Number(process.env.PORT) : 8787

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`)
})
