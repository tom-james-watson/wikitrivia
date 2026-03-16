import { GameDifficulty } from "../types/game";

const FREE_PLAY_DIFFICULTY_STORAGE_KEY = "free-play:difficulty";
const FREE_PLAY_INTRO_SHOWN_STORAGE_KEY = "free-play:intro-shown";

export function loadFreePlayDifficulty(): GameDifficulty {
  const storedValue = localStorage.getItem(FREE_PLAY_DIFFICULTY_STORAGE_KEY);

  if (
    storedValue === "easy" ||
    storedValue === "normal" ||
    storedValue === "hard"
  ) {
    return storedValue;
  }

  return "normal";
}

export function saveFreePlayDifficulty(difficulty: GameDifficulty) {
  localStorage.setItem(FREE_PLAY_DIFFICULTY_STORAGE_KEY, difficulty);
}

function loadShownIntroPaths(): string[] {
  try {
    const rawValue = sessionStorage.getItem(FREE_PLAY_INTRO_SHOWN_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function saveShownIntroPaths(paths: string[]) {
  sessionStorage.setItem(
    FREE_PLAY_INTRO_SHOWN_STORAGE_KEY,
    JSON.stringify(paths),
  );
}

export function markFreePlayIntroShown(path: string) {
  const shownPaths = loadShownIntroPaths();

  if (shownPaths.includes(path)) {
    return;
  }

  saveShownIntroPaths([...shownPaths, path]);
}

export function consumeFreePlayIntroShown(path: string): boolean {
  const shownPaths = loadShownIntroPaths();

  if (!shownPaths.includes(path)) {
    return false;
  }

  saveShownIntroPaths(shownPaths.filter((shownPath) => shownPath !== path));
  return true;
}
