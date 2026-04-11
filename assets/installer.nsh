; ── Discord Custom RPC Manager – Custom NSIS Script ─────────────────────────
; Adds: welcome page, running-app check, uninstaller with data-cleanup dialog

; ── WELCOME PAGE (shown before license + directory) ──────────────────────────
!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to Discord Custom RPC Manager Setup"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of Discord Custom RPC Manager.$\r$\n$\r$\nIt is recommended that you close all other applications before starting Setup. This will make it possible to update relevant system files without having to reboot your computer.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_PAGE_WELCOME
!macroend

; ── CHECK IF APP IS ALREADY RUNNING ──────────────────────────────────────────
!macro customInit
  FindWindow $0 "" "Discord Custom RPC Manager"
  StrCmp $0 0 initDone
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
      "Discord Custom RPC Manager is currently running.$\n$\nPlease close it before continuing the installation." \
      IDOK initDone IDCANCEL initQuit
    initQuit:
      Quit
  initDone:
!macroend

; ── UNINSTALLER WELCOME PAGE ─────────────────────────────────────────────────
!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Uninstall Discord Custom RPC Manager"
  !define MUI_WELCOMEPAGE_TEXT "This will remove Discord Custom RPC Manager from your computer.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

; ── UNINSTALLER: ASK TO KEEP OR DELETE USER DATA ─────────────────────────────
!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you want to delete all saved profiles and settings?$\n$\nYES — Remove all app data (profiles, settings)$\nNO  — Keep your data (safe to reinstall later)" \
    IDYES unDeleteData IDNO unSkipDelete

  unDeleteData:
    DetailPrint "Removing app data..."
    RMDir /r "$APPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\Discord Custom RPC Manager"
    DetailPrint "App data removed."
    Goto unSkipDelete

  unSkipDelete:
    DetailPrint "App data kept."
!macroend
