'use client'

import { useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { AlertTriangle, ArrowUp, BookOpen, Mic, MicOff, Sparkles, Square } from 'lucide-react'
import { myths, user as defaultUser } from '@/lib/herflow-data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

type Language = 'en' | 'hi'

const suggestions: Record<Language, string[]> = {
  en: ['Is it normal for my cycle to vary?', 'How can I ease period cramps?', 'When should I see a doctor?'],
  hi: ['क्या पीरियड में दर्द सामान्य है?', 'पैड कितनी बार बदलना चाहिए?', 'अनियमित पीरियड्स के कारण क्या हैं?'],
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export function AssistantScreen() {
  const { user: authUser } = useAuth()
  const user = authUser || defaultUser

  const [language, setLanguage] = useState<Language>('en')
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const { messages, sendMessage, status, stop, error } = useChat({
    onError(err) {
      console.error('PeriodLens chat error:', err)
      setChatError(err.message || String(err))
    },
  })
  const busy = status === 'submitted' || status === 'streaming'

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setChatError(null)
    sendMessage({ text: trimmed })
    setInput('')
  }

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!Ctor) {
      alert('Voice input is not supported in this browser.')
      return
    }
    const recognition = new Ctor()
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = true
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('')
      setInput(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-rose text-white">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-semibold leading-tight">PeriodLens</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>Google Gemini AI</span>
              <span>·</span>
              <span className="text-primary font-medium">Day {user.cycleDay} ({user.phase})</span>
            </p>
          </div>
        </div>
        <div role="radiogroup" aria-label="Response language" className="flex rounded-full bg-muted p-1 text-xs font-semibold">
          {(
            [
              ['en', 'EN'],
              ['hi', 'हिंदी'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={language === id}
              onClick={() => setLanguage(id)}
              className={cn(
                'rounded-full px-3 py-1.5 transition-colors',
                language === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-5 px-5 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <>
            <div className="pt-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight text-balance">
                {language === 'hi' ? 'आज मैं आपकी कैसे मदद करूँ?' : 'How can I help you today?'}
              </h2>
              <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Private, judgement-free answers grounded in WHO, NHS and NHM guidance.
              </p>
            </div>
            <div className="space-y-2">
              {suggestions[language].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-lavender-soft"
                >
                  {s}
                </button>
              ))}
            </div>
            <section aria-labelledby="myths-title">
              <h2 id="myths-title" className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="size-4 text-primary" aria-hidden="true" />
                Myth vs fact
              </h2>
              <ul className="space-y-3">
                {myths.map((m) => (
                  <li key={m.claim} className="rounded-2xl border border-border bg-card p-4">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        m.verdict === 'Myth' ? 'bg-rose-soft text-rose-strong' : 'bg-sage-soft text-sage-strong',
                      )}
                    >
                      {m.verdict}
                    </span>
                    <p className="mt-2.5 text-sm font-semibold leading-snug">{m.claim}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-lg bg-primary text-primary-foreground'
                      : 'rounded-bl-lg border border-border bg-card',
                  )}
                >
                  {message.parts && message.parts.length > 0
                    ? message.parts.map((part, i) =>
                        part.type === 'text' ? <span key={`${message.id}-${i}`}>{part.text}</span> : null,
                      )
                    : (message as unknown as { content?: string }).content || null}
                </div>
              </li>
            ))}
            {status === 'submitted' ? (
              <li className="flex">
                <div className="flex gap-1 rounded-3xl rounded-bl-lg border border-border bg-card px-4 py-4" aria-label="Assistant is typing">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="size-2 animate-bounce rounded-full bg-lavender"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </li>
            ) : null}
          </ul>
        )}

        {(error || chatError) ? (
          <div className="rounded-2xl bg-destructive/10 p-4 text-xs text-destructive space-y-1.5" role="alert">
            <p className="font-semibold text-sm">Something went wrong:</p>
            <p className="font-mono text-xs break-all bg-card/60 p-2.5 rounded-xl border border-destructive/20">
              {chatError || error?.message || 'Please check your connection and try again.'}
            </p>
          </div>
        ) : null}

        <aside className="flex gap-3 rounded-2xl bg-rose-soft p-4 text-xs leading-relaxed text-rose-strong">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            PeriodLens offers education, not diagnosis. For severe pain, very heavy bleeding or fainting, contact your
            campus health centre or call <strong>112</strong>.
          </p>
        </aside>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="sticky bottom-0 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur-xl"
      >
        <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-1.5 pl-4 shadow-sm focus-within:border-ring">
          <label htmlFor="chat-input" className="sr-only">
            Ask PeriodLens
          </label>
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                send(input)
              }
            }}
            placeholder={language === 'hi' ? 'अपना सवाल लिखें…' : 'Ask anything, privately…'}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={toggleVoice}
            aria-pressed={listening}
            aria-label={listening ? 'Stop voice input' : 'Ask with voice'}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
              listening ? 'bg-rose-soft text-rose-strong' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {listening ? <MicOff className="size-5" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
          </button>
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="Stop generating"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
            >
              <Square className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
