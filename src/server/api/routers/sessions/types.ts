import type { Session } from "@/types/database.types";

// Type for player subset when selecting only id, display_name, email, avatar_url
export type PlayerSubset = {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string;
};

// Extended session type with player information
export type SessionWithPlayers = Session & {
  player1_name: string;
  player2_name: string;
  player1_email?: string;
  player2_email?: string;
  player1_avatar_url?: string;
  player2_avatar_url?: string;
};

// Game list entry structure from JSON
export type GameListEntry = {
  number?: number;
  player1_score?: number;
  player2_score?: number;
  duration?: string;
  rounds?: number;
  winner?: "player1" | "player2" | "draw";
  [key: string]: unknown;
};

// Parsed game structure for UI
export type ParsedGame = {
  number: number;
  result: "Won" | "Lost" | "Draw";
  createdBy?: string;
  details?: {
    player1Score: number;
    player2Score: number;
    duration?: string;
    rounds?: number;
  };
};

