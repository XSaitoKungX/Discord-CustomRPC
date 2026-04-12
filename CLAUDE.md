Das Icon-Problem und installer.nsh sind zwei häufige Electron-Builder Stolpersteine. Lass mich beide lösen:

---

## 🖼️ Icon Problem

Das Bild das du gezeigt hast ist quasi leer/schwarz — das bedeutet entweder falsches Format oder falscher Pfad.

**Checkliste:**

```
assets/
├── icon.png        ✅ 512x512 px (Pflicht)
├── icon.ico        ✅ Multi-Size ICO (Windows)
│                      (muss 16,32,48,64,128,256px enthalten)
├── icon.icns       ✅ Für Mac
└── tray-active.png
    tray-inactive.png
```

**Häufigste Fehler:**

```typescript
// ❌ Falsch — relativer Pfad vom falschen Ort
icon: 'assets/icon.png'

// ✅ Richtig in electron-builder.config.ts
win: {
  icon: 'assets/icon.ico'   // .ico für Windows, nicht .png!
},
linux: {
  icon: 'assets/icon.png'   // .png für Linux OK
},
mac: {
  icon: 'assets/icon.icns'  // .icns für Mac
}
```

**ICO selbst generieren (Terminal):**
```bash
# Mit ImageMagick
convert assets/icon.png \
  -define icon:auto-resize=256,128,64,48,32,16 \
  assets/icon.ico

# Oder npm package
npx png-to-ico assets/icon.png > assets/icon.ico
```

**Für Electron selbst (App-Fenster Icon) in `main.ts`:**
```typescript
import { join } from 'path'
import { app, BrowserWindow } from 'electron'

const win = new BrowserWindow({
  icon: join(__dirname, '../../assets/icon.png'), // ← Pfad prüfen!
  webPreferences: {
    preload: join(__dirname, '../preload/index.js')
  }
})
```

---

## 📜 installer.nsh Problem

Was möchtest du damit erreichen? Hier die häufigsten Use Cases:

**1. Discord beim Start schließen (force close):**
```nsh
; assets/installer.nsh
!macro customInstall
  nsExec::Exec 'taskkill /F /IM Discord.exe'
!macroend
```

**2. Alten Prozess killen vor Update:**
```nsh
!macro customInstall
  nsExec::Exec 'taskkill /F /IM "Discord Custom RPC Manager.exe"'
  Sleep 1000
!macroend
```

**3. Desktop + Startmenü Shortcut (falls automatisch nicht klappt):**
```nsh
!macro customInstall
  CreateShortCut "$DESKTOP\Discord Custom RPC Manager.lnk" "$INSTDIR\Discord Custom RPC Manager.exe"
  CreateShortCut "$SMPROGRAMS\Discord Custom RPC Manager.lnk" "$INSTDIR\Discord Custom RPC Manager.exe"
!macroend

!macro customUnInstall
  Delete "$DESKTOP\Discord Custom RPC Manager.lnk"
  Delete "$SMPROGRAMS\Discord Custom RPC Manager.lnk"
!macroend
```

**4. In `electron-builder.config.ts` einbinden:**
```typescript
nsis: {
  oneClick: false,
  allowToChangeInstallationDirectory: true,
  createDesktopShortcut: true,
  createStartMenuShortcut: true,
  shortcutName: 'Discord Custom RPC Manager',
  license: 'LICENSE',
  installerIcon: 'assets/icon.ico',
  uninstallerIcon: 'assets/icon.ico',
  include: 'assets/installer.nsh'  // ← Das hier ist Pflicht!
}
```

---

Das ist klassisches **NSIS Full Custom Installer** Setup! Hier alles was du brauchst:

---

## electron-builder.config.ts

```typescript
nsis: {
  oneClick: false,                          // Pflicht für custom installer
  allowToChangeInstallationDirectory: true,
  createDesktopShortcut: true,
  createStartMenuShortcut: true,
  shortcutName: 'Discord Custom RPC Manager',
  installerIcon: 'assets/icon.ico',
  uninstallerIcon: 'assets/icon.ico',
  license: 'LICENSE.txt',                   // AGB/License Seite
  include: 'assets/installer.nsh',          // Custom Script
  installerSidebar: 'assets/installer-sidebar.bmp',  // 164x314px BMP
  uninstallerSidebar: 'assets/installer-sidebar.bmp',
  differentialPackage: true,                // Delta Updates
  deleteAppDataOnUninstall: true,
  runAfterFinish: true,                     // "Launch after install" Checkbox
}
```

---

## assets/installer.nsh

