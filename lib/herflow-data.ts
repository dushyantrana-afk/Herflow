export type TabId = 'home' | 'cycle' | 'support' | 'assistant' | 'profile'

export const user = {
  name: 'Ananya',
  campus: 'IIT Delhi',
  cycleDay: 14,
  cycleLength: 28,
  periodLength: 5,
  nextPeriodInDays: 15,
  phase: 'Ovulation window',
}

export type Dispenser = {
  id: string
  name: string
  building: string
  stock: number
  distance: string
  lastRefill: string
  predictedEmptyIn: string
  x: number
  y: number
}

export const dispensers: Dispenser[] = [
  {
    id: 'lib',
    name: 'Central Library',
    building: 'Ground floor, near lockers',
    stock: 82,
    distance: '120 m',
    lastRefill: '2h ago',
    predictedEmptyIn: '3 days',
    x: 30,
    y: 34,
  },
  {
    id: 'hostel',
    name: 'Himadri Hostel',
    building: 'Common room, Block B',
    stock: 46,
    distance: '350 m',
    lastRefill: 'Yesterday',
    predictedEmptyIn: '1 day',
    x: 72,
    y: 26,
  },
  {
    id: 'lhc',
    name: 'Lecture Hall Complex',
    building: '1st floor washroom',
    stock: 12,
    distance: '210 m',
    lastRefill: '3 days ago',
    predictedEmptyIn: '4 hours',
    x: 54,
    y: 58,
  },
  {
    id: 'sports',
    name: 'Sports Complex',
    building: 'Changing room, west wing',
    stock: 0,
    distance: '640 m',
    lastRefill: '5 days ago',
    predictedEmptyIn: 'Empty',
    x: 22,
    y: 74,
  },
  {
    id: 'health',
    name: 'Health Centre',
    building: 'Reception desk',
    stock: 95,
    distance: '480 m',
    lastRefill: 'Today',
    predictedEmptyIn: '6 days',
    x: 82,
    y: 70,
  },
]

export function stockLevel(stock: number) {
  if (stock === 0) return { label: 'Empty', tone: 'empty' as const }
  if (stock < 25) return { label: 'Low', tone: 'low' as const }
  if (stock < 60) return { label: 'Moderate', tone: 'moderate' as const }
  return { label: 'Well stocked', tone: 'good' as const }
}

export type Helper = {
  id: string
  alias: string
  distance: string
  eta: string
  verified: boolean
  helped: number
}

export const helpers: Helper[] = [
  { id: 'h1', alias: 'Lotus · 3rd yr', distance: '80 m', eta: '2 min', verified: true, helped: 14 },
  { id: 'h2', alias: 'Fern · 2nd yr', distance: '150 m', eta: '4 min', verified: true, helped: 9 },
  { id: 'h3', alias: 'Iris · PhD', distance: '260 m', eta: '6 min', verified: true, helped: 21 },
]

export type CommunityPost = {
  id: string
  kind: 'request' | 'offer'
  alias: string
  location: string
  item: string
  time: string
}

export type CommunityMessageType = 'chat' | 'ask_pad' | 'offer_pad' | 'urgent'

export type CommunityChatMessage = {
  id: string
  userId?: string | null
  senderName: string
  senderCampus: string
  isVerifiedStudent: boolean
  isAnonymous: boolean
  content: string
  messageType: CommunityMessageType
  item?: string
  location?: string
  status?: 'open' | 'helped' | 'resolved'
  helpedBy?: string | null
  time: string
  createdAt: string
}

export const initialCommunityMessages: CommunityChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Pooja · 2nd yr',
    senderCampus: 'IIT Delhi',
    isVerifiedStudent: true,
    isAnonymous: false,
    content: 'Good morning everyone! Just checked and the pad dispenser at Central Library (Ground floor) was just refilled with fresh stock.',
    messageType: 'chat',
    time: '25m ago',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    senderName: 'Anonymous Student',
    senderCampus: 'IIT Delhi',
    isVerifiedStudent: true,
    isAnonymous: true,
    content: 'SOS! Period started unexpectedly during class. Can anyone spare a regular or heavy flow pad near Lecture Hall Complex?',
    messageType: 'ask_pad',
    item: 'Regular pad',
    location: 'LHC, 1st floor washroom',
    status: 'helped',
    helpedBy: 'Riya (Himadri)',
    time: '18m ago',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    senderName: 'Riya · Himadri Hostel',
    senderCampus: 'IIT Delhi',
    isVerifiedStudent: true,
    isAnonymous: false,
    content: 'Just handed one over to you outside the LHC washroom! Hope you are feeling better ❤️',
    messageType: 'chat',
    time: '14m ago',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-4',
    senderName: 'Tanvi K. · PhD',
    senderCampus: 'IIT Delhi',
    isVerifiedStudent: true,
    isAnonymous: false,
    content: 'I have 2 extra heavy flow pads and panty liners in my locker. Happy to share with anyone who needs them today!',
    messageType: 'offer_pad',
    item: '2 × Heavy flow pads',
    location: 'Central Library, 2nd floor study cubicles',
    status: 'open',
    time: '8m ago',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-5',
    senderName: 'Anonymous Student',
    senderCampus: 'IIT Delhi',
    isVerifiedStudent: true,
    isAnonymous: true,
    content: 'Does anyone have a heating pad or hot water bag at Himadri Hostel Block B? Having intense day 1 cramps 🥺',
    messageType: 'chat',
    time: '3m ago',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
]

export const communityPosts: CommunityPost[] = [
  { id: 'c1', kind: 'request', alias: 'Anonymous', location: 'LHC, 1st floor', item: 'Regular pad', time: '2 min ago' },
  { id: 'c2', kind: 'offer', alias: 'Willow', location: 'Central Library', item: '2 × Heavy flow pads', time: '8 min ago' },
  { id: 'c3', kind: 'request', alias: 'Anonymous', location: 'Sports Complex', item: 'Heavy flow pad', time: '12 min ago' },
  { id: 'c4', kind: 'offer', alias: 'Sage', location: 'Himadri Hostel', item: 'Panty liners', time: '25 min ago' },
]

export const cycleHistory = [
  { month: 'Jun', length: 29, period: 5 },
  { month: 'Jul', length: 27, period: 4 },
  { month: 'Aug', length: 28, period: 5 },
  { month: 'Sep', length: 30, period: 6 },
  { month: 'Oct', length: 28, period: 5 },
  { month: 'Nov', length: 28, period: 5 },
]

export const symptoms = [
  'Cramps',
  'Headache',
  'Bloating',
  'Fatigue',
  'Acne',
  'Back pain',
  'Tender breasts',
  'Mood swings',
]

export const moods = [
  { id: 'calm', label: 'Calm' },
  { id: 'happy', label: 'Happy' },
  { id: 'tired', label: 'Tired' },
  { id: 'low', label: 'Low' },
  { id: 'anxious', label: 'Anxious' },
]

export const myths = [
  {
    claim: 'You should not exercise during your period.',
    verdict: 'Myth',
    detail: 'Gentle exercise like walking or yoga can actually ease cramps and lift mood.',
  },
  {
    claim: 'Period pain that stops daily activities is normal.',
    verdict: 'Myth',
    detail: 'Severe pain may signal conditions like endometriosis. Please consult a doctor.',
  },
  {
    claim: 'Cycles between 21 and 35 days are considered typical.',
    verdict: 'Fact',
    detail: 'Adult cycle lengths vary. Consistency for you matters more than an exact number.',
  },
]
