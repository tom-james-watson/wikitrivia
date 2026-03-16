import { DeckNode } from "../types/decks";

export function createDeckNodeMap(rootDeck: DeckNode): Map<string, DeckNode> {
  const deckMap = new Map<string, DeckNode>();

  function visit(deck: DeckNode): void {
    deckMap.set(deck.id, deck);
    getDeckNodeChildren(deck).forEach(visit);
  }

  visit(rootDeck);
  return deckMap;
}

export function createDeckNodeListMap(
  decks: readonly DeckNode[],
): Map<string, DeckNode> {
  return new Map(decks.map((deck) => [deck.id, deck]));
}

export function getDeckNodeChildren(deck: DeckNode): DeckNode[] {
  return deck.children ?? [];
}

export function getVisibleDeckNodeChildren(deck: DeckNode): DeckNode[] {
  return getDeckNodeChildren(deck).filter((child) => !child.hidden);
}

export function hasVisibleDeckNodeChildren(deck: DeckNode): boolean {
  return getVisibleDeckNodeChildren(deck).length > 0;
}

export function getDeckNodeBySlugPath(
  deckMap: ReadonlyMap<string, DeckNode>,
  rootDeckId: string,
  slugPath: readonly string[],
): DeckNode | null {
  if (slugPath.length === 0) {
    return deckMap.get(rootDeckId) ?? null;
  }

  let current = deckMap.get(rootDeckId) ?? null;

  for (const slug of slugPath) {
    if (!current) {
      return null;
    }

    current =
      getDeckNodeChildren(current).find((child) => child.slug === slug) ?? null;
  }

  return current;
}

export function collectLeafDeckIds(deck: DeckNode): string[] {
  const children = getDeckNodeChildren(deck);
  if (children.length === 0) {
    return [deck.id];
  }

  return children.flatMap((child) => collectLeafDeckIds(child));
}

export function resolveDeckSelection(
  deckNodeMap: ReadonlyMap<string, DeckNode>,
  rootDeckId: string,
): DeckNode | null {
  return deckNodeMap.get(rootDeckId) ?? null;
}
