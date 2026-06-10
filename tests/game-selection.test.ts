import assert from "node:assert/strict";
import { test } from "node:test";
import createInitialState from "../lib/create-state";
import {
  createGameState,
  drawNextCard,
  prepareDecks,
} from "../lib/game-selection";
import { createSeededRandom } from "../lib/seeded-random";
import booksDeckCards from "../public/decks/all-entertainment-books.json";
import rootDeckTree from "../public/decks/index.json";
import { Card } from "../types/cards";
import { DeckNode } from "../types/decks";
import { GameState } from "../types/game";

function createDeckNode(overrides: Partial<DeckNode> = {}): DeckNode {
  return {
    difficultyCounts: {
      easy: 2,
      hard: 2,
      normal: 2,
    },
    frequency: 1,
    hidden: false,
    id: "test-deck",
    minScore: 0,
    slug: "test-deck",
    themeHue: 120,
    title: "Test Deck",
    ...overrides,
  };
}

function createCards(): Card[] {
  return [
    {
      fact: "Fact A",
      image: "a.jpg",
      pageViews: 100_000,
      qid: "Q1",
      subtitle: null,
      title: "Card A",
      wikipediaSlug: "Card_A",
      year: 1900,
    },
    {
      fact: "Fact B",
      image: "b.jpg",
      pageViews: 100_000,
      qid: "Q2",
      subtitle: null,
      title: "Card B",
      wikipediaSlug: "Card_B",
      year: 1910,
    },
  ];
}

function createCard(overrides: Partial<Card> = {}): Card {
  return {
    fact: "Fact",
    image: "image.jpg",
    pageViews: 100_000,
    qid: "Q1",
    subtitle: null,
    title: "Card",
    wikipediaSlug: "Card",
    year: 1900,
    ...overrides,
  };
}

function createSelectionState(
  selectedRootDeck: DeckNode = createDeckNode(),
  cardsByDeckId: ReadonlyMap<string, Card[]> = new Map([
    ["test-deck", createCards()],
  ]),
): GameState {
  return {
    badlyPlaced: null,
    difficulty: "hard",
    imageCache: [],
    lives: 3,
    next: null,
    nextButOne: null,
    decks: prepareDecks(selectedRootDeck, cardsByDeckId, () => 0),
    played: [],
    random: () => 0,
    recentDeckIds: [],
    selectedRootDeck,
    usedQids: new Set<string>(),
    usedYears: new Set<number>(),
  };
}

function findDeckNode(deck: DeckNode, deckId: string): DeckNode | null {
  if (deck.id === deckId) {
    return deck;
  }

  for (const child of deck.children ?? []) {
    const match = findDeckNode(child, deckId);
    if (match) {
      return match;
    }
  }

  return null;
}

function playNextCard(state: GameState): number | null {
  const card = state.next;
  if (!card) {
    return null;
  }

  const promotedCard = state.nextButOne;
  const nextState: GameState = {
    ...state,
    imageCache: [],
    next: null,
    nextButOne: null,
    played: [
      ...state.played,
      {
        ...card,
        played: {
          correct: true,
          justPlaced: false,
          placementIndex: state.played.length,
          showDate: true,
        },
      },
    ],
    recentDeckIds: [...state.recentDeckIds],
    usedQids: new Set(state.usedQids),
    usedYears: new Set(state.usedYears),
  };
  const upcomingCard = drawNextCard(nextState);

  Object.assign(state, {
    ...nextState,
    next: promotedCard,
    nextButOne: upcomingCard,
  });

  return card.year;
}

function playYears(state: GameState, count: number): number[] {
  const years: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const year = playNextCard(state);
    if (year === null) {
      break;
    }

    years.push(year);
  }

  return years;
}

function getLongestMonotonicRun(years: number[]): number {
  let ascendingRun = years.length > 0 ? 1 : 0;
  let descendingRun = years.length > 0 ? 1 : 0;
  let longestRun = years.length > 0 ? 1 : 0;

  for (let index = 1; index < years.length; index += 1) {
    ascendingRun = years[index] > years[index - 1] ? ascendingRun + 1 : 1;
    descendingRun = years[index] < years[index - 1] ? descendingRun + 1 : 1;
    longestRun = Math.max(longestRun, ascendingRun, descendingRun);
  }

  return longestRun;
}

test("drawNextCard never repeats a qid within the same game", () => {
  const state = createSelectionState();

  const first = drawNextCard(state);
  const second = drawNextCard(state);
  const third = drawNextCard(state);

  assert.equal(first?.qid, "Q1");
  assert.equal(second?.qid, "Q2");
  assert.equal(third, null);
});

