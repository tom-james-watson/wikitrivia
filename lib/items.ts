import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const playedYears = played.map((item): number => {
    return item.year;
  });

  const periods: [number, number][] = [
    [-100000, 1400],
    [1400, 1850],
    [1850, 1930],
    [1930, 2020],
  ];
  const [fromYear, toYear] =
    periods[Math.floor(Math.random() * periods.length)];
  const avoidPeople = Math.random() > 0.5;

  const candidates = deck.filter((candidate) => {
    if (avoidPeople && candidate.instance_of.includes("human")) {
      return false;
    }

    if (candidate.year < fromYear || candidate.year > toYear) {
      return false;
    }

    if (playedYears.includes(candidate.year)) {
      return false;
    }

    return true;
  });

  if (candidates.length === 0) {
    throw new Error("No item candidates");
  }

  const item = { ...candidates[Math.floor(Math.random() * candidates.length)] };

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
