import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useCanteens } from "../../hooks/useCanteens.js";
import { useMenuItems } from "../../hooks/useMenuItems.js";
import { isStale, timeAgo } from "../../lib/time.js";
import Card from "../../components/Card.jsx";
import CrowdControl from "./CrowdControl.jsx";
import StockList from "./StockList.jsx";

export default function StaffHome() {
  const { canteenId } = useAuth();
  const { canteens, loading: l1 } = useCanteens();
  const { items, loading: l2 } = useMenuItems(canteenId);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const canteen = useMemo(
    () => canteens.find((c) => c.id === canteenId),
    [canteens, canteenId]
  );

  if (!canteenId) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <p className="text-sm text-red-600 font-medium">
            No canteen is assigned to your staff account. Ask Admin to assign one.
          </p>
        </Card>
      </main>
    );
  }

  if (l1 || l2) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-48 rounded-2xl bg-slate-200/70 animate-pulse" />
      </main>
    );
  }

  const stale = isStale(canteen?.levelUpdatedAt, 20);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{canteen?.name || canteenId}</h1>
        <p className="text-xs text-slate-500">
          Last updated {timeAgo(canteen?.levelUpdatedAt)}
        </p>
      </div>

      {stale && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-sm font-semibold"
        >
          ⚠️ Please update the crowd level.
        </div>
      )}

      <Card>
        <CrowdControl
          canteenId={canteenId}
          currentLevel={canteen?.currentLevel}
        />
      </Card>

      <StockList canteenId={canteenId} items={items} />
    </main>
  );
}
