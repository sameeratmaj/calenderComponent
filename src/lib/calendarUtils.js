import { MONTH_NAMES, SEASON_THEMES } from "./calendarConstants";

export function buildCalendarDays(monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startOffset = (start.getDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startOffset);

  const endOffset = 6 - ((end.getDay() + 6) % 7);
  const gridEnd = new Date(end);
  gridEnd.setDate(end.getDate() + endOffset);

  const days = [];
  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }

  return days;
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isSameMonth(first, second) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

export function isToday(date) {
  const today = new Date();
  return isSameDay(date, today);
}

export function normalizeRange(first, second) {
  return first <= second ? { start: first, end: second } : { start: second, end: first };
}

export function isWithinRange(date, start, end) {
  return stripTime(date) >= stripTime(start) && stripTime(date) <= stripTime(end);
}

export function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function parseISODateKey(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function buildRangeKey(start, end) {
  return `${toISODate(start)}_${toISODate(end)}`;
}

export function formatShortDate(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

export function formatLongDate(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function readStorage(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
}

export function getSeasonTheme(monthIndex) {
  if (monthIndex >= 1 && monthIndex <= 3) {
    return { key: "spring", ...SEASON_THEMES.spring };
  }
  if (monthIndex >= 4 && monthIndex <= 5) {
    return { key: "summer", ...SEASON_THEMES.summer };
  }
  if (monthIndex >= 6 && monthIndex <= 8) {
    return { key: "monsoon", ...SEASON_THEMES.monsoon };
  }
  if (monthIndex >= 9 && monthIndex <= 10) {
    return { key: "autumn", ...SEASON_THEMES.autumn };
  }
  return { key: "winter", ...SEASON_THEMES.winter };
}
