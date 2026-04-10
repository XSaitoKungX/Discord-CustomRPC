import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import type { RPCProfile } from '../../types/profile'
import { formatDistanceToNow } from 'date-fns'

interface RPCPreviewProps {
  profile: Partial<RPCProfile>
}

export function RPCPreview({ profile }: RPCPreviewProps): JSX.Element {
  const [elapsed, setElapsed] = useState<string>('00:00')
  const [startTime] = useState(() => new Date())

  useEffect(() => {
    if (!profile.showElapsedTime) return
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      if (h > 0) {
        setElapsed(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      } else {
        setElapsed(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [profile.showElapsedTime, startTime])

  return (
    // Always dark preview regardless of app theme
    <div className="rounded-xl overflow-hidden" style={{ background: '#1e1f22', fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Discord-style header */}
      <div className="px-3 pt-3 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#b5bac1' }}>
          Playing a game
        </p>
      </div>

      <div className="px-3 pb-3 flex gap-3">
        {/* Large image */}
        <div className="relative flex-shrink-0">
          <div
            className="w-[72px] h-[72px] rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: '#313338' }}
          >
            {profile.largeImageKey ? (
              <img
                src={`https://cdn.discordapp.com/app-assets/${profile.applicationId}/${profile.largeImageKey}.png`}
                alt={profile.largeImageText ?? 'large image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-zinc-600" />
            )}
          </div>

          {/* Small image overlay */}
          {profile.smallImageKey && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center overflow-hidden"
              style={{ background: '#313338', borderColor: '#1e1f22' }}
            >
              <img
                src={`https://cdn.discordapp.com/app-assets/${profile.applicationId}/${profile.smallImageKey}.png`}
                alt={profile.smallImageText ?? 'small image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center gap-0.5 min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: '#f2f3f5' }}>
            {profile.name || 'Application Name'}
          </p>
          {profile.details && (
            <p className="text-[12px] truncate" style={{ color: '#b5bac1' }}>
              {profile.details}
            </p>
          )}
          {profile.state && (
            <p className="text-[12px] truncate" style={{ color: '#b5bac1' }}>
              {profile.state}
            </p>
          )}
          {profile.showElapsedTime && (
            <p className="text-[12px]" style={{ color: '#b5bac1' }}>
              {elapsed} elapsed
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      {(profile.button1Label || profile.button2Label) && (
        <div className="px-3 pb-3 flex flex-col gap-1.5">
          {profile.button1Label && (
            <button
              className="w-full py-1.5 rounded text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ background: '#4e505880', color: '#f2f3f5' }}
            >
              {profile.button1Label}
            </button>
          )}
          {profile.button2Label && (
            <button
              className="w-full py-1.5 rounded text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ background: '#4e505880', color: '#f2f3f5' }}
            >
              {profile.button2Label}
            </button>
          )}
        </div>
      )}

      {/* Party */}
      {profile.partySize !== undefined && profile.partyMax !== undefined && (
        <div className="px-3 pb-3">
          <p className="text-[12px]" style={{ color: '#b5bac1' }}>
            {profile.partySize} of {profile.partyMax} in party
          </p>
        </div>
      )}
    </div>
  )
}
