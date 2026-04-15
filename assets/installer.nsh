; ── Discord Custom RPC Manager – Custom NSIS Script ─────────────────────────
; https://www.electron.build/nsis.html
;
; Macros used by electron-builder:
;   customInit            – runs before any installer page
;   customWelcomePage     – custom welcome page (installer)
;   customUnWelcomePage   – custom welcome page (uninstaller)
;   customUnInstall       – runs during uninstall section

; ── BRANDING ─────────────────────────────────────────────────────────────────
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${__FILEDIR__}\installer-banner.bmp"
!define MUI_HEADERIMAGE_RIGHT

; ── INSTALLER INIT ───────────────────────────────────────────────────────────
!macro customInit
  ; ── Single-instance guard via named mutex ──────────────────────────────────
  System::Call 'kernel32::CreateMutexW(i 0, i 1, w "DiscordCustomRPCManager_Running") i .r0 ?e'
  Pop $1
  IntCmp $1 183 0 notRunning notRunning
    ; App is running — show nsDialogs warning page instead of plain MessageBox
    nsDialogs::Create 1018
    Pop $2
    ${NSD_CreateLabel} 0 0 100% 40u "Discord Custom RPC Manager is currently running.$\r$\nPlease close it before continuing with the installation."
    Pop $3
    ${NSD_CreateBitmap} 0 45u 164u 57u ""
    Pop $4
    ${NSD_SetImage} $4 "${__FILEDIR__}\installer-banner.bmp" $5
    nsDialogs::Show
    Quit
  notRunning:

  ; ── Already-installed check ────────────────────────────────────────────────
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayVersion"
  StrCmp $0 "" initDone

  MessageBox MB_YESNOCANCEL|MB_ICONQUESTION "Discord Custom RPC Manager v$0 is already installed.$\r$\n$\r$\nYES    =  Reinstall / update (keeps your profiles)$\r$\nNO     =  Uninstall first, then install fresh$\r$\nCANCEL =  Abort" IDYES initDone IDNO doUninstall
  Quit

  doUninstall:
    ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "UninstallString"
    StrCmp $1 "" initDone
    ExecWait '"$1" /S'

  initDone:
!macroend

; ── INSTALLER WELCOME PAGE ───────────────────────────────────────────────────
!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to Discord Custom RPC Manager"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of Discord Custom RPC Manager.$\r$\n$\r$\nCreate fully custom Discord Rich Presence profiles — set your own title, description, images, buttons, and timestamps.$\r$\n$\r$\nClick Next to continue."
  !ifndef MUI_WELCOMEFINISHPAGE_BITMAP
    !define MUI_WELCOMEFINISHPAGE_BITMAP "${__FILEDIR__}\installer-header.bmp"
  !endif
  !insertmacro MUI_PAGE_WELCOME
!macroend

; ── UNINSTALLER WELCOME PAGE ─────────────────────────────────────────────────
!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Uninstall Discord Custom RPC Manager"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will remove Discord Custom RPC Manager from your computer.$\r$\n$\r$\nYour saved profiles and settings will NOT be deleted unless you choose to remove them in the next step.$\r$\n$\r$\nClick Next to continue."
  !ifndef MUI_WELCOMEFINISHPAGE_BITMAP
    !define MUI_WELCOMEFINISHPAGE_BITMAP "${__FILEDIR__}\installer-header.bmp"
  !endif
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

; ── UNINSTALLER: DATA CLEANUP PAGE ───────────────────────────────────────────
!macro customUnInstall
  ; Custom nsDialogs page — checkbox instead of plain MessageBox
  nsDialogs::Create 1018
  Pop $0
  StrCmp $0 error uninstallFallback

  ${NSD_CreateLabel} 0 0 100% 30u "The uninstallation is complete."
  Pop $1

  ${NSD_CreateLabel} 0 35u 100% 20u "Would you also like to remove your saved profiles and app data?"
  Pop $1

  ${NSD_CreateCheckbox} 0 60u 100% 12u "Delete my profiles and settings permanently"
  Pop $2
  ${NSD_SetState} $2 ${BST_UNCHECKED}

  ${NSD_CreateLabel} 0 78u 100% 30u "Leave unchecked to keep your data — reinstalling will restore all your profiles."
  Pop $1

  nsDialogs::Show

  ${NSD_GetState} $2 $3
  StrCmp $3 ${BST_CHECKED} deleteData skipDelete

  deleteData:
    SetShellVarContext current
    DetailPrint "Removing user app data..."
    RMDir /r "$APPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\discord-custom-rpc"
    RMDir /r "$LOCALAPPDATA\Discord Custom RPC Manager"
    DetailPrint "App data removed."
    Goto uninstallDone

  uninstallFallback:
    ; nsDialogs not available — fall back to MessageBox
    MessageBox MB_YESNO|MB_ICONQUESTION "Do you also want to delete your saved profiles and settings?$\r$\n$\r$\nYES ->  Permanently delete all profiles and app data$\r$\nNO  ->  Keep data (reinstalling will restore your profiles)" IDYES deleteData IDNO skipDelete

  skipDelete:
    DetailPrint "App data kept."

  uninstallDone:
!macroend
