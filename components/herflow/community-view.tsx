'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Gift,
  GraduationCap,
  HandHeart,
  HandHelping,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Chip, Toggle } from './primitives'
import { useAuth } from '@/lib/auth-context'
import {
  fetchCommunityMessages,
  sendCommunityChatMessage,
  markCommunityMessageHelped,
} from '@/lib/supabase/services'
import {
  type CommunityChatMessage,
  type CommunityMessageType,
  initialCommunityMessages,
} from '@/lib/herflow-data'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'ask_pad' | 'offer_pad' | 'chat'

const padItems = [
  'Regular pad',
  'Heavy flow pad',
  'Panty liners',
  'Tampon',
  'Pain relief / Meftal',
]

const campusLocations = [
  'Central Library',
  'Lecture Hall Complex',
  'Himadri Hostel',
  'Kailash Hostel',
  'Sports Complex',
  'Student Activity Centre',
  'Health Centre',
]

const quickEmojis = ['❤️', '🙏', '🌸', '🩹', '☕', '✨']

export function CommunityView() {
  const { user } = useAuth()
  const studentName = user?.name || 'Student'
  const studentCampus = user?.campus || 'IIT Delhi'

  const [messages, setMessages] = useState<CommunityChatMessage[]>(initialCommunityMessages)
  const [filter, setFilter] = useState<FilterType>('all')
  const [inputText, setInputText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [sending, setSending] = useState(false)

  // Modals for Ask / Offer pad
  const [padModalOpen, setPadModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'ask' | 'offer'>('ask')
  const [selectedItem, setSelectedItem] = useState(padItems[0])
  const [selectedLocation, setSelectedLocation] = useState(campusLocations[0])
  const [customLocation, setCustomLocation] = useState('')
  const [modalNote, setModalNote] = useState('')

  const chatBottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load live messages on mount
  useEffect(() => {
    fetchCommunityMessages().then((data) => {
      if (data && data.length > 0) {
        setMessages(data)
      }
    })
  }, [])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Filter messages
  const visibleMessages = messages.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'ask_pad') return m.messageType === 'ask_pad'
    if (filter === 'offer_pad') return m.messageType === 'offer_pad'
    if (filter === 'chat') return m.messageType === 'chat' || m.messageType === 'urgent'
    return true
  })

  // Counts for tabs
  const askCount = messages.filter((m) => m.messageType === 'ask_pad' && m.status !== 'resolved').length
  const offerCount = messages.filter((m) => m.messageType === 'offer_pad').length

  // Send regular chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || sending) return

    setSending(true)
    const displayName = isAnonymous ? 'Anonymous Student' : studentName

    const newMsg = await sendCommunityChatMessage({
      userId: user?.id || null,
      senderName: displayName,
      senderCampus: studentCampus,
      isVerifiedStudent: true,
      isAnonymous,
      content: trimmed,
      messageType: 'chat',
      status: 'open',
    })

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setSending(false)
    inputRef.current?.focus()
  }

  // Submit Ask or Offer Pad
  const handlePadModalSubmit = async () => {
    const finalLocation = customLocation.trim() || selectedLocation
    const displayName = isAnonymous ? 'Anonymous Student' : studentName
    const msgType: CommunityMessageType = modalMode === 'ask' ? 'ask_pad' : 'offer_pad'

    const defaultContent =
      modalMode === 'ask'
        ? `SOS! Can someone spare a ${selectedItem.toLowerCase()} near ${finalLocation}? ${modalNote ? `"${modalNote}"` : ''}`
        : `I have extra ${selectedItem.toLowerCase()} with me at ${finalLocation}. Happy to share with anyone who needs it! ${modalNote ? `"${modalNote}"` : ''}`

    const newMsg = await sendCommunityChatMessage({
      userId: user?.id || null,
      senderName: displayName,
      senderCampus: studentCampus,
      isVerifiedStudent: true,
      isAnonymous,
      content: defaultContent,
      messageType: msgType,
      item: selectedItem,
      location: finalLocation,
      status: 'open',
    })

    setMessages((prev) => [...prev, newMsg])
    setPadModalOpen(false)
    setModalNote('')
    setCustomLocation('')
  }

  // Helper response action: "I Can Help"
  const handleOfferHelp = async (targetMsg: CommunityChatMessage) => {
    const helperAlias = isAnonymous ? 'A verified peer' : studentName

    // 1. Mark request as helped
    await markCommunityMessageHelped(targetMsg.id, helperAlias)

    // 2. Post supportive reply into the chat stream
    const replyContent = `🙋‍♀️ ${helperAlias} is bringing a pad to ${targetMsg.location || 'your location'} right now! Stay safe ❤️`

    const replyMsg = await sendCommunityChatMessage({
      userId: user?.id || null,
      senderName: helperAlias,
      senderCampus: studentCampus,
      isVerifiedStudent: true,
      isAnonymous,
      content: replyContent,
      messageType: 'chat',
    })

    // Update state locally
    setMessages((prev) =>
      prev
        .map((m) => (m.id === targetMsg.id ? { ...m, status: 'helped' as const, helpedBy: helperAlias } : m))
        .concat(replyMsg)
    )
  }

  const openPadModal = (mode: 'ask' | 'offer') => {
    setModalMode(mode)
    setPadModalOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)] lg:h-[720px] max-w-full">
      {/* ── TOP BANNER: Realtime community header ── */}
      <div className="shrink-0 pb-3 border-b border-border/70 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-rose text-white shadow-xs">
              <Users className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold leading-tight">Campus Community Chat</h2>
                <span className="flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[10px] font-bold text-sage-strong">
                  <span className="size-1.5 rounded-full bg-sage-strong animate-pulse" />
                  Live · {studentCampus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Direct student-to-student help &amp; pad sharing</span>
                <span>·</span>
                <span className="text-sage-strong font-medium">Anonymous by default</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => openPadModal('ask')}
              className="rounded-xl bg-gradient-to-r from-rose-strong to-rose text-white text-xs font-semibold shadow-xs hover:opacity-95 cursor-pointer h-9 px-3"
            >
              <HandHelping className="size-3.5 mr-1" />
              Ask for Pad
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openPadModal('offer')}
              className="rounded-xl border-border bg-card text-xs font-semibold hover:bg-muted cursor-pointer h-9 px-3"
            >
              <Gift className="size-3.5 mr-1 text-sage-strong" />
              Offer Pad
            </Button>
          </div>
        </div>

        {/* ── Filter Channels ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(
            [
              { id: 'all', label: 'All Chat' },
              { id: 'ask_pad', label: `🆘 Pad Requests ${askCount > 0 ? `(${askCount})` : ''}` },
              { id: 'offer_pad', label: `🎁 Pad Offers ${offerCount > 0 ? `(${offerCount})` : ''}` },
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

      {/* ── CHAT MESSAGE FEED ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-4 space-y-3.5 px-1 pr-2">
        {visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
            <MessageCircle className="size-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold">No messages in this channel yet</p>
            <p className="text-xs max-w-xs mt-1">
              Be the first to say hi or post a pad request to students on campus!
            </p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = user?.id && msg.userId === user.id
            const isPadRequest = msg.messageType === 'ask_pad'
            const isPadOffer = msg.messageType === 'offer_pad'

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col',
                  isMe && !isPadRequest && !isPadOffer ? 'items-end' : 'items-start'
                )}
              >
                {/* ── SPECIAL CARD: EMERGENCY PAD REQUEST ── */}
                {isPadRequest ? (
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
                          {msg.item || 'Regular pad'}
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

                    {msg.status !== 'helped' && (
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-rose/20">
                        <span className="text-xs text-muted-foreground">
                          Are you nearby and have a spare pad?
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
                ) : isPadOffer ? (
                  /* ── SPECIAL CARD: SPARE PAD OFFER ── */
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
                          {msg.item || 'Pad'}
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
                          setInputText(`Hi ${msg.senderName}, is the ${msg.item || 'pad'} at ${msg.location || 'there'} still available?`)
                          inputRef.current?.focus()
                        }}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="size-3.5" />
                        Reply to claim
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── STANDARD CHAT BUBBLE ── */
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs space-y-1',
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
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* ── BOTTOM COMPOSER ── */}
      <div className="shrink-0 pt-2 border-t border-border/70 bg-background/95 backdrop-blur-md space-y-2">
        {/* Identity Pill & Quick Emoji Row */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <button
            type="button"
            onClick={() => setIsAnonymous((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-muted/80 hover:bg-muted px-2.5 py-1 text-muted-foreground transition-colors cursor-pointer font-medium"
            title="Click to toggle identity mode"
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
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji)
                  inputRef.current?.focus()
                }}
                className="size-7 flex items-center justify-center rounded-lg hover:bg-muted text-sm transition-transform active:scale-90 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message, ask for help, or offer extra pads..."
            className="flex-1 rounded-2xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 font-semibold shrink-0 cursor-pointer shadow-xs disabled:opacity-40"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>

      {/* ── MODAL: ASK FOR PAD OR OFFER PAD ── */}
      {padModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPadModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
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
                <h3 className="text-base font-bold leading-tight">
                  {modalMode === 'ask' ? 'Ask for a Pad Nearby' : 'Offer Spare Pads on Campus'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {modalMode === 'ask'
                    ? 'Notify campus peers nearby for emergency help'
                    : 'Help fellow students who might be in urgent need'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product item selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  What item?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {padItems.map((item) => (
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

              {/* Campus location selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Where on campus?
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {campusLocations.map((loc) => (
                    <Chip
                      key={loc}
                      selected={selectedLocation === loc && !customLocation}
                      onClick={() => {
                        setSelectedLocation(loc)
                        setCustomLocation('')
                      }}
                      className="text-xs py-1 px-2.5 rounded-xl cursor-pointer"
                    >
                      {loc}
                    </Chip>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or specify exact room/floor (e.g. LHC Washroom 1st floor)"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Note / Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {modalMode === 'ask' ? 'Urgent Note / Washroom details' : 'Note for recipient'}
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

              {/* Anonymity toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-lavender-soft/70 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Post Anonymously</p>
                    <p className="text-[11px] text-muted-foreground">Keep your name and identity hidden</p>
                  </div>
                </div>
                <Toggle checked={isAnonymous} onChange={setIsAnonymous} label="Post anonymously" />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handlePadModalSubmit}
                className={cn(
                  'w-full h-11 rounded-2xl font-semibold text-white shadow-xs cursor-pointer',
                  modalMode === 'ask'
                    ? 'bg-rose-strong hover:bg-rose-strong/90'
                    : 'bg-primary hover:bg-primary/90'
                )}
              >
                {modalMode === 'ask' ? 'Post Urgent Request' : 'Post Pad Offer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
