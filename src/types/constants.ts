import type { CardOrigin, DraftSettings } from "./database.types";

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
  JARL: 'Jarl',
  JOR: 'JOR',
  JUD: 'JUD',
  KEE: 'KEE',
  KET: 'KET',
  KRA: 'KRA',
  MAN: 'MAN',
  NID: 'NID',
  OED: 'OED',
  PAN: 'PAN',
  POLEMARCH: 'Polemarch',
  POS: 'POS',
  RAG: 'RAG',
  RAG_COR: 'RAG_COR',
  RIS: 'RIS',
  SUR: 'SUR',
  TJATI: 'Tjati',
  TRO: 'TRO',
  YMI: 'YMI',
  THERMOPYLAE: 'Thermopylae',
} as const;

export const CARD_ORIGIN_FULL_NAME: Partial<Record<CardOrigin, string>> = {
  ASG: "Asgard",
  CHT: "Chthonian Wrath",
  COR: "Core Box Pantheon",
  CRT: "Corinthia",
  DIO: "Dionysus",
  DUA: "Duat",
  ECH: "Echidna's Children",
  ETE: "Eternal Cycle",
  HEP: "Hephastus",
  HER: "Hera",
  ISF_COR: "Core Box Isfet",
  JOR: "Jormungand",
  JUD: "Judges of the Underworld",
  Jarl: "Jarl",
  KEE: "Keepers of the Soul",
  KET: "Ketos",
  KRA: "Kraken",
  MAN: "Manticore",
  NID: "Nidhogg",
  OED: "Oedipus vs the Sphinx",
  PAN: "Pandora's Box",
  POS: "Poseidon",
  Polemarch: "Polemarch",
  RAG: "Ragnar Saga",
  RAG_COR: "Core Box Ragnarok",
  RIS: "Rise of the Titans",
  SUR: "Surt",
  Tjati: "Tjati",
  TRO: "Heroes of the Trojan War",
  YMI: "Ymir",
  Thermopylae: "Thermopylae",
};

export const CARD_TYPES = {
  HERO: 'hero',
  MONSTER: 'monster',
  GOD: 'god',
  TITAN: 'titan',
  TROOP: 'troop',
  ART_OF_WAR: 'art_of_war',
  TROOP_ATTACHMENT: 'troop_attachment',
} as const;

export const UNIT_TYPES = [
  CARD_TYPES.HERO,
  CARD_TYPES.MONSTER,
  CARD_TYPES.GOD,
  CARD_TYPES.TITAN,
  CARD_TYPES.TROOP,
] as const;

/** God and titan are separate card types but share divinity draft rules */
export const isDivinityUnitType = (unitType: string): boolean =>
  unitType === CARD_TYPES.GOD || unitType === CARD_TYPES.TITAN;

export const HELPER_TYPES = [
  CARD_TYPES.ART_OF_WAR,
  CARD_TYPES.TROOP_ATTACHMENT,
] as const;

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

/** Fixed UUID — must match supabase/migrations/018_seed_solo_practice_user.sql */
export const SOLO_PRACTICE_PLAYER_ID = '00000000-0000-0000-0000-000000000001';

/** Must match supabase/migrations/021_multiplayer_modes.sql. The first entry always fills player2_id. */
export const PRACTICE_PLAYER_IDS = [
  SOLO_PRACTICE_PLAYER_ID,
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
] as const;

export const isPracticePlayerId = (id: string): boolean =>
  (PRACTICE_PLAYER_IDS as readonly string[]).includes(id);

export const GAME_MODE = {
  ONE_VS_ONE: '1v1',
  FFA3: 'ffa3',
  TEAM_2V2: 'team2v2',
} as const;

export const GAME_MODE_VALUES = [
  GAME_MODE.ONE_VS_ONE,
  GAME_MODE.FFA3,
  GAME_MODE.TEAM_2V2,
] as const;

/** i18n keys for the short mode labels (1v1, 1v1v1, 2v2) */
export const GAME_MODE_LABEL_KEYS = {
  [GAME_MODE.ONE_VS_ONE]: 'gameMode1v1',
  [GAME_MODE.FFA3]: 'gameModeFfa3',
  [GAME_MODE.TEAM_2V2]: 'gameModeTeam2v2',
} as const;

export const GAME_MODE_PLAYER_COUNT = {
  [GAME_MODE.ONE_VS_ONE]: 2,
  [GAME_MODE.FFA3]: 3,
  [GAME_MODE.TEAM_2V2]: 4,
} as const;

export const TEAM = {
  FIRST: 1,
  SECOND: 2,
} as const;

export const MAP_SIDE = {
  A: 'A',
  B: 'B',
} as const;

export const MAP_SIDE_VALUES = [MAP_SIDE.A, MAP_SIDE.B] as const;

export const GAME_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const DRAFT_RESET_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  DECLINED: 'declined',
} as const;

export const DRAFT_READY_CHECK_STATUS = {
  PENDING: 'pending',
  EXPIRED: 'expired',
} as const;

export const FRIENDSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
} as const;

export const MAP_TYPE = {
  DIVINE_SOURCE: 'divineSource',
  RUINS: 'ruins',
  FOREST: 'forest',
  BUILDING: 'building',
  STAIRS: 'stairs',
  BURNING: 'burning',
  ROCK: 'rock',
  STRUCTURE: 'structure',
  HEIGHTS: 'heights',
  SWAMP: 'swamp',
  RIFT: 'rift',
  CLIFF: 'cliff',
  CAGE_WALLS: 'cageWalls',
  CHAINS: 'chains',
  CAGE: 'cage',
  WATER: 'water',
  STEPS: 'steps',
  SACRED_WATERS: 'sacredWaters',
  SOLAR: 'solar',
  DIVINE_GROWTH: 'divineGrowth',
  QUICKSAND: 'quicksand',
  POLAR: 'polar',
} as const;

export const ALL_VALUE = "all" as const;

export const DEFAULT_DRAFT_SETTINGS: DraftSettings = {
  user_allowed_points: 18,
  draft_size: 40,
  gods_amount: 4,
  titans_amount: 2,
  troop_attachment_amount: 4,
  origins: [ALL_VALUE],
  maps: [ALL_VALUE],
} as const;

export const GAME_MODE_DEFAULT_SETTINGS = {
  [GAME_MODE.ONE_VS_ONE]: {
    user_allowed_points: DEFAULT_DRAFT_SETTINGS.user_allowed_points,
    draft_size: DEFAULT_DRAFT_SETTINGS.draft_size,
  },
  [GAME_MODE.FFA3]: { user_allowed_points: 16, draft_size: 50 },
  [GAME_MODE.TEAM_2V2]: { user_allowed_points: 14, draft_size: 60 },
} as const;

export const WIN_CONDITION = {
  KILLED_DIVINITY: 'killedDivinity',
  OBTAINED_GEMS: 'obtainedGems',
} as const;