'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from './supabase/client'
import { isSupabaseConfigured } from './supabase/services'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export type AuthUser = {
  id: string
  email: string
  name: string
  campus: string
  collegeDomain: string
  isVerifiedStudent: boolean
  cycleDay?: number
  cycleLength?: number
  phase?: string
}

export type EmailValidationResult = {
  valid: boolean
  domain?: string
  suggestedCampus?: string
  reason?: string
}

/**
 * Validates that an email belongs to a recognized college / university / academic institution.
 * Blocks commercial personal email providers like @gmail.com, @yahoo.com, etc.
 */
export function validateCollegeEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) {
    return { valid: false, reason: 'Please enter your college email address' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: 'Please enter a valid email format (e.g. name@college.edu)' }
  }

  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email address' }
  }

  const domain = parts[1]

  // Disallowed commercial email providers
  const publicCommercialDomains = [
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.co.in',
    'yahoo.co.uk',
    'ymail.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'proton.me',
    'protonmail.com',
    'aol.com',
    'zoho.com',
    'mail.com',
    'gmx.com',
    'yandex.com',
    'rediffmail.com',
    'fastmail.com',
  ]

  if (publicCommercialDomains.includes(domain)) {
    return {
      valid: false,
      domain,
      reason: `Personal email providers (@${domain}) are not accepted. HERFLOW is an exclusive campus network — please use your official college or university email address (ending with .edu, .ac.in, etc.).`,
    }
  }

  // Allowed educational institution domains and patterns
  const isEduDomain =
    domain.endsWith('.edu') ||
    domain.endsWith('.ac.in') ||
    domain.endsWith('.edu.in') ||
    domain.endsWith('.res.in') ||
    domain.endsWith('.ac.uk') ||
    domain.endsWith('.edu.au') ||
    domain.endsWith('.edu.sg') ||
    domain.endsWith('.ac.nz') ||
    domain.endsWith('.ac.za') ||
    domain.endsWith('.edu.pk') ||
    domain.endsWith('.edu.ca') ||
    domain.endsWith('.college') ||
    domain.endsWith('.university') ||
    domain.endsWith('.academy') ||
    domain.includes('.edu.') ||
    domain.includes('.ac.') ||
    domain.includes('college') ||
    domain.includes('univ') ||
    domain.includes('campus') ||
    domain.includes('institute')

  if (!isEduDomain) {
    return {
      valid: false,
      domain,
      reason: `The domain "@${domain}" is not recognized as an academic domain. Please use your official college/university email address (e.g., student@college.edu or name@univ.ac.in).`,
    }
  }

  // Auto-detect campus names from common institutional domains
  let suggestedCampus: string | undefined
  if (domain.includes('iitd')) suggestedCampus = 'IIT Delhi'
  else if (domain.includes('iitb')) suggestedCampus = 'IIT Bombay'
  else if (domain.includes('iitk')) suggestedCampus = 'IIT Kanpur'
  else if (domain.includes('iitm')) suggestedCampus = 'IIT Madras'
  else if (domain.includes('iitr')) suggestedCampus = 'IIT Roorkee'
  else if (domain.includes('iitg')) suggestedCampus = 'IIT Guwahati'
  else if (domain.includes('bits')) suggestedCampus = 'BITS Pilani'
  else if (domain.includes('thapar')) suggestedCampus = 'Thapar University'
  else if (domain.includes('du.ac.in')) suggestedCampus = 'Delhi University'
  else if (domain.includes('dtu')) suggestedCampus = 'Delhi Technological University'
  else if (domain.includes('nsut')) suggestedCampus = 'NSUT Delhi'
  else if (domain.includes('vit.ac.in') || domain.includes('vit.edu')) suggestedCampus = 'VIT Vellore'
  else if (domain.includes('manipal')) suggestedCampus = 'Manipal University'
  else if (domain.includes('srm')) suggestedCampus = 'SRM University'
  else if (domain.includes('aiims')) suggestedCampus = 'AIIMS Delhi'
  else if (domain.includes('harvard.edu')) suggestedCampus = 'Harvard University'
  else if (domain.includes('mit.edu')) suggestedCampus = 'MIT'
  else if (domain.includes('stanford.edu')) suggestedCampus = 'Stanford University'
  else {
    const rawStem = domain.split('.')[0]
    suggestedCampus = rawStem.toUpperCase() + ' Campus'
  }

  return {
    valid: true,
    domain,
    suggestedCampus,
  }
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
    campus: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>
  signOut: () => Promise<void>
  enterDemoMode: () => void
  exitDemoMode: () => void
}

