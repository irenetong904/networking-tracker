import 'dotenv/config'
import { app } from '../src/app.js'

// Vercel's Node runtime calls an exported Express app instance directly as a
// (req, res) handler — no adapter needed.
export default app
