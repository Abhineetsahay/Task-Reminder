"use client";

import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to login right now.");
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[linear-gradient(140deg,#f8fafc_0%,#e2e8f0_45%,#fff7ed_100%)] px-4 py-10 sm:px-6 ${spaceGrotesk.variable}`}
    >
      <main className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
            Task Reminder
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your email or username, then enter your password.
          </p>
        </div>

        <form onSubmit={() => handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Email or username
            <input
              type="text"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="jane@example.com or jane_doe"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New here?{" "}
          <Link
            href="/signin"
            className="font-semibold text-slate-900 underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
