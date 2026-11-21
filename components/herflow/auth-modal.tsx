'use client'

import { useState, useId } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useAuth, validateCollegeEmail } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export type AuthModalMode = 'signin' | 'signup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthModalMode
  onSuccess?: () => void
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [campus, setCampus] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailId = useId()
  const passwordId = useId()
  const nameId = useId()
  const campusId = useId()

  const { signIn, signUp, enterDemoMode } = useAuth()

  if (!isOpen) return null

  // Real-time email validation feedback
  const emailValidation = email.length > 2 ? validateCollegeEmail(email) : null

  // Auto-fill campus if empty and email domain provides suggestion
  const handleEmailChange = (val: string) => {
    setEmail(val)
    setError(null)
    setSuccessMsg(null)

    if (mode === 'signup' && (!campus || campus.trim() === '')) {
      const v = validateCollegeEmail(val)
      if (v.valid && v.suggestedCampus) {
        setCampus(v.suggestedCampus)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    // Pre-flight college email check
    const val = validateCollegeEmail(email)
    if (!val.valid) {
      setError(val.reason || 'Please provide a valid college or university email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password)
        if (!res.success) {
          setError(res.error || 'Failed to sign in. Check your credentials.')
          setSubmitting(false)
          return
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.')
          setSubmitting(false)
          return
        }

        const res = await signUp(email, password, name, campus || val.suggestedCampus || 'Campus')
        if (!res.success) {
          setError(res.error || 'Failed to register student account.')
          setSubmitting(false)
          return
        }

        if (res.message) {
          setSuccessMsg(res.message)
          setSubmitting(false)
          return
        }
      }

      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoAccess = () => {
    enterDemoMode()
    onSuccess?.()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 size-48 rounded-full bg-lavender/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-rose/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-lavender to-rose text-white shadow-sm mb-3">
            <GraduationCap className="size-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {mode === 'signin' ? 'Sign In with College ID' : 'Create Campus Student Account'}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Exclusive to students and faculty with verified institutional emails.
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex rounded-2xl bg-muted/70 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Register Student
          </button>
        </div>

        {/* Feedback / Alert Banners */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-in fade-in">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-sage-soft p-3 text-xs text-sage-strong border border-sage-strong/20 animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor={nameId} className="block text-xs font-semibold text-foreground mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id={nameId}
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={campusId} className="block text-xs font-semibold text-foreground mb-1.5">
                  Campus / University Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id={campusId}
                    type="text"
                    required
                    placeholder="e.g. IIT Delhi, BITS Pilani, Stanford"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* College Email Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={emailId} className="text-xs font-semibold text-foreground">
                College / University Email
              </label>
              <span className="text-[11px] font-medium text-primary">Required: .edu / .ac.in</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id={emailId}
                type="email"
                required
                placeholder="student@college.edu or name@univ.ac.in"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full rounded-2xl border bg-background py-2.5 pl-10 pr-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all ${
                  emailValidation && !emailValidation.valid
                    ? 'border-destructive/60 focus:border-destructive focus:ring-destructive/20'
                    : emailValidation && emailValidation.valid
                    ? 'border-sage-strong/70 focus:border-sage-strong focus:ring-sage-strong/20'
                    : 'border-border focus:border-ring focus:ring-ring/20'
                }`}
              />
              {emailValidation && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {emailValidation.valid ? (
                    <CheckCircle2 className="size-4 text-sage-strong" />
                  ) : (
                    <AlertCircle className="size-4 text-destructive" />
                  )}
                </span>
              )}
            </div>

            {/* Instant Validation Note */}
            {emailValidation && (
              <p
                className={`mt-1.5 text-[11px] leading-tight ${
                  emailValidation.valid ? 'text-sage-strong' : 'text-destructive'
                }`}
              >
                {emailValidation.valid
                  ? `✓ Verified academic domain (${emailValidation.domain})`
                  : emailValidation.reason}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={passwordId} className="text-xs font-semibold text-foreground">
                Password
              </label>
              <span className="text-[11px] text-muted-foreground">Min. 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-lavender-strong py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all mt-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {mode === 'signin' ? 'Signing In...' : 'Registering...'}
              </span>
            ) : mode === 'signin' ? (
              'Sign In with College ID'
            ) : (
              'Create Student Account'
            )}
          </Button>
        </form>

        {/* Security & Verification Guarantee */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-sage-strong" />
          <span>Encrypted · Restricted to verified academic domains</span>
        </div>

        {/* Demo Mode Fallback for Instant Testing */}
        <div className="mt-5 border-t border-border/60 pt-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">Want to evaluate without signing up?</p>
          <button
            type="button"
            onClick={handleDemoAccess}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Sparkles className="size-3.5 text-lavender" />
            Explore in Campus Demo Mode (Ananya / IIT Delhi)
          </button>
        </div>
      </div>
    </div>
  )
}
