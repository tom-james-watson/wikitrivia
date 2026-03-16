import assert from "node:assert/strict";
import { test } from "node:test";
import createInitialState from "../lib/create-state";
import { drawNextCard, prepareDecks } from "../lib/game-selection";
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
        id: "easy-deck",
        slug: "easy-deck",
        title: "Easy Deck",
      }),
    ],
    difficultyCounts: {
      easy: 2,
      hard: 3,
      normal: 3,
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
      [
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
        {
          fact: "Fact C",
          image: "c.jpg",
          pageViews: 100_000,
          qid: "Q3",
          subtitle: null,
          title: "Card C",
          wikipediaSlug: "Card_C",
          year: 1920,
        },
      ],
    ],
  ]);

  const state = await createInitialState(rootDeck, cardsByDeckId, "easy");

  assert.deepEqual(
    state.decks.map((deck) => deck.id),
    ["easy-deck"],
  );
});
