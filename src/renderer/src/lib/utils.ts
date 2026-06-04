import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(bin)
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64)
  const bytes = Uint8Array.from([...bin].map((c) => c.charCodeAt(0)))
  return new TextDecoder().decode(bytes)
}

export function getShareUrl(profile: object): string {
  const json = JSON.stringify(profile)
  const b64 = utf8ToBase64(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `https://xsaitox.dev/en/discord-customrpc/share?data=${b64}`
}

export function decodeShareData(b64: string): object | null {
  try {
    const normalized = b64.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    return JSON.parse(base64ToUtf8(padded))
  } catch {
    return null
  }
}
