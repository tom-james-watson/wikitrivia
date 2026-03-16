export const DAILY_DATE_LOCALE = "en-US";

function getOrdinalSuffix(day: number): string {
  const remainder100 = day % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatDailyDate(
  dateKey: string,
  locale: string = DAILY_DATE_LOCALE,
): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).formatToParts(date);
  const day = date.getUTCDate();
  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const firstDatePart = parts.find(
    (part) => part.type === "day" || part.type === "month",
  )?.type;

  return firstDatePart === "month"
    ? `${month} ${dayWithSuffix} ${year}`
    : `${dayWithSuffix} ${month} ${year}`;
}
