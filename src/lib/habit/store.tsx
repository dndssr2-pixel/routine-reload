import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadData, saveData, normalize, mergeData } from "./storage";
import { activeTasks, todayKey } from "./stats";
import { createId, starterData, type AppData, type Task, type ThemePreference } from "./types";

type Store = {
  data: AppData;
  loaded: boolean;
  today: string;
  toggleTask: (taskId: string) => void;
  addTask: (input: { title: string; note?: string; categoryId: string | null }) => void;
  updateTask: (id: string, patch: Partial<Pick<Task, "title" | "note" | "categoryId">>) => void;
  deleteTask: (id: string) => void;
  setArchived: (id: string, archived: boolean) => void;
  moveTask: (id: string, direction: -1 | 1) => void;
  reorderTasks: (orderedIds: string[]) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  setTheme: (theme: ThemePreference) => void;
  replaceAll: (incoming: unknown) => void;
  mergeAll: (incoming: unknown) => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function HabitStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => starterData());
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(() => todayKey());
  const dirty = useRef(false);

  // Load persisted data once on the client.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadData();
      if (cancelled) return;
      if (stored) setData(stored);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist after every change (once initial load has settled).
  useEffect(() => {
    if (!loaded || !dirty.current) return;
    void saveData(data);
  }, [data, loaded]);

  // Roll over to the new day without a refresh.
  useEffect(() => {
    const check = () => setToday(todayKey());
    const timer = window.setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    dirty.current = true;
    setData((prev) => fn(prev));
  }, []);

  const value = useMemo<Store>(() => {
    const withOrder = (tasks: Task[]) =>
      tasks
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((t, i) => ({ ...t, sortOrder: i }));

    return {
      data,
      loaded,
      today,
      toggleTask: (taskId) =>
        update((prev) => {
          const key = todayKey();
          const scheduled = activeTasks(prev.tasks).map((t) => t.id);
          const existing = prev.logs[key];
          const completed = existing?.completed ?? [];
          const next = completed.includes(taskId)
            ? completed.filter((id) => id !== taskId)
            : [...completed, taskId];
          return {
            ...prev,
            logs: { ...prev.logs, [key]: { date: key, completed: next, scheduled } },
          };
        }),
      addTask: ({ title, note = "", categoryId }) =>
        update((prev) => ({
          ...prev,
          tasks: [
            ...prev.tasks,
            {
              id: createId(),
              title: title.trim(),
              note: note.trim(),
              categoryId,
              sortOrder: prev.tasks.length,
              createdAt: new Date().toISOString(),
              archivedAt: null,
            },
          ],
        })),
      updateTask: (id, patch) =>
        update((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) =>
        update((prev) => ({
          ...prev,
          tasks: withOrder(prev.tasks.filter((t) => t.id !== id)),
        })),
      setArchived: (id, archived) =>
        update((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === id ? { ...t, archivedAt: archived ? new Date().toISOString() : null } : t,
          ),
        })),
      moveTask: (id, direction) =>
        update((prev) => {
          const ordered = withOrder(prev.tasks.filter((t) => !t.archivedAt));
          const index = ordered.findIndex((t) => t.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= ordered.length) return prev;
          const next = ordered.slice();
          const a = next[index]!;
          const b = next[target]!;
          next[index] = b;
          next[target] = a;
          const orderMap = new Map(next.map((t, i) => [t.id, i]));
          return {
            ...prev,
            tasks: prev.tasks.map((t) =>
              orderMap.has(t.id) ? { ...t, sortOrder: orderMap.get(t.id)! } : t,
            ),
          };
        }),
      reorderTasks: (orderedIds) =>
        update((prev) => {
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
          return {
            ...prev,
            tasks: prev.tasks.map((t) =>
              orderMap.has(t.id) ? { ...t, sortOrder: orderMap.get(t.id)! } : t,
            ),
          };
        }),
      addCategory: (name) =>
        update((prev) => ({
          ...prev,
          categories: [
            ...prev.categories,
            { id: createId(), name: name.trim(), tone: prev.categories.length % 6 },
          ],
        })),
      deleteCategory: (id) =>
        update((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c.id !== id),
          tasks: prev.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)),
        })),
      setTheme: (theme) => update((prev) => ({ ...prev, theme })),
      replaceAll: (incoming) =>
        update((prev) => ({ ...normalize(incoming), theme: prev.theme })),
      mergeAll: (incoming) => update((prev) => mergeData(prev, normalize(incoming))),
      resetAll: () => update((prev) => ({ ...starterData(), theme: prev.theme })),
    };
  }, [data, loaded, today, update]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useHabits(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useHabits must be used inside HabitStoreProvider");
  return ctx;
}
