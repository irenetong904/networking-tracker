import { describe, expect, it } from 'vitest'
import { contactInputSchema, formatZodError } from './validation.js'

describe('contactInputSchema', () => {
  it('accepts a valid contact', () => {
    const result = contactInputSchema.safeParse({
      name: 'Ada Lovelace',
      company: 'Berkeley Haas',
      role: 'Classmate',
      met_at: 'Orientation',
      notes: 'Met at the welcome mixer.',
      priority: 'high',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = contactInputSchema.safeParse({
      name: '',
      priority: 'medium',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodError(result.error)).toMatch(/name is required/i)
    }
  })

  it('rejects a whitespace-only name', () => {
    const result = contactInputSchema.safeParse({
      name: '   ',
      priority: 'medium',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid priority value', () => {
    const result = contactInputSchema.safeParse({
      name: 'Grace Hopper',
      priority: 'urgent',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodError(result.error)).toMatch(/priority must be/i)
    }
  })

  it('rejects a missing priority', () => {
    const result = contactInputSchema.safeParse({ name: 'No Priority' })
    expect(result.success).toBe(false)
  })

  it('fills in optional fields with empty strings when omitted', () => {
    const result = contactInputSchema.safeParse({ name: 'Minimal Contact', priority: 'low' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.company).toBe('')
      expect(result.data.notes).toBe('')
    }
  })
})
