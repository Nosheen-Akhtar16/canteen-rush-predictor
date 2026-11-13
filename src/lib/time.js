const WEEKDAY_MAP = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function toMillis(ts) {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  const parsed = Date.parse(ts);
  return Number.isNaN(parsed) ? null : parsed;
}

export function istParts(date = new Date()) {
  const ms = toMillis(date) ?? Date.now();
  const d = new Date(ms);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const weekdayStr = parts.find((p) => p.type === "weekday")?.value || "Sun";
  const hourStr = parts.find((p) => p.type === "hour")?.value || "0";

  const weekday = WEEKDAY_MAP[weekdayStr] ?? 0;
  const rawHour = parseInt(hourStr, 10);
  const hour = Number.isNaN(rawHour) ? 0 : rawHour % 24;

  return { weekday, hour };
}

export function isStale(ts, thresholdMinutes = 20) {
  const ms = toMillis(ts);
  if (!ms) return true;
  return Date.now() - ms > thresholdMinutes * 60 * 1000;
}

export function timeAgo(ts) {
  const ms = toMillis(ts);
  if (!ms) return "never";
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "1 hr ago";
  if (diffHr < 24) return `${diffHr} hrs ago`;
  const diffDays = Math.floor(diffHr / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

export function formatTimeIST(ts) {
  const ms = toMillis(ts);
  if (!ms) return "";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(ms))
    .toLowerCase();
}

export function formatHourLabel(hour) {
  if (hour === 0) return "12 am";
  if (hour < 12) return `${hour} am`;
  if (hour === 12) return "12 pm";
  return `${hour - 12} pm`;
}
