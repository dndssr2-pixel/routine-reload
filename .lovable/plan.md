# Daily Habit & Task Tracker (installable mobile app)

A focused daily checklist app: add your routines once, tick them off each day, and watch streaks build. Everything is saved on your device, so nothing disappears on refresh or when opened from your home screen.

## Screens

- **Today** (home): date header, progress ring/bar, streak counter, list of today's tasks grouped by category, tap-to-tick rows, celebration when everything is done.
- **Manage tasks**: add, edit, delete, reorder (drag or up/down), assign category, archive without losing history.
- **History**: calendar heatmap of past days, completion rate, current streak, best streak, and a day detail view.
- **Settings**: light/dark/system theme, export a backup file, import a backup file, install-app hint.

## How it works

- Tasks, categories, and per-day completion logs are stored locally on the device (IndexedDB, with a localStorage fallback) and loaded before the first paint of the list.
- A day is keyed by local calendar date. Opening the app on a new day shows a fresh, unticked list while every past day stays recorded. Days with no record count as incomplete, so streaks stay honest.
- Streaks: current streak = consecutive days ending today (or yesterday if today is unfinished) where every scheduled task was done. Best streak = longest such run ever. Daily completion rate = done / scheduled for that day.
- Editing a task never rewrites history; past days keep the tasks they had.
- Backup export writes a single JSON file with everything; import validates it and replaces or merges the current data after a confirmation prompt.

## Installable app + offline

- Web app manifest with app name, icons (192/512 + maskable + apple touch icon), standalone display, theme colors, and mobile viewport meta.
- Offline support via a generated service worker: page loads use network-first, hashed assets are cached. Registration is guarded so it never runs in the Lovable editor preview; offline behaviour applies to the published app.

## Look and feel

- Mobile-first single-column layout, large comfortable tap targets, bottom tab bar for Today / History / Settings.
- Semantic light and dark theme tokens (no hardcoded colours), one distinctive type and colour direction rather than default template styling.
- Motion: row tick springs, progress bar animates, confetti-style celebration once the day hits 100%.

## Technical notes

- TanStack Start routes: `/` (Today), `/tasks`, `/history`, `/settings`; head metadata per route.
- Local persistence layer in `src/lib/storage.ts` (idb-keyval) plus a typed data model (`Task`, `Category`, `DayLog`) and a store hook exposing today's state and mutations.
- Streak/rate math isolated in `src/lib/stats.ts` so it stays testable.
- Reordering via `sortOrder` integers; dnd through a lightweight pointer-based list, with keyboard-accessible move buttons.
- `vite-plugin-pwa` (`generateSW`, `autoUpdate`, `injectRegister: null`, `devOptions.enabled: false`) with a single guarded registration wrapper and a `?sw=off` kill switch.
- No backend or account needed; all data stays on the device.
