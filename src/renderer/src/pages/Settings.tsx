import { Settings2 } from 'lucide-react'
import { SettingsPanel } from '../components/settings/SettingsPanel'

export function Settings(): React.ReactElement {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage app preferences and data</p>
          </div>
        </div>
        <SettingsPanel />
      </div>
    </div>
  )
}
