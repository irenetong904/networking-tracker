import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'

const AUTH = { Authorization: 'Bearer test-token' }

describe('POST /api/contacts', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects requests with no bearer token', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .send({ name: 'Ada Lovelace', priority: 'high' })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/sign in/i)
  })

  it('rejects an empty name with a 400 and a clear message', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set(AUTH)
      .send({ name: '', priority: 'high' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/name is required/i)
  })

  it('rejects an invalid priority with a 400 and a clear message', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set(AUTH)
      .send({ name: 'Grace Hopper', priority: 'urgent' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/priority must be/i)
  })

  it('forwards a valid payload to the Data API and returns the created row', async () => {
    const fakeRow = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Grace Hopper',
      company: '',
      role: '',
      met_at: '',
      notes: '',
      priority: 'high',
      created_at: new Date().toISOString(),
      user_id: 'user_123',
    }
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(fakeRow), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await request(app)
      .post('/api/contacts')
      .set(AUTH)
      .send({ name: 'Grace Hopper', priority: 'high' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Grace Hopper')
    expect(fetchMock).toHaveBeenCalled()
  })
})
