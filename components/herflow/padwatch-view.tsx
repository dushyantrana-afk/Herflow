'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { BellRing, Brain, Clock, LayoutDashboard, MapPin, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, SectionHeader, StockBadge, StockBar, Toggle } from './primitives'
import { dispensers as defaultDispensers, type Dispenser } from '@/lib/herflow-data'
import { fetchDispensers } from '@/lib/supabase/services'
import { cn } from '@/lib/utils'

const demand = [
  { hour: '8a', value: 30 },
  { hour: '10a', value: 55 },
  { hour: '12p', value: 80 },
  { hour: '2p', value: 92 },
  { hour: '4p', value: 64 },
  { hour: '6p', value: 40 },
  { hour: '8p', value: 25 },
]

function pinTone(stock: number) {
  if (stock === 0) return 'bg-destructive'
  if (stock < 25) return 'bg-rose-strong'
  if (stock < 60) return 'bg-primary'
  return 'bg-sage-strong'
}

export function PadWatchView() {
  const [dispensersList, setDispensersList] = useState<Dispenser[]>(defaultDispensers)
  const [selectedId, setSelectedId] = useState(defaultDispensers[0].id)
  const [alerts, setAlerts] = useState(true)
  const [admin, setAdmin] = useState(false)
  const [refilled, setRefilled] = useState<string[]>([])

  useEffect(() => {
    fetchDispensers().then((data) => {
      if (data && data.length > 0) {
        setDispensersList(data)
        setSelectedId((prev) => (data.some((d) => d.id === prev) ? prev : data[0].id))
      }
    })
  }, [])

  const selected = dispensersList.find((d) => d.id === selectedId) ?? dispensersList[0]
  const low = dispensersList.filter((d) => d.stock < 25)

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0" aria-labelledby="map-title">
        <h2 id="map-title" className="sr-only">
          Campus dispenser map
        </h2>
        <div className="relative aspect-[16/11] w-full">
          <Image
            src="/images/campus-map.png"
            alt="Illustrated campus map showing buildings and pathways"
            fill
            sizes="420px"
            className="scale-[1.18] object-cover"
            priority
          />
          {dispensersList.map((d) => {
            const isSelected = d.id === selectedId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedId(d.id)}
                aria-pressed={isSelected}
                aria-label={`${d.name}, ${d.stock}% stocked`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {isSelected ? (
                  <span className={cn('herflow-pulse absolute inset-0 rounded-full', pinTone(d.stock))} aria-hidden="true" />
                ) : null}
                <span
                  className={cn(
                    'relative flex items-center justify-center rounded-full border-2 border-white text-white shadow-md transition-all',
                    pinTone(d.stock),
                    isSelected ? 'size-10' : 'size-8',
                  )}
                >
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
              </button>
            )
          })}
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
            <span className="size-2 rounded-full bg-sage-strong" aria-hidden="true" />
            Live · updated 1 min ago
          </span>
        </div>
        <div className="p-5" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold">{selected.name}</p>
              <p className="text-sm text-muted-foreground">
                {selected.building} · {selected.distance}
              </p>
            </div>
            <StockBadge stock={selected.stock} />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Stock level</span>
              <span className="font-semibold text-foreground">{selected.stock}%</span>
            </div>
            <StockBar stock={selected.stock} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-muted/70 p-3">
              <p className="text-xs text-muted-foreground">Last refill</p>
              <p className="mt-0.5 font-semibold">{selected.lastRefill}</p>
            </div>
            <div className="rounded-2xl bg-muted/70 p-3">
              <p className="text-xs text-muted-foreground">AI predicts empty in</p>
              <p className="mt-0.5 font-semibold">{selected.predictedEmptyIn}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card aria-labelledby="all-title">
        <SectionHeader id="all-title" title="All dispensers" eyebrow={`${dispensersList.length} on campus`} />
        <ul className="space-y-1">
          {dispensersList.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors',
                  d.id === selectedId ? 'bg-lavender-soft' : 'hover:bg-muted',
                )}
              >
                <span className={cn('size-2.5 shrink-0 rounded-full', pinTone(d.stock))} aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{d.name}</span>
                  <span className="block text-xs text-muted-foreground">{d.distance}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{d.stock}%</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card aria-labelledby="alerts-title">
        <div className="flex items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-soft">
            <BellRing className="size-5 text-rose-strong" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 id="alerts-title" className="text-base font-semibold">
              Low-stock notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              {low.length} dispensers are currently low or empty.
            </p>
          </div>
          <Toggle checked={alerts} onChange={setAlerts} label="Low-stock notifications" />
        </div>
      </Card>

      <Card aria-labelledby="ai-demand-title" className="bg-gradient-to-br from-lavender-soft to-card">
        <SectionHeader
          id="ai-demand-title"
          eyebrow="AI demand prediction"
          title="Peak demand today: 1–3 PM"
          action={<Brain className="size-5 text-primary" aria-hidden="true" />}
        />
        <div
          className="flex h-28 items-end gap-2.5"
          role="img"
          aria-label="Predicted demand by hour, peaking at 2 PM"
        >
          {demand.map((d) => (
            <div key={d.hour} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn('w-full rounded-lg', d.value > 75 ? 'bg-primary' : 'bg-lavender/40')}
                style={{ height: `${d.value * 0.8}px` }}
              />
              <span className="text-[11px] text-muted-foreground">{d.hour}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-card p-3 text-sm leading-relaxed">
          <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          Refill Lecture Hall Complex before 12 PM to avoid a stock-out during peak hours.
        </p>
      </Card>

      <Card aria-labelledby="admin-title">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-5 text-muted-foreground" aria-hidden="true" />
            <h2 id="admin-title" className="text-base font-semibold">
              Admin inventory
            </h2>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setAdmin((a) => !a)} aria-expanded={admin}>
            {admin ? 'Hide' : 'Open'}
          </Button>
        </div>
        {admin ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/70 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">Location</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Stock</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dispensersList.map((d) => {
                  const done = refilled.includes(d.id)
                  const stock = done ? 100 : d.stock
                  return (
                    <tr key={d.id}>
                      <td className="px-3 py-2.5 font-medium">{d.name}</td>
                      <td className="px-3 py-2.5 tabular-nums">{stock}%</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={done || d.stock >= 60}
                          onClick={() => setRefilled((r) => [...r, d.id])}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-lavender-soft disabled:text-muted-foreground disabled:hover:bg-transparent"
                        >
                          <RefreshCw className="size-3" aria-hidden="true" />
                          {done ? 'Refilled' : 'Mark refilled'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
