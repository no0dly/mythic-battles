export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Statistics = {
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
  friends: string[]
  statistics: Statistics
}
        
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
      }
    }
  }
}
