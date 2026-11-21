'use client'

import { BadgeCheck, Check, Clock, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from './primitives'
import type { PadRequest, RequestStatus } from '@/lib/request-types'
import { cn } from '@/lib/utils'

const steps: { id: RequestStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'completed', label: 'Completed' },
]

export function RequestStatusCard({
  request,
  onComplete,
  onCancel,
  onDismiss,
}: {
  request: PadRequest
  onComplete: () => void
  onCancel: () => void
  onDismiss: () => void
}) {
  const currentIndex = steps.findIndex((s) => s.id === request.status)

  return (
    <Card className="border-rose/40" aria-labelledby="request-status-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-strong">Active request</p>
          <h2 id="request-status-title" className="mt-1 text-base font-semibold">
            {request.item} · {request.location}
          </h2>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {request.anonymous ? 'Anonymous' : 'Named'}
        </span>
      </div>

      <ol className="mt-5 flex items-center" aria-label="Request progress">
        {steps.map((step, i) => {
          const done = i < currentIndex || request.status === 'completed'
          const active = i === currentIndex && request.status !== 'completed'
          return (
            <li key={step.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'relative flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    done && 'border-sage-strong bg-sage-strong text-white',
                    active && 'border-rose-strong bg-rose-soft text-rose-strong',
                    !done && !active && 'border-border bg-card text-muted-foreground',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {active ? (
                    <span className="herflow-pulse absolute inset-0 rounded-full bg-rose" aria-hidden="true" />
                  ) : null}
                  {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn('text-xs font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <span
                  className={cn('mx-1 mb-5 h-0.5 flex-1 rounded-full', i < currentIndex ? 'bg-sage-strong' : 'bg-border')}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="mt-5" aria-live="polite">
        {request.status === 'pending' ? (
          <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3.5">
            <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="flex-1 text-sm text-muted-foreground">Notifying 3 verified helpers nearby…</p>
            <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-full">
              Cancel
            </Button>
          </div>
        ) : null}

        {request.status === 'accepted' && request.helper ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-sage-soft p-3.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-sage text-sm font-semibold text-foreground">
                {request.helper.alias.charAt(0)}
              </span>
              <div className="flex-1">
                <p className="flex items-center gap-1 text-sm font-semibold">
                  {request.helper.alias}
                  <BadgeCheck className="size-4 text-sage-strong" aria-label="Verified helper" />
                </p>
                <p className="text-xs text-muted-foreground">
                  On the way · {request.helper.eta} · {request.helper.distance}
                </p>
              </div>
              <Button variant="outline" size="icon" className="rounded-full bg-card" aria-label="Send masked message">
                <MessageCircle className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <Button onClick={onComplete} className="h-12 w-full rounded-2xl font-semibold">
              I received it
            </Button>
          </div>
        ) : null}

        {request.status === 'completed' ? (
          <div className="flex items-center gap-3 rounded-2xl bg-sage-soft p-3.5">
            <Check className="size-5 text-sage-strong" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">Completed. Thank you for using PeriodMate.</p>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-card"
              aria-label="Dismiss"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
