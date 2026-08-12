import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormatDate(date: string | null | undefined, fallback = ''): string {
  if (!date) return fallback
  const d = new Date(date)
  return isNaN(d.getTime()) ? fallback : d.toLocaleDateString()
}
