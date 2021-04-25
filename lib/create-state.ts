import { GameState } from "../types/game";
import { Item } from "../types/item";
import { getRandomItem, preloadImage } from "./items";

export default async function createState(deck: Item[]): Promise<GameState> {
  const next = getRandomItem(deck, []);
  const nextButOne = getRandomItem(deck, []);
  const imageCache = [preloadImage(next.image), preloadImage(nextButOne.image)];
  const played = [{ ...getRandomItem(deck, []), played: { correct: true } }];

  return {
    badlyPlaced: null,
    deck,
    imageCache,
    next,
    nextButOne,
    played,
  };
}
