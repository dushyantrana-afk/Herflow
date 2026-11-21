'use client'

import { CalendarHeart, HandHeart, House, Sparkles, UserRound } from 'lucide-react'
import type { TabId } from '@/lib/herflow-data'
import { cn } from '@/lib/utils'

const items: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'cycle', label: 'Cycle', icon: CalendarHeart },
  { id: 'support', label: 'Support', icon: HandHeart },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

export function BottomNav({
  active,
  onChange,
  className,
}: {
  active: TabId
  onChange: (tab: TabId) => void
  className?: string
}) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'shrink-0 sticky bottom-0 z-30 border-t border-border/70 bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl',
        className,
      )}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors cursor-pointer select-none',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-lavender-soft',
                  )}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                </span>
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
