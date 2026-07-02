import type { Locale } from '../types'

export interface TranslationDict {
  app: {
    title: string
    tagline: string
  }
  onboarding: {
    step1Eyebrow: string
    step2Eyebrow: string
    step2SeedEyebrow: string
    chooseTypeTitle: string
    chooseTypeDesc: string
    beginnerBtn: string
    experiencedBtn: string
    seedTitle: string
    seedDesc: string
    weeksAgoLabel: string
    seedPlaceholder: string
    startBtn: string
    seedExerciseName: string
  }
  bodyInfo: {
    title: string
    height: string
    weight: string
    age: string
    sex: string
    sexNone: string
    sexMale: string
    sexFemale: string
    next: string
  }
  weekNav: {
    prevWeek: string
    nextWeek: string
  }
  workoutLog: {
    title: string
    totalVolume: string
    quickAddCustom: string
    exerciseNamePlaceholder: string
    deleteExercise: string
    setHeader: string
    weightHeader: string
    repsHeader: string
    deleteSet: string
    addSet: string
    saveWeek: string
    defaultExerciseName: string
  }
  trendChart: {
    title: string
    ariaLabel: string
    empty: string
  }
  prescription: {
    title: string
    aiLabel: string
    ruleBasedLabel: string
    noKeyNotice: string
    lastWeek: string
    thisTarget: string
    noPrescriptionYet: string
    generating: string
    generateBtn: string
  }
  apiKeySettings: {
    openLabel: string
    closeLabel: string
    registered: string
    notRegistered: string
    description: string
    keyLabel: string
    save: string
    deleteKey: string
  }
  errors: {
    aiRequestFailed: string
    aiNoContent: string
    aiInvalidFormat: string
    aiJsonMissing: string
    genericFailure: string
  }
  rulePrescription: {
    noHistoryMission: string
    noHistoryRationale: string
    singleWeekMission: string
    singleWeekRationale: string
    stagnantMission: string
    stagnantRationale: string
    weightDrivenMission: string
    weightDrivenRationale: string
    repDrivenMission: string
    repDrivenRationale: string
    declinedMission: string
    declinedRationale: string
    flatMission: string
    flatRationale: string
    growthMission: string
    growthRationale: string
  }
}

