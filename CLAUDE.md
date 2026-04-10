Erstelle eine vollständige Electron App namens "Discord Custom RPC Manager"
als Open Source Projekt — kostenlos, öffentlich zugänglich für jeden.

## Projekt Info
- Name: Discord Custom RPC Manager
- GitHub: Open Source (MIT License)
- Web: https://xsaitox.dev/discord-customrpc
- Dev: http://localhost:7000
- Zielgruppe: Alle Discord Nutzer, Anfänger bis Profi
- Sprache: UI Englisch, Code-Kommentare Englisch

---

## Tech Stack
- Electron (Desktop Shell)
- TypeScript (strikt, überall)
- React 18 (Frontend)
- TailwindCSS v4 (Styling)
- shadcn/ui (Basis-Komponenten)
- Vite + electron-vite (Bundler)
- discord-rpc (npm, offizielle RPC Verbindung)
- Drizzle ORM + better-sqlite3 (Datenbank)
- electron-store (Settings/Config)
- electron-builder (.exe, .deb, .dmg)
- electron-updater (Auto-Updates via GitHub Releases)

---

## Projektstruktur

discord-custom-rpc/
├── .github/
│   ├── workflows/
│   │   ├── build.yml           # CI/CD Build auf Release Tag
│   │   └── release.yml         # Auto GitHub Release
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── src/
│   ├── main/                   # Electron Main Process (TypeScript)
│   │   ├── index.ts            # Entry Point
│   │   ├── tray.ts             # System Tray
│   │   ├── updater.ts          # Auto Updater
│   │   ├── deeplink.ts         # discordrpc:// Deep Links
│   │   └── ipc/                # IPC Handler
│   │       ├── profiles.ts
│   │       ├── rpc.ts
│   │       └── settings.ts
│   ├── preload/
│   │   └── index.ts            # Preload Script
│   ├── renderer/               # React Frontend
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui Basis-Komponenten
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   ├── ProfileEditor.tsx
│   │   │   │   ├── ProfileList.tsx
│   │   │   │   └── ProfileShare.tsx
│   │   │   ├── rpc/
│   │   │   │   ├── RPCPreview.tsx     # Discord Look-alike Preview
│   │   │   │   ├── RPCStatus.tsx
│   │   │   │   └── RPCControls.tsx
│   │   │   ├── onboarding/
│   │   │   │   ├── Welcome.tsx
│   │   │   │   └── Steps.tsx
│   │   │   └── settings/
│   │   │       ├── ThemeSelector.tsx
│   │   │       └── SettingsPanel.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Profiles.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── About.tsx
│   │   ├── hooks/
│   │   │   ├── useRPC.ts
│   │   │   ├── useProfiles.ts
│   │   │   └── useTheme.ts
│   │   ├── store/
│   │   │   ├── profileStore.ts    # Zustand Store
│   │   │   └── rpcStore.ts
│   │   ├── types/
│   │   │   ├── profile.ts
│   │   │   └── rpc.ts
│   │   └── styles/
│   │       ├── globals.css        # Tailwind Base
│   │       └── themes/
│   │           ├── default.css
│   │           ├── dark.css
│   │           ├── light.css
│   │           ├── space.css
│   │           ├── anime.css
│   │           ├── kawaii.css
│   │           └── dev.css
│   └── db/
│       ├── schema.ts              # Drizzle Schema
│       ├── migrations/
│       └── queries/
│           ├── profiles.ts
│           └── settings.ts
├── landing/                       # Statische Landing Page
│   ├── index.html
│   ├── css/
│   └── js/
├── assets/
│   ├── icon.png                   # 512x512
│   ├── tray-active.png            # 32x32
│   ├── tray-inactive.png          # 32x32
│   └── screenshots/
├── locales/
│   └── en.json                    # i18n vorbereitet
├── CONTRIBUTING.md
├── LICENSE                        # MIT
├── CHANGELOG.md
├── README.md
├── electron-builder.config.ts
├── electron.vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── package.json

---

## Themes

Implementiere ein Theme-System mit CSS Custom Properties.
Jedes Theme wird als eigene CSS Datei unter src/renderer/styles/themes/ angelegt.
Ein ThemeProvider in React wrapped die gesamte App und setzt das Theme via
data-theme Attribut auf dem Root Element. electron-store speichert die Auswahl.

Themes:

### Default
- Accent: #5865F2 (Discord Blurple)
- Background: #0a0a14
- Cards: rgba(255,255,255,0.05)
- Border: rgba(255,255,255,0.08)
- Glassmorphism mit backdrop-filter: blur(12px)

### Dark
- Accent: #7289DA
- Background: #0d0d0d
- Ultra dark, minimalistisch
- Subtile Glassmorphism

### Light
- Accent: #5865F2
- Background: #f5f5f5
- Cards: rgba(255,255,255,0.8)
- Soft Glassmorphism

### Space
- Accent: #a78bfa (Lila)
- Background: #0a0015
- Animated Starfield Background (Canvas oder CSS)
- Nebula Farbtöne: Lila, Cyan, Deep Blue
- Cards mit kosmischem Glow-Effekt

