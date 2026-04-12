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

; ── INSTALLER INIT: CHECK IF APP IS ALREADY INSTALLED / RUNNING ─────────────
!macro customInit
  ; Check if app is already installed
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayVersion"
  StrCmp $0 "" checkRunning ; If not installed, skip to running check
    
    ; App is installed - ask user what to do
    MessageBox MB_YESNOCANCEL|MB_ICONQUESTION \
      "Discord Custom RPC Manager v$0 is already installed.$\n$\nDo you want to:$
YES    =  Reinstall (keeps your profiles)$\nNO     =  Uninstall first$\nCANCEL =  Cancel installation" \
      IDYES doReinstall IDNO doUninstall IDCANCEL cancelInstall
    
    doReinstall:
      ; Continue with install (will overwrite)
      Goto checkRunning
    
    doUninstall:
      ; Launch uninstaller silently
      ExecWait '"$INSTDIR\Uninstall Discord Custom RPC Manager.exe" /S'
      Goto checkRunning
    
    cancelInstall:
      Quit
  
  checkRunning:
  ; Check if app is currently running
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
