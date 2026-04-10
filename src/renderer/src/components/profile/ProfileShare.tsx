import { useState } from 'react'
import { Copy, Check, ExternalLink, Download, X } from 'lucide-react'
import { getShareUrl } from '../../lib/utils'
import type { RPCProfile } from '../../types/profile'

interface ProfileShareProps {
  profile: RPCProfile
  onClose: () => void
}

export function ProfileShare({ profile, onClose }: ProfileShareProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const shareUrl = getShareUrl(profile)

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = (): void => {
    const json = JSON.stringify(profile, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Share Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Share <span className="font-medium text-foreground">{profile.name}</span> with others. They can import it directly with one click.
        </p>

        {/* Share URL */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Share Link</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-xs text-muted-foreground font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Deep link */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deep Link (discordrpc://)</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`discordrpc://import?data=${shareUrl.split('data=')[1]}`}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-xs text-muted-foreground font-mono focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">Opens the app directly and imports the profile.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Browser
          </a>
        </div>
      </div>
    </div>
  )
}
