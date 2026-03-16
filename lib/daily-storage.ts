import { DailyGameSnapshot } from "../types/routes";

const DAILY_SNAPSHOT_STORAGE_KEY = "daily:snapshot";

export function loadDailyGameSnapshot(): DailyGameSnapshot | null {
  try {
    const rawValue = localStorage.getItem(DAILY_SNAPSHOT_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as DailyGameSnapshot;
    const deckCursors = Array.isArray(
      (parsed as DailyGameSnapshot & { packCursors?: unknown[] }).deckCursors,
    )
      ? parsed.deckCursors
      : Array.isArray(
            (parsed as DailyGameSnapshot & { packCursors?: unknown[] })
              .packCursors,
          )
        ? ((
            parsed as DailyGameSnapshot & {
              packCursors?: typeof parsed.deckCursors;
            }
          ).packCursors ?? [])
        : null;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.dateKey !== "string" ||
      deckCursors === null ||
      !Array.isArray(parsed.played)
    ) {
      return null;
    }

    return {
      ...parsed,
      deckCursors,
      recentDeckIds:
        parsed.recentDeckIds ??
        (parsed as DailyGameSnapshot & { recentPackIds?: string[] })
          .recentPackIds ??
        [],
    };
  } catch {
    return null;
  }
}

export function saveDailyGameSnapshot(snapshot: DailyGameSnapshot) {
  localStorage.setItem(DAILY_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearDailyGameSnapshot() {
  localStorage.removeItem(DAILY_SNAPSHOT_STORAGE_KEY);
}
