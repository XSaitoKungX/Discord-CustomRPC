import { Monitor, ExternalLink, Zap } from 'lucide-react'

interface StepsProps {
  step: number
}

const steps = [
  {
    icon: Monitor,
    title: 'Open Discord Desktop',
    description:
      'Make sure Discord Desktop App is running. The web version does not support Rich Presence — you need the desktop client.',
    hint: 'Download Discord at discord.com/download'
  },
  {
    icon: ExternalLink,
    title: 'Create a Discord Application',
    description:
      'Go to the Discord Developer Portal, click "New Application", give it a name (this becomes your activity name), and copy the Application ID.',
    hint: 'discord.com/developers/applications',
    link: 'https://discord.com/developers/applications'
  },
  {
    icon: Zap,
    title: 'Create & Activate a Profile',
    description:
      'Click "New Profile" in the Profiles page, paste your Application ID, fill in your activity details, and hit Activate. Your status will update in Discord within seconds!',
    hint: 'You can create multiple profiles and switch between them anytime'
  }
]

export function Steps({ step }: StepsProps): React.ReactElement {
  const current = steps[step]
  if (!current) return <></>

  const Icon = current.icon

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary">Step {step + 1} of 3</span>
          </div>
          <h2 className="text-base font-semibold text-foreground">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
        </div>
      </div>

      <div className="pl-16">
        <div className="px-3 py-2.5 rounded-lg bg-background/50 border border-border text-xs text-muted-foreground flex items-center gap-2">
          <span className="text-primary">💡</span>
          {current.link ? (
            <a
              href={current.link}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {current.hint}
            </a>
          ) : (
            <span>{current.hint}</span>
          )}
        </div>
      </div>
    </div>
  )
}
