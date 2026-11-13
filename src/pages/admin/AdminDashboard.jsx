import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../../lib/firebase.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useCanteens } from "../../hooks/useCanteens.js";
import { useMenuItems } from "../../hooks/useMenuItems.js";
import { recomputeAllUsualLevels, updateUserRole } from "../../lib/api.js";
import { WEEKDAY_NAMES, formatHourLabel } from "../../lib/time.js";
import CrowdBadge from "../../components/CrowdBadge.jsx";
import Card from "../../components/Card.jsx";
import Button from "../../components/Button.jsx";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const BAR_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  none: "#94a3b8",
};

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const { canteens } = useCanteens();
  const { items } = useMenuItems();
  const [users, setUsers] = useState([]);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeDone, setRecomputeDone] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState("main");
  const [selectedWeekday, setSelectedWeekday] = useState(1);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const outItemsCount = useMemo(
    () => items.filter((i) => i.stockStatus === "out").length,
    [items]
  );

  const highCanteensCount = useMemo(
    () => canteens.filter((c) => c.currentLevel === "high").length,
    [canteens]
  );

  const activeCanteen = useMemo(
    () => canteens.find((c) => c.id === selectedCanteen) || canteens[0],
    [canteens, selectedCanteen]
  );

  const hourlyChartData = useMemo(() => {
    const usualMap = activeCanteen?.usual || {};
    return HOURS.map((h) => {
      const entry = usualMap[`${selectedWeekday}_${h}`];
      return {
        hour: h,
        hourLabel: formatHourLabel(h),
        avg: entry ? entry.avg : 0,
        label: entry ? entry.label : "none",
      };
    });
  }, [activeCanteen, selectedWeekday]);

  const busiestHourInsight = useMemo(() => {
    const valid = hourlyChartData.filter((d) => d.avg > 0);
    if (!valid.length) return "Not enough historical logs for this day yet.";
    const peak = valid.reduce((a, b) => (b.avg > a.avg ? b : a));
    return `Busiest hour at ${activeCanteen?.name || "Canteen"} on ${
      WEEKDAY_NAMES[selectedWeekday]
    }: ${peak.hourLabel}.`;
  }, [hourlyChartData, activeCanteen, selectedWeekday]);

  const topSoldOutData = useMemo(() => {
    const canteenNameMap = {};
    for (const c of canteens) canteenNameMap[c.id] = c.name;

    return [...items]
      .filter((i) => (i.soldOutCount || 0) > 0)
      .sort((a, b) => (b.soldOutCount || 0) - (a.soldOutCount || 0))
      .slice(0, 5)
      .map((item) => ({
        name: `${item.name} (${canteenNameMap[item.canteenId] || item.canteenId})`,
        soldOutCount: item.soldOutCount || 0,
      }));
  }, [items, canteens]);

  const handleRecompute = async () => {
    setRecomputing(true);
    setRecomputeDone(false);
    try {
      await recomputeAllUsualLevels();
      setRecomputeDone(true);
      setTimeout(() => setRecomputeDone(false), 3000);
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Operations</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Campus-wide crowd overview, rush analytics &amp; role assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recomputeDone && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              ✓ Done
            </span>
          )}
          <Button onClick={handleRecompute} disabled={recomputing}>
            {recomputing ? "Recomputing..." : "Recompute usual levels"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Total Canteens</p>
          <p className="text-3xl font-extrabold mt-1">{canteens.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Items Out Now</p>
          <p className="text-3xl font-extrabold mt-1 text-amber-600">{outItemsCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Canteens High Crowd</p>
          <p className="text-3xl font-extrabold mt-1 text-red-600">{highCanteensCount}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold">Live Canteen Status</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {canteens.map((c) => (
            <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-slate-500">{c.location}</div>
              </div>
              <CrowdBadge level={c.currentLevel} updatedAt={c.levelUpdatedAt} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold">Hourly Rush Pattern (8 am – 6 pm)</h2>
            <div className="flex gap-2">
              <select
                aria-label="Select canteen"
                value={activeCanteen?.id || ""}
                onChange={(e) => setSelectedCanteen(e.target.value)}
                className="min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium"
              >
                {canteens.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                aria-label="Select weekday"
                value={selectedWeekday}
                onChange={(e) => setSelectedWeekday(Number(e.target.value))}
                className="min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium"
              >
                {WEEKDAY_NAMES.map((day, idx) => (
                  <option key={day} value={idx}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 3]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v) =>
                    v === 1 ? "Low" : v === 2 ? "Med" : v === 3 ? "High" : ""
                  }
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {hourlyChartData.map((entry, idx) => (
                    <Cell key={idx} fill={BAR_COLORS[entry.label]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {busiestHourInsight}
          </p>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-bold">Top 5 Most Sold-Out Items</h2>
          {topSoldOutData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-500">
              No items marked Out yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSoldOutData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="soldOutCount" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {topSoldOutData[0]
              ? `Most frequently sold out: ${topSoldOutData[0].name} (${topSoldOutData[0].soldOutCount} times).`
              : "Sold-out counts update automatically whenever staff mark an item Out."}
          </p>
        </Card>
      </div>

      <Card className="space-y-3 overflow-x-auto">
        <h2 className="text-lg font-bold">User Roles &amp; Staff Canteen Assignment</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
              <th className="py-2.5 pr-4">Email</th>
              <th className="py-2.5 pr-4">Role</th>
              <th className="py-2.5">Assigned Canteen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => {
              const isSelf = u.uid === currentUser?.uid;
              return (
                <tr key={u.uid}>
                  <td className="py-3 pr-4 font-medium">
                    {u.email} {isSelf && <span className="text-xs text-slate-400">(You)</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      aria-label={`Role for ${u.email}`}
                      disabled={isSelf}
                      value={u.role || "student"}
                      onChange={(e) =>
                        updateUserRole(u.uid, e.target.value, u.canteenId || "main")
                      }
                      className="min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-semibold disabled:opacity-50"
                    >
                      <option value="student">student</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-3">
                    {u.role === "staff" ? (
                      <select
                        aria-label={`Canteen for ${u.email}`}
                        value={u.canteenId || "main"}
                        onChange={(e) =>
                          updateUserRole(u.uid, "staff", e.target.value)
                        }
                        className="min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-semibold"
                      >
                        {canteens.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
