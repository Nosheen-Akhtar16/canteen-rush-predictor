import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const DEMO_ACCOUNTS = [
  { label: "Student", email: "student@demo.com" },
  { label: "Staff (Main)", email: "staff1@demo.com" },
  { label: "Staff (Engg.)", email: "staff2@demo.com" },
  { label: "Admin", email: "admin@demo.com" },
];

export default function Login() {
  const { user, role, loading, loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "staff") navigate("/staff", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Canteen Crowd & Stock Tracker
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Live campus crowd levels, item stock &amp; peak hour forecasts.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 transition disabled:opacity-50 cursor-pointer"
          >
            Continue with Google
          </button>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@demo.com"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Quick Demo Fill (Password: Demo@1234):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("Demo@1234");
                    setError("");
                  }}
                  className="text-left p-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/70 dark:bg-slate-800/60 cursor-pointer"
                >
                  <div className="text-xs font-semibold">{acc.label}</div>
                  <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
