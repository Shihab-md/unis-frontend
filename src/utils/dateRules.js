const DEFAULT_TIME_ZONE = "Asia/Kolkata";

export const getBusinessTimeZone = () =>
  String(import.meta.env.VITE_UNIS_TIMEZONE || DEFAULT_TIME_ZONE).trim() || DEFAULT_TIME_ZONE;

export const getBusinessTodayKey = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: getBusinessTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
};

export const dateKeyToLocalDate = (dateKey) => {
  const match = String(dateKey || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
};

export const getBusinessTodayDate = () => dateKeyToLocalDate(getBusinessTodayKey());
