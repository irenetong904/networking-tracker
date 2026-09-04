import { useCallback, useEffect, useMemo, useState } from 'react'
import { LogOut, Plus } from 'lucide-react'
import { useAuth } from '../lib/AuthProvider'
import { ApiError, createContact, deleteContact, listContacts, updateContact } from '../lib/api'
import type { Contact, ContactInput } from '../lib/types'
import { Button } from '../components/ui/button'
import { FilterBar } from '../components/contacts/FilterBar'
import { ContactsList } from '../components/contacts/ContactsList'
import { ContactFormDialog } from '../components/contacts/ContactFormDialog'
import { DeleteConfirmDialog } from '../components/contacts/DeleteConfirmDialog'

type SortKey = 'name' | 'company' | 'priority' | 'created_at'

export function Contacts() {
  const { user, signOut } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [sort, setSort] = useState<SortKey>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const [formOpen, setFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listContacts({ sort, order, priority, q: query || undefined })
      setContacts(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load contacts. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [sort, order, priority, query])

  useEffect(() => {
    const t = setTimeout(load, query ? 250 : 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, order, priority, query])

  function handleSortChange(key: SortKey) {
    if (key === sort) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(key)
      setOrder('asc')
    }
  }

  async function handleCreate(input: ContactInput) {
    const created = await createContact(input)
    setContacts((prev) => [created, ...prev])
  }

  async function handleUpdate(input: ContactInput) {
    if (!editingContact) return
    const updated = await updateContact(editingContact.id, input)
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  async function handleDelete() {
    if (!deletingContact) return
    await deleteContact(deletingContact.id)
    setContacts((prev) => prev.filter((c) => c.id !== deletingContact.id))
  }

  const isEmpty = useMemo(() => !loading && !error && contacts.length === 0, [loading, error, contacts])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Networking Tracker</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Signed in as {user?.email}</p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="mr-1.5 h-4 w-4" /> Sign out
        </Button>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar query={query} onQueryChange={setQuery} priority={priority} onPriorityChange={setPriority} />
        <Button
          onClick={() => {
            setEditingContact(null)
            setFormOpen(true)
          }}
          className="shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add contact
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}{' '}
          <button type="button" className="font-medium underline" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {isEmpty && (
        <div className="rounded-lg border border-dashed border-[var(--border)] px-6 py-12 text-center">
          <p className="font-medium">No contacts yet</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Add the first person you want to stay connected with.
          </p>
        </div>
      )}

      {!loading && !error && contacts.length > 0 && (
        <ContactsList
          contacts={contacts}
          sort={sort}
          order={order}
          onSortChange={handleSortChange}
          onEdit={(c) => {
            setEditingContact(c)
            setFormOpen(true)
          }}
          onDelete={(c) => setDeletingContact(c)}
        />
      )}

      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editingContact}
        onSubmit={editingContact ? handleUpdate : handleCreate}
      />
      <DeleteConfirmDialog
        contact={deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
