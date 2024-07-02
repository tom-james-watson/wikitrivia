import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const seedrandom = require("seedrandom");

export function getRandomItem(
  deck: Item[], 
  played: Item[], 
  seed?: string
): Item {
  let rng;
  if ( seed ) {
    rng = seedrandom(seed + `${played.length}`);
  } else {
    rng = Math.random;
  }
  const periods: [number, number][] = [
    [-100000, 1000],
    [1000, 1800],
    [1800, 2020],
  ];
  const [fromYear, toYear] =
    periods[Math.floor(rng() * periods.length)];
  const avoidPeople = rng() > 0.5;
  const candidates = deck.filter((candidate) => {
    if (avoidPeople && candidate.instance_of.includes("human")) {
      return false;
    }
    if (candidate.year < fromYear || candidate.year > toYear) {
      return false;
    }
    if (tooClose(candidate, played)) {
      return false;
    }
    return true;
  });

  if (candidates.length > 0) {
    const result = candidates[Math.floor(rng() * candidates.length)];
    return result;
  }
  return deck[Math.floor(rng() * deck.length)];
}

function tooClose(item: Item, played: Item[]) {
  let distance = (played.length < 40) ? 5 : 1;
  if (played.length < 11)
    distance = 110 - 10 * played.length;

  return played.some((p) => Math.abs(item.year - p.year) < distance);
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
