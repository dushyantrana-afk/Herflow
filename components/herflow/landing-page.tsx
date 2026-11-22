'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CalendarHeart,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Lock,
  MapPin,
  PackageCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dispensers } from '@/lib/herflow-data'
import type { AuthModalMode } from './auth-modal'

interface LandingPageProps {
  onOpenAuth: (mode: AuthModalMode) => void
  onExploreDemo: () => void
}

export function LandingPage({ onOpenAuth, onExploreDemo }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq((curr) => (curr === index ? null : index))
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#f4f1fa,transparent_60%),radial-gradient(ellipse_at_bottom_right,#faeff1,transparent_55%)] text-foreground">
      {/* ── TOP STICKY NAVBAR ── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-rose text-white shadow-sm font-bold text-sm">
              H
            </span>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight leading-tight">
                HERFLOW <span className="text-primary font-bold">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <GraduationCap className="size-3 text-primary" />
                Verified Campus Network
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#dispensers" className="hover:text-foreground transition-colors">
              Smart Dispensers
            </a>
            <a href="#padwatch" className="hover:text-foreground transition-colors">
              SOS Delivery
            </a>
            <a href="#periodlens" className="hover:text-foreground transition-colors">
              OpenAI
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Campus Security
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExploreDemo}
              className="text-xs font-semibold hidden sm:inline-flex"
            >
              Demo Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAuth('signin')}
              className="rounded-xl text-xs font-semibold border-border hover:bg-muted"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenAuth('signup')}
              className="rounded-xl bg-gradient-to-r from-primary to-lavender-strong text-xs font-semibold text-white shadow-sm hover:opacity-95"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-lavender-soft/70 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs mb-6 backdrop-blur-sm">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>Campus Menstrual Dignity & Telemetry Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Period Dignity & Smart Hygiene,{' '}
              <span className="bg-gradient-to-r from-primary via-lavender-strong to-rose-strong bg-clip-text text-transparent">
                Engineered for Campus Life.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Real-time dispenser stock tracking across colleges, emergency peer pad delivery in &lt;15 minutes, and private AI health guidance — zero shame, 100% encrypted.
            </p>

            {/* Email Verification Callout */}
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-sage-strong bg-sage-soft/80 border border-sage-strong/20 px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="size-4" />
              <span>Restricted to official college emails (.edu, .ac.in) for student safety</span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                size="lg"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary to-lavender-strong px-8 py-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              >
                Join with College ID
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onExploreDemo}
                className="w-full sm:w-auto rounded-2xl border-border/80 bg-card px-8 py-6 text-sm font-semibold text-foreground hover:bg-muted shadow-xs transition-all"
              >
                <Sparkles className="mr-2 size-4 text-lavender" />
                Explore Live Campus Demo
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/60 pt-8 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">12+</p>
                <p className="text-xs text-muted-foreground mt-0.5">Partner Campuses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">&lt; 12 min</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg. SOS Delivery</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">98.4%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dispenser Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-strong">Zero</p>
                <p className="text-xs text-muted-foreground mt-0.5">Personal Data Sold</p>
              </div>
            </div>
          </div>

          {/* Device Showcase Preview */}
          <div className="mt-14 mx-auto max-w-5xl rounded-3xl border border-border/80 bg-card/60 p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Live Dispensers */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-lavender-soft text-primary font-bold">
                    <PackageCheck className="size-4" />
                  </span>
                  <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[10px] font-semibold text-sage-strong">
                    Live Telemetry
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Central Library Dispenser</h3>
                  <p className="text-xs text-muted-foreground">Ground Floor · 120m away</p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Stock Level</span>
                    <span className="text-primary font-bold">82% Available</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-lavender rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>
              </div>

              {/* Card 2: SOS Emergency Delivery */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-rose-soft text-rose-strong font-bold">
                    <Zap className="size-4" />
                  </span>
                  <span className="rounded-full bg-rose-soft px-2 py-0.5 text-[10px] font-semibold text-rose-strong">
                    SOS PadWatch
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Sudden Period in Lecture?</h3>
                  <p className="text-xs text-muted-foreground">Tap 1-click discreet request</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                  <Users className="size-3.5 text-primary shrink-0" />
                  <span>3 verified peer helpers currently active nearby</span>
                </div>
              </div>

              {/* Card 3: PeriodLens OpenAI */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-lavender-soft text-primary font-bold">
                    <Bot className="size-4" />
                  </span>
                  <span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                    GPT-4o Mini
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">PeriodLens AI Health</h3>
                  <p className="text-xs text-muted-foreground">WHO & NHM Evidence-based</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-2.5 text-xs text-foreground italic">
                  &ldquo;Your luteal phase is normal this cycle. For mild cramping, warm chamomile tea and magnesium help...&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE 4 PILLARS SECTION ── */}
      <section id="features" className="py-20 bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Complete Campus Ecosystem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
              Four Core Pillars That Protect Every Student
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              HERFLOW replaces broken coin dispensers and whispered emergencies with modern hardware telemetry and privacy-preserving software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div id="dispensers" className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-lavender-soft text-primary mb-5">
                  <Building2 className="size-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Smart IoT Dispensers (PadWatch)
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  View real-time stock levels of sanitary pad dispensers in libraries, academic blocks, and hostel washrooms. Our sensor telemetry predicts runout times before machines empty out, alerting campus maintenance to refill in advance.
                </p>
                <ul className="mt-5 space-y-2 text-xs font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Live distance & stock indicator (Green, Amber, Red)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Predictive empty-time forecasting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Interactive campus map with shortest walking route
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>Refilled automatically</span>
                <span className="font-semibold text-primary">Zero Coin Dependency</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div id="padwatch" className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-soft text-rose-strong mb-5">
                  <HandHeart className="size-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  SOS Peer Emergency Delivery (PeriodMate)
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Caught off-guard in the middle of an exam or lab without a pad? Send a discreet, anonymous SOS request. Verified female student peers in the same building receive an alert and deliver supplies directly to your washroom stall in minutes.
                </p>
                <ul className="mt-5 space-y-2 text-xs font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> 100% Anonymous aliases protect your identity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Real-time status tracker (Pending &rarr; Accepted &rarr; Delivered)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Safe, peer-verified college student network
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>Average delivery time</span>
                <span className="font-semibold text-rose-strong">&lt; 15 Minutes</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div id="periodlens" className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-lavender-soft text-primary mb-5">
                  <Bot className="size-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  PeriodLens AI Companion (OpenAI)
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Get private, judgment-free answers to symptoms, mood swings, PMS, and cycle irregularities. Powered by OpenAI and aligned with WHO, NHS, and National Health Mission protocols. Bilingual in English and Hindi.
                </p>
                <ul className="mt-5 space-y-2 text-xs font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Personalized to your exact cycle day and phase
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Bilingual support (English & हिंदी) with voice input
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Science-backed myth-busting for cultural taboos
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>Educational health guidance</span>
                <span className="font-semibold text-primary">Zero Jargon</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div id="cycleguard" className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-sage-soft text-sage-strong mb-5">
                  <CalendarHeart className="size-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  CycleGuard Private Intelligence
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Track your period dates, flow intensities, and symptoms with zero tracking by commercial data brokers. Your biological telemetry stays on your device and inside encrypted Supabase vaults.
                </p>
                <ul className="mt-5 space-y-2 text-xs font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Accurate window forecasts for upcoming exams & travel
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> Symptom & mood correlation logging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-sage-strong" /> End-to-end encrypted; never shared with advertisers
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>Privacy model</span>
                <span className="font-semibold text-sage-strong">End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLLEGE VERIFICATION GUARANTEE SECTION ── */}
      <section id="security" className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-lavender/30 via-background to-rose/25 border border-border/80 p-8 sm:p-14 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                  <Lock className="size-3.5" />
                  Institutional Access Only
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  Why We Require Your Official College Email.
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  HERFLOW is an exclusive, closed sanctuary. We strictly prohibit commercial email providers (like @gmail.com or @yahoo.com) so that:
                </p>
                <ul className="mt-6 space-y-3.5 text-sm text-foreground">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-sage-strong shrink-0 mt-0.5" />
                    <span><strong>Verified Student Community:</strong> Every user requesting or delivering an emergency pad is an authenticated campus member.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-sage-strong shrink-0 mt-0.5" />
                    <span><strong>Trolling & Abuse Prevention:</strong> Bad actors from the public web cannot access the peer support channels.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-sage-strong shrink-0 mt-0.5" />
                    <span><strong>Zero Data Monetization:</strong> Your sensitive cycle and reproductive health records will never be commercialized.</span>
                  </li>
                </ul>

                <div className="mt-8 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-xl border border-border bg-card px-3 py-1 font-mono">*.edu</span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 font-mono">*.ac.in</span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 font-mono">*.edu.in</span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 font-mono">*.ac.uk</span>
                  <span className="rounded-xl border border-border bg-card px-3 py-1 font-mono">*.college</span>
                </div>
              </div>

              {/* Visual Card showing blocked vs allowed */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain Verification Filter</p>
                
                <div className="flex items-center justify-between rounded-xl border border-sage-strong/30 bg-sage-soft p-3.5 text-xs text-sage-strong">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">ananya@iitd.ac.in</p>
                      <p className="text-[11px] text-muted-foreground">IIT Delhi verified institutional domain</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-sage-strong px-2 py-0.5 text-[10px] font-bold text-white">
                    ALLOWED
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-sage-strong/30 bg-sage-soft p-3.5 text-xs text-sage-strong">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">priya@stanford.edu</p>
                      <p className="text-[11px] text-muted-foreground">Accredited university student domain</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-sage-strong px-2 py-0.5 text-[10px] font-bold text-white">
                    ALLOWED
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="size-4 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">student123@gmail.com</p>
                      <p className="text-[11px] text-destructive/80">Commercial personal provider rejected</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">
                    BLOCKED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE DISPENSERS PREVIEW ── */}
      <section className="py-16 bg-card/40 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Live Campus Network</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                Real-Time Dispenser Status
              </h2>
            </div>
            <button
              type="button"
              onClick={onExploreDemo}
              className="mt-3 sm:mt-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Full Campus Map &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dispensers.slice(0, 4).map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-3 text-primary" /> {d.distance}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        d.stock > 40
                          ? 'bg-sage-soft text-sage-strong'
                          : d.stock > 20
                          ? 'bg-lavender-soft text-primary'
                          : 'bg-rose-soft text-rose-strong'
                      }`}
                    >
                      {d.stock} pads left
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground leading-snug">{d.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.building}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-[11px] flex justify-between text-muted-foreground">
                  <span>Last refilled: {d.lastRefill}</span>
                  <span className="font-medium text-foreground">{d.predictedEmptyIn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Common Questions</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: 'Why can’t I use my personal Gmail or Yahoo account to sign up?',
                a: 'To guarantee student safety, prevent public trolling, and protect emergency pad delivery requests, HERFLOW restricts membership strictly to students and faculty with verified college/university email addresses (.edu, .ac.in, etc.).',
              },
              {
                q: 'Can my professors or campus administrators see my cycle logs?',
                a: 'Never. Your menstrual cycle dates, logged symptoms, and health questions with PeriodLens are end-to-end encrypted. College authorities only receive aggregated, anonymized dispenser telemetry so they know when to restock machines.',
              },
              {
                q: 'How does the SOS emergency pad delivery maintain privacy?',
                a: 'When you tap SOS, you choose a discrete location (like "Library 2nd Floor Washroom, Stall 3"). The helper only sees your chosen anonymous alias (e.g., "SilverRobin") — never your real name or room number. Supplies are delivered discreetly in minutes.',
              },
              {
                q: 'Is PeriodLens AI a replacement for a campus doctor?',
                a: 'PeriodLens is an educational health assistant grounded in WHO and Indian NHM guidance. It provides reassurance and evidence-based tips. In severe cases (heavy flooding, extreme fever, or unmanageable pain), it connects you with campus emergency contacts and 112.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ── */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-lavender/20 to-rose/15 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-rose text-white shadow-md mx-auto mb-4 font-bold text-lg">
            H
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Never Let a Sudden Period Interrupt Your Education.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Join thousands of students on campuses across India and worldwide who navigate cycle health with dignity, privacy, and peer solidarity.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary to-lavender-strong px-8 py-6 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
            >
              Register with College ID
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onOpenAuth('signin')}
              className="w-full sm:w-auto rounded-2xl border-border bg-card px-8 py-6 text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/70 bg-background/80 py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">HERFLOW AI</span>
            <span>·</span>
            <span>Campus Menstrual Health & IoT Dispenser Network</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={onExploreDemo} className="hover:text-foreground cursor-pointer">
              Launch Demo
            </button>
            <button type="button" onClick={() => onOpenAuth('signin')} className="hover:text-foreground cursor-pointer">
              Sign In
            </button>
            <button type="button" onClick={() => onOpenAuth('signup')} className="hover:text-foreground cursor-pointer">
              Register
            </button>
            <span className="text-rose-strong font-medium flex items-center gap-1">
              <AlertTriangle className="size-3" /> Campus SOS: 112
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
