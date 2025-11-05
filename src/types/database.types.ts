export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Statistics = {
  wins: number
  losses: number
  total_games: number
  win_rate: number
  longest_win_streak: number
  longest_loss_streak: number
}

export type UserProfile = {
  id: string
  email: string
  display_name: string
  avatar_url: string
  created_at: string
  updated_at: string
  statistics: Statistics
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked'

export type Friendship = {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}
        
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'statistics'> & {
          statistics?: Json
        }
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'statistics'>> & {
          statistics?: Json
        }
      }
      friendships: {
        Row: Friendship
        Insert: Omit<Friendship, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Friendship, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper types for type-safe database operations
export type UserInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
export type UserUpdate = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
export type FriendshipInsert = Omit<Friendship, 'id' | 'created_at' | 'updated_at'>
export type FriendshipUpdate = Partial<Omit<Friendship, 'id' | 'created_at' | 'updated_at'>>
