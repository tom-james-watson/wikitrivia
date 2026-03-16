import { DeckNode } from "../types/decks";
import { GameDifficulty } from "../types/game";
import {
  FreePlayGroupDefinition,
  FreePlayLeafDefinition,
  SelectionRoute,
} from "../types/routes";
import { createDeckNodeListMap } from "./deck-tree";

export const MIN_ROUTE_CARD_COUNT = 10;

export const FREE_PLAY_DIFFICULTY_ORDER: GameDifficulty[] = [
  "easy",
  "normal",
  "hard",
];

export const DIFFICULTY_MIN_PAGE_VIEWS: Record<GameDifficulty, number> = {
  easy: 25_000,
  normal: 10_000,
  hard: 1_000,
};

export function countCardsForDifficulty(
  deckNodes: DeckNode[],
  difficulty: GameDifficulty,
): number {
  return deckNodes.reduce(
    (sum, deck) => sum + deck.difficultyCounts[difficulty],
    0,
  );
}

export function getSupportedDifficulties(
  deckNodes: DeckNode[],
): GameDifficulty[] {
  return FREE_PLAY_DIFFICULTY_ORDER.filter((difficulty) => {
    return (
      countCardsForDifficulty(deckNodes, difficulty) >= MIN_ROUTE_CARD_COUNT
    );
  });
}

export function getDefaultSupportedDifficulty(
  deckNodes: DeckNode[],
): GameDifficulty | null {
  return getSupportedDifficulties(deckNodes)[0] ?? null;
}

export function isSelectionRouteVisible(
  deckNodes: DeckNode[],
  selectionRoute: SelectionRoute,
): boolean {
  return (
    getSupportedDifficultiesForDeckId(deckNodes, selectionRoute.nodeId).length >
    0
  );
}

export function getSupportedDifficultiesForDeckId(
  deckNodes: DeckNode[],
  deckId: string,
): GameDifficulty[] {
  const deckMap = createDeckNodeListMap(deckNodes);
  const deck = deckMap.get(deckId);
  return deck ? getSupportedDifficulties([deck]) : [];
}

export function isLeafDefinitionVisible(
  deckNodes: DeckNode[],
  leaf: FreePlayLeafDefinition,
): boolean {
  return getSupportedDifficultiesForDeckId(deckNodes, leaf.nodeId).length > 0;
}

export function hasVisibleGroupChildren(
  deckNodes: DeckNode[],
  group: FreePlayGroupDefinition,
): boolean {
  return group.children.some((child) => {
    return child.kind === "group"
      ? hasVisibleGroupChildren(deckNodes, child)
      : isLeafDefinitionVisible(deckNodes, child);
  });
}