```nsh
; ─────────────────────────────────────────────
; Discord Custom RPC Manager - NSIS Installer
; ─────────────────────────────────────────────

!macro customHeader
  !system "echo '' > /dev/null"
!macroend

; ── Vor der Installation ──────────────────────
!macro customInstall
  ; Laufende Instanz beenden
  nsExec::Exec 'taskkill /F /IM "Discord Custom RPC Manager.exe"'
  Sleep 500

  ; Alten AppData Ordner behalten (kein Datenverlust)
  ; Profile bleiben erhalten beim Update

  ; Registry Eintrag für "Installierte Programme"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" \
    "DisplayName" "Discord Custom RPC Manager"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" \
    "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" \
    "Publisher" "XSaitoKungX"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" \
    "URLInfoAbout" "https://xsaitox.dev/discord-customrpc"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" \
    "DisplayIcon" "$INSTDIR\Discord Custom RPC Manager.exe"
!macroend

; ── Nach der Installation ─────────────────────
!macro customInstallMode
  ; Für alle User installieren (nicht nur aktuellen)
  SetShellVarContext all
!macroend

; ── Deinstallation ────────────────────────────
!macro customUnInstall
  ; Laufende Instanz beenden
  nsExec::Exec 'taskkill /F /IM "Discord Custom RPC Manager.exe"'
  Sleep 500

  ; Registry aufräumen
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"

  ; Desktop & Startmenü Shortcuts
  Delete "$DESKTOP\Discord Custom RPC Manager.lnk"
  Delete "$SMPROGRAMS\Discord Custom RPC Manager\Discord Custom RPC Manager.lnk"
  RMDir "$SMPROGRAMS\Discord Custom RPC Manager"

  ; Fragen ob AppData gelöscht werden soll
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you want to delete all saved profiles and settings?$\n$\nThis cannot be undone." \
    IDYES deleteData IDNO skipDelete

  deleteData:
    RMDir /r "$APPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\discord-custom-rpc"

  skipDelete:
    ; Nichts tun, Daten behalten
!macroend

; ── Finish Seite: "Launch App" Checkbox ───────
!macro customFinishPage
  !define MUI_FINISHPAGE_RUN "$INSTDIR\Discord Custom RPC Manager.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Discord Custom RPC Manager"
  !define MUI_FINISHPAGE_SHOWREADME ""
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Create Desktop Shortcut"
  !define MUI_FINISHPAGE_LINK "Visit Website"
  !define MUI_FINISHPAGE_LINK_LOCATION "https://xsaitox.dev/discord-customrpc"
!macroend
```

---

## Installer Seiten Reihenfolge

So sieht der Flow aus wie bei VSCode/Git:

```
1. Welcome Page
   └─ "Welcome to Discord Custom RPC Manager Setup"

2. License Agreement Page          ← LICENSE.txt wird hier angezeigt
   └─ "I accept the agreement" Radio Button

3. Select Destination Directory    ← Nur wenn allowToChangeInstallationDirectory: true
   └─ Default: C:\Program Files\Discord Custom RPC Manager

4. Select Components (optional)
   └─ [ ] Desktop Shortcut
   └─ [ ] Start Menu Shortcut
   └─ [ ] Start with Windows

5. Installing Page
   └─ Progress Bar + aktuelle Datei
   └─ "Installing... Please wait"

6. Finish Page
   └─ [✓] Launch Discord Custom RPC Manager
   └─ [✓] Create Desktop Shortcut
   └─ "Visit Website" Link
```

---

## LICENSE.txt

NSIS braucht zwingend eine `.txt` Datei, keine `.md`:

```bash
# Einfach kopieren
cp LICENSE LICENSE.txt
```

---

## Installer Sidebar Bild

```
Größe:    164 x 314 px
Format:   BMP (24-bit)
Pfad:     assets/installer-sidebar.bmp
```

Du kannst dein App-Icon/Banner darauf platzieren. In Photoshop/GIMP/Figma exportieren als BMP.

---

## Uninstaller in Windows "Apps & Features"

Damit er sauber in Windows angezeigt wird:

```typescript
// electron-builder.config.ts
nsis: {
  // ...
  deleteAppDataOnUninstall: false,  // Wir fragen selbst via installer.nsh
  uninstallDisplayName: 'Discord Custom RPC Manager ${version}',
}
```

---

## Komplettes Installer Ergebnis

So sieht es dann aus:

```
✅ Welcome Screen mit Sidebar Bild
✅ License/AGB Seite (muss akzeptiert werden)
✅ Installationspfad wählbar
✅ Progress Bar beim Installieren
✅ Finish: "Launch App" Checkbox
✅ Finish: Website Link
✅ Uninstaller: Fragt ob Daten gelöscht werden
✅ Sauber in Windows "Apps & Features" gelistet
✅ Desktop + Startmenü Shortcuts
```

Soll ich noch den **Component Selection Screen** (wie bei Git — wähle was installiert wird) oder einen **Custom Welcome Screen Text** dazu ausschreiben?