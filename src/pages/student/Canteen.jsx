import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCanteens } from "../../hooks/useCanteens.js";
import { useMenuItems } from "../../hooks/useMenuItems.js";
import { formatHourLabel, istParts } from "../../lib/time.js";
import CrowdBadge from "../../components/CrowdBadge.jsx";
import StockChip from "../../components/StockChip.jsx";
import Card from "../../components/Card.jsx";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const STRIP_COLORS = {
  low: "bg-emerald-500 text-white",
  medium: "bg-amber-400 text-slate-950",
  high: "bg-red-500 text-white",
  none: "bg-slate-200 dark:bg-slate-800 text-slate-500",
};

const USUAL_TEXT = {
  low: "Usually quiet around now.",
  medium: "Usually moderately busy around now.",
  high: "Usually busy around now.",
};

export default function Canteen() {
  const { id } = useParams();
  const { canteens, loading: loadingCanteen, error: err1 } = useCanteens();
  const { items, loading: loadingItems, error: err2 } = useMenuItems(id);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const canteen = useMemo(
    () => canteens.find((c) => c.id === id),
    [canteens, id]
  );

  const { weekday, hour } = useMemo(() => istParts(new Date()), []);
  const currentUsual = canteen?.usual?.[`${weekday}_${hour}`];

  const rushStrip = useMemo(() => {
    const usualMap = canteen?.usual || {};
    let quietest = null;

    const blocks = HOURS.map((h) => {
      const entry = usualMap[`${weekday}_${h}`];
      if (entry && (!quietest || entry.avg < quietest.avg)) {
        quietest = { hour: h, avg: entry.avg, label: entry.label };
      }
      return {
        hour: h,
        label: entry?.label || "none",
        isCurrent: h === hour,
      };
    });

    return { blocks, quietest };
  }, [canteen, weekday, hour]);

  const groupedMenu = useMemo(() => {
    const filtered = onlyInStock
      ? items.filter((item) => item.stockStatus !== "out")
      : items;

    const groups = {};
    for (const item of filtered) {
      const cat = item.category || "Menu";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }

    for (const cat of Object.keys(groups)) {
      groups[cat].sort((a, b) => {
        const aOut = a.stockStatus === "out" ? 1 : 0;
        const bOut = b.stockStatus === "out" ? 1 : 0;
        if (aOut !== bOut) return aOut - bOut;
        return (a.name || "").localeCompare(b.name || "");
      });
    }

    return groups;
  }, [items, onlyInStock]);

  const error = err1 || err2;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Back to all canteens
      </Link>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loadingCanteen ? (
        <div className="h-36 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
      ) : !canteen ? (
        <Card className="text-center py-10">
          <p className="text-sm text-slate-500">Canteen not found.</p>
        </Card>
      ) : (
        <>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{canteen.name}</h1>
                <p className="text-sm text-slate-500">{canteen.location}</p>
              </div>
              <CrowdBadge
                level={canteen.currentLevel}
                updatedAt={canteen.levelUpdatedAt}
              />
            </div>

            {currentUsual && USUAL_TEXT[currentUsual.label] && (
              <p className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
                {USUAL_TEXT[currentUsual.label]}
              </p>
            )}

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">
                  Today&apos;s Rush Strip (8 am – 6 pm)
                </span>
                <span>Current hour outlined</span>
              </div>

              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {rushStrip.blocks.map((block) => (
                  <div
                    key={block.hour}
                    title={`${formatHourLabel(block.hour)}: ${block.label}`}
                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] sm:text-xs font-bold ${
                      STRIP_COLORS[block.label]
                    } ${
                      block.isCurrent
                        ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900"
                        : ""
                    }`}
                  >
                    <span>{block.hour <= 12 ? block.hour : block.hour - 12}</span>
                    <span className="text-[9px] font-normal">
                      {block.hour < 12 ? "am" : "pm"}
                    </span>
                  </div>
                ))}
              </div>

              {rushStrip.quietest && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Quietest hour today:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {formatHourLabel(rushStrip.quietest.hour)}
                  </strong>{" "}
                  ({rushStrip.quietest.label}).
                </p>
              )}
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Menu &amp; Live Stock</h2>
            <label className="inline-flex items-center gap-2.5 min-h-[44px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm font-medium">Show only items in stock</span>
            </label>
          </div>

          {loadingItems ? (
            <div className="h-32 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
          ) : Object.keys(groupedMenu).length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-slate-500">No items match this filter.</p>
            </Card>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedMenu).map(([category, catItems]) => (
                <Card key={category} className="p-0 overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {category}
                    </h3>
                  </div>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {catItems.map((item) => (
                      <li
                        key={item.id}
                        className={`px-5 py-3.5 flex items-center justify-between gap-3 ${
                          item.stockStatus === "out" ? "opacity-50" : ""
                        }`}
                      >
                        <span className="font-medium text-sm sm:text-base">
                          {item.name}
                        </span>
                        <StockChip status={item.stockStatus} />
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
