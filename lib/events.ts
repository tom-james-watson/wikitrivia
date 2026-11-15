import { GameMode } from "../types/routes";

export interface GameEvent {
  type: "start" | "finish" | "share" | "leave" | "error";
  mode?: GameMode;
  day?: string;
  score?: number;
  detail?: string;
  progress?: number;
}

declare global {
  interface Window {
    gameEvents?: GameEvent[];
  }
}

export function announce(event: GameEvent) {
  window.gameEvents ??= [];
  window.gameEvents.push(event);
}

// Served by wikitrivia.tomjwatson.com only. Elsewhere the request 404s and
// events go nowhere.
export function loadEventListener() {
  const script = document.createElement("script");
  script.async = true;
  script.src = "/e.js";
  document.head.append(script);
}
