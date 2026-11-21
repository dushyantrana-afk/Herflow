'use client'

import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/herflow/app-shell'
import { LandingPage } from '@/components/herflow/landing-page'
import { AuthModal, type AuthModalMode } from '@/components/herflow/auth-modal'

function MainContent() {
  const { user, isDemo, enterDemoMode } = useAuth()
  const [authModalState, setAuthModalState] = useState<{
    open: boolean
    mode: AuthModalMode
  }>({
    open: false,
    mode: 'signin',
  })

  const openAuth = (mode: AuthModalMode) => {
    setAuthModalState({ open: true, mode })
  }

  const closeAuth = () => {
    setAuthModalState((s) => ({ ...s, open: false }))
  }

  // If a student is authenticated or has selected demo mode, display the full AppShell
  if (user || isDemo) {
    return <AppShell />
  }

  // Otherwise, present the new landing page for new visitors
  return (
    <main className="min-h-screen">
      <LandingPage
        onOpenAuth={openAuth}
        onExploreDemo={enterDemoMode}
      />
      <AuthModal
        isOpen={authModalState.open}
        onClose={closeAuth}
        initialMode={authModalState.mode}
      />
    </main>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}
