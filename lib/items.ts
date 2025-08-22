import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

function getPeriodsForRound(round: number): [number, number][] {
  if (round === 0 || round >= 11) {
    return [
      [-100000, 1000],
      [1000, 1800],
      [1800, 2020],
    ];
  }

  const distance = getIdealDistance(round);
  const epoch = Math.min(1800, 2000 - 2 * (distance) * round);
  return [
    [-100000, 1000],
    [1000, epoch],
    [epoch, 2020],
  ]
}

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const periods: [number, number][] = getPeriodsForRound(played.length);
  const [fromYear, toYear] = periods[Math.floor(Math.random() * periods.length)];
  const avoidPeople = Math.random() > 0.5;
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
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return deck[Math.floor(Math.random() * deck.length)];
}

function getIdealDistance(round: number) {
  return 110 - 10 * round;
}

function tooClose(item: Item, played: Item[]): boolean {
  let distance = (played.length < 40) ? 5 : 1;
  if (played.length < 11) {
    distance = getIdealDistance(played.length);
  }

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
