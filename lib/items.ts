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
  let distance = 5;
  if (played.length < 11) { 
    distance = 110 - 10 * played.length;
  } else if (played.length > 40) {
    distance = 1;
  }
  let item = deck[Math.floor(Math.random() * deck.length)];

  for (let i = 0; i < 10000; i++) {
    item = deck[Math.floor(Math.random() * deck.length)];
    if (avoidPeople && item.instance_of.includes("human")) {
      continue;
    }
    if (item.year < fromYear || item.year > toYear) {
      continue;
    }
    if (tooClose(item, played, distance)) {
      continue;
    }
    return item;
  }

  return item;
}

function tooClose(item: Item, played: Item[], distance: number) {
  for (let j = 0; j < played.length; j++) {
    if (Math.abs(item.year - played[j].year) < distance) {
      return true;
    }
  }
  return false;
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

  if (index !== correctIndex && item.year !== [...played, item][correctIndex].year) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

export function preloadImage(url: string): HTMLImageElement {
  const img = new Image();
  img.src = createWikimediaImage(url);
  return img;
}
