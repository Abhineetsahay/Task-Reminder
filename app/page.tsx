import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_15%,#1e293b_0%,#0f172a_45%,#020617_100%)] px-4 py-10">
      <main className="w-full max-w-xl rounded-3xl border border-slate-700/70 bg-slate-900/85 p-8 text-center shadow-[0_24px_70px_-30px_rgba(0,0,0,0.8)] backdrop-blur sm:p-10">
        <p className="inline-block rounded-full border border-orange-800 bg-orange-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">
          Task Reminder
        </p>
        <h1 className="mt-4 text-3xl font-bold text-slate-100 sm:text-4xl">
          Stay focused. Finish your tasks.
        </h1>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          Log in to manage your day, track progress, and complete tasks on time.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
          >
            Go to Login
          </Link>
          <Link
            href="/signin"
            className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
