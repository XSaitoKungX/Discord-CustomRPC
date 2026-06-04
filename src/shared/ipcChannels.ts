export const IPC = {
  // Profiles
  PROFILES_GET_ALL: 'profiles:getAll',
  PROFILES_CREATE: 'profiles:create',
  PROFILES_UPDATE: 'profiles:update',
  PROFILES_DELETE: 'profiles:delete',
  PROFILES_REORDER: 'profiles:reorder',

  // RPC
  RPC_START: 'rpc:start',
  RPC_STOP: 'rpc:stop',
  RPC_STATUS: 'rpc:status',
  RPC_STATUS_CHANGED: 'rpc:statusChanged',
  RPC_AUTO_STARTED: 'rpc:autoStarted',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Updater
  UPDATER_CHECK: 'updater:check',
  UPDATER_INSTALL: 'updater:install',
  UPDATER_DOWNLOAD: 'updater:download',
  UPDATER_STATUS: 'updater:status',

  // App
  APP_VERSION: 'app:version',
  APP_READY: 'app:ready',

  // Discord
  DISCORD_GET_ASSETS: 'discord:getAssets',

  // Deep link
  DEEPLINK_IMPORT: 'deeplink:import',

  // Shortcuts
  SHORTCUT_NEW_PROFILE: 'shortcut:newProfile',
  SHORTCUT_SAVE: 'shortcut:save',
  SHORTCUT_SETTINGS: 'shortcut:settings',
} as const
