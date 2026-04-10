import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'dev.xsaitox.discord-custom-rpc',
  productName: 'Discord Custom RPC Manager',
  copyright: 'Copyright © 2026 XSaitoKungX',
  compression: 'maximum',
  removePackageScripts: true,

  directories: {
    output: 'dist',
    buildResources: 'assets'
  },

  files: [
    'out/**/*',
    'node_modules/**/*',
    '!node_modules/.cache/**/*',
    '!node_modules/.bin/**/*',
    '!**/*.{md,txt,ts,map}',
    '!**/{.git,.github,__tests__,test,tests,spec,specs}/**'
  ],

  asar: true,
  asarUnpack: [
    'node_modules/better-sqlite3/**/*',
    'node_modules/bindings/**/*'
  ],

  extraResources: [
    {
      from: 'src/db/migrations',
      to: 'migrations'
    }
  ],

  // @electron/rebuild statt veraltetem electron-rebuild
  afterPack: async (ctx) => {
    const { execSync } = await import('child_process')
    const electronVersion = (
      ctx.packager as unknown as { electronVersion: string }
    ).electronVersion
    execSync(
      `npx @electron/rebuild --version ${electronVersion} --module-dir ${ctx.appOutDir}/resources/app.asar.unpacked`,
      { stdio: 'inherit' }
    )
  },

  publish: {
    provider: 'github',
    owner: 'XSaitoKungX',
    repo: 'Discord-CustomRPC',
    releaseType: 'release'
  },

  // ─── Windows ────────────────────────────────────────────────
  win: {
    target: [
      { target: 'nsis',     arch: ['x64', 'arm64'] },
      { target: 'portable', arch: ['x64'] }
    ],
    icon: 'assets/icon.png',
    requestedExecutionLevel: 'asInvoker',
    // Zeigt Verifier-Info im Installer
    verifyUpdateCodeSignature: false
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Discord Custom RPC Manager',
    // Zeigt Lizenz im Installer
    license: 'LICENSE',
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico'
  },

  // ─── Linux ──────────────────────────────────────────────────
  linux: {
    target: [
      { target: 'deb',      arch: ['x64', 'arm64'] },
      { target: 'AppImage', arch: ['x64', 'arm64'] },
      { target: 'rpm',      arch: ['x64', 'arm64'] }  // neu: Fedora/RHEL
    ],
    icon: 'assets/icon.png',
    category: 'Utility',
    desktop: {
      name: 'Discord Custom RPC Manager',
      comment: 'Manage your Discord Rich Presence profiles',
      StartupNotify: true  // boolean, nicht string
    }
  },

  deb: {
    depends: ['libgtk-3-0', 'libnotify4', 'libnss3', 'libxss1', 'libxtst6']
  },

  // ─── Mac ────────────────────────────────────────────────────
  mac: {
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] }  // neu: Pflicht für Auto-Updater
    ],
    icon: 'assets/icon.png',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'assets/entitlements.mac.plist',
    entitlementsInherit: 'assets/entitlements.mac.plist'
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ],
    // Schöneres DMG Fenster
    window: { width: 540, height: 380 }
  }
}

export default config