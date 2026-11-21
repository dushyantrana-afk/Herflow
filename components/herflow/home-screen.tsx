'use client'

import { useState } from 'react'
import { ArrowRight, Bell, Check, ChevronRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Chip, SectionHeader, StockBadge, StockBar } from './primitives'
import { RequestStatusCard } from './request-status-card'
import { dispensers, moods, symptoms, user as defaultUser, type TabId } from '@/lib/herflow-data'
import type { PadRequest } from '@/lib/request-types'
import { saveDailyCheckIn } from '@/lib/supabase/services'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

export function HomeScreen({
  onNavigate,
  onOpenSos,
  request,
  onCompleteRequest,
  onCancelRequest,
  onDismissRequest,
}: {
  onNavigate: (tab: TabId, supportView?: 'padwatch') => void
  onOpenSos: () => void
  request: PadRequest | null
  onCompleteRequest: () => void
  onCancelRequest: () => void
  onDismissRequest: () => void
}) {
  const { user: authUser } = useAuth()
  const user = authUser || defaultUser

  return (
    <div className="space-y-5 px-5 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Sunday, 15 November</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-balance">Good morning, {user.name}</h1>
        </div>
        <button
          type="button"
          className="relative flex size-11 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Notifications, 2 unread"
        >
          <Bell className="size-5" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-strong" aria-hidden="true" />
        </button>
      </header>

      <CycleOverviewCard user={user} onOpen={() => onNavigate('cycle')} />

      {request ? (
        <RequestStatusCard
          request={request}
          onComplete={onCompleteRequest}
          onCancel={onCancelRequest}
          onDismiss={onDismissRequest}
        />
      ) : (
        <EmergencyCard onOpenSos={onOpenSos} />
      )}

      <SymptomCheckIn />

      <NearbySupply onViewMap={() => onNavigate('support', 'padwatch')} />

      <AssistantEntry onOpen={() => onNavigate('assistant')} />
    </div>
  )
}

function CycleOverviewCard({ onOpen, user }: { onOpen: () => void; user: { cycleDay?: number; cycleLength?: number; phase?: string } }) {
  const cycleDay = user.cycleDay ?? 14
  const cycleLength = user.cycleLength ?? 28
  const progress = cycleDay / cycleLength
  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <section
      aria-labelledby="cycle-overview-title"
      className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#7d73ad] via-[#8b82b8] to-[#b89bb4] p-5 text-white shadow-[0_18px_40px_-20px_rgba(98,88,152,0.7)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-white/5" aria-hidden="true" />
      <div className="relative flex items-center gap-5">
        <div className="relative size-32 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-white/80">Day</span>
            <span className="text-4xl font-semibold leading-none">{cycleDay}</span>
            <span className="mt-0.5 text-xs text-white/80">of {cycleLength}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="cycle-overview-title" className="text-xs font-semibold uppercase tracking-wider text-white/80">
            CycleGuard
          </h2>
          <p className="mt-1 text-lg font-semibold leading-snug">{user.phase || 'Ovulation window'}</p>
          <p className="mt-3 text-sm text-white/85">Next period estimate</p>
          <p className="text-2xl font-semibold">In {user.nextPeriodInDays} days</p>
          <p className="mt-0.5 text-xs text-white/75">Around 30 Nov · based on 6 cycles</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="relative mt-5 flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
      >
        View calendar &amp; insights
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </section>
  )
}

function EmergencyCard({ onOpenSos }: { onOpenSos: () => void }) {
  return (
    <Card className="border-rose/40 bg-gradient-to-br from-rose-soft to-card" aria-labelledby="sos-card-title">
      <div className="flex items-start gap-4">
        <div className="relative flex size-12 shrink-0 items-center justify-center">
          <span className="herflow-pulse absolute inset-0 rounded-full bg-rose" aria-hidden="true" />
          <span className="relative flex size-12 items-center justify-center rounded-full bg-rose-strong text-white">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
        </div>
        <div className="flex-1">
          <h2 id="sos-card-title" className="text-base font-semibold">
            Need a pad right now?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            3 verified helpers and 2 dispensers are within 300 m of you.
          </p>
        </div>
      </div>
      <Button
        onClick={onOpenSos}
        className="mt-4 h-13 w-full rounded-2xl bg-rose-strong py-3.5 text-base font-semibold text-white hover:bg-rose-strong/90"
      >
        Request a pad now
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-sage-strong" aria-hidden="true" />
        Anonymous by default
      </p>
    </Card>
  )
}

function SymptomCheckIn() {
  const [mood, setMood] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const toggle = (s: string) => {
    setSaved(false)
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <Card aria-labelledby="checkin-title">
      <SectionHeader id="checkin-title" eyebrow="Daily check-in" title="How are you feeling today?" />
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Mood">
        {moods.map((m) => (
          <Chip
            key={m.id}
            selected={mood === m.id}
            onClick={() => {
              setSaved(false)
              setMood(m.id)
            }}
            className="shrink-0"
          >
            {m.label}
          </Chip>
        ))}
      </div>
      <p className="mb-2.5 mt-4 text-sm font-medium text-muted-foreground">Symptoms</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Symptoms">
        {symptoms.slice(0, 6).map((s) => (
          <Chip key={s} selected={selected.includes(s)} onClick={() => toggle(s)}>
            {s}
          </Chip>
        ))}
      </div>
      <Button
        onClick={() => {
          saveDailyCheckIn({ mood, symptoms: selected })
          setSaved(true)
        }}
        disabled={!mood && selected.length === 0}
        variant={saved ? 'secondary' : 'default'}
        className={cn('mt-5 h-12 w-full rounded-2xl font-semibold', saved && 'bg-sage-soft text-sage-strong')}
      >
        {saved ? (
          <>
            <Check className="size-4" aria-hidden="true" /> Saved privately
          </>
        ) : (
          'Save check-in'
        )}
      </Button>
      <p className="sr-only" aria-live="polite">
        {saved ? 'Check-in saved' : ''}
      </p>
    </Card>
  )
}

function NearbySupply({ onViewMap }: { onViewMap: () => void }) {
  const nearby = [...dispensers].sort((a, b) => parseInt(a.distance) - parseInt(b.distance)).slice(0, 3)
  return (
    <Card aria-labelledby="supply-title">
      <SectionHeader
        id="supply-title"
        eyebrow="PadWatch · Live"
        title="Nearby pad availability"
        action={
          <button type="button" onClick={onViewMap} className="text-sm font-semibold text-primary hover:underline">
            View map
          </button>
        }
      />
      <ul className="space-y-4">
        {nearby.map((d) => (
          <li key={d.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.distance} · refilled {d.lastRefill}
                </p>
              </div>
              <StockBadge stock={d.stock} />
            </div>
            <StockBar stock={d.stock} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

function AssistantEntry({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-3xl border border-border/70 bg-gradient-to-r from-sage-soft to-card p-5 text-left transition-shadow hover:shadow-md"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm">
        <Sparkles className="size-5 text-primary" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-base font-semibold">Ask PeriodLens</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          Private AI answers in English &amp; हिंदी
        </span>
      </span>
      <ArrowRight
        className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  )
}
