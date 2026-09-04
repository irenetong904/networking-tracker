// On Vercel, real environment variables are injected directly — this import
// only matters for local dev, where it's a no-op unless a .env file exists.
import 'dotenv/config'
const { app } = await import('../src/app.js')

// Vercel's Node runtime calls an exported Express app instance directly as a
// (req, res) handler — no adapter needed.
export default app
