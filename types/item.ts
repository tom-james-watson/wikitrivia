import { AdemeECV } from "./AdemeECV";

export interface Item {
  id: string;
  label: string;
  description: string;
  explanation: string;
  categoryId: number;
  source: AdemeECV;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
