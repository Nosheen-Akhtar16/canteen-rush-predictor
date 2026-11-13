export const SCORE_MAP = {
  low: 1,
  medium: 2,
  high: 3,
};

export function computeUsual(logs = []) {
  const buckets = {};

  for (const log of logs) {
    if (log == null) continue;
    const weekday = log.weekday;
    const hour = log.hour;
    const score =
      typeof log.score === "number" ? log.score : SCORE_MAP[log.level];

    if (
      typeof weekday !== "number" ||
      typeof hour !== "number" ||
      typeof score !== "number"
    ) {
      continue;
    }

    const key = `${weekday}_${hour}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(score);
  }

  const result = {};

  for (const [key, scores] of Object.entries(buckets)) {
    if (scores.length < 3) continue;

    const sum = scores.reduce((acc, val) => acc + val, 0);
    const avg = Number((sum / scores.length).toFixed(2));

    let label = "high";
    if (avg < 1.67) label = "low";
    else if (avg < 2.34) label = "medium";

    result[key] = { avg, label, n: scores.length };
  }

  return result;
}
