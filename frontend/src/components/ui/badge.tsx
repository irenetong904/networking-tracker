import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
