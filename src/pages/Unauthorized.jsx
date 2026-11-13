import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Card from "../components/Card.jsx";

export default function Unauthorized() {
  const { role } = useAuth();
  const home = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/";

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your current role (<strong>{role || "guest"}</strong>) does not have permission to view this page.
        </p>
        <Link
          to={home}
          className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
        >
          Go to your dashboard
        </Link>
      </Card>
    </main>
  );
}
