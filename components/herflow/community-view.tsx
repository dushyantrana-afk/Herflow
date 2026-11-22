'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  GraduationCap,
  HandHelping,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chip, Toggle } from './primitives'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { sendCommunityChatMessage, markCommunityMessageHelped, isSupabaseConfigured } from '@/lib/supabase/services'
import { type CommunityChatMessage, initialCommunityMessages } from '@/lib/herflow-data'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'ask_pad' | 'offer_pad' | 'chat'
type RealtimeStatus = 'connecting' | 'live' | 'offline'

// ─── Constants ───────────────────────────────────────────────────────────────

const CHAT_STORAGE_KEY = 'herflow_community_chat_messages'
const MAX_MESSAGES = 100

const PAD_ITEMS = [
  'Regular pad',
  'Heavy flow pad',
  'Panty liners',
  'Tampon',
  'Pain relief / Meftal',
]

const CAMPUS_LOCATIONS = [
  'Central Library',
  'Lecture Hall Complex',
  'Himadri Hostel',
  'Kailash Hostel',
  'Sports Complex',
  'Student Activity Centre',
  'Health Centre',
]

const QUICK_EMOJIS = ['❤️', '🙏', '🌸', '🩹', '☕', '✨']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 10) return 'Just now'
    if (diff < 60) return `${diff}s ago`
    const m = Math.floor(diff / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'Just now'
  }
}

function rowToMessage(row: Record<string, unknown>): CommunityChatMessage {
  return {
    id: row.id as string,
    userId: (row.user_id as string | null) ?? undefined,
    senderName: row.sender_name as string,
    senderCampus: row.sender_campus as string,
    isVerifiedStudent: row.is_verified as boolean,
    isAnonymous: row.is_anonymous as boolean,
    content: row.content as string,
    messageType: row.message_type as CommunityChatMessage['messageType'],
    item: (row.item as string | null) ?? undefined,
    location: (row.location as string | null) ?? undefined,
    status: row.status as CommunityChatMessage['status'],
    helpedBy: (row.helped_by as string | null) ?? undefined,
    time: formatTime(row.created_at as string),
    createdAt: row.created_at as string,
  }
}

function persistLocal(msgs: CommunityChatMessage[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MESSAGES)))
  } catch { /* storage full – ignore */ }
}

