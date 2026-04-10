import { Home, List, Settings, Info, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUiStore } from '../../store/uiStore'
import { useRpcStore } from '../../store/rpcStore'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: List, label: 'Profiles', path: '/profiles' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Info, label: 'About', path: '/about' }
]

export function Sidebar(): JSX.Element {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { status } = useRpcStore()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 border-r border-border bg-card/30 backdrop-blur-md',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-border', sidebarCollapsed && 'justify-center px-2')}>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          {/* Status dot */}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
              status === 'connected' && 'bg-green-500',
              status === 'disconnected' && 'bg-zinc-500',
              status === 'error' && 'bg-red-500'
            )}
          />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-foreground truncate">Custom RPC</p>
            <p className="text-xs text-muted-foreground truncate">Discord Manager</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                'hover:bg-accent/10 hover:text-accent',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground',
                sidebarCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
