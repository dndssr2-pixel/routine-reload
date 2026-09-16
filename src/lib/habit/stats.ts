import type { AppData, DayLog, Task } from "./types";

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function shiftDays(key: string, delta: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

export function activeTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);
}

export type DayStats = { done: number; total: number; rate: number; complete: boolean };

export function dayStats(data: AppData, date: string): DayStats {
  const isToday = date === todayKey();
  const log: DayLog | undefined = data.logs[date];
  const scheduledIds = isToday
    ? activeTasks(data.tasks).map((t) => t.id)
    : (log?.scheduled ?? []);
  const total = scheduledIds.length;
  const done = scheduledIds.filter((id) => log?.completed.includes(id)).length;
  return {
    done,
    total,
    rate: total === 0 ? 0 : done / total,
    complete: total > 0 && done === total,
  };
}

/** All dates that have a record, plus today, oldest first. */
export function trackedDates(data: AppData): string[] {
  const keys = new Set(Object.keys(data.logs));
  keys.add(todayKey());
  return Array.from(keys).sort();
}

export function currentStreak(data: AppData): number {
  const today = todayKey();
  let cursor = dayStats(data, today).complete ? today : shiftDays(today, -1);
  let streak = 0;
  // Cap the walk so a corrupted record can never loop forever.
  for (let i = 0; i < 3650; i++) {
    if (!dayStats(data, cursor).complete) break;
    streak++;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(data: AppData): number {
  const dates = trackedDates(data);
  if (dates.length === 0) return 0;
  let best = 0;
  let run = 0;
  let cursor = dates[0];
  const last = dates[dates.length - 1];
  for (let i = 0; i < 3650; i++) {
    if (dayStats(data, cursor).complete) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
    if (cursor === last) break;
    cursor = shiftDays(cursor, 1);
  }
  return best;
}

export function completionRate(data: AppData, days = 30): number {
  const today = todayKey();
  let done = 0;
  let total = 0;
  for (let i = 0; i < days; i++) {
    const s = dayStats(data, shiftDays(today, -i));
    done += s.done;
    total += s.total;
  }
  return total === 0 ? 0 : done / total;
}

export function daysCompleted(data: AppData): number {
  return trackedDates(data).filter((d) => dayStats(data, d).complete).length;
}
