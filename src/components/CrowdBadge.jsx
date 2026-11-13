import React from "react";
import { isStale, timeAgo } from "../lib/time.js";

const LEVEL_CONFIG = {
  low: {
    label: "Low",
    dot: "bg-emerald-500",
    style: {
      backgroundColor: "var(--crowd-low-bg)",
      color: "var(--crowd-low-text)",
      borderColor: "var(--crowd-low-border)",
    },
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-500",
    style: {
      backgroundColor: "var(--crowd-medium-bg)",
      color: "var(--crowd-medium-text)",
      borderColor: "var(--crowd-medium-border)",
    },
  },
  high: {
    label: "High",
    dot: "bg-red-500",
    style: {
      backgroundColor: "var(--crowd-high-bg)",
      color: "var(--crowd-high-text)",
      borderColor: "var(--crowd-high-border)",
    },
  },
};

export default function CrowdBadge({
  level,
  updatedAt,
  showTime = true,
  forceLive = false,
}) {
  const stale = !forceLive && updatedAt !== undefined && isStale(updatedAt, 20);
  const config = !stale && LEVEL_CONFIG[level];

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Not updated
      </span>
    );
  }

  return (
    <span
      style={config.style}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {showTime && updatedAt && (
        <span className="opacity-80 font-normal">· updated {timeAgo(updatedAt)}</span>
      )}
    </span>
  );
}
