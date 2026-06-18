export function parseTimelineYear(value: string | undefined): number | null {
  const trimmed = value?.trim() ?? "";

  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }

  const year = Number(trimmed);
  return Number.isSafeInteger(year) ? year : null;
}
