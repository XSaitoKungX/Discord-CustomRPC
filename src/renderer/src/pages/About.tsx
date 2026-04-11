import React, { useState, useEffect } from 'react'
import { GitBranch, Globe, Bug, Sparkles, Shield, Lock, RefreshCw, Code2, ExternalLink } from 'lucide-react'
import { isElectron } from '../lib/electron'
import appIcon from '../assets/app-icon.png'
import saitoIcon from '../assets/saito-icon.png'

const LINKS = [
  {
    icon: GitBranch,
    label: 'GitHub Repository',
    description: 'View source code',
    href: 'https://github.com/XSaitoKungX/Discord-CustomRPC'
  },
  {
    icon: Globe,
    label: 'Website',
    description: 'xsaitox.dev/discord-customrpc',
    href: 'https://xsaitox.dev/discord-customrpc'
  },
  {
    icon: ExternalLink,
    label: 'Discord Developer Portal',
    description: 'Create your Application ID',
    href: 'https://discord.com/developers/applications'
  },
  {
    icon: Bug,
    label: 'Report a Bug',
    description: 'Open a GitHub Issue',
    href: 'https://github.com/XSaitoKungX/Discord-CustomRPC/issues/new?template=bug_report.md'
  },
  {
    icon: Sparkles,
    label: 'Request a Feature',
    description: 'Share your idea',
    href: 'https://github.com/XSaitoKungX/Discord-CustomRPC/issues/new?template=feature_request.md'
  }
]

const PRIVACY_ITEMS = [
  { icon: Lock, text: 'No Discord token required or stored' },
  { icon: Shield, text: 'All data stored locally on your device' },
  { icon: RefreshCw, text: 'Auto-updates via GitHub Releases only' },
  { icon: Code2, text: '100% open source — audit the code yourself' }
]

export function About(): React.ReactElement {
  const [version, setVersion] = useState<string>('...')

  useEffect(() => {
    if (!isElectron()) return
    window.api.app.version().then(setVersion)
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Hero */}
        <div className="relative rounded-2xl border border-border bg-linear-to-br from-primary/10 via-card to-card overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg ring-1 ring-border">
              <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Discord Custom RPC</h1>
              <p className="text-sm text-muted-foreground">Manager</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-mono font-medium">
                  v{version}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-xs font-medium">
                  MIT License
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                  Open Source
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            A free, open source desktop app to create and manage custom Discord Rich Presence profiles.
            No token required — connects directly via Discord's local IPC protocol.
          </p>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-semibold text-green-400">Privacy & Security</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRIVACY_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <div className="w-5 h-5 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 text-green-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Links</h2>
          <div className="grid grid-cols-1 gap-1.5">
            {LINKS.map(({ icon: Icon, label, description, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/10 hover:border-border transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Developer Card */}
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Developer</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/30 shrink-0">
              <img src={saitoIcon} alt="XSaitoKungX" className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">XSaitoKungX</p>
              <p className="text-xs text-muted-foreground">Apprentice Developer · Hobby Project</p>
              <a
                href="https://xsaitox.dev"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline mt-0.5 inline-block"
              >
                xsaitox.dev →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
