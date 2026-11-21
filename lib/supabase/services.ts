import { createClient } from './client'
import {
  dispensers as defaultDispensers,
  communityPosts as defaultCommunityPosts,
  initialCommunityMessages,
  type Dispenser,
  type CommunityPost,
  type CommunityChatMessage,
} from '@/lib/herflow-data'
import type { PadRequest, RequestStatus } from '@/lib/request-types'

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes('your-project-id'))
}

// ---------------------------------------------------------------------------
// Dispensers Service
// ---------------------------------------------------------------------------
export async function fetchDispensers(): Promise<Dispenser[]> {
  if (!isSupabaseConfigured()) {
    return defaultDispensers
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dispensers')
      .select('*')
      .order('stock', { ascending: false })

    if (error || !data || data.length === 0) {
      return defaultDispensers
    }

    return data.map((d) => ({
      id: d.id,
      name: d.name,
      building: d.building,
      stock: d.stock,
      distance: d.distance,
      lastRefill: d.last_refill,
      predictedEmptyIn: d.predicted_empty_in,
      x: Number(d.x),
      y: Number(d.y),
    }))
  } catch {
    return defaultDispensers
  }
}

// ---------------------------------------------------------------------------
// Emergency Pad Requests Service
// ---------------------------------------------------------------------------
export async function submitPadRequest(
  request: Omit<PadRequest, 'id' | 'status' | 'helper'>
): Promise<PadRequest> {
  const newId = crypto.randomUUID()
  const localRequest: PadRequest = {
    ...request,
    id: newId,
    status: 'pending',
    helper: null,
  }

  if (!isSupabaseConfigured()) {
    return localRequest
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('pad_requests')
      .insert({
        id: newId,
        location: request.location,
        item: request.item,
        anonymous: request.anonymous,
        note: request.note,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !data) {
      return localRequest
    }

    return {
      id: data.id,
      location: data.location,
      item: data.item,
      anonymous: data.anonymous,
      note: data.note ?? '',
      status: data.status as RequestStatus,
      helper: data.helper_id
        ? {
            id: data.helper_id,
            alias: data.helper_alias ?? 'Helper',
            distance: '150 m',
            eta: '3 min',
            verified: true,
            helped: 10,
          }
        : null,
    }
  } catch {
    return localRequest
  }
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  helperAlias?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('pad_requests')
      .update({
        status,
        ...(helperAlias ? { helper_alias: helperAlias, helper_id: crypto.randomUUID() } : {}),
      })
      .eq('id', id)

    return !error
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Community Board Service (Pad-to-Pad)
// ---------------------------------------------------------------------------
export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  if (!isSupabaseConfigured()) {
    return defaultCommunityPosts
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return defaultCommunityPosts
    }

    return data.map((p) => ({
      id: p.id,
      kind: p.kind as 'request' | 'offer',
      alias: p.alias,
      location: p.location,
      item: p.item,
      time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
  } catch {
    return defaultCommunityPosts
  }
}

export async function submitCommunityPost(
  post: Omit<CommunityPost, 'id' | 'time'>
): Promise<CommunityPost> {
  const localPost: CommunityPost = {
    ...post,
    id: crypto.randomUUID(),
    time: 'Just now',
  }

  if (!isSupabaseConfigured()) {
    return localPost
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        kind: post.kind,
        alias: post.alias,
        location: post.location,
        item: post.item,
      })
      .select()
      .single()

    if (error || !data) return localPost

    return {
      id: data.id,
      kind: data.kind as 'request' | 'offer',
      alias: data.alias,
      location: data.location,
      item: data.item,
      time: 'Just now',
    }
  } catch {
    return localPost
  }
}

// ---------------------------------------------------------------------------
// Daily Symptom & Mood Check-in Service
// ---------------------------------------------------------------------------
export async function saveDailyCheckIn(data: {
  mood: string | null
  symptoms: string[]
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return true

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return true // Anonymous local session

    const { error } = await supabase.from('symptom_logs').insert({
      user_id: user.id,
      mood: data.mood,
      symptoms: data.symptoms,
      log_date: new Date().toISOString().split('T')[0],
    })

    return !error
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Community Live Chat Service
// ---------------------------------------------------------------------------
const CHAT_STORAGE_KEY = 'herflow_community_chat_messages'

function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'Just now'
  }
}

export async function fetchCommunityMessages(): Promise<CommunityChatMessage[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        return data.map((m) => ({
          id: m.id,
          userId: m.user_id,
          senderName: m.sender_name,
          senderCampus: m.sender_campus,
          isVerifiedStudent: m.is_verified,
          isAnonymous: m.is_anonymous,
          content: m.content,
          messageType: m.message_type as CommunityChatMessage['messageType'],
          item: m.item ?? undefined,
          location: m.location ?? undefined,
          status: m.status as CommunityChatMessage['status'],
          helpedBy: m.helped_by,
          time: formatMessageTime(m.created_at),
          createdAt: m.created_at,
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch community messages from Supabase, falling back to local:', err)
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CommunityChatMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({
            ...m,
            time: formatMessageTime(m.createdAt),
          }))
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return initialCommunityMessages
}

export async function sendCommunityChatMessage(
  msg: Omit<CommunityChatMessage, 'id' | 'createdAt' | 'time'>
): Promise<CommunityChatMessage> {
  const newId = crypto.randomUUID()
  const nowIso = new Date().toISOString()
  const localMessage: CommunityChatMessage = {
    ...msg,
    id: newId,
    createdAt: nowIso,
    time: 'Just now',
    status: msg.status || 'open',
  }

  // Update local storage
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(CHAT_STORAGE_KEY)
      const list: CommunityChatMessage[] = existing ? JSON.parse(existing) : [...initialCommunityMessages]
      const updated = [...list, localMessage]
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.warn('Error saving message locally:', err)
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          id: newId,
          user_id: msg.userId ?? null,
          sender_name: msg.senderName,
          sender_campus: msg.senderCampus,
          is_verified: msg.isVerifiedStudent,
          is_anonymous: msg.isAnonymous,
          content: msg.content,
          message_type: msg.messageType,
          item: msg.item ?? null,
          location: msg.location ?? null,
          status: msg.status ?? 'open',
          helped_by: msg.helpedBy ?? null,
        })
        .select()
        .single()

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          senderName: data.sender_name,
          senderCampus: data.sender_campus,
          isVerifiedStudent: data.is_verified,
          isAnonymous: data.is_anonymous,
          content: data.content,
          messageType: data.message_type as CommunityChatMessage['messageType'],
          item: data.item ?? undefined,
          location: data.location ?? undefined,
          status: data.status as CommunityChatMessage['status'],
          helpedBy: data.helped_by,
          time: 'Just now',
          createdAt: data.created_at,
        }
      }
    } catch (err) {
      console.warn('Failed to save community message to Supabase:', err)
    }
  }

  return localMessage
}

export async function markCommunityMessageHelped(
  messageId: string,
  helperName: string
): Promise<boolean> {
  // Update local storage
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(CHAT_STORAGE_KEY)
      if (existing) {
        const list: CommunityChatMessage[] = JSON.parse(existing)
        const updated = list.map((m) =>
          m.id === messageId ? { ...m, status: 'helped' as const, helpedBy: helperName } : m
        )
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
      }
    } catch {
      // Ignore
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('community_messages')
        .update({
          status: 'helped',
          helped_by: helperName,
        })
        .eq('id', messageId)

      return !error
    } catch {
      return false
    }
  }

  return true
}
