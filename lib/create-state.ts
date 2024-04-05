import { GameState } from "../types/game";
import { Item } from "../types/item";

export default function createState(deck: Item[]): GameState {
  let randomIndex = Math.floor(Math.random() * deck.length);
  const played = [{ ...deck[randomIndex], played: { correct: true } }];
  deck.splice(randomIndex, 1);
  randomIndex = Math.floor(Math.random() * deck.length);
  const next = deck[randomIndex];
  deck.splice(randomIndex, 1);
  const imageCache = [] as HTMLImageElement[]; // TODO preload images? [preloadImage(next.image)];

  return {
    badlyPlaced: null,
    deck,
    imageCache,
    lives: 5,
    next,
    nextButOne: null,
    played,
  };
}
