import React from "react";

export default function Card({ children, className = "", onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs ${
        clickable
          ? "cursor-pointer transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
