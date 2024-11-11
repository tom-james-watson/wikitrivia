import { Item, PlayedItem } from "./item";

export interface GameState {
  badlyPlaced: {
    index: number;
    rendered: boolean;
    delta: number;
  } | null;
  deck: Item[];
  lives: number;
  next: Item | null;
  nextButOne: Item | null;
  played: PlayedItem[];
}
