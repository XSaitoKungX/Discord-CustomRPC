import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function getShareUrl(profile: object): string {
  const json = JSON.stringify(profile)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return `https://xsaitox.dev/discord-customrpc/share?data=${b64}`
}

export function decodeShareData(b64: string): object | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch {
    return null
  }
}
