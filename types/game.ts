import { Item, PlayedItem } from "./item";

export interface GameState {
  badlyPlaced: {
    index: number;
    rendered: boolean;
    delta: number;
  } | null;
  deck: Item[];
  // If we don't keep a reference to the preloaded images they can end up being
  // garbage collected.
  imageCache: HTMLImageElement[];
  lives: number;
  next: Item | null;
  nextButOne: Item | null;
  played: PlayedItem[];
}
