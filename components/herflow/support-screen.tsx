'use client'

import { cn } from '@/lib/utils'
import { PeriodMateView } from './periodmate-view'
import { PadWatchView } from './padwatch-view'
import { CommunityView } from './community-view'
import type { PadRequest } from '@/lib/request-types'

export type SupportView = 'periodmate' | 'padwatch' | 'community'

const views: { id: SupportView; label: string }[] = [
  { id: 'periodmate', label: 'PeriodMate' },
  { id: 'padwatch', label: 'PadWatch' },
  { id: 'community', label: 'Pad-to-Pad' },
]

export function SupportScreen({
  view,
  onViewChange,
  onOpenSos,
  request,
  onCompleteRequest,
  onCancelRequest,
  onDismissRequest,
}: {
  view: SupportView
  onViewChange: (v: SupportView) => void
  onOpenSos: () => void
  request: PadRequest | null
  onCompleteRequest: () => void
  onCancelRequest: () => void
  onDismissRequest: () => void
}) {
  return (
    <div className="px-5 pb-8 pt-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Support</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Help is always nearby</h1>
      </header>

      <div role="tablist" aria-label="Support sections" className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            id={`tab-${v.id}`}
            aria-selected={view === v.id}
            aria-controls={`panel-${v.id}`}
            onClick={() => onViewChange(v.id)}
            className={cn(
              'rounded-xl py-2.5 text-sm font-semibold transition-all',
              view === v.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`} className="mt-5">
        {view === 'periodmate' ? (
          <PeriodMateView
            onOpenSos={onOpenSos}
            request={request}
            onCompleteRequest={onCompleteRequest}
            onCancelRequest={onCancelRequest}
            onDismissRequest={onDismissRequest}
          />
        ) : null}
        {view === 'padwatch' ? <PadWatchView /> : null}
        {view === 'community' ? <CommunityView /> : null}
      </div>
    </div>
  )
}
