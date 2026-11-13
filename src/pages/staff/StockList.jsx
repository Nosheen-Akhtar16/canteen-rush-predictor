import React, { useState } from "react";
import {
  addMenuItem,
  deleteMenuItem,
  renameMenuItem,
  resetAllStockToIn,
  setStockStatus,
} from "../../lib/api.js";
import { formatTimeIST } from "../../lib/time.js";
import Button from "../../components/Button.jsx";

const SWITCH_OPTIONS = [
  { value: "in", label: "In", active: "bg-emerald-600 text-white" },
  { value: "low", label: "Low", active: "bg-amber-500 text-slate-950" },
  { value: "out", label: "Out", active: "bg-red-600 text-white" },
];

export default function StockList({ canteenId, items }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Snacks");

  const handleStatusChange = async (itemId, status) => {
    setBusyId(itemId);
    setError("");
    try {
      await setStockStatus(itemId, status);
    } catch (err) {
      setError(err.message || "Failed to update stock status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm("Reset all items in this canteen to In stock?")) return;
    setBusyId("reset");
    setError("");
    try {
      await resetAllStockToIn(items);
    } catch (err) {
      setError(err.message || "Failed to reset items.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusyId("add");
    setError("");
    try {
      await addMenuItem(canteenId, { name: newName, category: newCategory });
      setNewName("");
    } catch (err) {
      setError(err.message || "Failed to add menu item.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRename = async (item) => {
    const updated = window.prompt("Rename item:", item.name);
    if (!updated || updated.trim() === item.name) return;
    try {
      await renameMenuItem(item.id, updated);
    } catch (err) {
      setError(err.message || "Rename failed.");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from menu?`)) return;
    try {
      await deleteMenuItem(item.id);
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">2. Item Stock ({items.length})</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEditMode((v) => !v)}>
            {editMode ? "Done editing" : "Edit menu"}
          </Button>
          <Button
            variant="secondary"
            disabled={busyId === "reset" || items.length === 0}
            onClick={handleResetAll}
          >
            Reset all to In stock
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {editMode && (
        <form
          onSubmit={handleAddItem}
          className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 items-end"
        >
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="new-item-name" className="block text-xs font-semibold mb-1">
              New Item Name
            </label>
            <input
              id="new-item-name"
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Paneer Roll"
              className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm"
            />
          </div>
          <div className="w-36">
            <label htmlFor="new-item-cat" className="block text-xs font-semibold mb-1">
              Category
            </label>
            <select
              id="new-item-cat"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              <option>Snacks</option>
              <option>Meals</option>
              <option>Beverages</option>
              <option>Bakery</option>
            </select>
          </div>
          <Button type="submit" disabled={busyId === "add"}>
            + Add Item
          </Button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold text-sm sm:text-base">{item.name}</div>
              <div className="text-xs text-slate-500">
                {item.category}
                {item.stockStatus === "out" && item.stockUpdatedAt && (
                  <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                    · Out since {formatTimeIST(item.stockUpdatedAt)}
                  </span>
                )}
              </div>
            </div>

            {editMode ? (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => handleRename(item)}>
                  Rename
                </Button>
                <Button variant="danger" onClick={() => handleDelete(item)}>
                  Delete
                </Button>
              </div>
            ) : (
              <div
                role="group"
                aria-label={`Stock status for ${item.name}`}
                className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800 gap-1"
              >
                {SWITCH_OPTIONS.map((opt) => {
                  const selected = item.stockStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleStatusChange(item.id, opt.value)}
                      className={`min-h-[44px] min-w-[54px] px-3 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                        selected
                          ? opt.active
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
