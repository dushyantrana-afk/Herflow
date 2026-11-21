'use client'

import { CalendarHeart, GraduationCap, HandHeart, House, Info, LogOut, MapPin, Sparkles, UserRound } from 'lucide-react'
import type { TabId } from '@/lib/herflow-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export type DesktopTabId = TabId | 'about'

const items: { id: DesktopTabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'cycle', label: 'Cycle', icon: CalendarHeart },
  { id: 'support', label: 'Support', icon: HandHeart },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'about', label: 'About', icon: Info },
]

export function DesktopNav({
  active,
  onChange,
  onOpenSos,
  onOpenAuth,
}: {
  active: DesktopTabId
  onChange: (tab: DesktopTabId) => void
  onOpenSos: () => void
  onOpenAuth?: () => void
}) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-3 xl:px-10">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onChange('home')}
          className="text-sm font-bold tracking-tight shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-90"
        >
          <span className="flex size-7 items-center justify-center rounded-xl bg-gradient-to-br from-lavender to-rose text-white text-xs font-bold shadow-xs">
            H
          </span>
          <span>
            HERFLOW <span className="text-primary font-bold">AI</span>
          </span>
        </button>

        {/* Nav links */}
        <nav aria-label="Primary" className="flex flex-1 items-center gap-1">
          {items.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-lavender-soft text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* User Pill / Status */}
        {user ? (
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange('profile')}
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-card hover:bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors cursor-pointer"
            >
              <GraduationCap className="size-3.5 text-primary" />
              <span className="max-w-[110px] truncate font-semibold">{user.name}</span>
              <span className="text-[10px] text-muted-foreground">({user.campus})</span>
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        ) : onOpenAuth ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAuth}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Sign In with College ID
          </Button>
        ) : null}

        {/* SOS CTA */}
        <Button
          onClick={onOpenSos}
          size="sm"
          className="shrink-0 rounded-xl bg-rose-strong px-4 text-white hover:bg-rose-strong/90 cursor-pointer shadow-sm"
        >
          <MapPin className="size-4" aria-hidden="true" />
          Request a pad
        </Button>
      </div>
    </header>
  )
}