### Anime
- Accent: #ff6b9d (Pink)
- Background: #1a0a2e
- Vibrant: Pink, Purple, Neon Cyan
- Sakura Petal Partikel (subtle, CSS Animation)
- Leuchtende Neon-Borders

### Kawaii
- Accent: #ff9de2 (Soft Pink)
- Background: #fff0f8
- Farben: Rosa, Mint, Lavender, Peach
- Runde Formen (border-radius: 24px+)
- Soft Schatten statt harte Glassmorphism
- Kawaii Emoji Akzente (✨🌸💖)

### Dev
- Accent: #00ff41 (Matrix Grün)
- Background: #0d0d0d
- Font: JetBrains Mono / Fira Code (Monospace)
- Terminal-Look: Grüner Text auf Schwarz
- Scanline Overlay (CSS)
- ASCII Art Akzente

---

## Features

### Onboarding
- Welcome Screen beim ersten Start
- 3-Schritt Anleitung:
  1. Discord Desktop App öffnen
  2. Discord Developer Portal → New Application → ID kopieren
  3. Erstes Profil erstellen & aktivieren
- Interaktive Schritt-für-Schritt UI mit Fortschrittsanzeige
- "Skip" und "Don't show again" Option
- Help Button immer sichtbar in der App

### Profile Management
Jedes Profil hat folgende TypeScript Type Definition:

interface RPCProfile {
  id: string;                    // UUID
  name: string;                  // Interner Profilname
  applicationId: string;         // Discord App ID
  details?: string;              // Zeile 1
  state?: string;                // Zeile 2
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  button1Label?: string;
  button1Url?: string;
  button2Label?: string;
  button2Url?: string;
  partySize?: number;
  partyMax?: number;
  showElapsedTime: boolean;
  createdAt: Date;
  updatedAt: Date;
}

- Profile erstellen, bearbeiten, löschen, duplizieren
- Drag & Drop Sortierung (dnd-kit)
- Suchfunktion in der Profil-Liste
- JSON Export (einzeln + alle)
- JSON Import
- Share Link via Base64 URL Encoding:
  https://xsaitox.dev/discord-customrpc/share?data=BASE64
  → Andere können direkt importieren

### RPC Steuerung
- "Activate" Button pro Profil → startet discord-rpc Verbindung
- "Deactivate" → stoppt RPC
- Live Status Badge: Connected (grün) / Disconnected (grau) / Error (rot)
- Automatischer Reconnect wenn Discord neustartet
- Cooldown Hinweis: Discord erlaubt Update nur alle 15 Sekunden
- Fehler sauber abfangen:
  - Discord nicht geöffnet
  - Falsche Application ID
  - RPC Verbindung unterbrochen

### Live Preview
- Simulierter Discord Profil-Block (exakter Discord UI Look)
- Echtzeit Update während der Eingabe (debounced, 300ms)
- Zeigt: Avatar Placeholder, Username Placeholder,
  Details, State, Large/Small Image, Buttons, Elapsed Time
- Dark Preview immer, unabhängig vom gewählten App-Theme

### Electron Features
- System Tray:
  - Icon wechselt: aktiv (grün) / inaktiv (grau)
  - Kontextmenü: Open App, aktives Profil anzeigen, RPC Stop, Quit
- Fenster minimiert in Tray (nicht taskbar close)
- Auto-Updater (electron-updater + GitHub Releases)
  - Update verfügbar → Toast Notification
  - "Download & Install" Button in Settings
- Deep Link: discordrpc://import?data=BASE64
  → Öffnet App und importiert Profil direkt
- Keyboard Shortcuts:
  - Ctrl+N → Neues Profil
  - Ctrl+S → Speichern
  - Ctrl+, → Settings öffnen
  - Ctrl+W → Minimieren

### Settings
Gespeichert via electron-store (TypeScript typed):

interface AppSettings {
  theme: 'default' | 'dark' | 'light' | 'space' | 'anime' | 'kawaii' | 'dev';
  language: 'en';                // i18n vorbereitet
  minimizeToTray: boolean;
  startMinimized: boolean;
  autostart: boolean;
  updateChannel: 'stable' | 'beta';
  showOnboarding: boolean;
}

- Theme Selector mit Live Preview der Farben
- Minimize to Tray Toggle
- Start Minimized Toggle
- Autostart mit System
- Update Channel (Stable / Beta)
- Export all Profiles (Backup .json)
- Import Profiles (Restore)
- Reset all Settings
- App Version + "Check for Updates" Button
- Changelog Link → GitHub Releases
- Link zum Discord Developer Portal

---

## Drizzle Schema

// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  applicationId: text('application_id').notNull(),
  details: text('details'),
  state: text('state'),
  largeImageKey: text('large_image_key'),
  largeImageText: text('large_image_text'),
  smallImageKey: text('small_image_key'),
  smallImageText: text('small_image_text'),
  button1Label: text('button1_label'),
  button1Url: text('button1_url'),
  button2Label: text('button2_label'),
  button2Url: text('button2_url'),
  partySize: integer('party_size'),
  partyMax: integer('party_max'),
  showElapsedTime: integer('show_elapsed_time', { mode: 'boolean' })
    .notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

