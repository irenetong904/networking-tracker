import { z } from 'zod'

/**
 * Server-side (trusted) validation for a contact record. This runs in the
 * Express backend before anything reaches the Data API — the Postgres CHECK
 * constraint on `priority` (see db/schema.sql) is a second, independent line
 * of defense in case the Data API is ever called directly, bypassing this
 * server.
 */
export const contactInputSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
  company: z.string().trim().max(200).optional().default(''),
  role: z.string().trim().max(200).optional().default(''),
  met_at: z.string().trim().max(200).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be high, medium, or low.' }),
  }),
})

export type ContactInput = z.infer<typeof contactInputSchema>

// Edits use the same rules as creation: the UI always submits a full record,
// so name and priority are required on update too — an edit can never leave
// a contact in an invalid state.
export const contactUpdateSchema = contactInputSchema

export function formatZodError(error: z.ZodError): string {
  return error.errors[0]?.message ?? 'Invalid input.'
}
