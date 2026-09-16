export type Category = {
  id: string;
  name: string;
  /** Accent hue index 0-5, mapped to design tokens in the UI. */
  tone: number;
};

export type Task = {
  id: string;
  title: string;
  note: string;
  categoryId: string | null;
  sortOrder: number;
  createdAt: string;
  archivedAt: string | null;
};

export type DayLog = {
  /** Local calendar date, YYYY-MM-DD */
  date: string;
  /** Task ids ticked off on that day */
  completed: string[];
  /** Snapshot of the task ids that were scheduled that day */
  scheduled: string[];
};

export type ThemePreference = "light" | "dark" | "system";

export type AppData = {
  version: 1;
  tasks: Task[];
  categories: Category[];
  logs: Record<string, DayLog>;
  theme: ThemePreference;
};

export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyData = (): AppData => ({
  version: 1,
  tasks: [],
  categories: [],
  logs: {},
  theme: "system",
});

export function starterData(): AppData {
  const now = new Date().toISOString();
  const health: Category = { id: createId(), name: "Health", tone: 0 };
  const mind: Category = { id: createId(), name: "Mind", tone: 2 };
  const titles: Array<[string, Category, string]> = [
    ["Morning workout", health, "20 minutes, anything counts"],
    ["Drink 2L water", health, ""],
    ["Read 20 pages", mind, ""],
    ["Plan tomorrow", mind, "Three priorities, no more"],
  ];
  return {
    version: 1,
    categories: [health, mind],
    tasks: titles.map(([title, cat, note], i) => ({
      id: createId(),
      title,
      note,
      categoryId: cat.id,
      sortOrder: i,
      createdAt: now,
      archivedAt: null,
    })),
    logs: {},
    theme: "system",
  };
}
