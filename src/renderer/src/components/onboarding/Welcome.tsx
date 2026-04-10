import { useState } from 'react'
import { Steps } from './Steps'
import { X } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { isElectron } from '../../lib/electron'

interface WelcomeProps {
  onClose: () => void
}

export function Welcome({ onClose }: WelcomeProps): JSX.Element {
  const [step, setStep] = useState(0)
  const { setSetting } = useSettingsStore()

  const handleDontShow = async (): Promise<void> => {
    setSetting('showOnboarding', false)
    if (isElectron()) await window.api.settings.set('showOnboarding', false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[560px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-primary/20 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome to</p>
            <h1 className="text-2xl font-bold text-foreground">Discord Custom RPC Manager</h1>
            <p className="text-sm text-muted-foreground">Your Discord, Your Style. Let's get you set up in 3 easy steps.</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/60' : 'w-3 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 py-6">
          <Steps step={step} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-6">
          <button
            onClick={handleDontShow}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Don't show again
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
