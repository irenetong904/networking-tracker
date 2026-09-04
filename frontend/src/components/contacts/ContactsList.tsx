import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import { Badge, type BadgeProps } from '../ui/badge'
import { Button } from '../ui/button'
import type { Contact } from '../../lib/types'
import type { ListContactsParams } from '../../lib/api'

const priorityVariant: Record<Contact['priority'], BadgeProps['variant']> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
}

export interface ContactsListProps {
  contacts: Contact[]
  sort: NonNullable<ListContactsParams['sort']>
  order: NonNullable<ListContactsParams['order']>
  onSortChange: (sort: ContactsListProps['sort']) => void
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

const columns: { key: ContactsListProps['sort']; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'priority', label: 'Priority' },
  { key: 'created_at', label: 'Added' },
]

function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
  return order === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
}

export function ContactsList({ contacts, sort, order, onSortChange, onEdit, onDelete }: ContactsListProps) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-lg border border-[var(--border)] sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => onSortChange(col.key)}
                    className="flex items-center gap-1.5 hover:text-[var(--foreground)]"
                  >
                    {col.label}
                    <SortIcon active={sort === col.key} order={order} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Where met</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.company || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={priorityVariant[c.priority]}>{c.priority}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{c.met_at || '—'}</td>
                <td className="max-w-[16rem] truncate px-4 py-3 text-[var(--muted-foreground)]">
                  {c.notes || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} onClick={() => onEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} onClick={() => onDelete(c)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {contacts.map((c) => (
          <div key={c.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {[c.role, c.company].filter(Boolean).join(' at ') || '—'}
                </p>
              </div>
              <Badge variant={priorityVariant[c.priority]}>{c.priority}</Badge>
            </div>
            {c.met_at && <p className="mt-2 text-sm">Met at {c.met_at}</p>}
            {c.notes && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.notes}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(c)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(c)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