test("drawNextCard never repeats a year within the same game", () => {
  const duplicateYearsDeck = createDeckNode({
    difficultyCounts: {
      easy: 3,
      hard: 3,
      normal: 3,
    },
    id: "duplicate-years-deck",
    slug: "duplicate-years-deck",
    title: "Duplicate Years Deck",
  });
  const state = createSelectionState(
    duplicateYearsDeck,
    new Map([
      [
        duplicateYearsDeck.id,
        [
          {
            fact: "Fact A",
            image: "a.jpg",
            pageViews: 100_000,
            qid: "Q1",
            subtitle: null,
            title: "Card A",
            wikipediaSlug: "Card_A",
            year: 1900,
          },
          {
            fact: "Fact B",
            image: "b.jpg",
            pageViews: 100_000,
            qid: "Q2",
            subtitle: null,
            title: "Card B",
            wikipediaSlug: "Card_B",
            year: 1900,
          },
          {
            fact: "Fact C",
            image: "c.jpg",
            pageViews: 100_000,
            qid: "Q3",
            subtitle: null,
            title: "Card C",
            wikipediaSlug: "Card_C",
            year: 1910,
          },
        ],
      ],
    ]),
  );

  const first = drawNextCard(state);
  const second = drawNextCard(state);
  const third = drawNextCard(state);

  assert.equal(first?.year, 1900);
  assert.equal(second?.year, 1910);
  assert.equal(third, null);
});

test("prepareDecks preserves source rank instead of sorting by year", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 3,
      hard: 3,
      normal: 3,
    },
  });
  const preparedDecks = prepareDecks(
    deck,
    new Map([
      [
        deck.id,
        [
          createCard({ qid: "Q1", title: "Newest", year: 2000 }),
          createCard({ qid: "Q2", title: "Oldest", year: 1500 }),
          createCard({ qid: "Q3", title: "Middle", year: 1800 }),
        ],
      ],
    ]),
    () => 0,
  );

  assert.deepEqual(
    preparedDecks[0].cards.map((card) => card.year),
    [2000, 1500, 1800],
  );
  assert.deepEqual(
    preparedDecks[0].cards.map((card) => card.rank),
    [1, 2, 3],
  );
});

test("hard selection samples the whole candidate set instead of cursor-adjacent cards", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 100,
      hard: 100,
      normal: 100,
    },
  });
  const state = createSelectionState(
    deck,
    new Map([
      [
        deck.id,
        Array.from({ length: 100 }, (_, index) =>
          createCard({
            qid: `Q${index}`,
            title: `Card ${index}`,
            wikipediaSlug: `Card_${index}`,
            year: 1000 + index * 10,
          }),
        ),
      ],
    ]),
  );
  state.decks[0].drawCursor = 50;
  state.random = () => 0.999;

  assert.equal(drawNextCard(state)?.qid, "Q99");
});

test("duplicate-year candidates do not give that year extra selection weight", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 2,
      hard: 2,
      normal: 2,
    },
  });
  const state = createSelectionState(
    deck,
    new Map([
      [
        deck.id,
        [
          createCard({ qid: "Q0", title: "Clash A", year: 1000 }),
          createCard({ qid: "Q1", title: "Clash B", year: 1000 }),
          createCard({ qid: "Q2", title: "Solo", year: 2000 }),
        ],
      ],
    ]),
  );
  state.random = () => 0.6;

  assert.equal(drawNextCard(state)?.qid, "Q2");
});

test("duplicate-year candidates are randomly chosen within the selected year", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 1,
      hard: 1,
      normal: 1,
    },
  });
  const state = createSelectionState(
    deck,
    new Map([
      [
        deck.id,
        [
          createCard({ qid: "Q0", title: "Clash A", year: 1000 }),
          createCard({ qid: "Q1", title: "Clash B", year: 1000 }),
        ],
      ],
    ]),
  );
  state.random = () => 0.999;

  assert.equal(drawNextCard(state)?.qid, "Q1");
});

test("easy selection uses the exact top-ranked quarter, not the whole deck", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 12,
      hard: 12,
      normal: 12,
    },
  });
  const state = createSelectionState(
    deck,
    new Map([
      [
        deck.id,
        Array.from({ length: 12 }, (_, index) =>
          createCard({
            qid: `Q${index}`,
            title: `Card ${index}`,
            wikipediaSlug: `Card_${index}`,
            year: 1000 + index * 10,
          }),
        ),
      ],
    ]),
  );
  state.difficulty = "easy";
  state.random = () => 0.999;

  assert.equal(drawNextCard(state)?.qid, "Q2");
});

