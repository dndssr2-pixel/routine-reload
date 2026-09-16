# Daily Habits Tracker

Build a daily recurring habit and task tracker web app designed to work seamlessly as an installable mobile PWA.

Key requirements:
1. Recurring Daily Tasks: Users add tasks/routines once (e.g. 'Morning workout', 'Read 20 pages', 'Drink 2L water'). Each day displays these tasks ready to be ticked off.
2. Daily Reset & History: Checkboxes are for the current day. When a new day begins, tasks are uncompleted for the new day while keeping full historical records of past completions, current streak, best streak, and daily completion rate.
3. Data Persistence (Never vanish on refresh/app reopen): Store all tasks, categories, and day-by-day completion logs durably in localStorage/IndexedDB so data never vanishes on refresh or when opened as an installed web app. Include a backup JSON export and import feature.
4. PWA & Mobile-First Experience: Configure web app manifest, icons, and viewport settings so it can be installed ('Add to Home Screen') and used like a native app with offline capabilities.
5. Polished, Focused Interface: Clean, minimal design with dark and light themes, progress bar for today's completion, streak counter, celebratory feedback when all tasks are done, and easy reordering or editing of tasks.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://routine-reload.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5bcb0bc3-b384-45e1-af0c-67bce526e8cc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
