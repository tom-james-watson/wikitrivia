export interface Card {
  fact: string;
  image: string;
  pageViews: number | null;
  qid: string;
  subtitle: string | null;
  title: string;
  wikipediaSlug: string | null;
  year: number;
}

export interface PreparedCardFields {
  id: string;
  deckId: string;
  deckThemeHue: number;
  rank: number;
}

export type PlayedCard = Card &
  PreparedCardFields & {
    played: {
      correct: boolean;
      justPlaced?: boolean;
      placementIndex?: number;
      showDate: boolean;
    };
  };
