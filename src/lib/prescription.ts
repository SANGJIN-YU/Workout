import type { BodyInfo, Prescription, PrescriptionSource, WeekLog } from '../types'
import { buildTrendSummary, percentChange } from './volume'
import { buildPrescriptionPrompt, type ParsedPrescription } from './prescriptionPrompt'
import { requestPrescriptionFromAi } from './aiClient'

function nextMonday(fromIso?: string): string {
  const base = fromIso ? new Date(`${fromIso}T00:00:00`) : new Date()
  const day = base.getDay()
  const daysUntilNextMonday = fromIso ? 7 : ((8 - day) % 7 || 7)
  const next = new Date(base)
  next.setDate(base.getDate() + daysUntilNextMonday)
  return next.toISOString().slice(0, 10)
}

/** AI API 없이도 핵심 루프를 검증할 수 있는 규칙 기반 처방 (기획서 5-1 원칙을 그대로 코드화). */
export function generateRuleBasedPrescription(weeks: WeekLog[]): ParsedPrescription {
  const summary = buildTrendSummary(weeks)
  const latest = summary.latest

  if (!latest) {
    return {
      missionTitle: '이번 주 미션: 기준선 측정 — 편하게 기록만 남기기',
      targetVolumeKg: 0,
      rationale: '아직 기록이 없어 추세를 계산할 수 없습니다. 이번 주는 볼륨 목표 없이 기록만 쌓아 기준선을 만듭니다.',
    }
  }

  const volume = latest.volume

  if (summary.points.length < 2) {
    return {
      missionTitle: `이번 주 미션: 지난주와 비슷한 강도로 한 번 더 (목표 ${Math.round(volume).toLocaleString()}kg)`,
      targetVolumeKg: Math.round(volume),
      rationale: `기록이 ${summary.points.length}주뿐이라 추세 판단이 어렵습니다. 지난주 볼륨 ${Math.round(volume).toLocaleString()}kg을 유지하며 데이터를 한 주 더 쌓습니다.`,
    }
  }

  if (summary.stagnant) {
    const target = Math.round(volume * 1.05)
    const recentVolumes = summary.points
      .slice(-3)
      .map((p) => Math.round(p.volume).toLocaleString())
      .join('kg → ')
    return {
      missionTitle: `이번 주 미션: 정체 돌파 — 총 볼륨 5%↑ (목표 ${target.toLocaleString()}kg)`,
      targetVolumeKg: target,
      rationale: `최근 볼륨이 ${recentVolumes}kg으로 정체 구간(변동폭 3% 이내)에 진입했습니다. 중량 또는 세트 구성을 바꿔 자극을 새로 줘야 할 시점입니다.`,
    }
  }

  if (summary.driver === 'weight-driven') {
    const target = Math.round(volume * 1.03)
    return {
      missionTitle: `이번 주 미션: 고중량 흐름 유지 + 3%↑ (목표 ${target.toLocaleString()}kg)`,
      targetVolumeKg: target,
      rationale: `지난주 볼륨 상승(${summary.lastChangePercent.toFixed(1)}%)은 세트당 평균 강도 상승에 의한 고중량 성장 신호입니다. 무리하지 않는 선에서 3% 증량을 유지합니다.`,
    }
  }

  if (summary.driver === 'rep-driven') {
    const target = Math.round(volume * 1.03)
    return {
      missionTitle: `이번 주 미션: 반복 대신 중량으로 3%↑ (목표 ${target.toLocaleString()}kg)`,
      targetVolumeKg: target,
      rationale: `지난주 볼륨 상승(${summary.lastChangePercent.toFixed(1)}%)은 저중량 반복 증가가 주도했습니다. 지구력은 확보됐으니 이번 주는 반복 수 대신 중량을 올려 볼륨을 채워보세요.`,
    }
  }

  if (summary.driver === 'declined') {
    const prevPoint = summary.points[summary.points.length - 2]
    const target = Math.round(prevPoint.volume)
    return {
      missionTitle: `이번 주 미션: 회복 주간 — 이전 수준으로 복귀 (목표 ${target.toLocaleString()}kg)`,
      targetVolumeKg: target,
      rationale: `지난주 볼륨이 ${summary.lastChangePercent.toFixed(1)}% 감소했습니다(${Math.round(prevPoint.volume).toLocaleString()}kg → ${Math.round(volume).toLocaleString()}kg). 무리한 증량보다 이전 수준 회복을 목표로 컨디션을 다집니다.`,
    }
  }

  if (summary.driver === 'flat') {
    const target = Math.round(volume * 1.02)
    return {
      missionTitle: `이번 주 미션: 소폭 증량으로 다시 궤도 진입 (목표 ${target.toLocaleString()}kg)`,
      targetVolumeKg: target,
      rationale: `지난주 볼륨 변화(${summary.lastChangePercent.toFixed(1)}%)가 크지 않았습니다. 아직 정체 구간(연속 3주)은 아니지만, 2% 증량으로 상승 흐름을 다시 만들어봅니다.`,
    }
  }

  const target = Math.round(volume * 1.04)
  return {
    missionTitle: `이번 주 미션: 상승 흐름 이어가기 (목표 ${target.toLocaleString()}kg)`,
    targetVolumeKg: target,
    rationale: `지난주 볼륨이 ${summary.lastChangePercent.toFixed(1)}% 상승했고 중량·반복이 고르게 증가했습니다. 같은 방향으로 4% 증량을 처방합니다.`,
  }
}

export interface GeneratedPrescription {
  prescription: Prescription
}

export async function generatePrescription(
  bodyInfo: BodyInfo,
  weeks: WeekLog[],
  apiKey: string | null,
): Promise<Prescription> {
  const summary = buildTrendSummary(weeks)
  const previousVolumeKg = summary.latest?.volume ?? 0
  const weekStart = nextMonday(summary.latest?.weekStart)

  let parsed: ParsedPrescription
  let source: PrescriptionSource

  if (apiKey) {
    const prompt = buildPrescriptionPrompt(bodyInfo, weeks)
    parsed = await requestPrescriptionFromAi(apiKey, prompt)
    source = 'ai'
  } else {
    parsed = generateRuleBasedPrescription(weeks)
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
