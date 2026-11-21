import type { Helper } from './herflow-data'

export type RequestStatus = 'pending' | 'accepted' | 'completed'

export type PadRequest = {
  id: string
  status: RequestStatus
  location: string
  item: string
  anonymous: boolean
  note: string
  helper: Helper | null
}
