import type { Locale } from '../types'

function toIntlLocale(locale: Locale): string {
  return locale === 'ko' ? 'ko-KR' : 'en-US'
}

export function formatNumber(value: number, locale: Locale): string {
  return Math.round(value).toLocaleString(toIntlLocale(locale))
}

export function formatWeekLabel(weekStartIso: string, locale: Locale): string {
  const d = new Date(`${weekStartIso}T00:00:00`)
  const formatted = d.toLocaleDateString(toIntlLocale(locale), { month: 'long', day: 'numeric' })
  return locale === 'ko' ? `${formatted} 주` : `Week of ${formatted}`
}
