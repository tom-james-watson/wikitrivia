export interface DeckDifficultyCounts {
  easy: number;
  normal: number;
  hard: number;
}

export interface DeckNode {
  children?: DeckNode[];
  difficultyCounts: DeckDifficultyCounts;
  frequency?: number;
  hidden?: boolean;
  id: string;
  minScore: number;
  slug: string;
  themeHue: number;
  title: string;
}
