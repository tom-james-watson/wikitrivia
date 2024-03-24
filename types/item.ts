import { AdemeECV } from "./AdemeECV";

export interface Item {
  id: string;
  label: string;
  description: string;
  explanation: string;
  category: string;
  image: string;
  source: AdemeECV;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
