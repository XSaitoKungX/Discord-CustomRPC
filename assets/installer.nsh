; ── Discord Custom RPC Manager – Custom NSIS Script ─────────────────────────
; https://www.electron.build/nsis.html
;
; Macros provided by electron-builder (do not redefine):
;   customInit         – runs before installer pages
;   customUnWelcomePage – injects a welcome page into the uninstaller
;   customUnInstall    – runs during uninstall section

; ── INSTALLER INIT ───────────────────────────────────────────────────────────
!macro customInit
  ; ── Single-instance guard via named mutex ──────────────────────────────────
  ; More reliable than FindWindow (works even when minimized to tray)
  System::Call 'kernel32::CreateMutexW(i 0, i 1, w "DiscordCustomRPCManager_Running") i .r0 ?e'
  Pop $1 ; last error
  IntCmp $1 183 0 notRunning notRunning ; ERROR_ALREADY_EXISTS = 183
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
      "Discord Custom RPC Manager is currently running.$\r$\n$\r$\nPlease close it before continuing." \
      IDOK notRunning
    Quit
  notRunning:

  ; ── Already-installed check ────────────────────────────────────────────────
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayVersion"
  StrCmp $0 "" initDone

  ; Installed – ask user what to do
  MessageBox MB_YESNOCANCEL|MB_ICONQUESTION "Discord Custom RPC Manager v$0 is already installed.$\r$\n$\r$\nYES    =  Reinstall / update (keeps your profiles)$\r$\nNO     =  Uninstall first, then install fresh$\r$\nCANCEL =  Abort" IDYES initDone IDNO doUninstall
  ; CANCEL falls through to Quit
  Quit

  doUninstall:
    ; Look up uninstaller path from registry instead of assuming $INSTDIR
    ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "UninstallString"
    StrCmp $1 "" initDone ; no uninstall string → skip
    ExecWait '"$1" /S'

  initDone:
!macroend

; ── UNINSTALLER WELCOME PAGE ─────────────────────────────────────────────────
!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Uninstall Discord Custom RPC Manager"
  !define MUI_WELCOMEPAGE_TEXT "This will remove Discord Custom RPC Manager from your computer.$\r$\n$\r$\nYour saved profiles and settings will NOT be deleted unless you choose to remove them in the next step.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

; ── UNINSTALLER: DATA CLEANUP ────────────────────────────────────────────────
!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you also want to delete your saved profiles and settings?$\r$\n$\r$\nYES  ->  Permanently delete all profiles and app data$\r$\nNO   ->  Keep data (reinstalling will restore your profiles)" IDYES deleteData IDNO skipDelete

  deleteData:
    ; Covers both per-user and per-machine install contexts
    SetShellVarContext current
    DetailPrint "Removing user app data..."
    RMDir /r "$APPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\Discord Custom RPC Manager"
    DetailPrint "App data removed."
    Goto uninstallDone

  skipDelete:
    DetailPrint "App data kept."

  uninstallDone:
!macroend
