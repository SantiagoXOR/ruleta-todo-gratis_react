export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
      }
      prizes: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          probability: number
          stock: number
          image_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          probability: number
          stock: number
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          probability?: number
          stock?: number
          image_url?: string | null
          is_active?: boolean
        }
      }
      spins: {
        Row: {
          id: string
          created_at: string
          user_id: string
          prize_id: string | null
          result_angle: number
          is_winner: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          prize_id?: string | null
          result_angle: number
          is_winner: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          prize_id?: string | null
          result_angle?: number
          is_winner?: boolean
        }
      }
      claims: {
        Row: {
          id: string
          created_at: string
          spin_id: string
          user_id: string
          prize_id: string
          status: 'pending' | 'completed' | 'cancelled'
          claimed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          spin_id: string
          user_id: string
          prize_id: string
          status?: 'pending' | 'completed' | 'cancelled'
          claimed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          spin_id?: string
          user_id?: string
          prize_id?: string
          status?: 'pending' | 'completed' | 'cancelled'
          claimed_at?: string | null
        }
      }
    }
  }
} 