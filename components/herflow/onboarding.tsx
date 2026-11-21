'use client'

import { useState } from 'react'
import { CalendarHeart, HandHeart, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const steps: { icon: LucideIcon; title: string; body: string; tone: string }[] = [
  {
    icon: CalendarHeart,
    title: 'Understand your cycle',
    body: 'Track periods and symptoms privately and get gentle, personal insights.',
    tone: 'from-lavender-soft to-background text-primary',
  },
  {
    icon: HandHeart,
    title: 'Help is one tap away',
    body: 'Request a pad from verified students nearby, or find a stocked dispenser on campus.',
    tone: 'from-rose-soft to-background text-rose-strong',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Anonymous by default. Your health data stays encrypted and is never shared.',
    tone: 'from-sage-soft to-background text-sage-strong',
  },
]

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  const last = step === steps.length - 1

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs animate-in fade-in p-0 lg:p-6"
    >
      <div className="flex h-full w-full max-w-md flex-col bg-background lg:h-auto lg:max-h-[90dvh] lg:rounded-3xl lg:border lg:border-border/60 lg:shadow-2xl overflow-hidden">
        <div className="flex justify-between px-6 pt-6">
          <span className="text-sm font-bold tracking-tight">
            HERFLOW <span className="text-primary">AI</span>
          </span>
          <button
            type="button"
            onClick={onFinish}
            className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Skip
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center py-6">
          <div
            key={step}
            className={cn(
              'flex size-40 items-center justify-center rounded-full bg-gradient-to-b animate-in fade-in zoom-in-95 duration-500',
              current.tone,
            )}
          >
            <Icon className="size-16" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 id="onboarding-title" className="mt-8 text-2xl font-semibold tracking-tight text-balance">
            {current.title}
          </h2>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-muted-foreground">{current.body}</p>
        </div>
        <div className="px-6 pb-8 pt-2">
          <div className="mb-6 flex justify-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border')}
                aria-hidden="true"
              />
            ))}
          </div>
          <Button
            onClick={() => (last ? onFinish() : setStep(step + 1))}
            className="h-14 w-full rounded-2xl text-base font-semibold cursor-pointer"
          >
            {last ? 'Get started' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
