import { GameDifficulty } from "../types/game";

function getHighscoreStorageKey(path: string, difficulty: GameDifficulty) {
  return `highscore:${path}:${difficulty}`;
}

export function loadHighscore(
  path: string,
  difficulty: GameDifficulty,
): number {
  return Number(
    localStorage.getItem(getHighscoreStorageKey(path, difficulty)) ?? "0",
  );
}

export function saveHighscore(
  path: string,
  difficulty: GameDifficulty,
  score: number,
) {
  localStorage.setItem(getHighscoreStorageKey(path, difficulty), String(score));
}
