import { cn } from '../../lib/utils'
import { useTheme } from '../../hooks/useTheme'
import type { AppTheme } from '../../types/rpc'

const themes: { id: AppTheme; label: string; accent: string; bg: string; desc: string }[] = [
  { id: 'default', label: 'Default', accent: '#5865F2', bg: '#0a0a14', desc: 'Discord Blurple' },
  { id: 'dark', label: 'Dark', accent: '#7289DA', bg: '#0d0d0d', desc: 'Ultra Dark' },
  { id: 'light', label: 'Light', accent: '#5865F2', bg: '#f5f5f5', desc: 'Clean Light' },
  { id: 'space', label: 'Space', accent: '#a78bfa', bg: '#0a0015', desc: 'Cosmic Purple' },
  { id: 'anime', label: 'Anime', accent: '#ff6b9d', bg: '#1a0a2e', desc: 'Neon Pink' },
  { id: 'kawaii', label: 'Kawaii', accent: '#ff9de2', bg: '#fff0f8', desc: 'Soft Pink' },
  { id: 'dev', label: 'Dev', accent: '#00ff41', bg: '#0d0d0d', desc: 'Matrix Green' }
]

export function ThemeSelector(): JSX.Element {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Theme</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose your visual style</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
              theme === t.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card/30 hover:border-border/80 hover:bg-card/60'
            )}
          >
            {/* Color preview */}
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/10"
              style={{ background: t.bg }}
            >
              <div
                className="w-3 h-3 rounded-full mt-1 mx-auto"
                style={{ background: t.accent }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{t.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t.desc}</p>
            </div>
            {theme === t.id && (
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: t.accent }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
