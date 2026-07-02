import type { BodyInfo, WeekLog } from '../types'
import { buildTrendSummary } from './volume'

/**
 * 처방 프롬프트 v1 (기획서 5-1)
 * 반드시 포함: (1) 고중량/저중량반복 해석 (2) 정체 감지 (3) 추세 근거 인용 (4) 미션형 프레이밍
 * 모델은 아래 JSON 스키마로만 응답하도록 강제한다.
 */
export function buildPrescriptionPrompt(bodyInfo: BodyInfo, weeks: WeekLog[]): string {
  const summary = buildTrendSummary(weeks)
  const history = summary.points
    .map(
      (p, i) =>
        `${i + 1}주차 (${p.weekStart}): 총 볼륨 ${Math.round(p.volume).toLocaleString()}kg, 평균 세트당 강도 ${p.avgIntensity.toFixed(1)}kg/rep`,
    )
    .join('\n')

  return `당신은 웨이트 트레이닝 데이터를 근거로 다음 주 훈련을 처방하는 전문 코치입니다.
"총 볼륨(무게 × 횟수 × 세트)"의 추세만 근거로 사용하고, 추측이나 일반론을 덧붙이지 마세요.

[사용자 신체 정보]
키: ${bodyInfo.heightCm}cm, 몸무게: ${bodyInfo.weightKg}kg, 나이: ${bodyInfo.age}세

[최근 주간 볼륨 기록]
${history || '기록 없음'}

[반드시 지킬 처방 원칙]
1. 볼륨 해석의 정직성: 볼륨 상승이 "고중량 사용"(강도 상승) 때문인지 "저중량 반복 증가"(지구력 위주) 때문인지 구분해서 판단하라.
2. 정체 감지: 최근 2~3주 볼륨이 거의 제자리(변동폭 3% 이내)라면 "정체 구간"으로 판정하고, 반드시 변화(중량/반복/세트 구성 변경 등)를 처방하라.
3. 근거 노출: 처방 이유는 반드시 위 데이터의 구체적 수치를 인용해서 설명하라. 예: "지난 3주 볼륨이 4,100~4,200kg에서 정체 + 체중 대비 성장 여지 있음 → 5% 증량 처방".
4. 미션형 프레이밍: 처방은 표가 아니라 "이번 주 미션: [구체적 목표]" 형태의 한 문장으로 제시하라.

[출력 형식]
다른 설명 없이 아래 JSON 객체 하나만 출력하라 (마크다운 코드블록 없이):
{
  "missionTitle": "이번 주 미션: ... (목표 N,NNNkg)" 형태의 한 문장,
  "targetVolumeKg": 다음 주 목표 총 볼륨 (숫자),
  "rationale": "추세 데이터를 인용한 근거 1~2문장"
}`
}

export interface ParsedPrescription {
  missionTitle: string
  targetVolumeKg: number
  rationale: string
}

export function parsePrescriptionResponse(text: string): ParsedPrescription {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
  const parsed = JSON.parse(jsonMatch[0])
  if (
    typeof parsed.missionTitle !== 'string' ||
    typeof parsed.targetVolumeKg !== 'number' ||
    typeof parsed.rationale !== 'string'
  ) {
    throw new Error('AI 응답 형식이 올바르지 않습니다.')
  }
  return parsed
}
