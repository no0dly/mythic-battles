export const CARD_TYPES = {
  HERO: 'hero',
  MONSTER: 'monster',
  GOD: 'god',
  TITAN: 'titan',
  TROOP: 'troop',
  JARL: 'jarl',
  ART_OF_WAR: 'art_of_war',
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
  ROLL_FOR_TURN: 'rollForTurn',
  DRAFT: 'draft',
  RESET_REQUESTED: 'resetRequested',
  FINISHED: 'finished',
} as const;
