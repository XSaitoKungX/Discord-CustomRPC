# TODO

Roadmap and task tracker for **Discord Custom RPC Manager**. Items are derived
from a review of the current source (`2.0.0-beta.1`). Check items off as they
land. Severity hints: **[bug]**, **[incomplete]**, **[enhancement]**,
**[feature]**, **[release]**.

---

## 0. Top priorities (explicit asks)

- [ ] **[release] Ship a full `2.0.0` (drop `beta`).** See section 6.
- [ ] **[enhancement] Use `icon.png` for the installer.** Generate `icon.bmp`
  from `assets/icon.png` and replace `installer-banner.bmp`. See section 5.

---

## 1. Bugs to fix

- [x] **[bug] Deep-link protocol mismatch in docs.** `discordrpc://` chosen as
  canonical (used throughout the code); `README.md` corrected. The `.dcrpc`
  file association in `electron-builder.js` is a separate file-type mechanism
  (no handler wired up yet — see backlog).
- [x] **[bug] Update channel setting is ignored.** `updater.ts` now drives
  `channel`/`allowPrerelease` from `getSettings().updateChannel`.
- [x] **[bug] Share → import round-trip.** Root cause was non-URL-safe base64
  in `getShareUrl()` (a `+` became a space when parsed from the query string).
  Now URL-safe encode/decode in `lib/utils.ts`. Also consolidated duplicate
  import handlers (App.tsx used raw `atob`, Profiles.tsx used `decodeShareData`)
  into one global handler to stop double imports. **Note:** the public
  `https://xsaitox.dev/...` link still depends on that page redirecting to the
  `discordrpc://` deep link.
- [x] **[bug] `require()` in the middle of a module.** Moved to top-level
  `import` in `updater.ts`.
- [x] **[bug] Empty catch swallows updater errors silently.** Now logs.
- [x] **[bug] `reorderProfiles` is not atomic.** Wrapped in a
  `db.transaction()` in `src/db/queries/profiles.ts`.
- [x] **[bug] Preview image handling.** `RPCPreview.tsx` now prefers an explicit
  `largeImageUrl`/`smallImageUrl` over the CDN asset path (mirrors
  `setActivity`). The `.png` extension is correct for Discord app-assets (served
  as png/webp), so it was kept; remaining 404s come from unresolved name keys
  without a fetched asset list.

## 2. Incomplete / half-implemented features

- [~] **[incomplete] Details/State/Image URLs are stored but never sent.**
  **Image URLs done:** `setActivity()` now prefers `largeImageUrl`/`smallImageUrl`
  over the asset key, and `RPCPreview.tsx` mirrors this. **`detailsUrl`/`stateUrl`
  blocked:** the deprecated `discord-rpc` lib's `setActivity` only forwards
  `state/details/timestamps/assets/party/secrets/buttons` (verified in
  `node_modules/discord-rpc/src/client.js`) and drops `details_url`/`state_url`.
  Sending those requires the `@xhayper/discord-rpc` migration below.
- [x] **[incomplete] i18n is only "prepared".** `locales/en.ts` exists and the
  `language` setting is typed `'en'` only, but UI strings are hardcoded across
  components. Either wire up a real i18n layer (provider + `t()` + extra locales)
  or document it as English-only and remove the dead `language` setting.
- [x] **[incomplete] Party fields lack full UI/validation.** `partySize`/
  `partyMax` exist in schema, preview, and `setActivity`; confirm the editor
  exposes them with validation (`size <= max`, non-negative) and that they are
  cleared correctly.
- [x] **[incomplete] `streamUrl` only applies to STREAMING.** Confirm the editor
  hides/disables the field for non-streaming activity types to avoid confusion.

## 3. Improvements (quality, robustness, DX)

- [ ] **[enhancement] Replace the deprecated `discord-rpc` dependency.** The
  `discord-rpc` package is unmaintained; buttons do not render for the local
  user. Evaluate migrating to a maintained fork (e.g. `@xhayper/discord-rpc`).
- [x] **[enhancement] Surface a clear "Discord not running" state.** Connection
  errors are silently retried in `rpc.ts`; add a user-visible hint when Discord
  is closed.
- [ ] **[enhancement] Centralize IPC channel names** in a shared constants file
  to avoid string drift between `main/ipc/*`, `preload/index.ts`, and `env.d.ts`.
- [x] **[enhancement] Add input validation in the editor.** Application ID
  (numeric), button URLs (valid `http(s)`), button label length limits, and the
  two-button Discord cap.
- [x] **[enhancement] Respect the 15s Discord update cooldown** in the UI (the
  `cooldownHint` string already exists in `locales/en.ts`).
- [ ] **[enhancement] Add automated tests.** There is currently no test setup.
  Add unit tests for `queries/profiles.ts`, `deeplink.ts`, share encode/decode,
  and `setActivity` payload building.
