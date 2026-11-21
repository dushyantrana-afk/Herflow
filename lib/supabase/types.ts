export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          campus: string
          cycle_day: number
          cycle_length: number
          period_length: number
          phase: string
          anonymous_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          campus?: string
          cycle_day?: number
          cycle_length?: number
          period_length?: number
          phase?: string
          anonymous_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          campus?: string
          cycle_day?: number
          cycle_length?: number
          period_length?: number
          phase?: string
          anonymous_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dispensers: {
        Row: {
          id: string
          name: string
          building: string
          stock: number
          distance: string
          last_refill: string
          predicted_empty_in: string
          x: number
          y: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          building: string
          stock?: number
          distance?: string
          last_refill?: string
          predicted_empty_in?: string
          x?: number
          y?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          building?: string
          stock?: number
          distance?: string
          last_refill?: string
          predicted_empty_in?: string
          x?: number
          y?: number
          created_at?: string
          updated_at?: string
        }
      }
      pad_requests: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'accepted' | 'completed' | 'cancelled'
          location: string
          item: string
          anonymous: boolean
          note: string | null
          helper_id: string | null
          helper_alias: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
          location: string
          item: string
          anonymous?: boolean
          note?: string | null
          helper_id?: string | null
          helper_alias?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
          location?: string
          item?: string
          anonymous?: boolean
          note?: string | null
          helper_id?: string | null
          helper_alias?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string | null
          kind: 'request' | 'offer'
          alias: string
          location: string
          item: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          kind: 'request' | 'offer'
          alias?: string
          location: string
          item: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          kind?: 'request' | 'offer'
          alias?: string
          location?: string
          item?: string
          created_at?: string
        }
      }
      symptom_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          mood: string | null
          symptoms: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date?: string
          mood?: string | null
          symptoms?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          mood?: string | null
          symptoms?: string[]
          created_at?: string
        }
      }
      cycle_history: {
        Row: {
          id: string
          user_id: string
          month: string
          length: number
          period: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          length: number
          period: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          length?: number
          period?: number
          created_at?: string
        }
      }
    }
  }
}
