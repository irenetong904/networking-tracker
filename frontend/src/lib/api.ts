import { getBearerToken } from './neonClient'
import type { Contact, ContactInput } from './types'

// In production both frontend and backend are served from the same Vercel
// project, so a relative path is enough. In local dev, the Express server
// runs on its own port; point at it with VITE_API_BASE_URL.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getBearerToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const message = body?.error ?? `Request failed with status ${res.status}`
    throw new ApiError(message, res.status)
  }
  return body as T
}

export interface ListContactsParams {
  sort?: 'name' | 'company' | 'priority' | 'created_at'
  order?: 'asc' | 'desc'
  priority?: 'high' | 'medium' | 'low' | 'all'
  q?: string
}

export function listContacts(params: ListContactsParams = {}) {
  const search = new URLSearchParams()
  if (params.sort) search.set('sort', params.sort)
  if (params.order) search.set('order', params.order)
  if (params.priority && params.priority !== 'all') search.set('priority', params.priority)
  if (params.q) search.set('q', params.q)
  const qs = search.toString()
  return request<Contact[]>(`/api/contacts${qs ? `?${qs}` : ''}`)
}

export function createContact(input: ContactInput) {
  return request<Contact>('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateContact(id: string, input: ContactInput) {
  return request<Contact>(`/api/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteContact(id: string) {
  return request<{ ok: true }>(`/api/contacts/${id}`, { method: 'DELETE' })
}
