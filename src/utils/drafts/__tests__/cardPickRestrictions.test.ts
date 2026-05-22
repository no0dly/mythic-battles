import { describe, expect, it } from 'vitest';
import type { Card } from '@/types/database.types';
import { CARD_TYPES } from '@/types/constants';
import {
  canPickCard,
  canStartGame,
} from '@/utils/drafts/cardPickRestrictions';

const makeCard = (overrides: Partial<Card> & Pick<Card, 'unit_type' | 'cost'>): Card =>
  ({
    id: 'card-1',
    unit_name: 'Test',
    amount_of_card_activations: 0,
    strategic_value: 1,
    talents: [],
    class: null,
    image_url: null,
    origin: null,
    extra: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  }) as Card;

describe('canPickCard', () => {
  const god = makeCard({ id: 'g1', unit_type: CARD_TYPES.GOD, cost: 6 });
  const titan = makeCard({ id: 't1', unit_type: CARD_TYPES.TITAN, cost: 8 });
  const godCheap = makeCard({ id: 'g2', unit_type: CARD_TYPES.GOD, cost: 3 });
  const hero = makeCard({ id: 'h1', unit_type: CARD_TYPES.HERO, cost: 4 });

  it('allows first god pick', () => {
    expect(canPickCard(god, [], 18, [god, hero]).canPick).toBe(true);
  });

  it('blocks second divinity after god (titan)', () => {
    const result = canPickCard(titan, [god], 12, [titan]);
    expect(result.canPick).toBe(false);
    expect(result.reason).toBe('divinityCardLimitReached');
  });

  it('blocks second divinity after titan (god)', () => {
    const result = canPickCard(godCheap, [titan], 10, [godCheap]);
    expect(result.canPick).toBe(false);
    expect(result.reason).toBe('divinityCardLimitReached');
  });

  it('requires reserving points for divinity when none picked', () => {
    const result = canPickCard(hero, [], 5, [godCheap, hero]);
    expect(result.canPick).toBe(false);
    expect(result.reason).toBe('mustReservePointsForDivinity');
  });

  it('skips divinity reserve after titan is picked', () => {
    const expensiveHero = makeCard({ id: 'h2', unit_type: CARD_TYPES.HERO, cost: 10 });
    expect(
      canPickCard(expensiveHero, [titan], 10, [godCheap, expensiveHero]).canPick
    ).toBe(true);
  });
});

describe('canStartGame', () => {
  const god = makeCard({ id: 'g1', unit_type: CARD_TYPES.GOD, cost: 6 });
  const titan = makeCard({ id: 't1', unit_type: CARD_TYPES.TITAN, cost: 8 });
  const hero = makeCard({ id: 'h1', unit_type: CARD_TYPES.HERO, cost: 4 });

  it('requires a divinity (god or titan)', () => {
    const result = canStartGame([hero], 0);
    expect(result.canPick).toBe(false);
    expect(result.reason).toBe('mustPickDivinityCard');
  });

  it('allows start with god picked', () => {
    expect(canStartGame([god], 0).canPick).toBe(true);
  });

  it('allows start with titan picked', () => {
    expect(canStartGame([titan], 0).canPick).toBe(true);
  });
});
