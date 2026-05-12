import { useState } from 'react'
import { Steps } from './Steps'
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { isElectron } from '../../lib/electron'
import { cn } from '../../lib/utils'

interface WelcomeProps {
  onClose: () => void
}

const TOTAL_STEPS = 3

export function Welcome({ onClose }: WelcomeProps): React.ReactElement {
  const [step, setStep] = useState(0)
  const { setSetting } = useSettingsStore()

  const handleDontShow = async (): Promise<void> => {
    setSetting('showOnboarding', false)
    if (isElectron()) await window.api.settings.set('showOnboarding', false)
    onClose()
  }

  const isLast = step === TOTAL_STEPS - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="w-[580px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="relative px-8 pt-7 pb-5 bg-linear-to-br from-primary/15 via-primary/5 to-transparent">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title row */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-0.5">Getting started</p>
              <h1 className="text-xl font-bold text-foreground leading-tight">Discord Custom RPC Manager</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Set up your custom Rich Presence in 3 quick steps.</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                  i === step
                    ? 'w-8 bg-primary'
                    : i < step
                      ? 'w-4 bg-primary/50 hover:bg-primary/70'
                      : 'w-4 bg-muted hover:bg-muted-foreground/30'
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
            <span className="ml-auto text-[11px] font-medium text-muted-foreground tabular-nums">
              {step + 1} / {TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 py-5">
          <Steps step={step} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-6 pt-1">
          <button
            onClick={handleDontShow}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Don't show again
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Let's go!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
