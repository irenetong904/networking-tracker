import express from 'express'
import cors from 'cors'
import { contactsRouter } from './routes/contacts.js'

const allowedOrigin = process.env.FRONTEND_ORIGIN

export const app = express()

app.use(
  cors({
    // Same-origin requests (no Origin header, or the deployed Vercel app
    // serving both frontend and backend) always work. FRONTEND_ORIGIN is
    // only needed for local dev, where Vite (5173) and Express (8787) run on
    // different ports.
    origin: allowedOrigin ? [allowedOrigin] : true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/contacts', contactsRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})
