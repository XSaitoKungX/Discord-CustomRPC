// English locale — i18n prepared
export const en = {
  app: {
    name: 'Discord Custom RPC Manager',
    tagline: 'Your Discord, Your Style'
  },
  nav: {
    home: 'Home',
    profiles: 'Profiles',
    settings: 'Settings',
    about: 'About'
  },
  profiles: {
    new: 'New Profile',
    edit: 'Edit Profile',
    delete: 'Delete Profile',
    duplicate: 'Duplicate',
    share: 'Share',
    import: 'Import',
    export: 'Export',
    activate: 'Activate',
    deactivate: 'Deactivate',
    noProfiles: 'No profiles yet',
    search: 'Search profiles…',
    created: 'Profile created',
    saved: 'Profile saved',
    deleted: 'Profile deleted'
  },
  rpc: {
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error',
    activated: 'RPC activated',
    deactivated: 'RPC deactivated',
    cooldownHint: 'Discord allows updates every 15 seconds minimum'
  },
  settings: {
    title: 'Settings',
    theme: 'Theme',
    minimizeToTray: 'Minimize to Tray',
    startMinimized: 'Start Minimized',
    autostart: 'Launch at Startup',
    updateChannel: 'Update Channel',
    exportAll: 'Export All Profiles',
    importProfiles: 'Import Profiles',
    resetSettings: 'Reset Settings',
    checkUpdates: 'Check for Updates'
  },
  onboarding: {
    title: 'Welcome to Discord Custom RPC Manager',
    step1Title: 'Open Discord Desktop',
    step2Title: 'Create a Discord Application',
    step3Title: 'Create & Activate a Profile',
    skip: 'Skip',
    dontShow: "Don't show again",
    next: 'Next',
    back: 'Back',
    getStarted: 'Get Started'
  }
} as const

export type Locale = typeof en
