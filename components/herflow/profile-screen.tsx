'use client'

import { useState } from 'react'
import {
  ChevronRight,
  Fingerprint,
  Globe,
  GraduationCap,
  HeartPulse,
  LogOut,
  PlayCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Card, Toggle } from './primitives'
import { user as defaultUser } from '@/lib/herflow-data'
import { useAuth } from '@/lib/auth-context'

export function ProfileScreen({
  onReplayOnboarding,
  onOpenAuth,
}: {
  onReplayOnboarding: () => void
  onOpenAuth?: () => void
}) {
  const { user: authUser, isDemo, signOut } = useAuth()
  const displayName = authUser?.name || defaultUser.name
  const displayCampus = authUser?.campus || defaultUser.campus
  const displayEmail = authUser?.email || ''

  const [settings, setSettings] = useState({
    anonymous: true,
    lock: true,
    hideWidgets: false,
    research: false,
    periodReminders: true,
    lowStock: true,
    helperRequests: false,
  })
  const set = (key: keyof typeof settings) => (v: boolean) => setSettings((s) => ({ ...s, [key]: v }))

  return (
    <div className="space-y-5 px-5 pb-8 pt-6">
      <header className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-lavender to-rose text-2xl font-semibold text-white shadow-sm">
          {displayName.charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight truncate">{displayName}</h1>
            {isDemo && (
              <span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                Demo
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <GraduationCap className="size-3.5 text-primary" />
            <span>{displayCampus}</span>
            <span>·</span>
            <span className="text-sage-strong font-medium">Verified Student</span>
          </p>
          {displayEmail && (
            <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
              {displayEmail}
            </p>
          )}
        </div>
      </header>

      {isDemo && onOpenAuth && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-lavender-soft/60 p-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-4 text-primary shrink-0" />
            <p className="text-foreground">
              You are viewing in <strong>Campus Demo Mode</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-xl bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Sign In with College ID
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl bg-sage-soft p-4">
        <ShieldCheck className="size-5 text-sage-strong" aria-hidden="true" />
        <p className="text-sm leading-relaxed">
          Your health data is end-to-end encrypted and never sold or shared.
        </p>
      </div>

      <SettingsGroup title="Privacy & security">
        <ToggleRow label="Anonymous by default" hint="Use an alias for all requests" checked={settings.anonymous} onChange={set('anonymous')} />
        <ToggleRow label="App lock" hint="Face ID or fingerprint" icon={Fingerprint} checked={settings.lock} onChange={set('lock')} />
        <ToggleRow label="Discreet notifications" hint="Hide cycle details on lock screen" checked={settings.hideWidgets} onChange={set('hideWidgets')} />
        <ToggleRow label="Share anonymised data for research" hint="Off by default. Opt-in only." checked={settings.research} onChange={set('research')} />
      </SettingsGroup>

      <SettingsGroup title="Notifications">
        <ToggleRow label="Period reminders" checked={settings.periodReminders} onChange={set('periodReminders')} />
        <ToggleRow label="Low-stock alerts" checked={settings.lowStock} onChange={set('lowStock')} />
        <ToggleRow label="Nearby help requests" checked={settings.helperRequests} onChange={set('helperRequests')} />
      </SettingsGroup>

      <SettingsGroup title="Support">
        <LinkRow icon={Globe} label="Language" value="English, हिंदी" />
        <LinkRow icon={HeartPulse} label="Campus health centre" value="Open till 8 PM" />
        <LinkRow icon={Phone} label="Emergency contacts" value="2 added" />
        <li>
          <button type="button" onClick={onReplayOnboarding} className="flex w-full items-center gap-3 px-5 py-4 text-left">
            <PlayCircle className="size-5 text-muted-foreground" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">View onboarding</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </li>
      </SettingsGroup>

      <button
        type="button"
        onClick={() => signOut()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {isDemo ? 'Exit Demo & Sign Out' : 'Sign out'}
      </button>
      <p className="text-center text-xs text-muted-foreground">HERFLOW AI · v1.0</p>
    </div>
  )
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <Card as="div" className="p-0">
        <ul className="divide-y divide-border">{children}</ul>
      </Card>
    </section>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
  icon?: LucideIcon
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-4">
      {Icon ? <Icon className="size-5 text-muted-foreground" aria-hidden="true" /> : null}
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </li>
  )
}

function LinkRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li>
      <button type="button" className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
        <span className="flex-1 text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{value}</span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}
