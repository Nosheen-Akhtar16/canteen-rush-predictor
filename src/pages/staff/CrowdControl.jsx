import React, { useState } from "react";
import { setCrowdLevel } from "../../lib/api.js";

const LEVELS = [
  {
    id: "low",
    label: "Low",
    desc: "Walk right in",
    active: "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400",
    idle: "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-emerald-500",
  },
  {
    id: "medium",
    label: "Medium",
    desc: "5–10 min wait",
    active: "bg-amber-500 text-slate-950 border-amber-500 ring-2 ring-amber-300",
    idle: "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-amber-500",
  },
  {
    id: "high",
    label: "High",
    desc: "Long queue",
    active: "bg-red-600 text-white border-red-600 ring-2 ring-red-400",
    idle: "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-red-500",
  },
];

export default function CrowdControl({ canteenId, currentLevel }) {
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [lastAttemptLevel, setLastAttemptLevel] = useState(null);

  const handleSelect = async (level) => {
    setSaving(true);
    setSavedMsg("");
    setError("");
    setLastAttemptLevel(level);
    try {
      await setCrowdLevel(canteenId, level);
      setSavedMsg("Saved");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (err) {
      setError(err.message || "Could not update crowd level.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">1. Live Crowd Level</h2>
        {savedMsg && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            ✓ {savedMsg}
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          {lastAttemptLevel && (
            <button
              type="button"
              onClick={() => handleSelect(lastAttemptLevel)}
              className="min-h-[44px] px-3 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {LEVELS.map((lvl) => {
          const isCurrent = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              disabled={saving}
              onClick={() => handleSelect(lvl.id)}
              className={`min-h-[68px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition disabled:opacity-50 cursor-pointer ${
                isCurrent ? lvl.active : lvl.idle
              }`}
            >
              <span className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                {isCurrent && <span aria-hidden="true">✓</span>}
                {lvl.label}
              </span>
              <span className="text-[11px] opacity-85">{lvl.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
