import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Navbar() {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const links = [];
  if (role === "student") {
    links.push({ to: "/", label: "Canteens" }, { to: "/search", label: "Search" });
  } else if (role === "staff") {
    links.push({ to: "/staff", label: "Staff Panel" });
  } else if (role === "admin") {
    links.push(
      { to: "/admin", label: "Admin" },
      { to: "/", label: "Student View" },
      { to: "/search", label: "Search" }
    );
  }
  links.push({ to: "/design", label: "UI Kit" });

  const displayName =
    profile?.displayName || user.displayName || user.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            to={role === "staff" ? "/staff" : role === "admin" ? "/admin" : "/"}
            className="flex items-center gap-2 font-bold text-base sm:text-lg text-slate-900 dark:text-white"
          >
            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            <span>Canteen Rush</span>
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `min-h-[44px] inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <div className="hidden sm:flex flex-col items-end text-right mr-1">
            <span className="text-xs font-semibold">{displayName}</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-500">
              {role}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
