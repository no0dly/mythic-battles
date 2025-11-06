import { CARD_TYPES, GAME_STATUS, SESSION_STATUS } from "./constants"
import { ValueOf } from "./interfaces"

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
  sessions: string[]
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



export type CardType = ValueOf<typeof CARD_TYPES>;

export type Card = {
  id: string
  unit_name: string
  unit_type: CardType;
  cost: number
  amount_of_card_activations: number
  strategic_value: number
  talents: string[]
  class: string
  image_url: string
  created_at: string
  updated_at: string
}

export type SessionStatus = ValueOf<typeof SESSION_STATUS>;

export type Session = {
  id: string
  player1_id: string
  player2_id: string
  player1_score: number
  player2_score: number
  status: SessionStatus
  error_message: string | null
  game_list: string[] | null
  created_at: string
  updated_at: string
  finished_at: string | null
}


export type GameStatus = ValueOf<typeof GAME_STATUS>;

export type Game = {
  id: string
  session_id: string
  game_number: number
  status: GameStatus
  winner_id: string | null
  draft_id: string | null
  created_at: string
  updated_at: string
  finished_at: string | null
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
      cards: {
        Row: Card
        Insert: Omit<Card, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'id' | 'created_at' | 'updated_at'> & {
          game_list?: Json
        }
        Update: Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>> & {
          game_list?: Json
        }
      }
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Game, 'id' | 'created_at' | 'updated_at'>>
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
export type CardInsert = Omit<Card, 'id' | 'created_at' | 'updated_at'>
export type CardUpdate = Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at'> & {
  game_list?: Json
}
export type SessionUpdate = Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>> & {
  game_list?: Json
}
export type GameInsert = Omit<Game, 'id' | 'created_at' | 'updated_at'>
export type GameUpdate = Partial<Omit<Game, 'id' | 'created_at' | 'updated_at'>>
