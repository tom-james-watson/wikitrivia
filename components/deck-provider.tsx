import React from "react";
import { createDeckNodeMap } from "../lib/deck-tree";
import { Card } from "../types/cards";
import { DeckNode } from "../types/decks";

interface DeckContextValue {
  deckTree: DeckNode | null;
  deckNodes: DeckNode[] | null;
  loadDecks: (deckIds: readonly string[]) => Promise<Map<string, Card[]>>;
  preloadTree: () => Promise<DeckNode>;
  rootDeckId: string | null;
}

const DeckContext = React.createContext<DeckContextValue | null>(null);

let cachedDeckTree: DeckNode | null = null;
let deckTreePromise: Promise<DeckNode> | null = null;
const cachedDecks = new Map<string, Card[]>();
const deckPromises = new Map<string, Promise<Card[]>>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchDeckTree(): Promise<DeckNode> {
  if (cachedDeckTree) {
    return cachedDeckTree;
  }

  if (!deckTreePromise) {
    deckTreePromise = fetchJson<DeckNode>("/decks/index.json")
      .then((response) => {
        cachedDeckTree = response;
        return response;
      })
      .catch((error) => {
        deckTreePromise = null;
        throw error;
      });
  }

  return deckTreePromise;
}

async function fetchDeck(deckId: string): Promise<Card[]> {
  const cachedDeck = cachedDecks.get(deckId);
  if (cachedDeck) {
    return cachedDeck;
  }

  const existingPromise = deckPromises.get(deckId);
  if (existingPromise) {
    return existingPromise;
  }

  const nextPromise = fetchJson<Card[]>(`/decks/${deckId}.json`)
    .then((response) => {
      const loadedDeck = response as Card[];
      cachedDecks.set(deckId, loadedDeck);
      return loadedDeck;
    })
    .finally(() => {
      deckPromises.delete(deckId);
    });

  deckPromises.set(deckId, nextPromise);
  return nextPromise;
}

export function DeckProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [deckTree, setDeckTree] = React.useState<DeckNode | null>(
    cachedDeckTree,
  );

  const preloadTree = React.useCallback(async () => {
    const loadedDeckTree = await fetchDeckTree();
    setDeckTree(loadedDeckTree);
    return loadedDeckTree;
  }, []);

  const loadDecks = React.useCallback(async (deckIds: readonly string[]) => {
    const uniqueDeckIds = Array.from(new Set(deckIds));
    const entries = await Promise.all(
      uniqueDeckIds.map(
        async (deckId) => [deckId, await fetchDeck(deckId)] as const,
      ),
    );
    return new Map(entries);
  }, []);

  React.useEffect(() => {
    void preloadTree();
  }, [preloadTree]);

  const value = React.useMemo(
    () => ({
      deckTree,
      deckNodes: deckTree
        ? Array.from(createDeckNodeMap(deckTree).values())
        : null,
      loadDecks,
      preloadTree,
      rootDeckId: deckTree?.id ?? null,
    }),
    [deckTree, loadDecks, preloadTree],
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDecks(): DeckContextValue {
  const context = React.useContext(DeckContext);
  if (!context) {
    throw new Error("useDecks must be used within DeckProvider");
  }

  return context;
}
