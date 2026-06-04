# AGENTS.md

Guidance for AI coding agents working in the **Discord Custom RPC Manager** repository.
This file follows the [agents.md](https://agents.md/) convention.

## Project overview

Discord Custom RPC Manager is a cross-platform desktop application that lets users
create, manage, and activate custom Discord Rich Presence profiles. It is open
source (MIT) and free.

- **Type:** Electron desktop app (Windows, macOS, Linux)
- **Current version:** `2.0.0`
- **Author:** XSaitoKungX — https://xsaitox.dev

## Tech stack

- **Runtime / shell:** Electron 41
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Radix UI, shadcn-style components
- **State:** Zustand
- **Routing:** `react-router-dom` (hash router)
- **Backend (main process):** Node via Electron, `better-sqlite3`, `drizzle-orm`
- **Discord integration:** `discord-rpc`
- **Build tooling:** `electron-vite`, `electron-builder`
- **Package manager:** **Bun** (a `bun.lock` is committed — do not use npm/yarn/pnpm)

## Project structure

```
src/
  main/          Electron main process
    index.ts     App lifecycle, window, tray, shortcuts, deep links
    ipc/         IPC handlers: profiles.ts, rpc.ts, settings.ts
    tray.ts      System tray menu
    updater.ts   Auto-updater (electron-updater)
    deeplink.ts  discordrpc:// protocol handling
  preload/
    index.ts     contextBridge — exposes window.api to the renderer
  db/
    schema.ts    Drizzle schema (profiles table)
    index.ts     DB init + migrations
    migrations/  drizzle-kit generated migrations
    queries/     Query helpers
  renderer/
    index.html
    src/
      App.tsx        Router + Toaster + onboarding/deeplink wiring
      pages/         Home, Profiles, Settings, About
      components/    layout, profile, rpc, settings, onboarding
      store/         Zustand stores (profile, rpc, settings, ui)
      hooks/         React hooks (useTheme, useProfiles, ...)
      lib/           utils (cn, share encoding), electron helpers
      styles/        globals.css + themes/ (7 themes)
      types/         Shared renderer types
assets/            Icons and images
locales/           Localization files
```

## Setup & commands

Use Bun for everything.

```bash
bun install            # install dependencies
bun run dev            # rebuild native deps + start electron-vite dev (renderer port 7000)
bun run build:full     # generate DB migrations + production build
bun run build:win      # package for Windows
bun run build:linux    # package for Linux (deb, AppImage, rpm)
bun run build:mac      # package for macOS
```

Quality gates:

```bash
bun run lint           # eslint over src/
bun run typecheck      # tsc --noEmit
```

Database:

```bash
bun run db:generate    # generate migrations from src/db/schema.ts
bun run db:migrate     # apply migrations
bun run db:studio      # drizzle studio
```

## Coding conventions

- **Language:** TypeScript everywhere. `@typescript-eslint/no-explicit-any` is an
  **error** — never introduce `any`.
- **Formatting (Prettier):** no semicolons, single quotes, 2-space indent, no
  trailing commas, `printWidth` 100, always parenthesize arrow params.
- **Imports:** keep all imports at the top of the file.
- **Path aliases (renderer):** `@renderer` and `@` both resolve to `src/renderer/src`.
- **Comments:** do not add or remove comments unless explicitly requested.
- **Process boundaries:** the renderer must never access Node/Electron APIs
  directly. Add new capabilities via an IPC handler in `src/main/ipc/*` and
  expose them through `src/preload/index.ts` as `window.api.*`.
- **Database changes:** edit `src/db/schema.ts`, then run `bun run db:generate`
  to produce a migration. Do not hand-edit generated migrations.

## Validation before completing a task

Run and ensure both pass:

```bash
bun run typecheck
bun run lint
```

For native module issues (`better-sqlite3`), run `bun run prepare:native`.

## Architecture notes for agents

- IPC is the contract between processes. A renderer feature typically requires
  changes in three places: `src/main/ipc/<domain>.ts`, `src/preload/index.ts`,
  and the consuming Zustand store / component.
- Routing uses a **hash router** (`createHashRouter`) because the app loads from
  `file://` in production — keep that in mind for navigation.
- Single-instance lock is enforced; deep links arrive via `second-instance`
  (Windows/Linux) and `open-url` (macOS) and are dispatched through
  `handleDeepLink`.
- Theming is driven by CSS custom properties under `styles/themes/`; see
  `DESIGN.md` for tokens. Do not hardcode colors in components.

## Security

- Keep `contextIsolation: true`, `nodeIntegration: false`, and the preload
  bridge as the only renderer↔main channel.
- Never hardcode secrets/tokens. The app uses a user-supplied Discord
  Application ID — treat it as user data, not a secret to embed.

## Commit & PR conventions

- Commits follow **Conventional Commits** (`feat:`, `fix:`, `ci:`, `chore:`,
  `docs:`, etc.). The CHANGELOG is generated by `git-cliff` from commit history.
- Keep changes focused; ensure lint + typecheck pass before opening a PR.
