import { GameState } from "../types/game";
import { Item } from "../types/item";
import { getRandomItem, preloadImage } from "./items";

export default async function createState(
  deck: Item[], 
  seed: string = Math.floor(Math.random() * 100000000).toString(), 
  daily: boolean = false,
): Promise<GameState> {
  const played = [{ 
    ...getRandomItem(deck, [], seed), 
    played: { correct: true } 
  }];
  const next = getRandomItem(deck, played, seed);
  const nextButOne = getRandomItem(deck, [...played, next], seed);
  const imageCache = [preloadImage(next.image), preloadImage(nextButOne.image)];

  return {
    badlyPlaced: null,
    deck,
    imageCache,
    lives: 3,
    next,
    nextButOne,
    played,
    seed: { seed: seed, daily },
  };
}
