'use client'

import { useEffect, useRef, useState } from 'react'
import { EyeOff, Loader2, MapPin, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chip, Toggle } from './primitives'
import type { PadRequest } from '@/lib/request-types'

const locations = ['My current location', 'Central Library', 'Lecture Hall Complex', 'Himadri Hostel', 'Sports Complex']
const items = ['Regular pad', 'Heavy flow pad', 'Panty liner', 'Tampon']

export function EmergencySheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (request: Omit<PadRequest, 'id' | 'status' | 'helper'>) => void
}) {
  const [location, setLocation] = useState(locations[0])
  const [item, setItem] = useState(items[0])
  const [anonymous, setAnonymous] = useState(true)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      onSubmit({ location, item, anonymous, note: note.trim() })
      setSubmitting(false)
      setNote('')
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 lg:items-center lg:p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close request sheet"
        className="fixed inset-0 bg-foreground/35 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-title"
        className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-card px-5 pb-8 pt-3 shadow-2xl animate-in slide-in-from-bottom duration-300 lg:rounded-3xl lg:pt-5"
      >
        {/* Mobile drag handle */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted lg:hidden" aria-hidden="true" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-strong">PeriodMate</p>
            <h2 id="sos-title" className="mt-1 text-xl font-semibold tracking-tight">
              Request a pad nearby
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Verified helpers within 300 m are notified instantly.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Where are you?
          </legend>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <Chip key={loc} selected={location === loc} onClick={() => setLocation(loc)}>
                {loc}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="mb-2.5 text-sm font-semibold">What do you need?</legend>
          <div className="grid grid-cols-2 gap-2">
            {items.map((it) => (
              <Chip key={it} selected={item === it} onClick={() => setItem(it)} className="rounded-2xl py-3">
                {it}
              </Chip>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">
            Meeting note <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
            placeholder="e.g. Outside washroom, 1st floor"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </label>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-lavender-soft p-4">
          <div className="flex items-start gap-3">
            <EyeOff className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Stay anonymous</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Helpers only see an alias and approximate location.
              </p>
            </div>
          </div>
          <Toggle checked={anonymous} onChange={setAnonymous} label="Stay anonymous" />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 h-14 w-full rounded-2xl bg-rose-strong text-base font-semibold text-white hover:bg-rose-strong/90 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Sending request…
            </>
          ) : (
            'Send request'
          )}
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-sage-strong" aria-hidden="true" />
          No health data is shared. Communication is consent-based.
        </p>
      </div>
    </div>
  )
}
