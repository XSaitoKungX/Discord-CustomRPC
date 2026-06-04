# DESIGN.md

Design system reference for **Discord Custom RPC Manager**. Structured per the
[Stitch design.md](https://stitch.withgoogle.com/docs/design-md/overview)
standard: vision, principles, foundations (color, typography, spacing, motion),
components, layout, and content guidelines. This is the single source of truth
for visual decisions — do not hardcode design values that belong here.

## 1. Product vision

A focused, modern desktop tool that makes building Discord Rich Presence feel
effortless. The UI prioritizes a fast create → preview → activate loop, with a
live preview that matches what Discord actually renders. The experience should
feel polished, calm, and "developer-grade" while staying approachable for
non-technical users.

## 2. Design principles

- **Preview-first.** Users should always see the result of their changes; the
  live RPC preview is a primary surface, not an afterthought.
- **Calm by default, expressive on demand.** The default theme is restrained and
  dark; playful themes (Anime, Kawaii, Space, Dev) let users opt into personality.
- **Token-driven.** All color and radius come from CSS custom properties so every
  theme stays consistent. Never hardcode hex values in components.
- **Native-feeling.** Respect platform conventions (tray, title bar, shortcuts);
  the app should feel like a desktop app, not a website in a window.
- **Low friction.** Onboarding, sensible defaults, and inline guidance over
  documentation.

## 3. Foundations

### 3.1 Color

Colors are defined as HSL channel triplets in CSS custom properties under
`src/renderer/src/styles/themes/`, consumed through Tailwind v4 `@theme inline`
tokens (`--color-background`, `--color-primary`, etc.) in `styles/globals.css`.

Semantic tokens (each theme provides all of them):

- `--background` / `--foreground` — app surface and primary text.
- `--card` / `--card-foreground` — elevated panels and their text.
- `--primary` / `--primary-foreground` — primary actions / brand accent.
- `--secondary` / `--secondary-foreground` — secondary surfaces.
- `--muted` / `--muted-foreground` — subtle backgrounds and secondary text.
- `--accent` / `--accent-foreground` — highlights (often equals primary).
- `--destructive` / `--destructive-foreground` — dangerous actions.
- `--border`, `--input`, `--ring` — outlines, fields, focus rings.
- `--color-bg` — raw body background hex; `--accent-color` — raw accent hex used
  by glow/animation effects.

Tailwind utility usage: `bg-background`, `text-foreground`, `bg-card`,
`text-primary`, `border-border`, `ring-ring`, etc. Always go through these tokens.

### 3.2 Themes

Seven themes ship in `styles/themes/`, selected via a `data-theme` attribute on
the root (managed by `hooks/useTheme`):

- **default** — Discord-blurple dark (`#5865F2` accent, `--radius: 0.75rem`).
- **dark** — neutral dark variant.
- **light** — light surface (`#f5f5f5` bg, blurple accent).
- **space** — deep purple with starfield gradients and glow (`#a78bfa`,
  `--radius: 0.875rem`).
- **anime** — vibrant, playful palette.
- **kawaii** — soft pastel palette.
- **dev** — terminal aesthetic: black bg, neon green (`#00ff41`), monospace font,
  scanline overlay, sharp corners (`--radius: 0.25rem`).

When adding a theme, define **every** semantic token plus `--color-bg`,
`--accent-color`, and `--radius`, then import it in `globals.css`. Match the
token contract so all components render correctly.

### 3.3 Typography

- **UI font:** system stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI',
  Roboto, sans-serif`.
- **Monospace:** `--font-mono` = `'JetBrains Mono', 'Fira Code', 'Consolas',
  monospace`. The Dev theme forces monospace globally.
- Use weight and `--muted-foreground` (not custom colors) to establish hierarchy.

### 3.4 Shape & elevation

- Corner radius derives from `--radius`; use Tailwind radius tokens
  (`rounded-lg` = `--radius`, `rounded-md`, `rounded-sm`, `rounded-xl`).
- Elevated/glass panels use translucent `bg-card/30`–`bg-card/50` with
  `backdrop-filter: blur()`; the exact treatment is theme-specific (defined in
  each theme file). Prefer these existing utilities over inventing new surfaces.
- Custom scrollbars are 6px, themed via `--border` / `--muted-foreground`.

### 3.5 Motion

Defined as `@theme` animation tokens in `globals.css`:

- `--animate-float` — gentle 3s vertical float (decorative).
- `--animate-pulse-glow` — 2s glowing pulse using `--accent-color` (active state).
- `--animate-scanline` — 8s linear scanline (Dev theme ambiance).
- `--animate-accordion-down/up` — 0.2s ease-out for expanding content.

Keep motion subtle and purposeful; reserve glow/pulse for "active RPC" feedback.

## 4. Layout

- App shell: fixed full-height window, `overflow: hidden` on `html/body/#root`.
- Window chrome: default frame, auto-hidden menu bar; on macOS uses
  `hiddenInset` title bar. Window background `#0a0a14`, min size 900×600,
  default 1200×780.
- Primary layout (`components/layout/`): persistent **Sidebar** (navigation) +
  **Topbar** + routed content via `Layout.tsx`.
- Pages (`pages/`): `Home`, `Profiles`, `Settings`, `About`.
- Navigation uses a **hash router**; design flows around in-app route changes,
  not full page loads.

## 5. Components

Built on Radix UI primitives with shadcn-style wrappers and Lucide icons. Key
domain areas under `components/`:

- **profile/** — `ProfileCard`, `ProfileList`, `ProfileEditor` (the main form),
  `ProfileShare` (encode/share a profile).
- **rpc/** — live presence preview and activation controls.
- **settings/** — app settings UI.
- **onboarding/** — `Welcome` first-run flow.
- **layout/** — `Sidebar`, `Topbar`, `Layout`.

Component guidelines:

- Compose from Radix + existing wrappers; do not introduce a second UI library.
- Style with Tailwind tokens and the `cn()` helper (`lib/utils.ts`); never inline
  hardcoded colors.
- Toasts use `react-hot-toast`, bottom-right, themed via CSS variables.
- Drag-and-drop ordering uses `@dnd-kit` (e.g. profile sort order).

## 6. Content & tone

- Clear, concise, friendly. Prefer verbs for actions ("Activate", "Create
  Profile", "Share").
- Explain Discord-specific concepts inline (Application ID, asset keys) rather
  than assuming knowledge.
- Error and empty states should be actionable and reassuring (e.g. the README's
  "404 in preview is CDN caching, not a bug" framing).

## 7. The live preview contract

The preview must mirror Discord's Rich Presence rendering: activity type,
details/state (with optional URLs), large/small images + tooltips, timestamps
(elapsed/remaining), party size, and up to two buttons. These map directly to
the `profiles` schema in `src/db/schema.ts` — keep the preview and schema in sync
when fields change.

## 8. Do / Don't

- **Do** add new colors as theme tokens across all seven themes.
- **Do** reuse existing components, utilities, and motion tokens.
- **Don't** hardcode hex/HSL values inside components.
- **Don't** add bespoke fonts or a competing component system.
- **Don't** break the create → preview → activate flow with extra friction.
