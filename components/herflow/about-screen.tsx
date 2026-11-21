import {
  CalendarHeart,
  HandHeart,
  HeartPulse,
  Info,
  Lock,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: CalendarHeart,
    name: 'CycleGuard',
    tagline: 'Tracking & insights',
    desc: 'Log your periods, symptoms and flow privately. Get gentle cycle predictions based on your personal history — never shared with anyone.',
    tone: 'bg-lavender-soft text-primary',
  },
  {
    icon: MapPin,
    name: 'PeriodMate',
    tagline: 'Emergency pad support',
    desc: 'Request a pad from verified student helpers near you in one tap. Fully anonymous by default. Helpers are notified instantly.',
    tone: 'bg-rose-soft text-rose-strong',
  },
  {
    icon: HeartPulse,
    name: 'PadWatch',
    tagline: 'Live dispenser availability',
    desc: 'Real-time stock levels of pad dispensers across campus, so you always know where to find one before it runs out.',
    tone: 'bg-sage-soft text-sage-strong',
  },
  {
    icon: Sparkles,
    name: 'PeriodLens',
    tagline: 'AI health assistant',
    desc: 'Ask anything about menstrual health in English or Hindi. Answers grounded in WHO, NHS and NHM guidance — private and judgement-free.',
    tone: 'bg-lavender-soft text-primary',
  },
  {
    icon: Users,
    name: 'Pad-to-Pad',
    tagline: 'Community',
    desc: 'A campus-wide anonymous board where students can offer or request pads. Building solidarity, one cycle at a time.',
    tone: 'bg-rose-soft text-rose-strong',
  },
]

const values = [
  {
    icon: Lock,
    title: 'Private by design',
    body: 'All health data is end-to-end encrypted. Anonymous by default. We never sell or share your information.',
  },
  {
    icon: HandHeart,
    title: 'Community-first',
    body: 'Built on the belief that menstrual equity is a campus issue. Helpers are verified students who choose to give back.',
  },
  {
    icon: Info,
    title: 'Medically grounded',
    body: 'All AI responses are based on WHO, NHS and NHM guidance. We flag when something needs a real doctor.',
  },
]

export function AboutScreen({ onNavigate }: { onNavigate: (tab: 'home' | 'cycle' | 'support' | 'assistant' | 'profile') => void }) {
  return (
    <div className="space-y-16 px-6 py-10 lg:px-10">

      {/* Hero */}
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">About HERFLOW AI</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance lg:text-5xl">
          Smart menstrual health,<br />built for campus life.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          HERFLOW AI is a holistic menstrual health ecosystem designed for college students — bringing cycle tracking,
          emergency pad access, dispenser visibility and an AI health assistant together in one private, secure app.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => onNavigate('home')}
            className="h-12 rounded-2xl px-6 font-semibold"
          >
            Open the app
          </Button>
          <Button
            onClick={() => onNavigate('support')}
            variant="outline"
            className="h-12 rounded-2xl px-6 font-semibold"
          >
            Request a pad
          </Button>
        </div>
      </section>

      {/* Features grid */}
      <section aria-labelledby="features-title">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What we offer</p>
        <h2 id="features-title" className="mt-2 text-2xl font-semibold tracking-tight">
          Everything you need, in one place
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <article
                key={f.name}
                className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(41,40,50,0.04),0_8px_24px_-12px_rgba(41,40,50,0.08)]"
              >
                <span className={`flex size-11 items-center justify-center rounded-2xl ${f.tone}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-base font-semibold">{f.name}</p>
                  <p className="text-xs font-medium text-muted-foreground">{f.tagline}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="rounded-3xl bg-gradient-to-br from-lavender-soft via-background to-rose-soft p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our values</p>
        <h2 id="values-title" className="mt-2 text-2xl font-semibold tracking-tight">
          Why we built this
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {values.map((v) => {
            const Icon = v.icon
            return (
              <div key={v.title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-card shadow-sm">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </span>
                <p className="font-semibold">{v.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats strip */}
      <section aria-label="Impact numbers" className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {[
          { value: '5,000+', label: 'Students served' },
          { value: '12', label: 'Campus dispensers tracked' },
          { value: '98%', label: 'Anonymous by default' },
          { value: '3 min', label: 'Avg. helper response time' },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-border/70 bg-card p-5 text-center shadow-sm">
            <p className="text-3xl font-semibold tracking-tight text-primary">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* CTA footer */}
      <section className="rounded-3xl bg-gradient-to-br from-[#7d73ad] via-[#8b82b8] to-[#b89bb4] p-8 text-center text-white lg:p-12">
        <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
          Join thousands of students who track, support and learn together — privately and without judgment.
        </p>
        <Button
          onClick={() => onNavigate('home')}
          className="mt-6 h-12 rounded-2xl bg-white px-8 font-semibold text-primary hover:bg-white/90"
        >
          Open HERFLOW AI
        </Button>
      </section>

    </div>
  )
}
