import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";
import { createCardImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const periods: [number, number][] = [
    [-100000, 1400],
    [1400, 1850],
    [1850, 1930],
    [1930, 2020],
  ];
  const [fromYear, toYear] =
    periods[Math.floor(Math.random() * periods.length)];
  const avoidPeople = Math.random() > 0.5;

  let distance = 110 - 10 * played.length;
  distance = distance < 5 ? 5 : distance;
  
  const candidates = deck.filter((candidate) => {
    if (avoidPeople && candidate.instance_of.includes("human")) {
      return false;
    }

    if (candidate.year < fromYear || candidate.year > toYear) {
      return false;
    }

    for (let i = 0; i < played.length; i++) {
	if (Math.abs(candidate.year - played[i].year) < distance) {
	    return false;
	}
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
