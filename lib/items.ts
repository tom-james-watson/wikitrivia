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
  const periodWillFail = checkPeriodWillFail(played, fromYear, toYear);
  const candidates = deck.filter((candidate) => {
    if (avoidPeople && candidate.instance_of.includes("human")) {
      return false;
    }
    if (candidate.year < fromYear || candidate.year > toYear) {
      return false;
    }
    if (tooClose(candidate, played, periodWillFail)) {
      return false;
    }
    return true;
  });

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return deck[Math.floor(Math.random() * deck.length)];
}

function getIdealDistance(played: Item[]) {
  return 110 - 10 * played.length;
}

/**
 * This function checks that the played cards won't cause tooClose to return
 * true for all years in a period (possible for 1800-2020)
 */
function checkPeriodWillFail(
  played: Item[], 
  fromYear: number, 
  toYear: number
): boolean {
  if (played.length > 11 || played.length === 0) {
    return false;
  }

  const distance = getIdealDistance(played);

  const playedYears = played.map(({ year }) => year).sort();
  const interestingYears = playedYears.filter((year) => 
    fromYear - distance < year && year < toYear + distance
  );

  if (interestingYears.length === 0) {
    return false;
  }

  // If there is room at either end of the period, then we can proceed safely.
  if (interestingYears[0] - fromYear >= distance) {
    return false;
  }

  if (toYear - interestingYears[-1] >= distance) {
    return false;
  }

  // If there is room in between cards, we can proceed safely.
  for (let i = 0; i < interestingYears.length - 1; i++) {
    if (interestingYears[i+1] - interestingYears[i] >= 2 * distance) {
      return false;
    }
  }

  return true;
}

function tooClose(
  item: Item, 
  played: Item[], 
  periodWillFail: boolean
): boolean {
  let distance = (played.length < 40) ? 5 : 1;
  if (!periodWillFail && played.length < 11) {
    distance = getIdealDistance(played);
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
