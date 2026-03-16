import { Card } from "../types/cards";
import { DeckNode } from "../types/decks";
import { GameDifficulty, GameState } from "../types/game";
import { collectLeafDeckIds } from "./deck-tree";
import { createGameState } from "./game-selection";

interface CreateStateOptions {
  initialUsedQids?: Iterable<string>;
  random?: () => number;
}

export function hasDeckForDifficulty(
  selectedRootDeck: DeckNode,
  difficulty: GameDifficulty,
  cardsByDeckId: ReadonlyMap<string, Card[]>,
): boolean {
  if (selectedRootDeck.difficultyCounts[difficulty] <= 0) {
    return false;
  }

  return Array.from(cardsByDeckId.values()).some((cards) => cards.length > 0);
}

export function filterCardsByDifficulty(
  selectedRootDeck: DeckNode,
  difficulty: GameDifficulty,
  cardsByDeckId: ReadonlyMap<string, Card[]>,
): Map<string, Card[]> {
  const eligibleLeafIds = new Set(
    collectLeafDeckIds(selectedRootDeck).filter((deckId) => {
      const stack: DeckNode[] = [selectedRootDeck];

      while (stack.length > 0) {
        const node = stack.pop();
        if (!node) {
          continue;
        }
        if (node.id === deckId) {
          return node.difficultyCounts[difficulty] > 0;
        }
        for (const child of node.children ?? []) {
          stack.push(child);
        }
      }

      return false;
    }),
  );

  return new Map(
    Array.from(cardsByDeckId.entries()).filter(
      ([deckId, cards]) => eligibleLeafIds.has(deckId) && cards.length > 0,
    ),
  );
}

export default async function createState(
  selectedRootDeck: DeckNode,
  cardsByDeckId: ReadonlyMap<string, Card[]>,
  difficulty: GameDifficulty,
  options: CreateStateOptions = {},
): Promise<GameState> {
  if (!hasDeckForDifficulty(selectedRootDeck, difficulty, cardsByDeckId)) {
    throw new Error("No valid cards available for this deck and difficulty");
  }

  const filteredCardsByDeckId = filterCardsByDifficulty(
    selectedRootDeck,
    difficulty,
    cardsByDeckId,
  );

  return createGameState(
    selectedRootDeck,
    filteredCardsByDeckId,
    difficulty,
    options.initialUsedQids,
    options.random,
  );
}