test("easy selection ends when its exact top-ranked quarter is exhausted", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 12,
      hard: 12,
      normal: 12,
    },
  });
  const state = createSelectionState(
    deck,
    new Map([
      [
        deck.id,
        Array.from({ length: 12 }, (_, index) =>
          createCard({
            qid: `Q${index}`,
            title: `Card ${index}`,
            wikipediaSlug: `Card_${index}`,
            year: 1000 + index * 10,
          }),
        ),
      ],
    ]),
  );
  state.difficulty = "easy";

  for (let index = 0; index < 3; index += 1) {
    state.usedQids.add(`Q${index}`);
  }

  assert.equal(drawNextCard(state), null);
});

test("createState rejects an easy pool with ten cards but fewer than ten playable years", async () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 9,
      hard: 40,
      normal: 20,
    },
  });
  const cardsByDeckId = new Map<string, Card[]>([
    [
      deck.id,
      Array.from({ length: 40 }, (_, index) =>
        createCard({
          qid: `Q${index}`,
          title: `Card ${index}`,
          wikipediaSlug: `Card_${index}`,
          year: index < 2 ? 1000 : 1000 + index * 10,
        }),
      ),
    ],
  ]);

  await assert.rejects(
    () => createInitialState(deck, cardsByDeckId, "easy"),
    /No valid cards available/,
  );
});

test("normal selection does not fall back past its top-ranked slice", () => {
  const deck = createDeckNode({
    difficultyCounts: {
      easy: 24,
      hard: 24,
      normal: 24,
    },
  });
  const state = createSelectionState(
    deck,
    new Map([
      [
        deck.id,
        Array.from({ length: 24 }, (_, index) =>
          createCard({
            qid: `Q${index}`,
            title: `Card ${index}`,
            wikipediaSlug: `Card_${index}`,
            year: 1000 + index * 10,
          }),
        ),
      ],
    ]),
  );
  state.difficulty = "normal";

  for (let index = 0; index < 12; index += 1) {
    state.usedQids.add(`Q${index}`);
  }

  assert.equal(drawNextCard(state), null);
});

test("books hard selection avoids the previous long chronological run", () => {
  const deck = findDeckNode(
    rootDeckTree as unknown as DeckNode,
    "all-entertainment-books",
  );
  assert.ok(deck);

  const state = createGameState(
    deck,
    new Map([["all-entertainment-books", booksDeckCards as unknown as Card[]]]),
    "hard",
    [],
    createSeededRandom("books-hard-5333"),
  );
  const years = playYears(state, 80);

  assert.ok(getLongestMonotonicRun(years) < 20);
});

test("createState excludes decks with no valid cards for the chosen difficulty", async () => {
  const rootDeck = createDeckNode({
    children: [
      createDeckNode({
        difficultyCounts: {
          easy: 0,
          hard: 1,
          normal: 1,
        },
        id: "hard-only-deck",
        slug: "hard-only-deck",
        title: "Hard Only Deck",
      }),
      createDeckNode({
        difficultyCounts: {
          easy: 12,
          hard: 12,
          normal: 12,
        },
        id: "easy-deck",
        slug: "easy-deck",
        title: "Easy Deck",
      }),
    ],
    difficultyCounts: {
      easy: 12,
      hard: 13,
      normal: 13,
    },
    id: "root",
    slug: "root",
    title: "Root",
  });
  const cardsByDeckId = new Map<string, Card[]>([
    [
      "hard-only-deck",
      [
        {
          fact: "Fact A",
          image: "a.jpg",
          pageViews: 5_000,
          qid: "Q1",
          subtitle: null,
          title: "Card A",
          wikipediaSlug: "Card_A",
          year: 1900,
        },
      ],
    ],
    [
      "easy-deck",
      Array.from({ length: 12 }, (_, index) =>
        createCard({
          qid: `Q${index + 2}`,
          title: `Card ${index + 2}`,
          wikipediaSlug: `Card_${index + 2}`,
          year: 1910 + index * 10,
        }),
      ),
    ],
  ]);

  const state = await createInitialState(rootDeck, cardsByDeckId, "easy");

  assert.deepEqual(
    state.decks.map((deck) => deck.id),
    ["easy-deck"],
  );
});
