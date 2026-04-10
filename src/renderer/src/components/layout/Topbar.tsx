import { HelpCircle, ExternalLink } from 'lucide-react'
import { useRpcStore } from '../../store/rpcStore'
import { cn } from '../../lib/utils'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/profiles': 'Profiles',
  '/settings': 'Settings',
  '/about': 'About'
}

export function Topbar(): JSX.Element {
  const { status } = useRpcStore()
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Discord Custom RPC'

  const statusColors = {
    connected: 'bg-green-500/20 text-green-400 border-green-500/30',
    disconnected: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const statusLabels = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error'
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/20 backdrop-blur-md">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        {/* RPC Status Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium',
            statusColors[status]
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              status === 'connected' && 'bg-green-400 animate-pulse',
              status === 'disconnected' && 'bg-zinc-400',
              status === 'error' && 'bg-red-400'
            )}
          />
          {statusLabels[status]}
        </div>

        {/* Discord Developer Portal link */}
        <a
          href="https://discord.com/developers/applications"
          target="_blank"
          rel="noreferrer"
          title="Discord Developer Portal"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Help */}
        <button
          title="Help"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
