import { useState, useEffect } from 'react'
import { GitFork, Globe, Heart, Shield, ExternalLink } from 'lucide-react'
import { isElectron } from '../lib/electron'

export function About(): JSX.Element {
  const [version, setVersion] = useState<string>('...')

  useEffect(() => {
    if (!isElectron()) return
    window.api.app.version().then(setVersion)
  }, [])

  return (
    <div className="p-6 max-w-lg space-y-8">
      {/* App identity */}
      <div className="space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
          <span className="text-2xl">🎮</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Discord Custom RPC Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">v{version} · MIT License</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A free, open source tool to create and manage custom Discord Rich Presence profiles.
          No token required — uses only the official Discord IPC protocol.
        </p>
      </div>

      {/* Security notice */}
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
        <div className="flex items-center gap-2 text-green-400">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-semibold">Security & Privacy</span>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>✓ No Discord token required or stored</li>
          <li>✓ All data stored locally in SQLite</li>
          <li>✓ Only communicates via local Discord IPC</li>
          <li>✓ Auto-updates via GitHub Releases only</li>
          <li>✓ 100% open source — audit the code yourself</li>
        </ul>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Links</h2>
        <div className="space-y-1.5">
          {[
            { icon: GitFork, label: 'GitHub Repository', href: 'https://github.com/XSaitoKungX/Discord-CustomRPC' },
            { icon: Globe, label: 'Website', href: 'https://xsaitox.dev/discord-customrpc' },
            { icon: ExternalLink, label: 'Discord Developer Portal', href: 'https://discord.com/developers/applications' },
            { icon: ExternalLink, label: 'Report a Bug', href: 'https://github.com/XSaitoKungX/Discord-CustomRPC/issues/new?template=bug_report.md' },
            { icon: ExternalLink, label: 'Request a Feature', href: 'https://github.com/XSaitoKungX/Discord-CustomRPC/issues/new?template=feature_request.md' }
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border hover:bg-accent/10 transition-all"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Credits */}
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        Made with <Heart className="w-3 h-3 text-red-400" /> by{' '}
        <a
          href="https://xsaitox.dev"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          XSaitoKungX
        </a>
      </p>
    </div>
  )
}
