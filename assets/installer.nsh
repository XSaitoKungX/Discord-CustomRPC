; ── Discord Custom RPC Manager – Custom NSIS Script ─────────────────────────
; Based on official electron-builder docs:
; https://www.electron.build/nsis.html
;
; The assisted installer template automatically provides:
;   - License page        (via nsis.license in electron-builder.config.ts)
;   - Directory page      (via allowToChangeInstallationDirectory)
;   - Installation files  (MUI_PAGE_INSTFILES — progress bar)
;   - Finish page         (with "Launch app" checkbox)
;
; We add: Welcome page, running-app check, uninstall data-cleanup dialog

; ── WELCOME PAGE ─────────────────────────────────────────────────────────────
; NOTE: Welcome page is NOT added by default — we add it here.
; Keep the macro body minimal per official docs to avoid symbol conflicts.
!macro customWelcomePage
  !insertMacro MUI_PAGE_WELCOME
!macroend

; ── INSTALLER INIT: CHECK IF APP IS ALREADY RUNNING ──────────────────────────
!macro customInit
  FindWindow $0 "" "Discord Custom RPC Manager"
  StrCmp $0 0 customInitDone
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
      "Discord Custom RPC Manager is currently running.$\n$\nPlease close it before continuing." \
      IDOK customInitDone IDCANCEL customInitQuit
    customInitQuit:
      Quit
  customInitDone:
!macroend

; ── UNINSTALLER WELCOME PAGE ─────────────────────────────────────────────────
!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Uninstall Discord Custom RPC Manager"
  !define MUI_WELCOMEPAGE_TEXT "This will remove Discord Custom RPC Manager from your computer.$\r$\n$\r$\nYour saved profiles and settings will NOT be deleted unless you choose to remove them in the next step.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

; ── UNINSTALLER: DATA CLEANUP DIALOG ─────────────────────────────────────────
; Runs during the uninstall section (after files are removed)
!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you also want to delete your saved profiles and settings?$\n$\n\
YES  →  Permanently delete all profiles and app data$\n\
NO   →  Keep data (you can reinstall and your profiles will still be there)" \
    IDYES customUnDeleteData IDNO customUnSkipDelete

  customUnDeleteData:
    DetailPrint "Removing app data..."
    RMDir /r "$APPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\Discord Custom RPC Manager"
    DetailPrint "App data removed successfully."
    Goto customUnSkipDelete

  customUnSkipDelete:
    DetailPrint "App data kept."
!macroend
