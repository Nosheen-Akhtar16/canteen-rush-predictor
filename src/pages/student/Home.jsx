import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCanteens } from "../../hooks/useCanteens.js";
import { useMenuItems } from "../../hooks/useMenuItems.js";
import { isStale } from "../../lib/time.js";
import CrowdBadge from "../../components/CrowdBadge.jsx";
import Card from "../../components/Card.jsx";

const CROWD_RANK = { low: 1, medium: 2, high: 3 };

export default function Home() {
  const { canteens, loading, error } = useCanteens();
  const { items } = useMenuItems();
  const navigate = useNavigate();

  const outCountByCanteen = useMemo(() => {
    const counts = {};
    for (const item of items) {
      if (item.stockStatus === "out") {
        counts[item.canteenId] = (counts[item.canteenId] || 0) + 1;
      }
    }
    return counts;
  }, [items]);

  const sortedCanteens = useMemo(() => {
    return [...canteens].sort((a, b) => {
      const aRank = isStale(a.levelUpdatedAt, 20)
        ? 99
        : CROWD_RANK[a.currentLevel] ?? 99;
      const bRank = isStale(b.levelUpdatedAt, 20)
        ? 99
        : CROWD_RANK[b.currentLevel] ?? 99;
      if (aRank !== bRank) return aRank - bRank;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [canteens]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Campus Canteens</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Sorted quietest first. Tap any canteen to view live item availability.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
          ))}
        </div>
      ) : sortedCanteens.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-sm text-slate-500">No canteens found. Run `npm run seed` first.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedCanteens.map((canteen) => {
            const outCount = outCountByCanteen[canteen.id] || 0;
            return (
              <Card
                key={canteen.id}
                onClick={() => navigate(`/canteen/${canteen.id}`)}
                className="flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-bold">{canteen.name}</h2>
                  <p className="text-xs text-slate-500">{canteen.location}</p>
                  <div className="pt-1">
                    <CrowdBadge
                      level={canteen.currentLevel}
                      updatedAt={canteen.levelUpdatedAt}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span
                    className={
                      outCount > 0
                        ? "font-semibold text-amber-700 dark:text-amber-400"
                        : "font-medium text-emerald-700 dark:text-emerald-400"
                    }
                  >
                    {outCount > 0
                      ? `${outCount} ${outCount === 1 ? "item" : "items"} out`
                      : "All items in stock"}
                  </span>
                  <span className="font-semibold">View menu →</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
