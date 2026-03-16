import { Card, PlayedCard } from "../types/cards";
import { DeckNode } from "../types/decks";
import {
  GameDifficulty,
  GameState,
  PreparedCard,
  PreparedDeck,
} from "../types/game";
import { createDeckNodeMap, getDeckNodeChildren } from "./deck-tree";
import { DIFFICULTY_MIN_PAGE_VIEWS } from "./free-play-difficulty-rules";
import { createWikimediaImageCandidates } from "./image";
import { preloadCardImageCandidates } from "./use-card-image";

const YEAR_BUCKET_COUNT = 5;
const DECK_RECENCY_WINDOW = 2;
const DECK_RECENCY_PENALTY = 0.6;
const DECK_SEARCH_RADII = [10, 30, 80];
const DIFFICULTY_TOP_POOL: Record<GameDifficulty, { share: number } | null> = {
  easy: { share: 0.25 },
  normal: { share: 0.5 },
  hard: null,
};

function getSpacingBucket(year: number): number {
  if (year >= 1950) {
    return 0;
  }
  if (year >= 1850) {
    return 1;
  }
  if (year >= 1500) {
    return 2;
  }
  if (year >= 500) {
    return 3;
  }
  return 4;
}

function getMinimumSpacing(bucket: number): number {
  switch (bucket) {
    case 0:
      return 3;
    case 1:
      return 8;
    case 2:
      return 20;
    case 3:
      return 40;
    default:
      return 120;
  }
}

function computeYearBoundaries(years: number[]): number[] {
  const sortedYears = [...years].sort((a, b) => a - b);
  const boundaries: number[] = [];

  for (let index = 1; index < YEAR_BUCKET_COUNT; index += 1) {
    const quantileIndex = Math.min(
      sortedYears.length - 1,
      Math.floor((sortedYears.length * index) / YEAR_BUCKET_COUNT),
    );
    boundaries.push(sortedYears[quantileIndex]);
  }

  return boundaries;
}

function getYearBucket(year: number, boundaries: number[]): number {
  for (let index = 0; index < boundaries.length; index += 1) {
    if (year < boundaries[index]) {
      return index;
    }
  }

  return boundaries.length;
}

function weightedPick<T>(
  entries: T[],
  getWeight: (entry: T) => number,
  random: () => number,
): T | null {
  const weightedEntries = entries
    .map((entry) => ({ entry, weight: getWeight(entry) }))
    .filter((entry) => entry.weight > 0);
  const totalWeight = weightedEntries.reduce(
    (sum, weightedEntry) => sum + weightedEntry.weight,
    0,
  );

  if (totalWeight <= 0) {
    return null;
  }

  let threshold = random() * totalWeight;
  for (const weightedEntry of weightedEntries) {
    threshold -= weightedEntry.weight;
    if (threshold <= 0) {
      return weightedEntry.entry;
    }
  }

  return weightedEntries[weightedEntries.length - 1]?.entry ?? null;
}

function createOffsetSequence(radius: number): number[] {
  const offsets = [0];

  for (let delta = 1; delta <= radius; delta += 1) {
    offsets.push(delta, -delta);
  }

  return offsets;
}

function getWrappedIndex(length: number, index: number): number {
  return ((index % length) + length) % length;
}

function isCardUsed(
  card: PreparedCard,
  state: Pick<GameState, "usedQids" | "usedYears">,
): boolean {
  return state.usedQids.has(card.qid) || state.usedYears.has(card.year);
}

function meetsDifficultyPageViews(
  card: PreparedCard,
  difficulty: GameDifficulty,
): boolean {
  return (
    card.pageViews !== null &&
    card.pageViews >= DIFFICULTY_MIN_PAGE_VIEWS[difficulty]
  );
}

function respectsSpacing(
  card: PreparedCard,
  played: PlayedCard[],
  strictness: number,
): boolean {
  if (strictness <= 0) {
    return true;
  }

  return played.every((playedCard) => {
    const playedCardSpacingBucket =
      "spacingBucket" in playedCard
        ? (playedCard.spacingBucket as number)
        : getSpacingBucket(playedCard.year);
    const minimumSpacing = Math.max(
      1,
      Math.floor(
        Math.min(
          getMinimumSpacing(card.spacingBucket),
          getMinimumSpacing(playedCardSpacingBucket),
        ) * strictness,
      ),
    );

    return Math.abs(card.year - playedCard.year) >= minimumSpacing;
  });
}