const LOCAL_STORAGE_KEY = 'herflow_auth_session'
const DEMO_STORAGE_KEY = 'herflow_demo_mode'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Initialize Auth state
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        // 1. Check if user activated demo mode
        if (typeof window !== 'undefined') {
          const storedDemo = localStorage.getItem(DEMO_STORAGE_KEY)
          if (storedDemo === 'true') {
            if (mounted) {
              setIsDemo(true)
              setUser({
                id: 'demo-student-id',
                email: 'ananya@iitd.ac.in',
                name: 'Ananya Sharma',
                campus: 'IIT Delhi',
                collegeDomain: 'iitd.ac.in',
                isVerifiedStudent: true,
                cycleDay: 14,
                cycleLength: 28,
                phase: 'Ovulation window',
              })
              setIsLoading(false)
              return
            }
          }
        }

        // 2. Check Supabase Auth if configured
        if (isSupabaseConfigured()) {
          const supabase = createClient()
          const { data: { session: initialSession } } = await supabase.auth.getSession()

          if (initialSession?.user) {
            setSession(initialSession)
            await loadUserProfile(initialSession.user)
          } else {
            // Check fallback local storage session
            checkFallbackStorage()
          }

          // Listen for Supabase auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (!mounted) return
              setSession(newSession)
              if (newSession?.user) {
                await loadUserProfile(newSession.user)
              } else {
                setUser(null)
              }
            }
          )

          return () => {
            subscription.unsubscribe()
          }
        } else {
          // Supabase not configured yet - check fallback local storage session
          checkFallbackStorage()
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err)
        checkFallbackStorage()
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    function checkFallbackStorage() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as AuthUser
            if (parsed && parsed.email) {
              setUser(parsed)
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY)
          }
        }
      }
    }

    async function loadUserProfile(sbUser: SupabaseUser) {
      if (!isSupabaseConfigured()) return

      try {
        const supabase = createClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .single()

        const domain = sbUser.email?.split('@')[1] || 'college.edu'
        const authUser: AuthUser = {
          id: sbUser.id,
          email: sbUser.email || '',
          name: profile?.name || sbUser.user_metadata?.name || 'Student',
          campus: profile?.campus || sbUser.user_metadata?.campus || 'Campus',
          collegeDomain: domain,
          isVerifiedStudent: true,
          cycleDay: profile?.cycle_day ?? 14,
          cycleLength: profile?.cycle_length ?? 28,
          phase: profile?.phase || 'Ovulation window',
        }

        if (mounted) setUser(authUser)
      } catch {
        const domain = sbUser.email?.split('@')[1] || 'college.edu'
        if (mounted) {
          setUser({
            id: sbUser.id,
            email: sbUser.email || '',
            name: sbUser.user_metadata?.name || 'Student',
            campus: sbUser.user_metadata?.campus || 'Campus',
            collegeDomain: domain,
            isVerifiedStudent: true,
          })
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Sign In implementation
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const val = validateCollegeEmail(email)
    if (!val.valid) {
      return { success: false, error: val.reason }
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          const domain = data.user.email?.split('@')[1] || val.domain || 'college.edu'
          const campus = data.user.user_metadata?.campus || val.suggestedCampus || 'Campus'
          const name = data.user.user_metadata?.name || 'Student'

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name,
            campus,
            collegeDomain: domain,
            isVerifiedStudent: true,
          }
          setUser(authUser)
          setIsDemo(false)
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DEMO_STORAGE_KEY)
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser))
          }
          return { success: true }
        }
      }

      // Offline / Local Session fallback
      const domain = val.domain || 'college.edu'
      const authUser: AuthUser = {
        id: crypto.randomUUID(),
        email: email.trim().toLowerCase(),
        name: email.split('@')[0].replace(/[._]/g, ' '),
        campus: val.suggestedCampus || 'Campus',
        collegeDomain: domain,
        isVerifiedStudent: true,
        cycleDay: 14,
        cycleLength: 28,
        phase: 'Ovulation window',
      }
      setUser(authUser)
      setIsDemo(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_STORAGE_KEY)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser))
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in'
      return { success: false, error: msg }
    }
  }

  // Sign Up implementation
  const signUp = async (
    email: string,
    password: string,
    name: string,
    campus: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const val = validateCollegeEmail(email)
    if (!val.valid) {
      return { success: false, error: val.reason }
    }

    if (!name.trim()) {
      return { success: false, error: 'Please enter your full name' }
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    const finalCampus = campus.trim() || val.suggestedCampus || 'Campus'

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim(),
              campus: finalCampus,
            },
          },
        })

        if (error) {
          return { success: false, error: error.message }
        }

        // Check if session was granted immediately or confirmation email is required
        if (data.session && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: name.trim(),
            campus: finalCampus,
            collegeDomain: val.domain || 'college.edu',
            isVerifiedStudent: true,
          }
          setUser(authUser)
          setIsDemo(false)
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DEMO_STORAGE_KEY)
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser))
          }
          return { success: true }
        } else {
          return {
            success: true,
            message: `Verification link sent to ${email}! Please check your college inbox to confirm your account.`,
          }
        }
      }

      // Offline / Local Session fallback
      const authUser: AuthUser = {
        id: crypto.randomUUID(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        campus: finalCampus,
        collegeDomain: val.domain || 'college.edu',
        isVerifiedStudent: true,
        cycleDay: 14,
        cycleLength: 28,
        phase: 'Ovulation window',
      }
      setUser(authUser)
      setIsDemo(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_STORAGE_KEY)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser))
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create student account'
      return { success: false, error: msg }
    }
  }

  // Sign Out implementation
  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.warn('Sign out error:', err)
    } finally {
      setUser(null)
      setSession(null)
      setIsDemo(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        localStorage.removeItem(DEMO_STORAGE_KEY)
      }
    }
  }

  // Enter Demo Mode
  const enterDemoMode = () => {
    setIsDemo(true)
    const demoUser: AuthUser = {
      id: 'demo-student-id',
      email: 'ananya@iitd.ac.in',
      name: 'Ananya Sharma',
      campus: 'IIT Delhi',
      collegeDomain: 'iitd.ac.in',
      isVerifiedStudent: true,
      cycleDay: 14,
      cycleLength: 28,
      phase: 'Ovulation window',
    }
    setUser(demoUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_STORAGE_KEY, 'true')
    }
  }

  const exitDemoMode = () => {
    setIsDemo(false)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_STORAGE_KEY)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isDemo,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
