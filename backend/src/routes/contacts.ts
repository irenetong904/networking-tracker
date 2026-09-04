import { Router } from 'express'
import { contactInputSchema, contactUpdateSchema, formatZodError } from '../validation.js'
import { createRequestScopedClient, extractBearerToken } from '../dataApi.js'

export const contactsRouter = Router()

const SORT_COLUMNS = new Set(['name', 'company', 'priority', 'created_at'])
const PRIORITIES = new Set(['high', 'medium', 'low'])

contactsRouter.use((req, res, next) => {
  const token = extractBearerToken(req.header('authorization'))
  if (!token) {
    res.status(401).json({ error: 'Sign in required.' })
    return
  }
  req.bearerToken = token
  next()
})

contactsRouter.get('/', async (req, res) => {
  const client = createRequestScopedClient(req.bearerToken!)

  const sortParam = typeof req.query.sort === 'string' && SORT_COLUMNS.has(req.query.sort) ? req.query.sort : 'created_at'
  const ascending = req.query.order === 'asc'
  const priority = typeof req.query.priority === 'string' && PRIORITIES.has(req.query.priority) ? req.query.priority : null
  const q = typeof req.query.q === 'string' ? req.query.q.trim().replace(/[,()%]/g, '') : ''

  let query = client.from('contacts').select('*').order(sortParam, { ascending })

  if (priority) query = query.eq('priority', priority)
  if (q) query = query.or(`name.ilike.%${q}%,company.ilike.%${q}%,role.ilike.%${q}%`)

  const { data, error } = await query
  if (error) {
    res.status(502).json({ error: 'Could not reach the database. Please try again.' })
    return
  }
  res.json(data)
})

contactsRouter.post('/', async (req, res) => {
  const parsed = contactInputSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: formatZodError(parsed.error) })
    return
  }

  const client = createRequestScopedClient(req.bearerToken!)
  const { data, error } = await client.from('contacts').insert(parsed.data).select().single()
  if (error) {
    res.status(502).json({ error: 'Could not save this contact. Please try again.' })
    return
  }
  res.status(201).json(data)
})

contactsRouter.patch('/:id', async (req, res) => {
  const parsed = contactUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: formatZodError(parsed.error) })
    return
  }

  const client = createRequestScopedClient(req.bearerToken!)
  const { data, error } = await client
    .from('contacts')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select()

  // RLS silently drops rows the caller doesn't own rather than erroring, so
  // an update matching nothing (wrong id, or someone else's contact) comes
  // back as an empty array, not an `error` — check for that explicitly.
  if (error || !data || data.length === 0) {
    res.status(404).json({ error: 'Contact not found.' })
    return
  }
  res.json(data[0])
})

contactsRouter.delete('/:id', async (req, res) => {
  const client = createRequestScopedClient(req.bearerToken!)
  const { data, error } = await client.from('contacts').delete().eq('id', req.params.id).select()

  if (error || !data || data.length === 0) {
    res.status(404).json({ error: 'Contact not found.' })
    return
  }
  res.json({ ok: true })
})
