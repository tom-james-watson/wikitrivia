import { Card, PlayedCard, PreparedCardFields } from "./cards";
import { DeckNode } from "./decks";

export type GameDifficulty = "easy" | "normal" | "hard";

export type RandomSource = (() => number) & {
  getState?: () => number;
  setState?: (state: number) => void;
};

export interface PreparedCard extends Card, PreparedCardFields {
  spacingBucket: number;
  yearBucket: number;
}

export interface PreparedDeck {
  cards: PreparedCard[];
  drawCursor: number;
  id: string;
  minScore: number;
  node: DeckNode;
  slug: string;
  themeHue: number;
  title: string;
}

export interface GameState {
  badlyPlaced: {
    delta: number;
    index: number;
    rendered: boolean;
  } | null;
  difficulty: GameDifficulty;
  imageCache: Array<HTMLImageElement | null>;
  lives: number;
  next: PreparedCard | null;
  nextButOne: PreparedCard | null;
  decks: PreparedDeck[];
  selectedRootDeck: DeckNode | null;
  played: PlayedCard[];
  random: RandomSource;
  recentDeckIds: string[];
  usedQids: Set<string>;
  usedYears: Set<number>;
}