---

## IPC Channels (Main ↔ Renderer)

// Profiles
'profiles:getAll'     → RPCProfile[]
'profiles:create'     → RPCProfile
'profiles:update'     → RPCProfile
'profiles:delete'     → void
'profiles:reorder'    → void

// RPC
'rpc:start'           → { success: boolean, error?: string }
'rpc:stop'            → void
'rpc:status'          → 'connected' | 'disconnected' | 'error'

// Settings
'settings:get'        → AppSettings
'settings:set'        → void

// Updater
'updater:check'       → void
'updater:status'      → UpdateStatus

---

## State Management (Zustand)

Nutze Zustand für globalen React State:
- profileStore: Profile Liste, aktives Profil, Loading States
- rpcStore: RPC Status, aktive Application ID, Fehler
- settingsStore: Theme, App Settings (sync mit electron-store via IPC)
- uiStore: Sidebar collapsed, aktive Seite, Toast Queue

---

## Landing Page (landing/index.html)

Statische HTML/CSS/JS Seite für xsaitox.dev/discord-customrpc:

Sektionen:
1. Hero: "Your Discord, Your Style" + Download Buttons + GitHub Star
2. Theme Showcase: Animierter Preview aller 7 Themes
3. Features: Icon Grid mit allen Features
4. How it Works: 3-Schritt Anleitung mit Screenshots
5. Share Profiles: Erklärung des Share-Link Features
6. FAQ:
   - "Is this safe?" → Open Source, kein Token, nur offizielle Discord IPC
   - "Do I need coding skills?" → Nein
   - "Is this against Discord ToS?" → Nein, RPC ist offiziell supported
   - "Does it work on Mac?" → Ja, .dmg verfügbar
7. Download Section: .exe / .deb / .dmg mit Versionsnummer
8. Footer: GitHub, MIT License, Made by XSaitoKungX

Share Viewer Route:
/discord-customrpc/share?data=BASE64
→ Zeigt Profil-Preview + "Open in App" Button (Deep Link)
→ "Import via Web" Fallback (JSON Download)

---

## GitHub Actions (build.yml)

Trigger: Push auf Tag v*.*.*

Jobs:
- build-windows: electron-builder → .exe (NSIS + Portable)
- build-linux: electron-builder → .deb
- build-mac: electron-builder → .dmg
- release: Alle Artifacts als GitHub Release hochladen
  inkl. latest.yml für electron-updater

---

## Sicherheit

- Kein Discord Token wird jemals benötigt oder gespeichert
- Alle Daten lokal in SQLite
- Keine externe Netzwerkkommunikation außer:
  - discord-rpc (lokale IPC zu Discord)
  - electron-updater (GitHub Releases API)
- contextIsolation: true
- nodeIntegration: false
- Alle IPC Channels in preload.ts exposed (kein direkter Node Zugriff)
- Klar kommuniziert in README, Landing Page und About Screen

---

## package.json Scripts

"dev"           → electron-vite dev (Hot Reload)
"build"         → electron-vite build
"preview"       → electron-vite preview
"build:win"     → electron-builder --win
"build:linux"   → electron-builder --linux
"build:mac"     → electron-builder --mac
"build:all"     → electron-builder --win --linux --mac
"db:generate"   → drizzle-kit generate
"db:migrate"    → drizzle-kit migrate
"db:studio"     → drizzle-kit studio
"lint"          → eslint src --ext .ts,.tsx
"typecheck"     → tsc --noEmit
"release"       → npm run build:all && release script

---

## README.md

Muss enthalten:
- Project Banner (1200x300) Glassmorphism Style
- Badges: Version, MIT License, Platform, Stars, Downloads
- Theme Preview GIF/Screenshot Grid (alle 7 Themes)
- Feature Liste mit Icons
- Quick Start (Download + From Source)
- How to use (mit Screenshots)
- Share Profile Feature Erklärung
- Contributing Guide
- Security Policy
- FAQ
- License (MIT)
- Made with ❤️ by XSaitoKungX

---

## Code Qualität

- Strict TypeScript (tsconfig strict: true)
- ESLint + Prettier konfiguriert
- Alle Komponenten als funktionale React Komponenten mit Typen
- Custom Hooks für alle Logik (kein Logic in Components)
- Kein any Type erlaubt
- Alle Fehler gehandelt und dem User angezeigt
- Code Kommentare auf Englisch
- Komponenten maximal 150 Zeilen (aufteilen wenn größer)

---

## Zusatz-Hinweise

moderne Icons von React verwenden anstatt von Emojis
zustand          → State Management
dnd-kit          → Drag & Drop
react-router-dom → Navigation
react-hot-toast  → Toast Notifications
date-fns         → Datum Formatierung
clsx             → Conditional Classes (shadcn standard)