import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Flame, PartyPopper, Plus, Trophy } from "lucide-react";
import { useHabits } from "@/lib/habit/store";
import { activeTasks, bestStreak, currentStreak, dayStats } from "@/lib/habit/stats";
import { Celebration } from "@/components/celebration";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Streak Daily Habit Tracker" },
      {
        name: "description",
        content:
          "Tick off today's habits and routines, watch your progress bar fill, and keep your streak alive.",
      },
      { property: "og:title", content: "Today — Streak Daily Habit Tracker" },
      {
        property: "og:description",
        content: "Your daily checklist with progress, streaks, and celebration when you finish.",
      },
    ],
  }),
  component: TodayPage,
});

const TONE_CLASS = [
  "bg-tone-0",
  "bg-tone-1",
  "bg-tone-2",
  "bg-tone-3",
  "bg-tone-4",
  "bg-tone-5",
] as const;

function TodayPage() {
  const { data, today, toggleTask, loaded } = useHabits();
  const tasks = activeTasks(data.tasks);
  const stats = dayStats(data, today);
  const log = data.logs[today];
  const streak = currentStreak(data);
  const best = bestStreak(data);

  const [celebrate, setCelebrate] = useState(false);
  const wasComplete = useRef(false);
  useEffect(() => {
    if (!loaded) return;
    if (stats.complete && !wasComplete.current) setCelebrate(true);
    if (!stats.complete) setCelebrate(false);
    wasComplete.current = stats.complete;
  }, [stats.complete, loaded]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-5">
      <Celebration active={celebrate} />

      <section className="rounded-3xl bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {dateLabel}
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-bold">
            {stats.total === 0
              ? "No habits yet"
              : stats.complete
                ? "Day complete"
                : `${stats.done} of ${stats.total} done`}
          </h1>
          <span className="font-display text-3xl font-bold text-primary">
            {Math.round(stats.rate * 100)}%
          </span>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-border/70">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(stats.rate * 100)}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2">
            <Flame className="size-4 text-primary" />
            <span className="font-semibold">{streak}</span>
            <span className="text-muted-foreground">current streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2">
            <Trophy className="size-4 text-primary" />
            <span className="font-semibold">{best}</span>
            <span className="text-muted-foreground">best streak</span>
          </div>
        </div>
      </section>

      {stats.complete && (
        <div className="flex items-center gap-3 rounded-3xl border border-success/40 bg-success/10 p-4 animate-pop-in">
          <PartyPopper className="size-5 text-success" />
          <p className="text-sm font-medium">
            Everything ticked off today. That's {streak} day{streak === 1 ? "" : "s"} in a row.
          </p>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center">
          <h2 className="font-display text-lg font-semibold">Start with one habit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your routines once — they come back every day, ready to tick off.
          </p>
          <Link
            to="/tasks"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Add a habit
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const done = !!log?.completed.includes(task.id);
            const category = data.categories.find((c) => c.id === task.categoryId);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  aria-pressed={done}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                    done
                      ? "border-primary/40 bg-primary/10"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className={cn("size-4", done && "animate-pop-in")} strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate font-medium",
                        done && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </span>
                    {task.note && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {task.note}
                      </span>
                    )}
                  </span>
                  {category && (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          TONE_CLASS[category.tone % TONE_CLASS.length],
                        )}
                      />
                      {category.name}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
