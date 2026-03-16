export const DAILY_DIFFICULTY = "easy";

export function getCurrentUtcDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getNextUtcMidnight(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
}

export function formatTimeUntilNextDaily(
  now: Date = new Date(),
  prefix = "Next daily in",
): string {
  const remainingMs = Math.max(
    0,
    getNextUtcMidnight(now).getTime() - now.getTime(),
  );
  const totalMinutes = Math.max(0, Math.floor(remainingMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${prefix} ${minutes}m`;
  }

  return `${prefix} ${hours}h ${minutes}m`;
}
