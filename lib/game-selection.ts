import { Card, PlayedCard } from "../types/cards";
import { DeckNode } from "../types/decks";
import {
  GameDifficulty,
  GameState,
  PreparedCard,
  PreparedDeck,
} from "../types/game";
import { createDeckNodeMap, getDeckNodeChildren } from "./deck-tree";
import {
  DIFFICULTY_MIN_PAGE_VIEWS,
  getDifficultyPoolSize,
} from "./free-play-difficulty-rules";
import { createWikimediaImageCandidates } from "./image";
import { preloadCardImageCandidates } from "./use-card-image";

const YEAR_BUCKET_COUNT = 5;
const DECK_RECENCY_WINDOW = 2;
const DECK_RECENCY_PENALTY = 0.6;
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

function randomPick<T>(entries: T[], random: () => number): T | null {
  return weightedPick(entries, () => 1, random);
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

function getDifficultyPool(
  deck: PreparedDeck,
  difficulty: GameDifficulty,
): PreparedCard[] {
  const poolSize = getDifficultyPoolSize(deck.cards.length, difficulty);

  return deck.cards
    .slice(0, poolSize)
    .filter((card) => meetsDifficultyPageViews(card, difficulty));
}

function countDistinctYears(cards: PreparedCard[]): number {
  return new Set(cards.map((card) => card.year)).size;
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

function getSelectableCandidates(
  cards: PreparedCard[],
  state: GameState,
  strictness: number,
  cardFilter?: (card: PreparedCard) => boolean,
): PreparedCard[] {
  return cards.filter((candidate) => {
    if (cardFilter && !cardFilter(candidate)) {
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
}

function chooseOneCandidatePerYear(
  candidates: PreparedCard[],
  random: () => number,
): PreparedCard[] {
  const cardsByYear = new Map<number, PreparedCard[]>();

  for (const candidate of candidates) {
    let yearCards = cardsByYear.get(candidate.year);
    if (!yearCards) {
      yearCards = [];
      cardsByYear.set(candidate.year, yearCards);
    }

    yearCards.push(candidate);
  }

  const candidatesByYear: PreparedCard[] = [];

  for (const yearCards of cardsByYear.values()) {
    if (yearCards.length === 1) {
      candidatesByYear.push(yearCards[0]);
      continue;
    }

    const card = randomPick(yearCards, random);
    if (card) {
      candidatesByYear.push(card);
    }
  }

  return candidatesByYear;
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
  cardFilter?: (card: PreparedCard) => boolean,
): PreparedCard | null {
  if (deck.cards.length === 0) {
    return null;
  }

  const difficultyPool = getDifficultyPool(deck, state.difficulty);
  const selectableCandidates = getSelectableCandidates(
    difficultyPool,
    state,
    strictness,
    cardFilter,
  );
  const candidatesByYear = chooseOneCandidatePerYear(
    selectableCandidates,
    state.random,
  );

  return randomPick(candidatesByYear, state.random);
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
  difficulty: GameDifficulty,
  forbiddenDeckIds?: Set<string>,
): boolean {
  const children = getDeckNodeChildren(node);
  if (children.length === 0) {
    const deck = getPreparedDeckById(decks, node.id);
    return (
      !!deck &&
      countDistinctYears(getDifficultyPool(deck, difficulty)) > 0 &&
      !forbiddenDeckIds?.has(deck.id)
    );
  }

  return children.some((child) =>
    hasAvailableDeckInSubtree(child, decks, difficulty, forbiddenDeckIds),
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
  difficulty: GameDifficulty,
  recentDeckIds: string[],
  forbiddenDeckIds: Set<string> | undefined,
  random: () => number,
): PreparedDeck | null {
  const children = getDeckNodeChildren(node);

  if (children.length === 0) {
    const deck = getPreparedDeckById(decks, node.id);
    if (
      !deck ||
      forbiddenDeckIds?.has(deck.id) ||
      countDistinctYears(getDifficultyPool(deck, difficulty)) === 0
    ) {
      return null;
    }

    return deck;
  }

  const exhaustedChildIds = new Set<string>();

  while (exhaustedChildIds.size < children.length) {
    const candidateChildren = children.filter(
      (child) =>
        !exhaustedChildIds.has(child.id) &&
        hasAvailableDeckInSubtree(child, decks, difficulty, forbiddenDeckIds),
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
      difficulty,
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
  cardFilter?: (card: PreparedCard) => boolean,
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
        state.difficulty,
        state.recentDeckIds,
        forbiddenDeckIds,
        state.random,
      );
      if (!nextDeck) {
        break;
      }

      const card = chooseCardFromDeck(nextDeck, state, strictness, cardFilter);
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
  _random: () => number,
): PreparedDeck[] {
  const deckNodeMap = createDeckNodeMap(selectedRootDeck);

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
          .map((card) => ({
            ...card,
            spacingBucket: getSpacingBucket(card.year),
          })),
        drawCursor: 0,
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

function buildOpeningBucketFilters(
  decks: PreparedDeck[],
  difficulty: GameDifficulty,
  random: () => number,
): Array<(card: PreparedCard) => boolean> {
  const openingPool = decks.flatMap((deck) =>
    getDifficultyPool(deck, difficulty),
  );
  if (openingPool.length === 0) {
    return [];
  }

  const boundaries = computeYearBoundaries(
    openingPool.map((card) => card.year),
  );
  const bucketCounts = new Map<number, number>();

  for (const card of openingPool) {
    const bucket = getYearBucket(card.year, boundaries);
    bucketCounts.set(bucket, (bucketCounts.get(bucket) ?? 0) + 1);
  }

  const availableBuckets = Array.from(bucketCounts.keys());
  let bucketOrder: number[];
  if (availableBuckets.length <= 3) {
    bucketOrder = availableBuckets;
  } else {
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

    bucketOrder = [firstBucket, secondBucket, thirdBucket];
  }

  return bucketOrder.map(
    (bucket) => (card: PreparedCard) =>
      getYearBucket(card.year, boundaries) === bucket,
  );
}

function pickOpeningCards(
  state: GameState,
  desiredCount: number,
): PreparedCard[] {
  const cards: PreparedCard[] = [];
  const bucketFilters = buildOpeningBucketFilters(
    state.decks,
    state.difficulty,
    state.random,
  );
  const openingDeckIds = new Set<string>();

  for (const bucketFilter of bucketFilters) {
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
