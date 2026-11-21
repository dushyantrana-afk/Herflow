'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Info, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Chip, SectionHeader } from './primitives'
import { cycleHistory, symptoms, user } from '@/lib/herflow-data'
import { cn } from '@/lib/utils'

const TODAY = new Date(2026, 10, 15)
const LAST_PERIOD_START = new Date(2026, 10, 2)
const DAY_MS = 86_400_000
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type DayKind = 'period' | 'predicted' | 'fertile' | 'ovulation' | null

function dayKind(date: Date): DayKind {
  const diff = Math.round((date.getTime() - LAST_PERIOD_START.getTime()) / DAY_MS)
  const pos = ((diff % user.cycleLength) + user.cycleLength) % user.cycleLength
  const isFuture = date > TODAY
  if (pos < user.periodLength) return isFuture ? 'predicted' : 'period'
  if (pos === 14) return 'ovulation'
  if (pos >= 9 && pos <= 15) return 'fertile'
  return null
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export function CycleScreen() {
  const [month, setMonth] = useState(new Date(2026, 10, 1))
  const [selected, setSelected] = useState<Date>(TODAY)
  const [logged, setLogged] = useState<string[]>([])
  const [reportReady, setReportReady] = useState(false)

  const firstWeekday = month.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ]

  const shiftMonth = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  const selectedKind = dayKind(selected)
  const avgLength = Math.round(cycleHistory.reduce((s, c) => s + c.length, 0) / cycleHistory.length)
  const maxLen = Math.max(...cycleHistory.map((c) => c.length))

  return (
    <div className="space-y-5 px-5 pb-8 pt-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">CycleGuard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your cycle</h1>
      </header>

      <Card aria-labelledby="calendar-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="calendar-title" className="text-base font-semibold" aria-live="polite">
            {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftMonth(1)} aria-label="Next month">
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="pb-2 text-xs font-medium text-muted-foreground" aria-hidden="true">
              {d}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`e-${i}`} />
            const kind = dayKind(date)
            const isToday = sameDay(date, TODAY)
            const isSelected = sameDay(date, selected)
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={isSelected}
                aria-label={`${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}${kind ? `, ${kind}` : ''}${isToday ? ', today' : ''}`}
                className="flex items-center justify-center py-0.5"
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    kind === 'period' && 'bg-rose text-foreground',
                    kind === 'predicted' && 'border-2 border-dashed border-rose text-rose-strong',
                    kind === 'fertile' && 'bg-sage-soft text-sage-strong',
                    kind === 'ovulation' && 'bg-sage text-foreground',
                    isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                    isSelected && !isToday && 'ring-2 ring-foreground/70 ring-offset-2 ring-offset-card',
                    !kind && 'hover:bg-muted',
                  )}
                >
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <Legend className="bg-rose" label="Period" />
          <Legend className="border-2 border-dashed border-rose" label="Predicted" />
          <Legend className="bg-sage-soft" label="Fertile" />
          <Legend className="bg-sage" label="Ovulation" />
        </ul>
      </Card>

      <Card aria-labelledby="day-title">
        <SectionHeader
          id="day-title"
          eyebrow={selectedKind ? selectedKind.charAt(0).toUpperCase() + selectedKind.slice(1) : 'Cycle day'}
          title={selected.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Log symptoms">
          {symptoms.map((s) => (
            <Chip
              key={s}
              selected={logged.includes(s)}
              onClick={() => setLogged((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))}
            >
              {s}
            </Chip>
          ))}
        </div>
        <Button variant="outline" className="mt-4 h-11 w-full rounded-2xl">
          <Plus className="size-4" aria-hidden="true" />
          Log period start
        </Button>
      </Card>

      <Card aria-labelledby="trends-title">
        <SectionHeader
          id="trends-title"
          eyebrow="Last 6 cycles"
          title="Cycle history & trends"
          action={<span className="text-sm font-semibold text-primary">Avg {avgLength} days</span>}
        />
        <div className="flex h-36 items-end justify-between gap-3" role="img" aria-label={`Cycle lengths: ${cycleHistory.map((c) => `${c.month} ${c.length} days`).join(', ')}`}>
          {cycleHistory.map((c, i) => (
            <div key={c.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold">{c.length}</span>
              <div
                className={cn('w-full rounded-xl', i === cycleHistory.length - 1 ? 'bg-primary' : 'bg-lavender-soft')}
                style={{ height: `${(c.length / maxLen) * 88}px` }}
              />
              <span className="text-xs text-muted-foreground">{c.month}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card aria-labelledby="insights-title" className="bg-gradient-to-br from-lavender-soft to-card">
        <SectionHeader id="insights-title" eyebrow="Personal patterns" title="Insights" />
        <ul className="space-y-3">
          <Insight text="Your cycle has stayed regular (27–30 days) for 6 months." />
          <Insight text="Cramps are most often logged on day 1–2. Gentle heat and hydration may help." />
          <Insight text="Fatigue tends to rise 2 days before your period starts." />
        </ul>
      </Card>

      <Card aria-labelledby="report-title">
        <SectionHeader id="report-title" eyebrow="For your doctor" title="Health-history report" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          A private summary of your cycles, symptoms and flow, ready to share with a clinician.
        </p>
        <Button
          onClick={() => setReportReady(true)}
          variant={reportReady ? 'secondary' : 'default'}
          className="mt-4 h-12 w-full rounded-2xl font-semibold"
        >
          <Download className="size-4" aria-hidden="true" />
          {reportReady ? 'Report ready · Download PDF' : 'Generate report'}
        </Button>
      </Card>

      <aside className="flex gap-3 rounded-2xl bg-muted/70 p-4 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Predictions are estimates based on your logged data and are not a form of contraception or medical
          diagnosis. Please consult a qualified healthcare professional for medical advice.
        </p>
      </aside>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-full', className)} aria-hidden="true" />
      {label}
    </li>
  )
}

function Insight({ text }: { text: string }) {
  return (
    <li className="flex gap-3 rounded-2xl bg-card p-3.5 text-sm leading-relaxed">
      <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      {text}
    </li>
  )
}
