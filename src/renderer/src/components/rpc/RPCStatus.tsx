import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { RPCStatus as RPCStatusType } from '../../types/rpc'

interface RPCStatusProps {
  status: RPCStatusType
  error?: string | null
  className?: string
}

export function RPCStatus({ status, error, className }: RPCStatusProps): React.ReactElement {
  const config = {
    connected: {
      icon: Wifi,
      label: 'Connected',
      className: 'text-green-400 bg-green-500/10 border-green-500/20'
    },
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      className: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    },
    error: {
      icon: AlertCircle,
      label: error ?? 'Connection error',
      className: 'text-red-400 bg-red-500/10 border-red-500/20'
    }
  }

  const { icon: Icon, label, className: colorClass } = config[status]

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
        colorClass,
        className
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}
