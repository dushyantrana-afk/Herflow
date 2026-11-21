'use client'

import { useEffect, useState } from 'react'
import { Check, EyeOff, Gift, HandHelping, Inbox, MapPin, Plus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Chip, Toggle } from './primitives'
import { communityPosts, type CommunityPost } from '@/lib/herflow-data'
import { fetchCommunityPosts, submitCommunityPost } from '@/lib/supabase/services'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'request' | 'offer'

export function CommunityView() {
  const [posts, setPosts] = useState<CommunityPost[]>(communityPosts)
  const [filter, setFilter] = useState<Filter>('all')
  const [responded, setResponded] = useState<string[]>([])
  const [composing, setComposing] = useState(false)
  const [kind, setKind] = useState<'request' | 'offer'>('offer')
  const [item, setItem] = useState('Regular pad')
  const [location, setLocation] = useState('Central Library')
  const [anonymous, setAnonymous] = useState(true)

  useEffect(() => {
    fetchCommunityPosts().then((data) => {
      if (data && data.length > 0) setPosts(data)
    })
  }, [])

  const visible = posts.filter((p) => filter === 'all' || p.kind === filter)

  const publish = async () => {
    const newPost = await submitCommunityPost({
      kind,
      alias: anonymous ? 'Anonymous' : 'You',
      location,
      item,
    })
    setPosts((prev) => [newPost, ...prev])
    setComposing(false)
    setFilter('all')
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] bg-gradient-to-br from-sage-soft via-card to-lavender-soft p-5" aria-labelledby="p2p-title">
        <h2 id="p2p-title" className="text-xl font-semibold tracking-tight">
          Pad-to-Pad community
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Students helping students. Share an extra pad or ask for one, privately.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              setKind('request')
              setComposing(true)
            }}
            className="h-12 rounded-2xl font-semibold"
          >
            <HandHelping className="size-4" aria-hidden="true" />
            Request
          </Button>
          <Button
            onClick={() => {
              setKind('offer')
              setComposing(true)
            }}
            variant="outline"
            className="h-12 rounded-2xl bg-card font-semibold"
          >
            <Gift className="size-4" aria-hidden="true" />
            Offer
          </Button>
        </div>
      </section>

      {composing ? (
        <Card aria-labelledby="compose-title" className="animate-in fade-in slide-in-from-top-2">
          <h2 id="compose-title" className="text-base font-semibold">
            {kind === 'offer' ? 'Offer an extra pad' : 'Request a pad'}
          </h2>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium text-muted-foreground">Item</legend>
            <div className="flex flex-wrap gap-2">
              {['Regular pad', 'Heavy flow pad', 'Panty liners'].map((i) => (
                <Chip key={i} selected={item === i} onClick={() => setItem(i)}>
                  {i}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium text-muted-foreground">Location</legend>
            <div className="flex flex-wrap gap-2">
              {['Central Library', 'Lecture Hall Complex', 'Himadri Hostel'].map((l) => (
                <Chip key={l} selected={location === l} onClick={() => setLocation(l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-lavender-soft p-3.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <EyeOff className="size-4 text-primary" aria-hidden="true" />
              Post anonymously
            </span>
            <Toggle checked={anonymous} onChange={setAnonymous} label="Post anonymously" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" className="h-11 flex-1 rounded-2xl" onClick={() => setComposing(false)}>
              Cancel
            </Button>
            <Button className="h-11 flex-1 rounded-2xl font-semibold" onClick={publish}>
              <Plus className="size-4" aria-hidden="true" />
              Post
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="flex gap-2" role="group" aria-label="Filter posts">
        {(
          [
            ['all', 'All nearby'],
            ['request', 'Requests'],
            ['offer', 'Offers'],
          ] as const
        ).map(([id, label]) => (
          <Chip key={id} selected={filter === id} onClick={() => setFilter(id)}>
            {label}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="flex flex-col items-center py-10 text-center">
          <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold">Nothing nearby right now</p>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll notify you when someone posts.</p>
        </Card>
      ) : (
        <ul className="space-y-3" aria-live="polite">
          {visible.map((p) => {
            const done = responded.includes(p.id)
            const isOwn = p.alias === 'You' || p.time === 'Just now'
            return (
              <Card as="li" key={p.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-2xl',
                      p.kind === 'request' ? 'bg-rose-soft text-rose-strong' : 'bg-sage-soft text-sage-strong',
                    )}
                  >
                    {p.kind === 'request' ? (
                      <HandHelping className="size-5" aria-hidden="true" />
                    ) : (
                      <Gift className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.kind === 'request' ? 'Needs' : 'Offering'} · {p.time}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">{p.item}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" aria-hidden="true" />
                      {p.location} · {p.alias}
                    </p>
                  </div>
                  {isOwn ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Your post</span>
                  ) : (
                    <Button
                      size="sm"
                      variant={done ? 'secondary' : p.kind === 'request' ? 'default' : 'outline'}
                      disabled={done}
                      onClick={() => setResponded((r) => [...r, p.id])}
                      className="rounded-full"
                    >
                      {done ? (
                        <>
                          <Check className="size-3.5" aria-hidden="true" /> Sent
                        </>
                      ) : p.kind === 'request' ? (
                        'I can help'
                      ) : (
                        'Request'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </ul>
      )}

      <p className="flex items-start gap-2 rounded-2xl bg-muted/70 p-4 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage-strong" aria-hidden="true" />
        Responses must be accepted before any contact is shared. No personal health information is ever made public.
      </p>
    </div>
  )
}
