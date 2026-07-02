import type { BodyInfo, Locale, WeekLog } from '../types'
import { translate } from '../i18n/translations'
import { buildTrendSummary } from './volume'

const PROMPT_TEMPLATES: Record<
  Locale,
  {
    intro: string
    bodyInfoHeading: (info: BodyInfo) => string
    historyHeading: string
    noHistory: string
    principlesHeading: string
    principles: string[]
    outputHeading: string
    outputInstruction: string
  }
> = {
  ko: {
    intro:
      '당신은 웨이트 트레이닝 데이터를 근거로 다음 주 훈련을 처방하는 전문 코치입니다.\n"총 볼륨(무게 × 횟수 × 세트)"의 추세만 근거로 사용하고, 추측이나 일반론을 덧붙이지 마세요.',
    bodyInfoHeading: (info) => `[사용자 신체 정보]\n키: ${info.heightCm}cm, 몸무게: ${info.weightKg}kg, 나이: ${info.age}세`,
    historyHeading: '[최근 주간 볼륨 기록]',
    noHistory: '기록 없음',
    principlesHeading: '[반드시 지킬 처방 원칙]',
    principles: [
      '1. 볼륨 해석의 정직성: 볼륨 상승이 "고중량 사용"(강도 상승) 때문인지 "저중량 반복 증가"(지구력 위주) 때문인지 구분해서 판단하라.',
      '2. 정체 감지: 최근 2~3주 볼륨이 거의 제자리(변동폭 3% 이내)라면 "정체 구간"으로 판정하고, 반드시 변화(중량/반복/세트 구성 변경 등)를 처방하라.',
      '3. 근거 노출: 처방 이유는 반드시 위 데이터의 구체적 수치를 인용해서 설명하라. 예: "지난 3주 볼륨이 4,100~4,200kg에서 정체 + 체중 대비 성장 여지 있음 → 5% 증량 처방".',
      '4. 미션형 프레이밍: 처방은 표가 아니라 "이번 주 미션: [구체적 목표]" 형태의 한 문장으로 제시하라.',
    ],
    outputHeading: '[출력 형식]',
    outputInstruction: `다른 설명 없이 아래 JSON 객체 하나만 출력하라 (마크다운 코드블록 없이):
{
  "missionTitle": "이번 주 미션: ... (목표 N,NNNkg)" 형태의 한 문장,
  "targetVolumeKg": 다음 주 목표 총 볼륨 (숫자),
  "rationale": "추세 데이터를 인용한 근거 1~2문장"
}`,
  },
  en: {
    intro:
      'You are an expert coach who prescribes next week\'s training based on weight-training data.\nUse only the trend in "total volume (weight × reps × sets)" as evidence — do not add speculation or generic advice.',
    bodyInfoHeading: (info) => `[User body info]\nHeight: ${info.heightCm}cm, Weight: ${info.weightKg}kg, Age: ${info.age}`,
    historyHeading: '[Recent weekly volume history]',
    noHistory: 'No records yet',
    principlesHeading: '[Prescription principles you must follow]',
    principles: [
      '1. Honest volume interpretation: determine whether a volume increase is driven by "heavier weight" (intensity up) or "more reps at lower weight" (endurance-focused).',
      '2. Stagnation detection: if volume has been roughly flat for the last 2-3 weeks (within 3% variance), classify it as a "plateau" and you must prescribe a change (weight, reps, or set structure).',
      '3. Evidence citation: justify the prescription by citing the specific numbers from the data above. Example: "Volume has plateaued at 4,100-4,200kg for 3 weeks, and there is room to grow relative to bodyweight → prescribing a 5% increase."',
      '4. Mission framing: present the prescription as a single sentence in the form "This week\'s mission: [concrete goal]", not a table.',
    ],
    outputHeading: '[Output format]',
    outputInstruction: `Output only the JSON object below, with no other explanation and no markdown code block:
{
  "missionTitle": a single sentence in the form "This week's mission: ... (target N,NNNkg)",
  "targetVolumeKg": next week's target total volume (number),
  "rationale": "1-2 sentences of reasoning citing the trend data"
}`,
  },
}

/**
 * Prescription prompt v1 (business plan section 5-1).
 * Must include: (1) heavy-weight vs. low-weight-rep interpretation (2) stagnation detection
 * (3) evidence citation from the trend (4) mission-style framing. The model is forced to
 * respond with the JSON schema below, in the requested locale.
 */
export function buildPrescriptionPrompt(bodyInfo: BodyInfo, weeks: WeekLog[], locale: Locale): string {
  const summary = buildTrendSummary(weeks)
  const tpl = PROMPT_TEMPLATES[locale]
  const history = summary.points
    .map((p, i) =>
      locale === 'ko'
        ? `${i + 1}주차 (${p.weekStart}): 총 볼륨 ${Math.round(p.volume).toLocaleString()}kg, 평균 세트당 강도 ${p.avgIntensity.toFixed(1)}kg/rep`
        : `Week ${i + 1} (${p.weekStart}): total volume ${Math.round(p.volume).toLocaleString()}kg, avg intensity per rep ${p.avgIntensity.toFixed(1)}kg/rep`,
    )
    .join('\n')

  return `${tpl.intro}

${tpl.bodyInfoHeading(bodyInfo)}

${tpl.historyHeading}
${history || tpl.noHistory}

${tpl.principlesHeading}
${tpl.principles.join('\n')}

${tpl.outputHeading}
${tpl.outputInstruction}`
}

export interface ParsedPrescription {
  missionTitle: string
  targetVolumeKg: number
  rationale: string
}

export function parsePrescriptionResponse(text: string, locale: Locale): ParsedPrescription {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(translate(locale, 'errors', 'aiJsonMissing'))
  const parsed = JSON.parse(jsonMatch[0])
  if (
    typeof parsed.missionTitle !== 'string' ||
    typeof parsed.targetVolumeKg !== 'number' ||
    typeof parsed.rationale !== 'string'
  ) {
    throw new Error(translate(locale, 'errors', 'aiInvalidFormat'))
  }
  return parsed
}
