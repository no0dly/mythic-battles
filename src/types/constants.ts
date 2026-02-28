import { DraftSettings } from "./database.types";

export const CARD_CLASS = {
  AQUATIC: 'aquatic',
  BOREAL: 'boreal',
  FIREPROOF: 'fireproof',
  FLYING: 'flying',
  HUGE: 'huge',
  TERRESTRIAL: 'terrestrial',
} as const;

export const CARD_ORIGIN = {
  ASG: 'ASG',
  CHT: 'CHT',
  COR: 'COR',
  CRT: 'CRT',
  DIO: 'DIO',
  DUA: 'DUA',
  ECH: 'ECH',
  ETE: 'ETE',
  HEP: 'HEP',
  HER: 'HER',
  ISF_COR: 'ISF_COR',
  JOR: 'JOR',
  JUD: 'JUD',
  KEE: 'KEE',
  KET: 'KET',
  KRA: 'KRA',
  MAN: 'MAN',
  NID: 'NID',
  OED: 'OED',
  PAN: 'PAN',
  POS: 'POS',
  RAG: 'RAG',
  RAG_COR: 'RAG_COR',
  RIS: 'RIS',
  SUR: 'SUR',
  TRO: 'TRO',
  YMI: 'YMI',
} as const;

export const CARD_TYPES = {
  HERO: 'hero',
  MONSTER: 'monster',
  GOD: 'god',
  TITAN: 'titan',
  TROOP: 'troop',
  JARL: 'jarl',
  ART_OF_WAR: 'art_of_war',
  TROOP_ATTACHMENT: 'troop_attachment',
} as const;

export const SESSION_STATUS = {
  AVAILABLE: 'available',
  INVITE_TO_DRAFT: 'inviteToDraft',
  DRAFT: 'draft',
  DRAFT_RESET_REQUEST: 'draftResetRequest',
  IN_PROGRESS: 'inProgress',
  ERROR: 'error',
  FINISHED: 'finished',
} as const;

export const GAME_STATUS = {
  INVITE_TO_DRAFT: 'inviteToDraft',
  DRAFT: 'draft',
  DRAFT_RESET_REQUEST: 'draftResetRequest',
  IN_PROGRESS: 'inProgress',
  FINISHED: 'finished',
} as const;

export const DRAFT_STATUS = {
  DRAFT: 'draft',
  RESET_REQUESTED: 'resetRequested',
  FINISHED: 'finished',
} as const;

export const GAME_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const FRIENDSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
} as const;

export const DEFAULT_DRAFT_SETTINGS: DraftSettings = {
  user_allowed_points: 18,
  draft_size: 40,
  gods_amount: 4,
  titans_amount: 2,
  troop_attachment_amount: 4,
} as const;

export const WIN_CONDITION = {
  KILLED_GOD: 'killedGod',
  OBTAINED_GEMS: 'obtainedGems',
} as const;