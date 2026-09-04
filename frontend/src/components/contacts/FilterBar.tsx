import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export interface FilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  priority: 'all' | 'high' | 'medium' | 'low'
  onPriorityChange: (value: 'all' | 'high' | 'medium' | 'low') => void
}

export function FilterBar({ query, onQueryChange, priority, onPriorityChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, company, or role…"
          className="pl-9"
          aria-label="Search contacts"
        />
      </div>
      <Select value={priority} onValueChange={(v) => onPriorityChange(v as typeof priority)}>
        <SelectTrigger className="sm:w-40" aria-label="Filter by priority">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