function loadLocal(): CommunityChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CommunityChatMessage[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m) => ({ ...m, time: formatTime(m.createdAt) }))
      }
    }
  } catch { /* ignore */ }
  return initialCommunityMessages
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CommunityView() {
  const { user } = useAuth()
  const studentName = user?.name ?? 'Student'
  const studentCampus = user?.campus ?? 'IIT Delhi'

  // Core state
  const [messages, setMessages] = useState<CommunityChatMessage[]>(() => loadLocal())
  const [filter, setFilter] = useState<FilterType>('all')
  const [inputText, setInputText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [sending, setSending] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')

  // Modal state
  const [padModalOpen, setPadModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'ask' | 'offer'>('ask')
  const [selectedItem, setSelectedItem] = useState(PAD_ITEMS[0])
  const [selectedLocation, setSelectedLocation] = useState(CAMPUS_LOCATIONS[0])
  const [customLocation, setCustomLocation] = useState('')
  const [modalNote, setModalNote] = useState('')
  const [modalSending, setModalSending] = useState(false)

  // Refs
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const pendingIds = useRef<Set<string>>(new Set()) // optimistic message IDs

  // ── Merge helper: deduplicate by id, keep newest version ──────────────────
  const mergeMessage = useCallback((incoming: CommunityChatMessage) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === incoming.id)
      if (idx === -1) {
        const next = [...prev, incoming].slice(-MAX_MESSAGES)
        persistLocal(next)
        return next
      }
      // UPDATE – replace existing
      const next = prev.map((m) => (m.id === incoming.id ? incoming : m))
      persistLocal(next)
      return next
    })
  }, [])

  // ── Initial fetch + Realtime subscription ─────────────────────────────────
  useEffect(() => {
    let alive = true

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        setRealtimeStatus('offline')
        return
      }

      const supabase = createClient()

      // 1. Fetch last 60 messages
      try {
        const { data, error } = await supabase
          .from('community_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(60)

        if (!error && data && alive) {
          const fetched = data.map(rowToMessage)
          setMessages(fetched)
          persistLocal(fetched)
        }
      } catch (e) {
        console.warn('[Community] Initial fetch failed:', e)
      }

      // 2. Subscribe to realtime INSERT + UPDATE
      const channel = supabase
        .channel('community_messages_live', {
          config: { broadcast: { ack: false }, presence: { key: '' } },
        })
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'community_messages' },
          (payload) => {
            if (!alive) return
            const incoming = rowToMessage(payload.new as Record<string, unknown>)
            // If this is our own optimistic message being confirmed – just update it
            if (pendingIds.current.has(incoming.id)) {
              pendingIds.current.delete(incoming.id)
            }
            mergeMessage(incoming)
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'community_messages' },
          (payload) => {
            if (!alive) return
            mergeMessage(rowToMessage(payload.new as Record<string, unknown>))
          }
        )
        .subscribe((status) => {
          if (!alive) return
          if (status === 'SUBSCRIBED') setRealtimeStatus('live')
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setRealtimeStatus('offline')
          }
        })

      channelRef.current = channel
    }

    bootstrap()

    return () => {
      alive = false
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [mergeMessage])

  // ── Tick timestamps every 30s ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, time: formatTime(m.createdAt) }))
      )
    }, 30_000)
    return () => clearInterval(timer)
  }, [])

  // ── Auto-scroll on new message ────────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // ── Filtered view ─────────────────────────────────────────────────────────
  const visibleMessages = messages.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'ask_pad') return m.messageType === 'ask_pad'
    if (filter === 'offer_pad') return m.messageType === 'offer_pad'
    if (filter === 'chat') return m.messageType === 'chat' || m.messageType === 'urgent'
    return true
  })

  const askCount = messages.filter(
    (m) => m.messageType === 'ask_pad' && m.status === 'open'
  ).length
  const offerCount = messages.filter((m) => m.messageType === 'offer_pad').length

  // ── Send chat message ──────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || sending) return

    setSending(true)
    setInputText('')

    const displayName = isAnonymous ? 'Anonymous Student' : studentName
    const tempId = crypto.randomUUID()
    const nowIso = new Date().toISOString()

    // Optimistic insert
    const optimistic: CommunityChatMessage = {
      id: tempId,
      userId: user?.id ?? undefined,
      senderName: displayName,
      senderCampus: studentCampus,
      isVerifiedStudent: true,
      isAnonymous,
      content: trimmed,
      messageType: 'chat',
      status: 'open',
      time: 'Just now',
      createdAt: nowIso,
    }
    pendingIds.current.add(tempId)
    mergeMessage(optimistic)
    inputRef.current?.focus()

    try {
      const confirmed = await sendCommunityChatMessage({
        userId: user?.id ?? null,
        senderName: displayName,
        senderCampus: studentCampus,
        isVerifiedStudent: true,
        isAnonymous,
        content: trimmed,
        messageType: 'chat',
        status: 'open',
      })
      // Replace optimistic with confirmed (real id from server)
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== tempId)
        pendingIds.current.delete(tempId)
        // Only add if realtime hasn't already added it
        if (without.some((m) => m.id === confirmed.id)) return without
        const next = [...without, confirmed].slice(-MAX_MESSAGES)
        persistLocal(next)
        return next
      })
    } catch {
      // Remove optimistic on failure, restore input
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      pendingIds.current.delete(tempId)
      setInputText(trimmed)
    } finally {
      setSending(false)
    }
  }

  // ── Submit Ask / Offer Pad modal ──────────────────────────────────────────
  const handlePadSubmit = async () => {
    if (modalSending) return
    setModalSending(true)

    const finalLocation = customLocation.trim() || selectedLocation
    const displayName = isAnonymous ? 'Anonymous Student' : studentName
    const msgType = modalMode === 'ask' ? 'ask_pad' : 'offer_pad'
    const content =
      modalMode === 'ask'
        ? `SOS! Can someone spare a ${selectedItem.toLowerCase()} near ${finalLocation}?${modalNote ? ` "${modalNote}"` : ''}`
        : `I have extra ${selectedItem.toLowerCase()} at ${finalLocation}. Happy to share!${modalNote ? ` "${modalNote}"` : ''}`

    const tempId = crypto.randomUUID()
    const nowIso = new Date().toISOString()
    const optimistic: CommunityChatMessage = {
      id: tempId,
      userId: user?.id ?? undefined,
      senderName: displayName,
      senderCampus: studentCampus,
      isVerifiedStudent: true,
      isAnonymous,
      content,
      messageType: msgType as CommunityChatMessage['messageType'],
      item: selectedItem,
      location: finalLocation,
      status: 'open',
      time: 'Just now',
      createdAt: nowIso,
    }

    pendingIds.current.add(tempId)
    mergeMessage(optimistic)
    setPadModalOpen(false)
    setModalNote('')
    setCustomLocation('')

    try {
      const confirmed = await sendCommunityChatMessage({
        userId: user?.id ?? null,
        senderName: displayName,
        senderCampus: studentCampus,
        isVerifiedStudent: true,
        isAnonymous,
        content,
        messageType: msgType as CommunityChatMessage['messageType'],
        item: selectedItem,
        location: finalLocation,
        status: 'open',
      })
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== tempId)
        pendingIds.current.delete(tempId)
        if (without.some((m) => m.id === confirmed.id)) return without
        const next = [...without, confirmed].slice(-MAX_MESSAGES)
        persistLocal(next)
        return next
      })
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      pendingIds.current.delete(tempId)
    } finally {
      setModalSending(false)
    }
  }

  // ── I Can Help ────────────────────────────────────────────────────────────
  const handleOfferHelp = async (target: CommunityChatMessage) => {
    const helperAlias = isAnonymous ? 'A verified peer' : studentName

    // Optimistically update request card
    setMessages((prev) =>
      prev.map((m) =>
        m.id === target.id ? { ...m, status: 'helped' as const, helpedBy: helperAlias } : m
      )
    )

    try {
      await markCommunityMessageHelped(target.id, helperAlias)

      // Post a reply message in the chat
      await sendCommunityChatMessage({
        userId: user?.id ?? null,
        senderName: helperAlias,
        senderCampus: studentCampus,
        isVerifiedStudent: true,
        isAnonymous,
        content: `🙋‍♀️ ${helperAlias} is on the way with a pad to ${target.location ?? 'your location'}! Hang in there ❤️`,
        messageType: 'chat',
        status: 'open',
      })
    } catch {
      // Revert optimistic update on failure
      setMessages((prev) =>
        prev.map((m) => (m.id === target.id ? { ...m, status: 'open' as const } : m))
      )
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)] lg:h-[720px] max-w-full">

      {/* ── Header ── */}
      <div className="shrink-0 pb-3 border-b border-border/70 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-rose text-white shadow-xs">
              <Users className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold leading-tight">Campus Community Chat</h2>
                {/* Realtime status pill */}
                {realtimeStatus === 'live' ? (
                  <span className="flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[10px] font-bold text-sage-strong">
                    <Wifi className="size-2.5" />
                    Live · {studentCampus}
                  </span>
                ) : realtimeStatus === 'connecting' ? (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground animate-pulse">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Connecting…
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-rose-soft px-2 py-0.5 text-[10px] font-semibold text-rose-strong">
                    <WifiOff className="size-2.5" />
                    Offline mode
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Student-to-student help &amp; pad sharing ·{' '}
                <span className="text-sage-strong font-medium">Anonymous by default</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => { setModalMode('ask'); setPadModalOpen(true) }}
              className="rounded-xl bg-gradient-to-r from-rose-strong to-rose text-white text-xs font-semibold shadow-xs hover:opacity-95 cursor-pointer h-9 px-3"
            >
              <HandHelping className="size-3.5 mr-1" />
              Ask for Pad
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setModalMode('offer'); setPadModalOpen(true) }}
              className="rounded-xl border-border bg-card text-xs font-semibold hover:bg-muted cursor-pointer h-9 px-3"
            >
              <Gift className="size-3.5 mr-1 text-sage-strong" />
              Offer Pad
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(
            [
              { id: 'all', label: 'All Chat' },
              { id: 'ask_pad', label: `🆘 Pad Requests${askCount > 0 ? ` (${askCount})` : ''}` },
              { id: 'offer_pad', label: `🎁 Pad Offers${offerCount > 0 ? ` (${offerCount})` : ''}` },
              { id: 'chat', label: '💬 General' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer',
                filter === t.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Message feed ── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Community chat messages"
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-4 space-y-3.5 px-1 pr-2"
      >
        {visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
            <MessageCircle className="size-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold">No messages yet</p>
            <p className="text-xs max-w-xs mt-1">
              Be the first to say hi or post a pad request to campus peers!
            </p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = !!user?.id && msg.userId === user.id
            const isPadRequest = msg.messageType === 'ask_pad'
            const isPadOffer = msg.messageType === 'offer_pad'
            const isPending = pendingIds.current.has(msg.id)

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col transition-opacity duration-300',
                  isMe && !isPadRequest && !isPadOffer ? 'items-end' : 'items-start',
                  isPending && 'opacity-70'
                )}
              >
                {/* ── Emergency Pad Request card ── */}
                {isPadRequest && (
                  <div className="w-full rounded-2xl border-2 border-rose/50 bg-gradient-to-br from-rose-soft/80 via-card to-rose-soft/30 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-xl bg-rose-strong text-white">
                          <HandHelping className="size-4" />
                        </span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-strong">
                            Urgent Pad Request
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {msg.senderName} · {msg.time}
                          </p>
                        </div>
                      </div>

                      {msg.status === 'helped' ? (
                        <span className="flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-xs font-semibold text-sage-strong border border-sage/40">
                          <CheckCircle2 className="size-3.5" />
                          {msg.helpedBy ? `Helped by ${msg.helpedBy}` : 'Helped ❤️'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-rose-soft px-2.5 py-1 text-xs font-bold text-rose-strong border border-rose/30">
                          <span className="size-2 rounded-full bg-rose-strong animate-ping" />
                          Needs Help Now
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 my-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="rounded-lg bg-card px-2 py-0.5 border border-border/80">
                          {msg.item ?? 'Regular pad'}
                        </span>
                        {msg.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <MapPin className="size-3.5 text-rose-strong" />
                            {msg.location}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-card/60 rounded-xl p-2.5 border border-border/50">
                        {msg.content}
                      </p>
                    </div>

                    {msg.status !== 'helped' && !isMe && (
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-rose/20">
                        <span className="text-xs text-muted-foreground">
                          Nearby and have a spare pad?
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleOfferHelp(msg)}
                          className="rounded-xl bg-rose-strong hover:bg-rose-strong/90 text-white font-semibold text-xs h-8 px-3 cursor-pointer shadow-xs"
                        >
                          <Heart className="size-3.5 mr-1 fill-white" />
                          I Can Bring a Pad
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Spare Pad Offer card ── */}
                {isPadOffer && (
                  <div className="w-full rounded-2xl border border-sage/50 bg-gradient-to-br from-sage-soft/70 via-card to-sage-soft/30 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-xl bg-sage-strong text-white">
                          <Gift className="size-4" />
                        </span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-sage-strong">
                            Spare Pad Available
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {msg.senderName} · {msg.time}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-sage-soft px-2.5 py-0.5 text-xs font-semibold text-sage-strong">
                        Available
                      </span>
                    </div>

                    <div className="my-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="rounded-lg bg-card px-2 py-0.5 border border-border/80">
                          {msg.item ?? 'Pad'}
                        </span>
                        {msg.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <MapPin className="size-3.5 text-sage-strong" />
                            {msg.location}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-card/60 rounded-xl p-2.5 border border-border/50">
                        {msg.content}
                      </p>
                    </div>

                    <div className="mt-2.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setInputText(
                            `Hi ${msg.senderName}, is the ${msg.item ?? 'pad'} at ${msg.location ?? 'there'} still available?`
                          )
                          inputRef.current?.focus()
                        }}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="size-3.5" />
                        Reply to claim
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Standard chat bubble ── */}
                {!isPadRequest && !isPadOffer && (
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs space-y-1 animate-in fade-in slide-in-from-bottom-1',
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-xs'
                        : 'bg-card border border-border/80 text-foreground rounded-bl-xs'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-2 text-[11px]',
                        isMe ? 'text-primary-foreground/80 justify-end' : 'text-muted-foreground'
                      )}
                    >
                      <span className="font-semibold flex items-center gap-1">
                        {msg.isAnonymous ? (
                          <>
                            <EyeOff className="size-3" /> Anonymous
                          </>
                        ) : (
                          <>
                            <GraduationCap className="size-3" /> {msg.senderName}
                          </>
                        )}
                      </span>
                      <span>·</span>
                      <span>{msg.time}</span>
                      {isPending && <span className="text-[10px] opacity-60">sending…</span>}
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={chatBottomRef} aria-hidden="true" />
      </div>

      {/* ── Composer ── */}
      <div className="shrink-0 pt-2 border-t border-border/70 bg-background/95 backdrop-blur-md space-y-2">
        {/* Identity + emoji row */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <button
            type="button"
            onClick={() => setIsAnonymous((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-muted/80 hover:bg-muted px-2.5 py-1 text-muted-foreground transition-colors cursor-pointer font-medium"
          >
            {isAnonymous ? (
              <>
                <EyeOff className="size-3 text-primary" />
                <span>Posting as: <strong className="text-foreground">Anonymous</strong></span>
              </>
            ) : (
              <>
                <Eye className="size-3 text-sage-strong" />
                <span>Posting as: <strong className="text-foreground">{studentName}</strong></span>
              </>
            )}
            <span className="text-[10px] text-primary underline ml-1">switch</span>
          </button>

          <div className="flex items-center gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji)
                  inputRef.current?.focus()
                }}
                className="size-7 flex items-center justify-center rounded-lg hover:bg-muted text-sm transition-transform active:scale-90 cursor-pointer"
                aria-label={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message, ask for help, or offer extra pads…"
            aria-label="Message input"
            maxLength={500}
            className="flex-1 rounded-2xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || sending}
            aria-label="Send message"
            className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 font-semibold shrink-0 cursor-pointer shadow-xs disabled:opacity-40"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>

      {/* ── Ask / Offer Pad Modal ── */}
      {padModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pad-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setPadModalOpen(false) }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPadModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-2xl text-white',
                  modalMode === 'ask' ? 'bg-rose-strong' : 'bg-sage-strong'
                )}
              >
                {modalMode === 'ask' ? <HandHelping className="size-5" /> : <Gift className="size-5" />}
              </span>
              <div>
                <h3 id="pad-modal-title" className="text-base font-bold leading-tight">
                  {modalMode === 'ask' ? 'Ask for a Pad Nearby' : 'Offer Spare Pads on Campus'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {modalMode === 'ask'
                    ? 'Your request will be broadcast live to campus peers'
                    : 'Help a fellow student who might be in urgent need'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Item */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  What item?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PAD_ITEMS.map((item) => (
                    <Chip
                      key={item}
                      selected={selectedItem === item}
                      onClick={() => setSelectedItem(item)}
                      className="text-xs py-1 px-2.5 rounded-xl cursor-pointer"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Where on campus?
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <Chip
                      key={loc}
                      selected={selectedLocation === loc && !customLocation}
                      onClick={() => { setSelectedLocation(loc); setCustomLocation('') }}
                      className="text-xs py-1 px-2.5 rounded-xl cursor-pointer"
                    >
                      {loc}
                    </Chip>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or specify exact spot (e.g. LHC Washroom 1st floor, stall 2)"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {modalMode === 'ask' ? 'Extra note / details' : 'Note for whoever collects'}
                </label>
                <input
                  type="text"
                  placeholder={
                    modalMode === 'ask'
                      ? 'e.g. Stuck in stall 2, wearing blue hoodie'
                      : 'e.g. Sitting near library lockers, feel free to grab'
                  }
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-lavender-soft/70 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Post Anonymously</p>
                    <p className="text-[11px] text-muted-foreground">Your name stays hidden</p>
                  </div>
                </div>
                <Toggle checked={isAnonymous} onChange={setIsAnonymous} label="Post anonymously" />
              </div>

              {/* Submit */}
              <Button
                onClick={handlePadSubmit}
                disabled={modalSending}
                className={cn(
                  'w-full h-11 rounded-2xl font-semibold text-white shadow-xs cursor-pointer disabled:opacity-60',
                  modalMode === 'ask'
                    ? 'bg-rose-strong hover:bg-rose-strong/90'
                    : 'bg-primary hover:bg-primary/90'
                )}
              >
                {modalSending
                  ? 'Posting…'
                  : modalMode === 'ask'
                  ? 'Post Urgent Request'
                  : 'Post Pad Offer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
