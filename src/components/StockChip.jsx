import React from "react";

const STATUS_MAP = {
  in: {
    text: "In stock",
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  low: {
    text: "Low",
    classes:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  },
  out: {
    text: "Out",
    classes:
      "bg-slate-100 text-slate-500 border-slate-300 line-through dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
};

export default function StockChip({ status = "in" }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.in;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}
    >
      {cfg.text}
    </span>
  );
}
