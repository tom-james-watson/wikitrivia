import { Item, PlayedItem } from "../types/item";

export function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) => a.source.ecv - b.source.ecv);
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

export function round2(value: number):number {
  return Math.round(value * 100) / 100;
}

export function displayCO2(value: number): string {
  console.debug(value);
  return (Math.abs(value) < 0.1 ? round2(value * 1000) + " g" : round2(value) + " kg");
}