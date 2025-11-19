import type { Card } from '@/types/database.types'

export type CardIdMap = Map<string, Card>

export const createCardIdMap = (cards: Card[] | undefined | null): CardIdMap => {
  if (!cards?.length) return new Map()

  return new Map(cards.map((card) => [card.id, card]))
}