function cloneDeck(deck: PreparedDeck): PreparedDeck {
  return {
    ...deck,
    cards: deck.cards,
  };
}

function markCardUsed(state: GameState, card: PreparedCard): void {
  state.usedQids.add(card.qid);
  state.usedYears.add(card.year);
  state.recentDeckIds = [card.deckId, ...state.recentDeckIds].slice(
    0,
    DECK_RECENCY_WINDOW,
  );
}

function chooseCardFromDeck(
  deck: PreparedDeck,
  state: GameState,
  strictness: number,
  bucketFilter?: Set<number>,
): PreparedCard | null {
  if (deck.cards.length === 0) {
    return null;
  }

  const topPoolConfig = DIFFICULTY_TOP_POOL[state.difficulty];
  if (topPoolConfig) {
    const topPoolSize = Math.max(
      1,
      Math.min(
        deck.cards.length,
        Math.ceil(deck.cards.length * topPoolConfig.share),
      ),
    );
    const topRankedCandidates = [...deck.cards]
      .sort((left, right) => left.rank - right.rank)
      .slice(0, topPoolSize)
      .filter((candidate) => {
        if (bucketFilter && !bucketFilter.has(candidate.yearBucket)) {
          return false;
        }
        if (!meetsDifficultyPageViews(candidate, state.difficulty)) {
          return false;
        }
        if (isCardUsed(candidate, state)) {
          return false;
        }
        if (!respectsSpacing(candidate, state.played, strictness)) {
          return false;
        }

        return true;
      });

    const topRankedCard = weightedPick(
      topRankedCandidates,
      () => 1,
      state.random,
    );

    if (topRankedCard) {
      const index = deck.cards.findIndex(
        (candidate) => candidate.id === topRankedCard.id,
      );
      if (index === -1) {
        return topRankedCard;
      }

      deck.drawCursor = getWrappedIndex(
        deck.cards.length,
        index + 1 + Math.floor(state.random() * 7),
      );
      return topRankedCard;
    }
  }

  const searchRadii = [...DECK_SEARCH_RADII, Math.max(200, deck.cards.length)];

  for (const radius of searchRadii) {
    const offsets = createOffsetSequence(
      Math.min(radius, deck.cards.length - 1),
    );
    const candidates: PreparedCard[] = [];

    for (const offset of offsets) {
      const index = getWrappedIndex(
        deck.cards.length,
        deck.drawCursor + offset,
      );
      const candidate = deck.cards[index];

      if (!candidate) {
        continue;
      }
      if (bucketFilter && !bucketFilter.has(candidate.yearBucket)) {
        continue;
      }
      if (!meetsDifficultyPageViews(candidate, state.difficulty)) {
        continue;
      }
      if (isCardUsed(candidate, state)) {
        continue;
      }
      if (!respectsSpacing(candidate, state.played, strictness)) {
        continue;
      }

      candidates.push(candidate);
    }

    const card = weightedPick(candidates, (_candidate) => 1, state.random);

    if (card) {
      const index = deck.cards.findIndex(
        (candidate) => candidate.id === card.id,
      );
      if (index === -1) {
        return card;
      }

      deck.drawCursor = getWrappedIndex(
        deck.cards.length,
        index + 1 + Math.floor(state.random() * 7),
      );
      return card;
    }
  }

  return null;
}

function getPreparedDeckById(
  decks: PreparedDeck[],
  deckId: string,
): PreparedDeck | null {
  return decks.find((deck) => deck.id === deckId) ?? null;
}

function hasAvailableDeckInSubtree(
  node: DeckNode,
  decks: PreparedDeck[],
  forbiddenDeckIds?: Set<string>,
): boolean {
  const children = getDeckNodeChildren(node);
  if (children.length === 0) {
    const deck = getPreparedDeckById(decks, node.id);
    return !!deck && deck.cards.length > 0 && !forbiddenDeckIds?.has(deck.id);
  }

  return children.some((child) =>
    hasAvailableDeckInSubtree(child, decks, forbiddenDeckIds),
  );
}

