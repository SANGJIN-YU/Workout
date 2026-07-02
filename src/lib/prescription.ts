import type { BodyInfo, Locale, Prescription, PrescriptionSource, WeekLog } from '../types'
import { buildTrendSummary, percentChange } from './volume'
import { buildPrescriptionPrompt, type ParsedPrescription } from './prescriptionPrompt'
import { requestPrescriptionFromAi } from './aiClient'
import { translate, type TranslationDict } from '../i18n/translations'
import { formatNumber } from '../i18n/format'

function nextMonday(fromIso?: string): string {
  const base = fromIso ? new Date(`${fromIso}T00:00:00`) : new Date()
  const day = base.getDay()
  const daysUntilNextMonday = fromIso ? 7 : ((8 - day) % 7 || 7)
  const next = new Date(base)
  next.setDate(base.getDate() + daysUntilNextMonday)
  return next.toISOString().slice(0, 10)
}

/** Rule-based prescription that lets the core loop work without an AI key (codifies plan section 5-1's principles directly). */
export function generateRuleBasedPrescription(weeks: WeekLog[], locale: Locale): ParsedPrescription {
  const summary = buildTrendSummary(weeks)
  const latest = summary.latest
  const tr = (key: keyof TranslationDict['rulePrescription'], vars?: Record<string, string | number>) =>
    translate(locale, 'rulePrescription', key, vars)

  if (!latest) {
    return {
      missionTitle: tr('noHistoryMission'),
      targetVolumeKg: 0,
      rationale: tr('noHistoryRationale'),
    }
  }

  const volume = latest.volume

  if (summary.points.length < 2) {
    const target = Math.round(volume)
    return {
      missionTitle: tr('singleWeekMission', { target: formatNumber(target, locale) }),
      targetVolumeKg: target,
      rationale: tr('singleWeekRationale', { count: summary.points.length, volume: formatNumber(volume, locale) }),
    }
  }

  if (summary.stagnant) {
    const target = Math.round(volume * 1.05)
    const recentVolumes = summary.points
      .slice(-3)
      .map((p) => formatNumber(p.volume, locale))
      .join('kg → ')
    return {
      missionTitle: tr('stagnantMission', { target: formatNumber(target, locale) }),
      targetVolumeKg: target,
      rationale: tr('stagnantRationale', { recentVolumes }),
    }
  }

  if (summary.driver === 'weight-driven') {
    const target = Math.round(volume * 1.03)
    return {
      missionTitle: tr('weightDrivenMission', { target: formatNumber(target, locale) }),
      targetVolumeKg: target,
      rationale: tr('weightDrivenRationale', { percent: summary.lastChangePercent.toFixed(1) }),
    }
  }

  if (summary.driver === 'rep-driven') {
    const target = Math.round(volume * 1.03)
    return {
      missionTitle: tr('repDrivenMission', { target: formatNumber(target, locale) }),
      targetVolumeKg: target,
      rationale: tr('repDrivenRationale', { percent: summary.lastChangePercent.toFixed(1) }),
    }
  }

  if (summary.driver === 'declined') {
    const prevPoint = summary.points[summary.points.length - 2]
    const target = Math.round(prevPoint.volume)
    return {
      missionTitle: tr('declinedMission', { target: formatNumber(target, locale) }),
      targetVolumeKg: target,
      rationale: tr('declinedRationale', {
        percent: summary.lastChangePercent.toFixed(1),
        prevVolume: formatNumber(prevPoint.volume, locale),
        currentVolume: formatNumber(volume, locale),
      }),
    }
  }

  if (summary.driver === 'flat') {
    const target = Math.round(volume * 1.02)
    return {
      missionTitle: tr('flatMission', { target: formatNumber(target, locale) }),
      targetVolumeKg: target,
      rationale: tr('flatRationale', { percent: summary.lastChangePercent.toFixed(1) }),
    }
  }

  const target = Math.round(volume * 1.04)
  return {
    missionTitle: tr('growthMission', { target: formatNumber(target, locale) }),
    targetVolumeKg: target,
    rationale: tr('growthRationale', { percent: summary.lastChangePercent.toFixed(1) }),
  }
}

export interface GeneratedPrescription {
  prescription: Prescription
}

export async function generatePrescription(
  bodyInfo: BodyInfo,
  weeks: WeekLog[],
  apiKey: string | null,
  locale: Locale,
): Promise<Prescription> {
  const summary = buildTrendSummary(weeks)
  const previousVolumeKg = summary.latest?.volume ?? 0
  const weekStart = nextMonday(summary.latest?.weekStart)

  let parsed: ParsedPrescription
  let source: PrescriptionSource

  if (apiKey) {
    const prompt = buildPrescriptionPrompt(bodyInfo, weeks, locale)
    parsed = await requestPrescriptionFromAi(apiKey, prompt, locale)
    source = 'ai'
  } else {
    parsed = generateRuleBasedPrescription(weeks, locale)
    source = 'rule-based'
  }

  return {
    id: `${weekStart}-${Date.now()}`,
    weekStart,
    missionTitle: parsed.missionTitle,
    targetVolumeKg: parsed.targetVolumeKg,
    previousVolumeKg,
    changePercent: percentChange(previousVolumeKg, parsed.targetVolumeKg),
    rationale: parsed.rationale,
    source,
    generatedAt: new Date().toISOString(),
  }
}
