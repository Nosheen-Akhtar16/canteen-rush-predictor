import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCanteens } from "../../hooks/useCanteens.js";
import { useMenuItems } from "../../hooks/useMenuItems.js";
import { isStale } from "../../lib/time.js";
import CrowdBadge from "../../components/CrowdBadge.jsx";
import StockChip from "../../components/StockChip.jsx";
import Card from "../../components/Card.jsx";

const SUGGESTIONS = ["Samosa", "Cold Coffee", "Masala Dosa", "Paneer Roll", "Masala Chai"];
const STOCK_RANK = { in: 1, low: 2, out: 3 };
const CROWD_RANK = { low: 1, medium: 2, high: 3 };

export default function Search() {
  const { canteens, loading: l1, error: e1 } = useCanteens();
  const { items, loading: l2, error: e2 } = useMenuItems();
  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(rawQuery.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const canteenById = useMemo(() => {
    const map = {};
    for (const c of canteens) map[c.id] = c;
    return map;
  }, [canteens]);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    return items
      .filter((item) => (item.name || "").toLowerCase().includes(debouncedQuery))
      .map((item) => ({ ...item, canteen: canteenById[item.canteenId] }))
      .sort((a, b) => {
        const sDiff = (STOCK_RANK[a.stockStatus] ?? 9) - (STOCK_RANK[b.stockStatus] ?? 9);
        if (sDiff !== 0) return sDiff;
        const rA = !a.canteen || isStale(a.canteen.levelUpdatedAt, 20) ? 99 : CROWD_RANK[a.canteen.currentLevel] ?? 99;
        const rB = !b.canteen || isStale(b.canteen.levelUpdatedAt, 20) ? 99 : CROWD_RANK[b.canteen.currentLevel] ?? 99;
        return rA - rB;
      });
  }, [debouncedQuery, items, canteenById]);

  const error = e1 || e2;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Search Food Across Campus</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          In-stock items and quietest canteens appear first.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        type="search"
        aria-label="Search menu items"
        value={rawQuery}
        onChange={(e) => setRawQuery(e.target.value)}
        placeholder="Search Samosa, Cold Coffee, Dosa..."
        className="w-full min-h-[48px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-base"
      />

      {!debouncedQuery ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quick suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setRawQuery(term)}
                className="min-h-[44px] px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 text-sm font-medium cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : l1 || l2 ? (
        <div className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" />
      ) : results.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-base font-medium">No canteen lists that item</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((item) => (
            <Link key={item.id} to={`/canteen/${item.canteenId}`} className="block">
              <Card className="flex flex-wrap items-center justify-between gap-3 hover:border-emerald-400">
                <div>
                  <h2 className="font-bold text-base">{item.name}</h2>
                  <p className="text-xs text-slate-500">
                    {item.canteen?.name || item.canteenId}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StockChip status={item.stockStatus} />
                  {item.canteen && (
                    <CrowdBadge
                      level={item.canteen.currentLevel}
                      updatedAt={item.canteen.levelUpdatedAt}
                      showTime={false}
                    />
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