- [x] **[enhancement] Wire CI quality gates.** Ensure `bun run lint` and
  `bun run typecheck` run on PRs in `.github/`.
- [x] **[enhancement] Resolve `react-hooks/set-state-in-effect` warnings.**
  `RPCPreview.tsx` now derives image-error state from the resolved URL (no reset
  effect) and `ProfileEditor.tsx` `useDiscordAssets` moves `setState` into a
  nested async function. The rule runs at `error` again.
- [x] **[enhancement] Clean up unused-variable warnings** (removed dead
  `tray`/`getAppIconPath`/`format`/`Toggle`/`isConnecting`, unused catch binding;
  `varsIgnorePattern: '^_'` added to ESLint config).
- [x] **[bug] `typecheck` script never checked the code.** Root `tsconfig.json`
  is solution-style (`files: []`), so `tsc --noEmit` checked nothing. Script now
  runs both `tsconfig.node.json` and `tsconfig.web.json`; fixed the type error it
  revealed in `useProfiles.ts` `importProfiles` (missing `activityType`/
  `timestampMode`).
- [ ] **[enhancement] Reduce asset sizes.** `assets/` contains very large PNGs
  (e.g. `banner-150x57.png` ~1.8 MB, `icon.png` ~2 MB). Optimize/resize for
  faster builds and smaller installers.

## 4. New features (backlog)

- [ ] **[feature] Profile scheduling / rotation** — auto-switch profiles on a
  timer or schedule.
- [ ] **[feature] Auto-start last active profile** on app launch.
- [ ] **[feature] Profile templates / presets** for common games and apps.
- [ ] **[feature] Profile duplication & folders/tags** for organization.
- [ ] **[feature] Multiple locales** (German first, given the author/site).
- [ ] **[feature] Global hotkeys** to toggle a profile on/off.
- [ ] **[feature] Per-profile keyboard shortcut / quick-switcher.**
- [ ] **[feature] Import from a `dcrpc://` link pasted into the app** (not only
  via OS deep link).
- [ ] **[feature] Asset picker thumbnails for external image URLs** with
  validation/preview.

## 5. Installer: use `icon.png` (generate `icon.bmp`)

Currently `assets/installer.nsh` uses `installer-banner.bmp`
(`MUI_HEADERIMAGE_BITMAP`) and `installer-header.bmp`
(`MUI_WELCOMEFINISHPAGE_BITMAP`), both shipped via `extraResources` in
`electron-builder.js`.

- [ ] **Generate `assets/icon.bmp` from `assets/icon.png`** at the correct NSIS
  bitmap dimensions (header image is 150×57; welcome/finish is 164×314). Note a
  single square icon will not fit both slots well — consider a header bitmap and
  a separate welcome bitmap, or letterbox the icon onto the required canvas.
- [ ] **Update `assets/installer.nsh`** to reference the new `icon.bmp`
  (replace `installer-banner.bmp`; decide whether to also replace
  `installer-header.bmp`).
- [ ] **Update `extraResources` in `electron-builder.js`** to bundle `icon.bmp`
  and drop the now-unused `installer-banner.bmp` entry.
- [ ] **Decide on a generation method** (committed pre-built BMP vs. a build
  step using e.g. `sharp`/`imagemagick`). If automated, add it before the
  Windows build script.
- [ ] **Verify** the installer renders the new bitmap correctly (no stretching,
  correct 24-bit BMP format that NSIS accepts).

## 6. Prepare the full (non-beta) `2.0.0` release

- [ ] **Bump version** in `package.json` from `2.0.0-beta.1` to `2.0.0`.
- [ ] **Switch the updater to stable.** In `src/main/updater.ts` set
  `allowPrerelease`/`channel` from the user setting; default new installs to
  `stable`. Default `defaultSettings.updateChannel` is already `'stable'`.
- [ ] **Change publish from draft to release.** `electron-builder.js`
  `publish.releaseType` is `'draft'`; decide final release flow (and review
  `release:*` scripts that publish always).
- [ ] **Resolve all section 1 bugs and section 2 incompletes** that are
  user-facing before tagging stable.
- [ ] **Run quality gates:** `bun run typecheck` and `bun run lint` must pass.
- [ ] **Smoke-test packaged builds** on Windows, Linux (deb/AppImage/rpm), and
  macOS, including: install/uninstall, tray, deep-link import, auto-update,
  RPC activate/deactivate, all 7 themes.
- [ ] **Update docs:** `README.md` (remove beta wording, fix protocol),
  `CHANGELOG.md` (cut a `2.0.0` section via `git-cliff`).
- [ ] **Consider code signing** (Windows + macOS) to remove SmartScreen/
  Gatekeeper warnings, or keep the documented manual-run steps.
- [ ] **Tag and publish** following Conventional Commits so `git-cliff`
  generates the release notes.

---

> Maintenance: keep this file in sync as items are completed. Group new findings
> under the matching section and tag them with a severity hint.
