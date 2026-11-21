'use client'

import { Activity, useCallback, useEffect, useRef, useState } from 'react'
import { BottomNav } from './bottom-nav'
import { DesktopNav, type DesktopTabId } from './desktop-nav'
import { HomeScreen } from './home-screen'
import { CycleScreen } from './cycle-screen'
import { SupportScreen, type SupportView } from './support-screen'
import { AssistantScreen } from './assistant-screen'
import { ProfileScreen } from './profile-screen'
import { AboutScreen } from './about-screen'
import { EmergencySheet } from './emergency-sheet'
import { Onboarding } from './onboarding'
import { AuthModal, type AuthModalMode } from './auth-modal'
import { helpers, type TabId } from '@/lib/herflow-data'
import type { PadRequest } from '@/lib/request-types'
import { submitPadRequest, updateRequestStatus } from '@/lib/supabase/services'

export function AppShell() {
  const [tab, setTab] = useState<DesktopTabId>('home')
  const [supportView, setSupportView] = useState<SupportView>('periodmate')
  const [sosOpen, setSosOpen] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [authModalState, setAuthModalState] = useState<{ open: boolean; mode: AuthModalMode }>({
    open: false,
    mode: 'signin',
  })
  const [request, setRequest] = useState<PadRequest | null>(null)
  const scrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (request?.status !== 'pending') return
    const timer = setTimeout(() => {
      setRequest((r) => {
        if (r && r.status === 'pending') {
          updateRequestStatus(r.id, 'accepted', helpers[0].alias)
          return { ...r, status: 'accepted', helper: helpers[0] }
        }
        return r
      })
    }, 3500)
    return () => clearTimeout(timer)
  }, [request?.status])

  const navigate = (next: DesktopTabId, view?: SupportView) => {
    if (view) setSupportView(view)
    setTab(next)
    scrollRef.current?.scrollTo({ top: 0 })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const closeSos = useCallback(() => setSosOpen(false), [])

  const requestHandlers = {
    request,
    onOpenSos: () => setSosOpen(true),
    onCompleteRequest: () => {
      if (request) updateRequestStatus(request.id, 'completed')
      setRequest((r) => (r ? { ...r, status: 'completed' } : r))
    },
    onCancelRequest: () => {
      if (request) updateRequestStatus(request.id, 'cancelled')
      setRequest(null)
    },
    onDismissRequest: () => setRequest(null),
  }

  const handleSosSubmit = async (data: Omit<PadRequest, 'id' | 'status' | 'helper'>) => {
    const newReq = await submitPadRequest(data)
    setRequest(newReq)
    setSosOpen(false)
  }

  // Active tab for mobile bottom nav (fallback to 'home' if 'about' was active on desktop)
  const mobileActiveTab: TabId = tab === 'about' ? 'home' : tab

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden lg:static lg:min-h-screen lg:overflow-visible bg-[radial-gradient(ellipse_at_top,#efedf6,transparent_60%),radial-gradient(ellipse_at_bottom_right,#f7e9eb,transparent_55%)]">
      {/* ── DESKTOP HEADER (≥ lg) ── */}
      <div className="hidden lg:block shrink-0 sticky top-0 z-40">
        <DesktopNav
          active={tab}
          onChange={navigate}
          onOpenSos={() => setSosOpen(true)}
          onOpenAuth={() => setAuthModalState({ open: true, mode: 'signin' })}
        />
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden lg:flex-none lg:overflow-visible lg:mx-auto lg:w-full lg:max-w-7xl lg:flex-row lg:items-start lg:gap-8 lg:px-6 lg:py-8 xl:px-10">
        {/* Desktop Left Sidebar (≥ xl) */}
        <aside className="hidden xl:flex w-64 shrink-0 flex-col gap-5 sticky top-24 self-start">
          <div className="rounded-2xl bg-sage-soft p-4 text-sm leading-relaxed text-sage-strong">
            🔒 Private by design. Encrypted. Never sold.
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Navigation</p>
            <ul className="space-y-1.5 text-sm">
              {(
                [
                  { id: 'home' as DesktopTabId, label: 'Dashboard' },
                  { id: 'cycle' as DesktopTabId, label: 'Cycle Tracker' },
                  { id: 'support' as DesktopTabId, label: 'Nearby Support' },
                  { id: 'assistant' as DesktopTabId, label: 'AI Assistant' },
                  { id: 'about' as DesktopTabId, label: 'About HERFLOW' },
                ] as { id: DesktopTabId; label: string }[]
              ).map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => navigate(l.id)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                      tab === l.id
                        ? 'bg-lavender-soft font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 text-xs text-muted-foreground leading-relaxed shadow-sm">
            <p className="font-semibold text-foreground text-sm mb-1">HERFLOW AI</p>
            Smart menstrual health built for campus life. Cycle tracking, emergency pad delivery, dispenser telemetry & health AI.
          </div>
        </aside>

        {/* Main Content Card */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden lg:flex-1 lg:min-w-0 lg:overflow-visible lg:rounded-3xl lg:border lg:border-border/60 lg:bg-background lg:shadow-[0_4px_32px_-8px_rgba(41,40,50,0.1)]">
          <main
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain lg:flex-none lg:overflow-visible"
          >
            {tab === 'about' ? (
              <AboutScreen onNavigate={(t) => navigate(t)} />
            ) : (
              <>
                <Activity mode={tab === 'home' ? 'visible' : 'hidden'}>
                  <HomeScreen onNavigate={navigate} {...requestHandlers} />
                </Activity>
                <Activity mode={tab === 'cycle' ? 'visible' : 'hidden'}>
                  <CycleScreen />
                </Activity>
                <Activity mode={tab === 'support' ? 'visible' : 'hidden'}>
                  <SupportScreen view={supportView} onViewChange={setSupportView} {...requestHandlers} />
                </Activity>
                <Activity mode={tab === 'assistant' ? 'visible' : 'hidden'}>
                  <AssistantScreen />
                </Activity>
                <Activity mode={tab === 'profile' ? 'visible' : 'hidden'}>
                  <ProfileScreen
                    onReplayOnboarding={() => setOnboarding(true)}
                    onOpenAuth={() => setAuthModalState({ open: true, mode: 'signin' })}
                  />
                </Activity>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── DESKTOP FOOTER (≥ lg) ── */}
      <footer className="hidden lg:block border-t border-border/60 bg-background/60 py-6 mt-12 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 xl:px-10 text-xs text-muted-foreground">
          <p>© 2026 HERFLOW AI · Smart Menstrual Health Ecosystem</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('about')} className="hover:underline cursor-pointer">About</button>
            <button type="button" onClick={() => navigate('cycle')} className="hover:underline cursor-pointer">CycleGuard</button>
            <button type="button" onClick={() => navigate('support')} className="hover:underline cursor-pointer">PeriodMate</button>
            <button type="button" onClick={() => navigate('assistant')} className="hover:underline cursor-pointer">PeriodLens</button>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV (< lg) ── */}
      <BottomNav
        active={mobileActiveTab}
        onChange={(t) => navigate(t)}
        className="lg:hidden"
      />

      {/* ── EMERGENCY SHEET MODAL ── */}
      {sosOpen && (
        <EmergencySheet
          open={sosOpen}
          onClose={closeSos}
          onSubmit={handleSosSubmit}
        />
      )}

      {/* ── ONBOARDING MODAL ── */}
      {onboarding && <Onboarding onFinish={() => setOnboarding(false)} />}

      {/* ── AUTH MODAL ── */}
      {authModalState.open && (
        <AuthModal
          isOpen={authModalState.open}
          onClose={() => setAuthModalState((s) => ({ ...s, open: false }))}
          initialMode={authModalState.mode}
        />
      )}
    </div>
  )
}
