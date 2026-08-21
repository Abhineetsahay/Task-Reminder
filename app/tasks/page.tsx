"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

interface TaskItem {
  id: number;
  taskName: string;
  taskDescription: string | null;
  status: boolean;
  createdAt: string;
  endTime: string;
}

interface TaskResponse {
  tasks?: TaskItem[];
  error?: string;
}

interface SingleTaskResponse {
  task?: TaskItem;
  error?: string;
}

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoFromDateTimeLocalValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

const CLIENT_TIMEZONE_FIX_DEPLOYED_AT_MS = Date.parse("2026-08-21T00:00:00.000Z");

function formatDueDateTime(task: TaskItem) {
  const dueDate = new Date(task.endTime);
  if (Number.isNaN(dueDate.getTime())) {
    return task.endTime;
  }

  const createdAtMs = Date.parse(task.createdAt);
  const isLegacyTask =
    !Number.isNaN(createdAtMs) &&
    createdAtMs < CLIENT_TIMEZONE_FIX_DEPLOYED_AT_MS;

  if (!isLegacyTask) {
    return dueDate.toLocaleString();
  }

  // Older tasks stored local wall-clock values as UTC; shift once for display.
  const correctedLegacyDueDate = new Date(
    dueDate.getTime() + dueDate.getTimezoneOffset() * 60 * 1000,
  );
  return correctedLegacyDueDate.toLocaleString();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [endTime, setEndTime] = useState(() =>
    toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  
  const loadTasks = async (
    options: { showLoading?: boolean; clearError?: boolean } = {},
  ) => {
    const { showLoading = true, clearError = true } = options;

    if (showLoading) {
      setLoading(true);
    }
    if (clearError) {
      setError("");
    }

    try {
      const response = await fetch("/api/tasks", { method: "GET" });
      const payload = (await response.json()) as TaskResponse;

      if (!response.ok) {
        setError(payload.error ?? "Unable to load tasks.");
        return;
      }
      
      setTasks(payload.tasks ?? []);
    } catch {
      setError("Network error while loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchInitialTasks = async () => {
      try {
        const response = await fetch("/api/tasks", { method: "GET" });
        const payload = (await response.json()) as TaskResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setError(payload.error ?? "Unable to load tasks.");
          return;
        }

        setTasks(payload.tasks ?? []);
      } catch {
        if (!cancelled) {
          setError("Network error while loading tasks.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchInitialTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      const isoEndTime = toIsoFromDateTimeLocalValue(endTime);

      if (!isoEndTime) {
        setError("Please provide a valid due date.");
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName,
          taskDescription,
          endTime: isoEndTime,
        }),
      });

      const payload = (await response.json()) as SingleTaskResponse;

      if (!response.ok) {
        setError(payload.error ?? "Unable to create task.");
        return;
      }

      if (payload.task) {
        setTasks((prev) => [payload.task as TaskItem, ...prev]);
      }

      setTaskName("");
      setTaskDescription("");
      setEndTime(toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)));
    } catch {
      setError("Network error while creating task.");
    } finally {
      setCreating(false);
    }
  };

  const toggleTask = async (task: TaskItem) => {
    setError("");

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !task.status }),
      });

      const payload = (await response.json()) as SingleTaskResponse;

      if (!response.ok || !payload.task) {
        setError(payload.error ?? "Unable to update task.");
        return;
      }

      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? payload.task! : item)),
      );
    } catch {
      setError("Network error while updating task.");
    }
  };

  const deleteTask = async (taskId: number) => {
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to delete task.");
        return;
      }

      setTasks((prev) => prev.filter((item) => item.id !== taskId));
    } catch {
      setError("Network error while deleting task.");
    }
  };

  const summary = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status).length;
    const pending = total - done;
    return { total, done, pending };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#020617_0%,#0f172a_50%,#1e293b_100%)] px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-[0_16px_48px_-22px_rgba(0,0,0,0.6)] backdrop-blur sm:p-7">
          <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
            Your Tasks
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Add tasks, track progress, and keep your day organized.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Total
              </p>
              <p className="text-2xl font-semibold text-slate-100">
                {summary.total}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-emerald-300">
                Done
              </p>
              <p className="text-2xl font-semibold text-emerald-200">
                {summary.done}
              </p>
            </div>
            <div className="rounded-xl border border-amber-900 bg-amber-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-amber-300">
                Pending
              </p>
              <p className="text-2xl font-semibold text-amber-200">
                {summary.pending}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-[0_16px_48px_-22px_rgba(0,0,0,0.6)] backdrop-blur sm:p-7">
          <h2 className="text-xl font-semibold text-slate-100">Add Task</h2>

          <form className="mt-4 grid gap-4" onSubmit={handleCreate}>
            <label className="space-y-2 text-sm font-medium text-slate-300">
              Task name
              <input
                type="text"
                required
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="Finish project proposal"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-900/40"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-300">
              Description (optional)
              <textarea
                value={taskDescription}
                onChange={(event) => setTaskDescription(event.target.value)}
                placeholder="Add notes for this task"
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-900/40"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-300">
              Due date
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-900/40"
              />
            </label>

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
            >
              {creating ? "Adding..." : "Add Task"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-[0_16px_48px_-22px_rgba(0,0,0,0.6)] backdrop-blur sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-100">Task List</h2>
            <button
              type="button"
              onClick={() =>
                void loadTasks({ showLoading: true, clearError: true })
              }
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-4 text-sm text-slate-300">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-300">
              No tasks yet. Add your first one above.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tasks.map((task) => {
                const dueLabel = formatDueDateTime(task);
                return (
                  <li
                    key={task.id}
                    className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3
                          className={`font-semibold ${task.status ? "text-slate-400 line-through" : "text-slate-100"}`}
                        >
                          {task.taskName}
                        </h3>
                        {task.taskDescription ? (
                          <p className="text-sm text-slate-300">
                            {task.taskDescription}
                          </p>
                        ) : null}
                        <p className="text-xs text-slate-400">
                          Due: {dueLabel}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleTask(task)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition ${task.status ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
                        >
                          {task.status ? "Mark Pending" : "Mark Done"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteTask(task.id)}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
