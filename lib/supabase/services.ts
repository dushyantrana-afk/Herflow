import { createClient } from './client'
import {
  dispensers as defaultDispensers,
  communityPosts as defaultCommunityPosts,
  type Dispenser,
  type CommunityPost,
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
