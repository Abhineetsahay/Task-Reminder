"use client";

import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      className={`min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1e293b_0%,#0f172a_40%,#020617_100%)] px-4 py-10 sm:px-6 ${spaceGrotesk.variable}`}
    >
      <main className="mx-auto w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/85 p-6 shadow-[0_22px_70px_-30px_rgba(0,0,0,0.8)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="inline-block rounded-full border border-orange-800 bg-orange-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">
            Task Reminder
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">Login</h1>
          <p className="mt-2 text-sm text-slate-300">
            Use your email or username, then enter your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-slate-300">
            Email or username
            <input
              type="text"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="jane@example.com or jane_doe"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-900/40"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-300">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-900/40"
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

        <p className="mt-5 text-center text-sm text-slate-300">
          New here?{" "}
          <Link
            href="/signin"
            className="font-semibold text-slate-100 underline-offset-2 hover:text-orange-300 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
