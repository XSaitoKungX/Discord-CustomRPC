import { Monitor, ExternalLink, Zap, Layers, Clock, MousePointerClick, Users } from 'lucide-react'

interface StepsProps {
  step: number
}

const FEATURES = [
  { icon: Layers, label: 'Multiple Profiles', desc: 'Switch between activities instantly' },
  { icon: Clock, label: 'Smart Timestamps', desc: 'Elapsed time or custom countdown' },
  { icon: MousePointerClick, label: 'Custom Buttons', desc: 'Up to 2 clickable links' },
  { icon: Users, label: 'Party Support', desc: 'Show group size in your status' }
]

const steps = [
  {
    icon: Monitor,
    color: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    title: 'Make sure Discord is running',
    description:
      'Rich Presence only works with the Discord Desktop App. The browser version does not support it.',
    hint: { text: 'Download at discord.com/download', link: 'https://discord.com/download' }
  },
  {
    icon: ExternalLink,
    color: 'from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    title: 'Create a Discord Application',
    description:
      'Head to the Developer Portal, click "New Application" and give it a name — that name appears as your activity in Discord. Then copy the Application ID.',
    hint: { text: 'Open Discord Developer Portal', link: 'https://discord.com/developers/applications' }
  },
  {
    icon: Zap,
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    title: 'Create & Activate a Profile',
    description:
      'Go to Profiles, click "New Profile", paste your Application ID and fill in your activity details. Hit Activate — your status appears in Discord within seconds.',
    hint: { text: 'You can create unlimited profiles and switch between them anytime' }
  }
]

export function Steps({ step }: StepsProps): React.ReactElement {
  const current = steps[step]
  if (!current) return <></>
  const Icon = current.icon

  return (
    <div className="space-y-5">
      {/* Step card */}
      <div className={`rounded-xl bg-linear-to-br ${current.color} border ${current.borderColor} p-5 space-y-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-background/60 border ${current.borderColor} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${current.iconColor}`} />
          </div>
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-widest ${current.iconColor} opacity-80`}>Step {step + 1} of 3</p>
            <h2 className="text-[15px] font-semibold text-foreground leading-tight">{current.title}</h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className={`text-xs ${current.iconColor}`}>→</span>
          {current.hint.link ? (
            <a
              href={current.hint.link}
              target="_blank"
              rel="noreferrer"
              className={`text-xs font-medium ${current.iconColor} hover:underline underline-offset-2`}
            >
              {current.hint.text}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">{current.hint.text}</span>
          )}
        </div>
      </div>

      {/* Feature grid — only on last step */}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map(({ icon: FIcon, label, desc }) => (
            <div key={label} className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <FIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
