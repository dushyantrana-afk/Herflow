import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  children,
  as: Tag = 'section',
  ...props
}: {
  className?: string
  children: ReactNode
  as?: 'section' | 'div' | 'article' | 'li'
  'aria-labelledby'?: string
}) {
  return (
    <Tag
      className={cn(
        'rounded-3xl border border-border/70 bg-card p-5 shadow-[0_1px_2px_rgba(41,40,50,0.04),0_8px_24px_-12px_rgba(41,40,50,0.08)]',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function SectionHeader({
  id,
  title,
  action,
  eyebrow,
}: {
  id?: string
  title: string
  eyebrow?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h2 id={id} className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        checked ? 'bg-primary' : 'bg-muted-foreground/25',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-secondary',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function StockBar({ stock }: { stock: number }) {
  const tone =
    stock === 0 ? 'bg-destructive' : stock < 25 ? 'bg-rose' : stock < 60 ? 'bg-lavender' : 'bg-sage-strong'
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={stock}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Stock level"
    >
      <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${Math.max(stock, 2)}%` }} />
    </div>
  )
}

export function StockBadge({ stock }: { stock: number }) {
  const styles =
    stock === 0
      ? 'bg-destructive/10 text-destructive'
      : stock < 25
        ? 'bg-rose-soft text-rose-strong'
        : stock < 60
          ? 'bg-lavender-soft text-secondary-foreground'
          : 'bg-sage-soft text-sage-strong'
  const label = stock === 0 ? 'Empty' : stock < 25 ? 'Low' : stock < 60 ? 'Moderate' : 'In stock'
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', styles)}>{label}</span>
}
