import { GameState } from "../types/game";
import { Item } from "../types/item";
import { getRandomItem, preloadImage } from "./items";

export default async function createState(deck: Item[]): Promise<GameState> {
  const played = [{ ...getRandomItem(deck, []), played: { correct: true } }];
  const next = getRandomItem(deck, played);
  const nextButOne = getRandomItem(deck, [...played, next]);
  const imageCache = [preloadImage(next.image), preloadImage(nextButOne.image)];

  return {
    badlyPlaced: null,
    deck,
    imageCache,
    lives: 3,
    next,
    nextButOne,
    played,
  };
}
