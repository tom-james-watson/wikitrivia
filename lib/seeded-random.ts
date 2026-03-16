import { RandomSource } from "../types/game";

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(
  seed: string,
  initialState?: number,
): RandomSource {
  let state = initialState ?? (hashString(seed) || 1);

  const random = (() => {
    state += 0x6d2b79f5;
    let nextState = state;
    nextState = Math.imul(nextState ^ (nextState >>> 15), nextState | 1);
    nextState ^=
      nextState + Math.imul(nextState ^ (nextState >>> 7), nextState | 61);

    return ((nextState ^ (nextState >>> 14)) >>> 0) / 4294967296;
  }) as RandomSource;

  random.getState = () => state;
  random.setState = (nextState: number) => {
    state = nextState || 1;
  };

  return random;
}