function getSelectionFrequency(node: DeckNode): number {
  if (node.frequency === undefined) {
    throw new Error(`Deck ${node.id} is missing a frequency`);
  }

  return node.frequency;
}

function chooseDeckFromTree(
  node: DeckNode,
  decks: PreparedDeck[],
  recentDeckIds: string[],
  forbiddenDeckIds: Set<string> | undefined,
  random: () => number,
): PreparedDeck | null {
  const children = getDeckNodeChildren(node);

  if (children.length === 0) {
    const deck = getPreparedDeckById(decks, node.id);
    if (!deck || forbiddenDeckIds?.has(deck.id) || deck.cards.length === 0) {
      return null;
    }

    return deck;
  }

  const exhaustedChildIds = new Set<string>();

  while (exhaustedChildIds.size < children.length) {
    const candidateChildren = children.filter(
      (child) =>
        !exhaustedChildIds.has(child.id) &&
        hasAvailableDeckInSubtree(child, decks, forbiddenDeckIds),
    );
    const child = weightedPick(
      candidateChildren,
      (deck) => {
        const recencyPenalty = recentDeckIds.includes(deck.id)
          ? DECK_RECENCY_PENALTY
          : 1;
        return getSelectionFrequency(deck) * recencyPenalty;
      },
      random,
    );

    if (!child) {
      return null;
    }

    const deck = chooseDeckFromTree(
      child,
      decks,
      recentDeckIds,
      forbiddenDeckIds,
      random,
    );
    if (deck) {
      return deck;
    }

    exhaustedChildIds.add(child.id);
  }

  return null;
}

function chooseCard(
  state: GameState,
  strictnessLevels: number[],
  bucketFilter?: Set<number>,
  forbiddenDeckIds?: Set<string>,
): PreparedCard | null {
  if (!state.selectedRootDeck) {
    return null;
  }

  const exhaustedDeckIds = new Set<string>();

  for (const strictness of strictnessLevels) {
    exhaustedDeckIds.clear();

    while (exhaustedDeckIds.size < state.decks.length) {
      const nextDeck = chooseDeckFromTree(
        state.selectedRootDeck,
        state.decks.filter(
          (candidateDeck) => !exhaustedDeckIds.has(candidateDeck.id),
        ),
        state.recentDeckIds,
        forbiddenDeckIds,
        state.random,
      );
      if (!nextDeck) {
        break;
      }

      const card = chooseCardFromDeck(
        nextDeck,
        state,
        strictness,
        bucketFilter,
      );
      if (card) {
        return card;
      }

      exhaustedDeckIds.add(nextDeck.id);
    }
  }

  return null;
}

export function prepareDecks(
  selectedRootDeck: DeckNode,
  cardsByDeckId: ReadonlyMap<string, Card[]>,
  random: () => number,
): PreparedDeck[] {
  const deckNodeMap = createDeckNodeMap(selectedRootDeck);

  const boundaries = computeYearBoundaries(
    Array.from(cardsByDeckId.values()).flatMap((cards) =>
      cards.map((card) => card.year),
    ),
  );

  return Array.from(cardsByDeckId.entries())
    .map(([deckId, cards]) => {
      const deckNode = deckNodeMap.get(deckId);
      if (!deckNode) {
        return null;
      }

      return {
        cards: cards
          .map((card, index) => ({
            ...card,
            deckId,
            deckThemeHue: deckNode.themeHue,
            id: `${deckId}:${card.qid}:${index}`,
            rank: index + 1,
          }))
          .sort((a, b) => a.year - b.year)
          .map((card) => ({
            ...card,
            spacingBucket: getSpacingBucket(card.year),
            yearBucket: getYearBucket(card.year, boundaries),
          })),
        drawCursor: Math.floor(random() * Math.max(1, cards.length)),
        id: deckId,
        minScore: deckNode.minScore,
        node: deckNode,
        slug: deckNode.slug,
        themeHue: deckNode.themeHue,
        title: deckNode.title,
      };
    })
    .filter((deck): deck is PreparedDeck => deck !== null)
    .filter((deck) => deck.cards.length > 0);
}

