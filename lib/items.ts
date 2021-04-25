import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const playedYears = played.map((item): number => {
    return item.year;
  });
  let item: Item | undefined = undefined;
  let iterations = 0;

  const periods: [number, number][] = [
    [-100000, 1000],
    [800, 1600],
    [1600, 1870],
    [1870, 1930],
    [1930, 2020],
  ];
  const [fromYear, toYear] = periods[
    Math.floor(Math.random() * periods.length)
  ];

  while (item === undefined) {
    iterations += 1;

    if (iterations > 1000) {
      throw new Error(`Couldn't find item after ${iterations} iterations`);
    }

    const index = Math.floor(Math.random() * deck.length);
    const candidate = deck[index];

    if (candidate.year < fromYear || candidate.year > toYear) {
      continue;
    }

    if (playedYears.includes(candidate.year)) {
      continue;
    }

    deck.splice(index, 1);
    item = { ...candidate };
  }

  return item;
}

export function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) => a.year - b.year);
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

export function preloadImage(url: string): HTMLImageElement {
  const img = new Image();
  img.src = createWikimediaImage(url);
  return img;
}
