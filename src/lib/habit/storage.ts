import { get, set } from "idb-keyval";
import type { AppData } from "./types";
import { emptyData } from "./types";

const KEY = "streak-data-v1";

/** IndexedDB first, localStorage as a fallback and as a redundant copy. */
export async function loadData(): Promise<AppData | null> {
  let fromIdb: AppData | null = null;
  try {
    fromIdb = ((await get<AppData>(KEY)) as AppData | undefined) ?? null;
  } catch {
    fromIdb = null;
  }
  if (fromIdb) return normalize(fromIdb);

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw) as AppData);
  } catch {
    /* ignore */
  }
  return null;
}

export async function saveData(data: AppData): Promise<void> {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
  try {
    await set(KEY, data);
  } catch {
    /* ignore */
  }
}

export function normalize(input: unknown): AppData {
  const base = emptyData();
  if (!input || typeof input !== "object") return base;
  const raw = input as Partial<AppData>;
  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks
        .filter((t) => t && typeof t.id === "string" && typeof t.title === "string")
        .map((t, i) => ({
          id: t.id,
          title: t.title,
          note: typeof t.note === "string" ? t.note : "",
          categoryId: typeof t.categoryId === "string" ? t.categoryId : null,
          sortOrder: typeof t.sortOrder === "number" ? t.sortOrder : i,
          createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
          archivedAt: typeof t.archivedAt === "string" ? t.archivedAt : null,
        }))
    : [];
  const categories = Array.isArray(raw.categories)
    ? raw.categories
        .filter((c) => c && typeof c.id === "string" && typeof c.name === "string")
        .map((c) => ({ id: c.id, name: c.name, tone: typeof c.tone === "number" ? c.tone : 0 }))
    : [];
  const logs: AppData["logs"] = {};
  if (raw.logs && typeof raw.logs === "object") {
    for (const [date, log] of Object.entries(raw.logs)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !log) continue;
      logs[date] = {
        date,
        completed: Array.isArray(log.completed) ? log.completed.filter((x) => typeof x === "string") : [],
        scheduled: Array.isArray(log.scheduled) ? log.scheduled.filter((x) => typeof x === "string") : [],
      };
    }
  }
  const theme =
    raw.theme === "light" || raw.theme === "dark" || raw.theme === "system" ? raw.theme : "system";
  return { version: 1, tasks, categories, logs, theme };
}

export function isValidBackup(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const raw = input as Partial<AppData>;
  return Array.isArray(raw.tasks) || (!!raw.logs && typeof raw.logs === "object");
}

export function mergeData(current: AppData, incoming: AppData): AppData {
  const categories = [...current.categories];
  for (const c of incoming.categories) {
    if (!categories.some((x) => x.id === c.id)) categories.push(c);
  }
  const tasks = [...current.tasks];
  for (const t of incoming.tasks) {
    if (!tasks.some((x) => x.id === t.id)) tasks.push({ ...t, sortOrder: tasks.length });
  }
  const logs: AppData["logs"] = { ...current.logs };
  for (const [date, log] of Object.entries(incoming.logs)) {
    const existing = logs[date];
    logs[date] = existing
      ? {
          date,
          completed: Array.from(new Set([...existing.completed, ...log.completed])),
          scheduled: Array.from(new Set([...existing.scheduled, ...log.scheduled])),
        }
      : log;
  }
  return { version: 1, tasks, categories, logs, theme: current.theme };
}
