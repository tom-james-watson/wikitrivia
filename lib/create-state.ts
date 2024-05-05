import { GameState } from "../types/game";
import { Item } from "../types/item";

export default function createState(deck: Item[]): GameState {
  // Randomly pick the first card on the board
  let randomIndex = Math.floor(Math.random() * deck.length);
  const played = [{ ...deck[randomIndex], played: { correct: true } }];
  deck.splice(randomIndex, 1);

  // Randomly pick the card the player has to order
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
