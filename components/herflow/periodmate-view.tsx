'use client'

import { useState } from 'react'
import { ArrowRight, BadgeCheck, HandHeart, Lock, MessageSquareLock, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, SectionHeader, Toggle } from './primitives'
import { RequestStatusCard } from './request-status-card'
import { helpers } from '@/lib/herflow-data'
import type { PadRequest } from '@/lib/request-types'

export function PeriodMateView({
  onOpenSos,
  request,
  onCompleteRequest,
  onCancelRequest,
  onDismissRequest,
}: {
  onOpenSos: () => void
  request: PadRequest | null
  onCompleteRequest: () => void
  onCancelRequest: () => void
  onDismissRequest: () => void
}) {
  const [offering, setOffering] = useState(false)

  return (
    <div className="space-y-5">
      {request ? (
        <RequestStatusCard
          request={request}
          onComplete={onCompleteRequest}
          onCancel={onCancelRequest}
          onDismiss={onDismissRequest}
        />
      ) : (
        <section
          aria-labelledby="pm-title"
          className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#a35d68] to-[#c48690] p-5 text-white"
        >
          <h2 id="pm-title" className="text-xl font-semibold">
            Emergency pad request
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/90">
            One tap notifies verified helpers near you. Average response time on campus: 3 minutes.
          </p>
          <Button
            onClick={onOpenSos}
            className="mt-5 h-13 w-full rounded-2xl bg-white py-3.5 text-base font-semibold text-rose-strong hover:bg-white/90"
          >
            Request a pad now
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </section>
      )}

      <Card aria-labelledby="helpers-title">
        <SectionHeader
          id="helpers-title"
          eyebrow="Within 300 m"
          title="Verified helpers nearby"
          action={
            <span className="flex items-center gap-1.5 text-xs font-medium text-sage-strong">
              <span className="size-2 rounded-full bg-sage-strong" aria-hidden="true" />
              {helpers.length} online
            </span>
          }
        />
        <ul className="divide-y divide-border">
          {helpers.map((h) => (
            <li key={h.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-10 items-center justify-center rounded-full bg-lavender-soft text-sm font-semibold text-secondary-foreground">
                {h.alias.charAt(0)}
              </span>
              <div className="flex-1">
                <p className="flex items-center gap-1 text-sm font-semibold">
                  {h.alias}
                  {h.verified ? <BadgeCheck className="size-4 text-sage-strong" aria-label="Verified" /> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {h.distance} away · helped {h.helped} students
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{h.eta}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card aria-labelledby="offer-title" className="bg-gradient-to-br from-sage-soft to-card">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm">
            <HandHeart className="size-5 text-sage-strong" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 id="offer-title" className="text-base font-semibold">
              Offer a pad nearby
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {offering
                ? 'You are visible as an available helper. You can accept or decline every request.'
                : 'Become an available helper when you have an extra pad with you.'}
            </p>
          </div>
          <Toggle checked={offering} onChange={setOffering} label="Available as helper" />
        </div>
      </Card>

      <Card aria-labelledby="safety-title">
        <SectionHeader id="safety-title" eyebrow="Safety by design" title="Your privacy is protected" />
        <ul className="space-y-3 text-sm">
          <SafetyItem icon={Lock} text="Requests show only an alias and approximate building." />
          <SafetyItem icon={UserCheck} text="Helpers are verified with a campus ID." />
          <SafetyItem icon={MessageSquareLock} text="Masked, consent-based chat that expires after 1 hour." />
          <SafetyItem icon={ShieldCheck} text="No health data is ever shared with helpers." />
        </ul>
      </Card>
    </div>
  )
}

function SafetyItem({ icon: Icon, text }: { icon: typeof Lock; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lavender-soft">
        <Icon className="size-4 text-primary" aria-hidden="true" />
      </span>
      <span className="pt-1.5 leading-relaxed">{text}</span>
    </li>
  )
}
