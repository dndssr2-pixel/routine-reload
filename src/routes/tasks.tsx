import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArchiveRestore, ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useHabits } from "@/lib/habit/store";
import { activeTasks } from "@/lib/habit/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Manage habits — Streak" },
      {
        name: "description",
        content:
          "Add, rename, reorder, categorise or archive your daily habits. History is always kept.",
      },
      { property: "og:title", content: "Manage habits — Streak" },
      {
        property: "og:description",
        content: "Add, edit, reorder and archive the routines you track every day.",
      },
    ],
  }),
  component: TasksPage,
});

const TONE_CLASS = [
  "bg-tone-0",
  "bg-tone-1",
  "bg-tone-2",
  "bg-tone-3",
  "bg-tone-4",
  "bg-tone-5",
] as const;

function TasksPage() {
  const {
    data,
    addTask,
    updateTask,
    deleteTask,
    setArchived,
    moveTask,
    addCategory,
    deleteCategory,
  } = useHabits();
  const tasks = activeTasks(data.tasks);
  const archived = data.tasks.filter((t) => t.archivedAt);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title, note, categoryId });
    setTitle("");
    setNote("");
    toast.success("Habit added");
  };

  const inputClass =
    "w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Your habits</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Added once, shown every day. Editing never changes past days.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-2 rounded-3xl bg-surface p-4">
        <input
          className={inputClass}
          placeholder="New habit, e.g. Morning workout"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
        <input
          className={inputClass}
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={120}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              categoryId === null ? "bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            No category
          </button>
          {data.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                categoryId === c.id ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              <span className={cn("size-2 rounded-full", TONE_CLASS[c.tone % TONE_CLASS.length])} />
              {c.name}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          disabled={!title.trim()}
        >
          <Plus className="size-4" /> Add habit
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task, index) => {
          const category = data.categories.find((c) => c.id === task.categoryId);
          const editing = editingId === task.id;
          return (
            <li key={task.id} className="rounded-2xl border border-border bg-card p-3">
              {editing ? (
                <div className="space-y-2">
                  <input
                    className={inputClass}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={80}
                  />
                  <input
                    className={inputClass}
                    value={editNote}
                    placeholder="Note"
                    onChange={(e) => setEditNote(e.target.value)}
                    maxLength={120}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateTask(task.id, { categoryId: null })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs",
                        task.categoryId === null
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface",
                      )}
                    >
                      None
                    </button>
                    {data.categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateTask(task.id, { categoryId: c.id })}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs",
                          task.categoryId === c.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editTitle.trim())
                          updateTask(task.id, { title: editTitle.trim(), note: editNote.trim() });
                        setEditingId(null);
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      <Check className="size-4" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center justify-center rounded-2xl bg-surface px-4 py-2 text-sm"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label={`Move ${task.title} up`}
                      disabled={index === 0}
                      onClick={() => moveTask(task.id, -1)}
                      className="rounded-lg p-1 text-muted-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${task.title} down`}
                      disabled={index === tasks.length - 1}
                      onClick={() => moveTask(task.id, 1)}
                      className="rounded-lg p-1 text-muted-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {category ? category.name : "No category"}
                      {task.note ? ` · ${task.note}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Edit ${task.title}`}
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                      setEditNote(task.note);
                    }}
                    className="rounded-xl p-2 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Archive ${task.title}`}
                    onClick={() => {
                      setArchived(task.id, true);
                      toast("Archived — history kept");
                    }}
                    className="rounded-xl p-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArchiveRestore className="size-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {archived.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Archived</h2>
          <ul className="space-y-2">
            {archived.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2 rounded-2xl bg-surface p-3 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{task.title}</span>
                <button
                  type="button"
                  onClick={() => setArchived(task.id, false)}
                  className="rounded-full bg-card px-3 py-1.5 text-xs font-medium"
                >
                  Restore
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => deleteTask(task.id)}
                  className="rounded-xl p-2 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3 rounded-3xl bg-surface p-4">
        <h2 className="font-display text-lg font-semibold">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {data.categories.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs"
            >
              <span className={cn("size-2 rounded-full", TONE_CLASS[c.tone % TONE_CLASS.length])} />
              {c.name}
              <button
                type="button"
                aria-label={`Delete category ${c.name}`}
                onClick={() => deleteCategory(c.id)}
                className="text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          {data.categories.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          )}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newCategory.trim()) return;
            addCategory(newCategory);
            setNewCategory("");
          }}
        >
          <input
            className={inputClass}
            placeholder="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            maxLength={24}
          />
          <button
            type="submit"
            className="rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            disabled={!newCategory.trim()}
          >
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
