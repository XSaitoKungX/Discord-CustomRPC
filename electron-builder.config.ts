import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'dev.xsaitox.discord-custom-rpc',
  productName: 'Discord Custom RPC Manager',
  copyright: 'Copyright © 2026 XSaitoKungX',
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
  // Rebuild native modules for the target Electron version
  afterPack: async (ctx) => {
    const { execSync } = await import('child_process')
    execSync(
      `npx electron-rebuild --version ${ctx.electronVersion} --module-dir ${ctx.appOutDir}/resources/app.asar.unpacked`,
      { stdio: 'inherit' }
    )
  },
  publish: {
    provider: 'github',
    owner: 'XSaitoKungX',
    repo: 'Discord-CustomRPC',
    releaseType: 'release'
  },
  win: {
    target: [
      { target: 'nsis', arch: ['x64', 'arm64'] },
      { target: 'portable', arch: ['x64'] }
    ],
    icon: 'assets/icon.png',
    requestedExecutionLevel: 'asInvoker'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Discord Custom RPC Manager'
  },
  linux: {
    target: [
      { target: 'deb', arch: ['x64', 'arm64'] },
      { target: 'AppImage', arch: ['x64', 'arm64'] }
    ],
    publish: ['github'],
    snap: {
      publish: null
    },
    icon: 'assets/icon.png',
    category: 'Utility',
    desktop: {
      Name: 'Discord Custom RPC Manager',
      Comment: 'Manage your Discord Rich Presence profiles',
      StartupNotify: 'true'
    }
  },
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
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
    ]
  }
}

export default config
