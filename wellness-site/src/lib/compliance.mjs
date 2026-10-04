// AI 해설문 자동 검사.
// 1) 식품표시광고법·의료법상 문제가 될 수 있는 표현 차단
// 2) 해설문의 숫자가 원본 데이터에 있는 값인지 확인 (AI가 숫자를 지어내는 것 방지)

export const BANNED_PHRASES = [
  { pattern: /치료|완치|처방|진단|약효|특효|만병/, reason: '질병 치료·진단 표현 (의료법, 식품표시광고법 위반 소지)' },
  { pattern: /예방(?!접종)/, reason: '질병 예방 표현 (식품표시광고법 위반 소지)' },
  { pattern: /항암|당뇨|고혈압|암을|암 예방|질환|질병/, reason: '질병명 언급 (건강 효능 암시)' },
  { pattern: /혈당을 낮|혈압을 낮|콜레스테롤을 낮/, reason: '생리 기능 개선 주장' },
  { pattern: /해독|디톡스|독소/, reason: '근거 없는 효능 표현' },
  { pattern: /면역력/, reason: '건강기능식품 인정 기능성 외 표현 위험' },
  { pattern: /다이어트 효과|살이 빠|살 빠|체지방 감소|지방을 태|붓기/, reason: '체중 감량 효능 표현 (식품표시광고법 위반 소지)' },
  { pattern: /기적|부작용 없|무조건|100% 안전/, reason: '과장·단정 표현' },
];

export function findBannedPhrases(text) {
  const hits = [];
  for (const { pattern, reason } of BANNED_PHRASES) {
    const m = text.match(pattern);
    if (m) hits.push({ phrase: m[0], reason });
  }
  return hits;
}

export function extractNumbers(text) {
  return (text.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) ?? []).map((s) => Number(s.replace(/,/g, '')));
}

/** 데이터 객체 안의 모든 숫자를 평탄화해서 모은다. */
export function collectNumbers(value, out = new Set()) {
  if (typeof value === 'number' && Number.isFinite(value)) out.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectNumbers(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectNumbers(v, out));
  return out;
}

/** 해설문에 등장하는 숫자 중 원본 데이터로 설명되지 않는 것을 반환한다. */
export function findUnknownNumbers(text, data, extraAllowed = [100]) {
  const allowed = [...collectNumbers(data), ...extraAllowed];
  return extractNumbers(text).filter(
    (n) =>
      !allowed.some(
        (v) => Math.abs(n - v) <= 0.051 || Math.round(v) === n || Math.abs(n - Math.abs(v)) <= 0.051,
      ),
  );
}

export function checkCommentary(text, data) {
  const problems = [];
  for (const hit of findBannedPhrases(text)) problems.push(`금지 표현 "${hit.phrase}": ${hit.reason}`);
  const unknown = findUnknownNumbers(text, data);
  if (unknown.length) problems.push(`데이터에 없는 숫자: ${unknown.join(', ')}`);
  if (text.length < 40) problems.push('해설문이 너무 짧음');
  if (text.length > 600) problems.push('해설문이 너무 김 (600자 초과)');
  return problems;
}
