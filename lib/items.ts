import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const playedYears = played.map((item): number => {
    return item.year;
  });

  const periods: [number, number][] = [
    [1930, 2020],
    [1850, 1930],
    [1400, 1850],
    [-100000, 1400],
  ];

  const thisperiod = Math.floor(Math.random() * periods.length);  
  const [fromYear, toYear] =
    periods[iperiod];
  const avoidPeople = Math.random() > 0.5;

  // as suggested by @benguraldi  
  let distance = 30 - 3 * played.length;
  distance = distance < 3 ? 3 : distance;
    
  const candidates = deck.filter((candidate) => {
    if (avoidPeople && candidate.instance_of.includes("human")) {
      return false;
    }

    if (candidate.year < fromYear || candidate.year > toYear) {
      return false;
    }
      
    // tweak on @benguraldi suggestion
    for (let i = 0; i < played.length; i++) {
        if (Math.abs(candidate.year - played[i].year) < distance * (iperiod + 1)) {
            return false;
        }
    }

    return true;
  });


  if (candidates.length === 0) {
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
  }

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