function buildOpeningBucketOrder(
  decks: PreparedDeck[],
  random: () => number,
): number[] {
  const bucketCounts = new Map<number, number>();

  for (const deck of decks) {
    for (const card of deck.cards) {
      bucketCounts.set(
        card.yearBucket,
        (bucketCounts.get(card.yearBucket) ?? 0) + 1,
      );
    }
  }

  const availableBuckets = Array.from(bucketCounts.keys());
  if (availableBuckets.length <= 3) {
    return availableBuckets;
  }

  const firstBucket =
    weightedPick(
      availableBuckets,
      (bucket) => bucketCounts.get(bucket) ?? 0,
      random,
    ) ?? 0;
  const secondBucket =
    [...availableBuckets]
      .filter((bucket) => bucket !== firstBucket)
      .sort(
        (left, right) =>
          Math.abs(right - firstBucket) - Math.abs(left - firstBucket),
      )[0] ?? firstBucket;
  const thirdBucket =
    [...availableBuckets]
      .filter((bucket) => bucket !== firstBucket && bucket !== secondBucket)
      .sort((left, right) => {
        const leftDistance = Math.min(
          Math.abs(left - firstBucket),
          Math.abs(left - secondBucket),
        );
        const rightDistance = Math.min(
          Math.abs(right - firstBucket),
          Math.abs(right - secondBucket),
        );

        return rightDistance - leftDistance;
      })[0] ?? firstBucket;

  return [firstBucket, secondBucket, thirdBucket];
}

function pickOpeningCards(
  state: GameState,
  desiredCount: number,
): PreparedCard[] {
  const cards: PreparedCard[] = [];
  const bucketOrder = buildOpeningBucketOrder(state.decks, state.random);
  const openingDeckIds = new Set<string>();

  for (const bucket of bucketOrder) {
    const bucketFilter = new Set([bucket]);
    const card =
      chooseCard(state, [1, 0.5, 0], bucketFilter, openingDeckIds) ??
      chooseCard(state, [1, 0.5, 0], bucketFilter);
    if (!card) {
      continue;
    }

    markCardUsed(state, card);
    openingDeckIds.add(card.deckId);
    cards.push(card);

    if (cards.length === desiredCount) {
      return cards;
    }
  }

  while (cards.length < desiredCount) {
    const card =
      chooseCard(state, [1, 0.5, 0], undefined, openingDeckIds) ??
      chooseCard(state, [1, 0.5, 0]);
    if (!card) {
      break;
    }

    markCardUsed(state, card);
    openingDeckIds.add(card.deckId);
    cards.push(card);
  }

  return cards;
}

export function preloadImage(image: string): HTMLImageElement | null {
  return preloadCardImageCandidates(createWikimediaImageCandidates(image));
}

export function checkCorrect(
  played: PlayedCard[],
  card: PreparedCard,
  index: number,
): { correct: boolean; delta: number } {
  const sorted = [...played, card].sort(
    (left, right) => left.year - right.year,
  );
  const correctIndex = sorted.findIndex((item) => item.id === card.id);

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

export function drawNextCard(state: GameState): PreparedCard | null {
  const card = chooseCard(state, [1, 0.75, 0.5, 0]);
  if (!card) {
    return null;
  }

  markCardUsed(state, card);
  return card;
}

export function createGameState(
  selectedRootDeck: DeckNode,
  cardsByDeckId: ReadonlyMap<string, Card[]>,
  difficulty: GameDifficulty,
  initialUsedQids: Iterable<string> = [],
  random: () => number = Math.random,
): GameState {
  const state: GameState = {
    badlyPlaced: null,
    difficulty,
    imageCache: [],
    lives: 3,
    next: null,
    nextButOne: null,
    decks: prepareDecks(selectedRootDeck, cardsByDeckId, random).map(cloneDeck),
    played: [],
    random,
    recentDeckIds: [],
    selectedRootDeck,
    usedQids: new Set<string>(initialUsedQids),
    usedYears: new Set<number>(),
  };
  const openingCards = pickOpeningCards(state, 2);
  const [firstCard, secondCard] = openingCards;

  if (!firstCard || !secondCard) {
    throw new Error("Not enough valid cards to start a game");
  }

  state.played = [];
  state.next = firstCard;
  state.nextButOne = secondCard;
  state.imageCache = [
    preloadImage(firstCard.image),
    preloadImage(secondCard.image),
  ];

  return state;
}
