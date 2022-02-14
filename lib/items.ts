import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const periods: [number, number][] = [
    [-100000, 1000],
    [1000, 1800],
    [1800, 2020],
  ];
  const [fromYear, toYear] =
    periods[Math.floor(Math.random() * periods.length)];
  const avoidPeople = Math.random() > 0.5;
  let distance = 110 - 10 * played.length;
  distance = distance < 5 ? 5 : distance;
  let item;

  for (let i = 0; i < 1000; i++) {
    item = deck[Math.floor(Math.random() * deck.length)];
    if (avoidPeople && candidate.instance_of.includes("human")) {
      continue;
    }
    if (candidate.year < fromYear || candidate.year > toYear) {
      continue;
    }
    for (let j = 0; j < played.length; j++) {
      if (Math.abs(candidate.year - played[j].year) < distance) {
        continue;
      }
    }
    return item;
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
