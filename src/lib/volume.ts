import type { WeekLog } from '../types'

/** 총 볼륨 = 무게 × 횟수 × 세트 (모든 세트 합산) */
export function weekVolume(week: WeekLog): number {
  return week.exercises.reduce((exerciseSum, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setSum, set) => setSum + set.weightKg * set.reps, 0)
    return exerciseSum + exerciseVolume
  }, 0)
}

export function weekTotalReps(week: WeekLog): number {
  return week.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.reduce((s, set) => s + set.reps, 0),
    0,
  )
}

/** 볼륨을 총 반복수로 나눈 평균 세트당 무게. 강도(intensity)의 대리 지표. */
export function weekAvgIntensity(week: WeekLog): number {
  const reps = weekTotalReps(week)
  if (reps === 0) return 0
  return weekVolume(week) / reps
}

export interface WeeklyPoint {
  weekStart: string
  volume: number
  avgIntensity: number
}

export type VolumeDriver = 'weight-driven' | 'rep-driven' | 'mixed' | 'flat' | 'declined' | 'insufficient-data'

const STAGNATION_THRESHOLD_PCT = 3 // 정체로 판단하는 변동폭 기준 (±3% 이내)
const STAGNATION_WINDOW = 3 // 정체 판정에 사용하는 최근 주 수

export function sortedWeeklyPoints(weeks: WeekLog[]): WeeklyPoint[] {
  return [...weeks]
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .map((w) => ({ weekStart: w.weekStart, volume: weekVolume(w), avgIntensity: weekAvgIntensity(w) }))
}

/** 최근 STAGNATION_WINDOW주 간 볼륨 변동폭이 임계치 이내면 정체 구간으로 판정. */
export function isStagnant(points: WeeklyPoint[]): boolean {
  if (points.length < STAGNATION_WINDOW) return false
  const recent = points.slice(-STAGNATION_WINDOW)
  const volumes = recent.map((p) => p.volume)
  const max = Math.max(...volumes)
  const min = Math.min(...volumes)
  if (max === 0) return false
  return (max - min) / max <= STAGNATION_THRESHOLD_PCT / 100
}

/** 직전 대비 볼륨 상승이 고중량(강도 상승) 때문인지, 저중량 반복 증가 때문인지 판정. */
export function classifyVolumeDriver(points: WeeklyPoint[]): VolumeDriver {
  if (points.length < 2) return 'insufficient-data'
  const prev = points[points.length - 2]
  const curr = points[points.length - 1]
  const volumeChange = prev.volume === 0 ? 0 : (curr.volume - prev.volume) / prev.volume

  if (volumeChange <= -0.02) return 'declined'
  if (volumeChange < 0.02) return 'flat'

  const intensityChange = prev.avgIntensity === 0 ? 0 : (curr.avgIntensity - prev.avgIntensity) / prev.avgIntensity
  const intensityUp = intensityChange > 0.02
  const repsShareUp = volumeChange - intensityChange > 0.02

  if (intensityUp && !repsShareUp) return 'weight-driven'
  if (repsShareUp && !intensityUp) return 'rep-driven'
  return 'mixed'
}

export function percentChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100
  return ((to - from) / from) * 100
}

export interface TrendSummary {
  points: WeeklyPoint[]
  latest: WeeklyPoint | null
  stagnant: boolean
  driver: VolumeDriver
  lastChangePercent: number
}

export function buildTrendSummary(weeks: WeekLog[]): TrendSummary {
  const points = sortedWeeklyPoints(weeks)
  const latest = points.length > 0 ? points[points.length - 1] : null
  const previous = points.length > 1 ? points[points.length - 2] : null
  return {
    points,
    latest,
    stagnant: isStagnant(points),
    driver: classifyVolumeDriver(points),
    lastChangePercent: previous && latest ? percentChange(previous.volume, latest.volume) : 0,
  }
}
