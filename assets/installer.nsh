; ── Discord Custom RPC Manager – Custom NSIS Script ─────────────────────────
; Adds: welcome page, finish page with launch option, uninstaller data-cleanup

!macro customHeader
  !system "echo Installing Discord Custom RPC Manager..."
!macroend

; ── INSTALLER ────────────────────────────────────────────────────────────────
!macro customInit
  ; Check if app is already running and ask user to close it
  FindWindow $0 "" "Discord Custom RPC Manager"
  StrCmp $0 0 done
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
      "Discord Custom RPC Manager is currently running.$\n$\nPlease close it before continuing the installation." \
      IDOK done IDCANCEL quit
    quit:
      Quit
  done:
!macroend

!macro customInstall
  ; Create a README shortcut in the install folder (optional)
  SetOutPath "$INSTDIR"
!macroend

; ── UNINSTALLER ──────────────────────────────────────────────────────────────
!macro customUnInstall
  ; Ask user if they want to delete their profiles and settings
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you want to delete all your saved profiles and settings?$\n$\nClick YES to remove all app data.$\nClick NO to keep your data (you can reinstall later without losing profiles)." \
    IDYES deleteData IDNO skipDelete

  deleteData:
    ; Remove AppData folder (profiles database + settings)
    RMDir /r "$APPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\Discord Custom RPC Manager"
    DetailPrint "App data deleted."
    Goto skipDelete

  skipDelete:
    DetailPrint "App data kept."
!macroend
