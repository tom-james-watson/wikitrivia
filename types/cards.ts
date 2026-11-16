/**
 * Which wiki hosts a card's image file. Free files live on Commons; non-free
 * files such as album covers are uploaded to English Wikipedia only.
 */
export type ImageRepo = "commons" | "enwiki";

export interface Card {
  fact: string;
  image: string;
  /** Missing on cards built, or games saved, before this was recorded. */
  imageRepo?: ImageRepo;
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
