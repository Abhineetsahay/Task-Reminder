"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormState {
  username: string;
  email: string;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create your account right now.");
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Network error. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#fff7e8_0%,#f6f7fb_40%,#edf2ff_100%)] px-4 py-10 sm:px-6 md:px-10 `}
    >
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-orange-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />

      <main className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between gap-10 bg-[#0f172a] p-8 text-white sm:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.15),transparent_45%),linear-gradient(240deg,rgba(249,115,22,0.22),transparent_45%)]" />
          <div className="relative space-y-5">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              Welcome Back
            </p>
            <h1 className="font-(--font-playfair-display) text-4xl leading-tight sm:text-5xl">
              Sign in and keep your plans on track.
            </h1>
            <p className="max-w-md text-sm text-slate-200 sm:text-base">
              Manage reminders, stay consistent, and move your tasks forward one
              focused day at a time.
            </p>
          </div>

          <div className="relative grid gap-3 text-sm text-slate-200">
            <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              Secure cookie session with HTTP-only token storage.
            </p>
            <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              Fast onboarding with email, username, and password.
            </p>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10">
          <form className="w-full space-y-5" onSubmit={() => handleSubmit}>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-slate-900">
                Create your account
              </h2>
              <p className="text-sm text-slate-600">
                Start by entering your account details below.
              </p>
            </div>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Username
              <input
                type="text"
                value={form.username}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value }))
                }
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                placeholder="jane_doe"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                placeholder="jane@example.com"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                placeholder="At least 6 characters"
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
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Sign In"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
