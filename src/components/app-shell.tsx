import { Link } from "@tanstack/react-router";
import { CalendarDays, Flame, ListChecks, Settings, SquareCheckBig } from "lucide-react";
import type { ReactNode } from "react";
import { useHabits } from "@/lib/habit/store";
import { currentStreak } from "@/lib/habit/stats";

const NAV = [
  { to: "/", label: "Today", icon: SquareCheckBig },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/history", label: "History", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data, today } = useHabits();
  const streak = currentStreak(data);
  void today;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            Streak
          </Link>
          <div className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold">
            <Flame className="size-4 text-primary" />
            <span>{streak}</span>
            <span className="text-muted-foreground font-normal">day{streak === 1 ? "" : "s"}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-5 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex w-full max-w-2xl items-stretch">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
