import { CARD_CLASS, CARD_ORIGIN, CARD_TYPES, GAME_STATUS, SESSION_STATUS, DRAFT_STATUS, GAME_INVITATION_STATUS, FRIENDSHIP_STATUS, WIN_CONDITION } from "./constants"
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

export type FriendshipStatus = ValueOf<typeof FRIENDSHIP_STATUS>

export type Friendship = {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export type GameInvitationStatus = ValueOf<typeof GAME_INVITATION_STATUS>

export type GameInvitation = {
  id: string
  game_id: string
  session_id: string
  inviter_id: string
  invitee_id: string
  status: GameInvitationStatus
  message: string | null
  created_at: string
  updated_at: string
  responded_at: string | null
}



export type CardType = ValueOf<typeof CARD_TYPES>;
export type CardClass = ValueOf<typeof CARD_CLASS>;
export type CardOrigin = ValueOf<typeof CARD_ORIGIN>;

export type Card = {
  id: string
  unit_name: string
  unit_type: CardType;
  cost: number
  amount_of_card_activations: number
  strategic_value: number
  talents: string[]
  class: CardClass[]
  origin: CardOrigin | null
  image_url: string
  created_at: string
  updated_at: string
}

export type SessionStatus = ValueOf<typeof SESSION_STATUS>;

export type Session = {
  id: string
  player1_id: string
  player2_id: string
  player1_session_score: number
  player2_session_score: number
  status: SessionStatus
  error_message: string | null
  game_list: string[] | null
  created_at: string
  updated_at: string
  finished_at: string | null
}


export type GameStatus = ValueOf<typeof GAME_STATUS>;

export type DraftSettings = {
  user_allowed_points: number
  draft_size: number
  gods_amount: number
  titans_amount: number
  troop_attachment_amount: number
}

export type WinCondition = ValueOf<typeof WIN_CONDITION>;

export type Game = {
  id: string
  session_id: string
  game_number: number
  status: GameStatus
  winner_id: string | null
  draft_id: string | null
  created_by: string
  draft_settings: DraftSettings
  created_at: string
  updated_at: string
  finished_at: string | null
  win_condition: WinCondition | null
}

export type DraftStatus = ValueOf<typeof DRAFT_STATUS>;

export type DraftPick = {
  card_id: string
  player_id: string
  pick_number: number
  timestamp: string
}

export type DraftHistory = {
  picks: DraftPick[]
  initial_roll?: {
    player1_roll: number
    player2_roll: number
  }
}

export type InitialRoll = {
  userID: string
  roll: number
}

export type Draft = {
  id: string
  game_id: string
  player1_id: string
  player2_id: string
  initial_roll: InitialRoll[] | null
  draft_status: DraftStatus
  draft_history: Json | null
  current_turn_user_id: string
  created_at: string
  updated_at: string
  draft_pool: string[]
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
        Insert: Omit<Game, 'id' | 'created_at' | 'updated_at'> & {
          draft_settings?: Json
        }
        Update: Partial<Omit<Game, 'id' | 'created_at' | 'updated_at'>> & {
          draft_settings?: Json
        }
      }
      drafts: {
        Row: Draft
        Insert: Omit<Draft, 'id' | 'created_at' | 'updated_at'> & {
          initial_roll?: InitialRoll[]
          draft_history?: Json | DraftHistory
        }
        Update: Partial<Omit<Draft, 'id' | 'created_at' | 'updated_at'>> & {
          initial_roll?: InitialRoll[]
          draft_history?: Json | DraftHistory
        }
      }
      game_invitations: {
        Row: GameInvitation
        Insert: Omit<GameInvitation, 'id' | 'created_at' | 'updated_at' | 'responded_at'>
        Update: Partial<Omit<GameInvitation, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type UserSubset = Pick<UserProfile, 'id' | 'email' | 'display_name' | 'avatar_url'>;

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
export type GameInsert = Omit<Game, 'id' | 'created_at' | 'updated_at'> & {
  draft_settings?: Json
}
export type GameUpdate = Partial<Omit<Game, 'id' | 'created_at' | 'updated_at'>> & {
  draft_settings?: Json
}
export type DraftInsert = Omit<Draft, 'id' | 'created_at' | 'updated_at'> & {
  initial_roll?: InitialRoll[]
  draft_history?: Json | DraftHistory
}
export type DraftUpdate = Partial<Omit<Draft, 'id' | 'created_at' | 'updated_at'>> & {
  initial_roll?: InitialRoll[]
  draft_history?: Json | DraftHistory
}
export type GameInvitationInsert = Omit<GameInvitation, 'id' | 'created_at' | 'updated_at' | 'responded_at'>
export type GameInvitationUpdate = Partial<Omit<GameInvitation, 'id' | 'created_at' | 'updated_at'>>