export const translations: Record<Locale, TranslationDict> = {
  ko: {
    app: {
      title: '트렌드핏 TrendFit',
      tagline: '추세를 읽고, 다음 주를 처방합니다.',
    },
    onboarding: {
      step1Eyebrow: '1 / 2 · 기준 정보',
      step2Eyebrow: '2 / 2 · 시작 방식 선택',
      step2SeedEyebrow: '2 / 2 · 최근 볼륨 입력',
      chooseTypeTitle: '운동 경력이 있으신가요?',
      chooseTypeDesc:
        '처음이면 이번 주는 편하게 기록만 남기고, 2주차부터 처방을 시작합니다. 경력자는 최근 3주 볼륨을 입력하면 1주차부터 바로 처방을 받을 수 있습니다.',
      beginnerBtn: '처음이에요 — 기준선부터 측정할게요',
      experiencedBtn: '해봤어요 — 최근 기록으로 바로 시작할게요',
      seedTitle: '최근 3주 3대 운동 총 볼륨',
      seedDesc: '스쿼트·벤치프레스·데드리프트 합산 총 볼륨(무게 × 횟수 × 세트)을 아는 만큼만 입력하세요.',
      weeksAgoLabel: '{{count}}주 전 총 볼륨 (kg)',
      seedPlaceholder: '예: 4000',
      startBtn: '시작하기',
      seedExerciseName: '3대 운동 합산 (초기 입력)',
    },
    bodyInfo: {
      title: '신체 정보',
      height: '키 (cm)',
      weight: '몸무게 (kg)',
      age: '나이',
      sex: '성별 (선택)',
      sexNone: '선택 안 함',
      sexMale: '남성',
      sexFemale: '여성',
      next: '다음',
    },
    weekNav: {
      prevWeek: '이전 주',
      nextWeek: '다음 주',
    },
    workoutLog: {
      title: '이번 주 웨이트 기록',
      totalVolume: '총 볼륨 {{value}}',
      quickAddCustom: '+ 직접 입력',
      exerciseNamePlaceholder: '운동 이름 (예: 스쿼트)',
      deleteExercise: '운동 삭제',
      setHeader: '세트',
      weightHeader: '무게(kg)',
      repsHeader: '횟수',
      deleteSet: '세트 삭제',
      addSet: '+ 세트 추가',
      saveWeek: '이번 주 기록 저장',
      defaultExerciseName: '벤치프레스',
    },
    trendChart: {
      title: '주간 총 볼륨 추세',
      ariaLabel: '주간 총 볼륨 추세 그래프',
      empty: '아직 기록이 없습니다. 이번 주 기록을 저장하면 추세 그래프가 나타납니다.',
    },
    prescription: {
      title: '다음 주 처방',
      aiLabel: 'AI 처방',
      ruleBasedLabel: '규칙 기반 처방 (데모)',
      noKeyNotice: 'AI API 키가 없어 규칙 기반 처방으로 동작합니다. 실제 AI 처방을 받으려면 아래 설정에서 Anthropic API 키를 등록하세요.',
      lastWeek: '지난주',
      thisTarget: '이번 목표',
      noPrescriptionYet: '아직 처방을 받지 않았습니다. 이번 주 기록을 저장한 뒤 처방을 받아보세요.',
      generating: '처방 생성 중…',
      generateBtn: '다음 주 처방 받기',
    },
    apiKeySettings: {
      openLabel: 'AI API 키 설정',
      closeLabel: '설정 닫기',
      registered: '등록됨',
      notRegistered: '미등록',
      description:
        'Anthropic API 키는 이 브라우저의 로컬 저장소에만 저장되며 서버로 전송되지 않습니다. 처방 생성 버튼을 누를 때만 Anthropic API로 직접 요청을 보냅니다.',
      keyLabel: 'Anthropic API Key',
      save: '저장',
      deleteKey: '키 삭제',
    },
    errors: {
      aiRequestFailed: 'AI 처방 요청 실패 ({{status}}): {{body}}',
      aiNoContent: 'AI 응답에 처방 내용이 없습니다.',
      aiInvalidFormat: 'AI 응답 형식이 올바르지 않습니다.',
      aiJsonMissing: 'AI 응답에서 JSON을 찾을 수 없습니다.',
      genericFailure: 'AI 처방 생성에 실패했습니다.',
    },
    rulePrescription: {
      noHistoryMission: '이번 주 미션: 기준선 측정 — 편하게 기록만 남기기',
      noHistoryRationale: '아직 기록이 없어 추세를 계산할 수 없습니다. 이번 주는 볼륨 목표 없이 기록만 쌓아 기준선을 만듭니다.',
      singleWeekMission: '이번 주 미션: 지난주와 비슷한 강도로 한 번 더 (목표 {{target}}kg)',
      singleWeekRationale: '기록이 {{count}}주뿐이라 추세 판단이 어렵습니다. 지난주 볼륨 {{volume}}kg을 유지하며 데이터를 한 주 더 쌓습니다.',
      stagnantMission: '이번 주 미션: 정체 돌파 — 총 볼륨 5%↑ (목표 {{target}}kg)',
      stagnantRationale: '최근 볼륨이 {{recentVolumes}}kg으로 정체 구간(변동폭 3% 이내)에 진입했습니다. 중량 또는 세트 구성을 바꿔 자극을 새로 줘야 할 시점입니다.',
      weightDrivenMission: '이번 주 미션: 고중량 흐름 유지 + 3%↑ (목표 {{target}}kg)',
      weightDrivenRationale:
        '지난주 볼륨 상승({{percent}}%)은 세트당 평균 강도 상승에 의한 고중량 성장 신호입니다. 무리하지 않는 선에서 3% 증량을 유지합니다.',
      repDrivenMission: '이번 주 미션: 반복 대신 중량으로 3%↑ (목표 {{target}}kg)',
      repDrivenRationale:
        '지난주 볼륨 상승({{percent}}%)은 저중량 반복 증가가 주도했습니다. 지구력은 확보됐으니 이번 주는 반복 수 대신 중량을 올려 볼륨을 채워보세요.',
      declinedMission: '이번 주 미션: 회복 주간 — 이전 수준으로 복귀 (목표 {{target}}kg)',
      declinedRationale:
        '지난주 볼륨이 {{percent}}% 감소했습니다({{prevVolume}}kg → {{currentVolume}}kg). 무리한 증량보다 이전 수준 회복을 목표로 컨디션을 다집니다.',
      flatMission: '이번 주 미션: 소폭 증량으로 다시 궤도 진입 (목표 {{target}}kg)',
      flatRationale:
        '지난주 볼륨 변화({{percent}}%)가 크지 않았습니다. 아직 정체 구간(연속 3주)은 아니지만, 2% 증량으로 상승 흐름을 다시 만들어봅니다.',
      growthMission: '이번 주 미션: 상승 흐름 이어가기 (목표 {{target}}kg)',
      growthRationale: '지난주 볼륨이 {{percent}}% 상승했고 중량·반복이 고르게 증가했습니다. 같은 방향으로 4% 증량을 처방합니다.',
    },
  },
  en: {
    app: {
      title: 'TrendFit',
      tagline: 'Reads your trend, prescribes next week.',
    },
    onboarding: {
      step1Eyebrow: '1 / 2 · Baseline info',
      step2Eyebrow: '2 / 2 · Choose your start',
      step2SeedEyebrow: '2 / 2 · Recent volume',
      chooseTypeTitle: 'Have you trained before?',
      chooseTypeDesc:
        "If you're new, this week is just for logging — prescriptions start from week 2. If you've trained before, enter your last 3 weeks of volume to get a prescription starting this week.",
      beginnerBtn: "I'm new — start with a baseline week",
      experiencedBtn: "I've trained before — start from my recent volume",
      seedTitle: 'Last 3 weeks of Big Three volume',
      seedDesc: 'Enter as much as you know of your combined Squat + Bench Press + Deadlift volume (weight × reps × sets).',
      weeksAgoLabel: 'Total volume {{count}} week(s) ago (kg)',
      seedPlaceholder: 'e.g. 4000',
      startBtn: 'Get started',
      seedExerciseName: 'Big Three combined (initial entry)',
    },
    bodyInfo: {
      title: 'Body info',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      age: 'Age',
      sex: 'Sex (optional)',
      sexNone: 'Prefer not to say',
      sexMale: 'Male',
      sexFemale: 'Female',
      next: 'Next',
    },
    weekNav: {
      prevWeek: 'Previous week',
      nextWeek: 'Next week',
    },
    workoutLog: {
      title: "This week's weight log",
      totalVolume: 'Total volume {{value}}',
      quickAddCustom: '+ Custom',
      exerciseNamePlaceholder: 'Exercise name (e.g. Squat)',
      deleteExercise: 'Delete exercise',
      setHeader: 'Set',
      weightHeader: 'Weight (kg)',
      repsHeader: 'Reps',
      deleteSet: 'Delete set',
      addSet: '+ Add set',
      saveWeek: 'Save this week',
      defaultExerciseName: 'Bench Press',
    },
    trendChart: {
      title: 'Weekly total volume trend',
      ariaLabel: 'Weekly total volume trend chart',
      empty: 'No records yet. The trend chart appears once you save this week.',
    },
    prescription: {
      title: 'Next week prescription',
      aiLabel: 'AI prescription',
      ruleBasedLabel: 'Rule-based (demo)',
      noKeyNotice:
        'No AI API key set, so this runs on the rule-based fallback. Register an Anthropic API key below to get real AI prescriptions.',
      lastWeek: 'Last week',
      thisTarget: 'This target',
      noPrescriptionYet: "No prescription yet. Save this week's log, then request one.",
      generating: 'Generating…',
      generateBtn: 'Get next week prescription',
    },
    apiKeySettings: {
      openLabel: 'AI API key settings',
      closeLabel: 'Close settings',
      registered: 'set',
      notRegistered: 'not set',
      description:
        'Your Anthropic API key is stored only in this browser and never sent to a server. It is used only to call the Anthropic API directly when you request a prescription.',
      keyLabel: 'Anthropic API Key',
      save: 'Save',
      deleteKey: 'Remove key',
    },
    errors: {
      aiRequestFailed: 'AI prescription request failed ({{status}}): {{body}}',
      aiNoContent: 'The AI response had no prescription content.',
      aiInvalidFormat: 'The AI response was not in the expected format.',
      aiJsonMissing: 'Could not find JSON in the AI response.',
      genericFailure: 'Failed to generate an AI prescription.',
    },
    rulePrescription: {
      noHistoryMission: "This week's mission: baseline week — just log, no target",
      noHistoryRationale:
        'No records yet, so a trend cannot be calculated. This week is just for logging to establish a baseline, with no volume target.',
      singleWeekMission: "This week's mission: match last week's intensity once more (target {{target}}kg)",
      singleWeekRationale:
        "Only {{count}} week(s) of data, so a trend isn't clear yet. Hold at last week's volume of {{volume}}kg while we gather one more week of data.",
      stagnantMission: "This week's mission: break the plateau — total volume +5% (target {{target}}kg)",
      stagnantRationale:
        'Recent volume has plateaued around {{recentVolumes}}kg (within 3% variance). Time to change weight or set structure to create a new stimulus.',
      weightDrivenMission: "This week's mission: keep the heavy-weight trend + 3% (target {{target}}kg)",
      weightDrivenRationale:
        "Last week's volume increase ({{percent}}%) came from higher average intensity per set — a sign of real strength growth. Hold a modest 3% increase without overreaching.",
      repDrivenMission: "This week's mission: add weight instead of reps + 3% (target {{target}}kg)",
      repDrivenRationale:
        "Last week's volume increase ({{percent}}%) was driven by more reps at lower weight. Endurance is covered — this week, fill volume with heavier weight instead of more reps.",
      declinedMission: "This week's mission: recovery week — return to your prior level (target {{target}}kg)",
      declinedRationale:
        "Last week's volume dropped {{percent}}% ({{prevVolume}}kg → {{currentVolume}}kg). Rather than pushing a bigger number, aim to recover to your prior level and manage your condition.",
      flatMission: "This week's mission: a small bump to get back on track (target {{target}}kg)",
      flatRationale:
        "Last week's volume change ({{percent}}%) was small. It's not a 3-week plateau yet, but a 2% increase should restart the upward trend.",
      growthMission: "This week's mission: keep the upward trend going (target {{target}}kg)",
      growthRationale:
        "Last week's volume rose {{percent}}%, with both weight and reps increasing evenly. Prescribing another 4% increase in the same direction.",
    },
  },
}

/** Non-React translation helper for use in lib/ code that has no component tree to read context from. */
export function translate<S extends keyof TranslationDict>(
  locale: Locale,
  section: S,
  key: keyof TranslationDict[S],
  vars?: Record<string, string | number>,
): string {
  const dict = translations[locale][section] as Record<string, string>
  const template = dict[key as string] ?? String(key)
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, k) => (k in vars ? String(vars[k]) : match))
}
