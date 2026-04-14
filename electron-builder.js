/** @type {import('electron-builder').Configuration} */
const config = {
  // ─── App Identity ────────────────────────────────────────────────
  appId: 'dev.xsaitox.discord-custom-rpc',
  productName: 'Discord Custom RPC Manager',
  copyright: 'Copyright © 2026 XSaitoKungX (xsaitox.dev)',

  // ─── Build Optimization ────────────────────────────────────────
  compression: 'maximum',
  removePackageScripts: true,
  generateUpdatesFilesForAllChannels: true,
  npmRebuild: false,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  // Return false to skip electron-builder's automatic @electron/rebuild
  // Native modules are rebuilt by CI on the correct platform
  beforeBuild: async () => false,

  // ─── Directories ────────────────────────────────────────────────
  directories: {
    output: 'dist'
  },

  // ─── Files ─────────────────────────────────────────────────────
  files: [
    'out/**/*',
    'node_modules/**/*',
    '!node_modules/.cache/**/*',
    '!node_modules/.bin/**/*',
    '!**/*.{md,txt,ts,map}',
    '!**/{.git,.github,__tests__,test,tests,spec,specs}/**'
  ],

  // ─── Packaging ────────────────────────────────────────────────
  asar: true,
  asarUnpack: [
    'node_modules/better-sqlite3/**/*',
    'node_modules/bindings/**/*'
  ],

  // ─── Resources ────────────────────────────────────────────────
  extraResources: [
    {
      from: 'src/db/migrations',
      to: 'migrations'
    },
    {
      from: 'assets/icon.png',
      to: 'assets/icon.png'
    },
    {
      from: 'assets/icon.ico',
      to: 'assets/icon.ico'
    },
    {
      from: 'assets/favicon-16x16.png',
      to: 'assets/favicon-16x16.png'
    },
    {
      from: 'LICENSE',
      to: 'LICENSE'
    }
  ],

  // ─── Release Publishing ────────────────────────────────────────
  publish: {
    provider: 'github',
    owner: 'XSaitoKungX',
    repo: 'Discord-CustomRPC',
    releaseType: 'draft'
  },

  // ─── Windows ───────────────────────────────────────────────────
  win: {
    target: [
      { target: 'nsis', arch: ['x64', 'arm64'] },
      { target: 'portable', arch: ['x64'] }
    ],
    icon: 'assets/icon.ico',
    requestedExecutionLevel: 'asInvoker',
    verifyUpdateCodeSignature: false,
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    perMachine: false,
    artifactName: '${productName} Setup ${version}.${ext}',
    uninstallDisplayName: '${productName}',
    include: 'assets/installer.nsh',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Discord Custom RPC Manager',
    menuCategory: 'XSaitoKungX',
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    installerHeaderIcon: 'assets/icon.ico',
    license: 'LICENSE',
    runAfterFinish: true,
    deleteAppDataOnUninstall: false,
    removeDefaultUninstallWelcomePage: true
  },

  // ─── Linux ─────────────────────────────────────────────────────
  linux: {
    target: [
      { target: 'deb', arch: ['x64', 'arm64'] },
      { target: 'AppImage', arch: ['x64', 'arm64'] },
      { target: 'rpm', arch: ['x64', 'arm64'] }
    ],
    icon: 'assets/icon.png',
    category: 'Utility',
    desktop: {
      entry: {
        Comment: 'Manage your Discord Rich Presence profiles',
        Keywords: 'discord;rpc;rich;presence;manager;',
        StartupNotify: 'true',
        Terminal: 'false',
        Categories: 'Utility;Network;'
      }
    },
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },

  deb: {
    depends: [
      'libgtk-3-0',
      'libnotify4',
      'libnss3',
      'libxss1',
      'libxtst6',
      'xdg-utils',
      'libatspi2.0-0',
      'libdrm2',
      'libxcomposite1',
      'libxdamage1',
      'libxrandr2',
      'libgbm1',
      'libxkbcommon0',
      'libasound2'
    ],
    priority: 'optional'
  },

  rpm: {
    depends: [
      'gtk3',
      'libnotify',
      'nss',
      'libXScrnSaver',
      'libXtst',
      'xdg-utils',
      'at-spi2-core',
      'libdrm',
      'libXcomposite',
      'libXdamage',
      'libXrandr',
      'gbm',
      'libxkbcommon',
      'alsa-lib'
    ]
  },

  // ─── macOS ─────────────────────────────────────────────────────
  mac: {
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] }
    ],
    icon: 'assets/icon.icns',
    hardenedRuntime: false,
    gatekeeperAssess: false,
    identity: null,
    artifactName: '${productName}-${version}-${arch}.${ext}',
    category: 'public.app-category.utilities',
    darkModeSupport: true
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ],
    window: { width: 540, height: 380 },
    title: '${productName} ${version}',
    icon: 'assets/icon.png',
    iconSize: 100
  },

  // ─── File Associations ─────────────────────────────────────────
  fileAssociations: [
    {
      ext: 'dcrpc',
      name: 'Discord RPC Profile',
      description: 'Discord Custom RPC Profile',
      role: 'Editor'
    }
  ]
}

module.exports = config
