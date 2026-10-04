// 노트북에서 주 1회 실행: 해설문이 없는 페이지에 Claude Code 로 해설문을 생성한다.
// 생성 결과는 reviewed=false 로 저장되며, npm run review 로 사람이 승인해야 사이트에 노출된다.
//
//   npm run commentary                   기본 20건
//   npm run commentary -- --limit 50
//   npm run commentary -- --dry-run      프롬프트만 출력
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { loadFoods, readCommentary, commentaryPath, writeJsonAtomic } from '../src/lib/data.mjs';
import { pickComparisons } from '../src/lib/nutrition.mjs';
import { checkCommentary } from '../src/lib/compliance.mjs';
import { foodPayload, comparePayload } from '../src/lib/payload.mjs';

const { values: args } = parseArgs({
  options: { limit: { type: 'string', default: '20' }, 'dry-run': { type: 'boolean' } },
});

const RULES = `규칙:
- 한국어 존댓말, 3~4문장, 250자 안팎의 평문만 출력한다. 제목·목록·마크다운·인사말 금지.
- 아래 데이터에 있는 숫자만 사용한다. 새로운 숫자(권장 섭취량, 퍼센트 등)를 만들지 않는다.
- 데이터가 무엇을 보여주는지 사실만 설명한다. 건강 효과, 질병, 다이어트·체중 감량, 면역력, 해독 같은 효능을 언급하지 않는다.
- "~에 좋다", "~을 개선한다" 같은 효능 주장 대신 "~이 더 많다/적다"처럼 비교로 서술한다.
- 기준량(예: 100g)을 한 번 밝힌다.`;

function buildPrompt(payload) {
  const intro =
    payload.type === 'compare'
      ? `두 식품의 영양성분 비교 데이터를 읽고, 어떤 차이가 눈에 띄는지 설명하는 해설문을 써 주세요.`
      : `한 식품의 영양성분 데이터를 읽고, 구성의 특징을 설명하는 해설문을 써 주세요.`;
  return `${intro}\n\n${RULES}\n\n데이터(JSON):\n${JSON.stringify(payload, null, 2)}`;
}

function runClaude(prompt) {
  const r = spawnSync('claude', ['-p'], {
    input: prompt,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 180_000,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`claude 종료 코드 ${r.status}: ${r.stderr.slice(0, 300)}`);
  return r.stdout.trim();
}

// 대상 목록: 비교 페이지 우선 (검색 수요가 더 많음), 그다음 개별 식품
const { foods } = loadFoods();
const targets = [
  ...pickComparisons(foods).map(({ slug, a, b }) => ({ type: 'compare', slug, payload: comparePayload(a, b) })),
  ...foods.map((f) => ({ type: 'food', slug: f.id, payload: foodPayload(f) })),
]
  .filter((t) => !readCommentary(t.type, t.slug))
  .slice(0, Number(args.limit));

if (!targets.length) {
  console.log('해설문이 필요한 페이지가 없습니다.');
  process.exit(0);
}
if (args['dry-run']) {
  console.log(`대상 ${targets.length}건. 첫 프롬프트:\n\n${buildPrompt(targets[0].payload)}`);
  process.exit(0);
}

let saved = 0;
let failed = 0;
for (const [i, t] of targets.entries()) {
  const label = `[${i + 1}/${targets.length}] ${t.type}/${t.slug}`;
  let text;
  let problems = [];
  // 검사에 걸리면 문제점을 알려 주고 한 번 더 시도한다.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt =
      attempt === 1
        ? buildPrompt(t.payload)
        : `${buildPrompt(t.payload)}\n\n이전 답변이 다음 이유로 거절되었습니다. 고쳐서 다시 써 주세요:\n- ${problems.join('\n- ')}`;
    try {
      text = runClaude(prompt);
    } catch (err) {
      problems = [`실행 실패: ${err.message}`];
      break;
    }
    problems = checkCommentary(text, t.payload);
    if (!problems.length) break;
  }
  if (problems.length) {
    failed++;
    console.warn(`${label} 실패 — ${problems.join(' / ')}`);
    continue;
  }
  writeJsonAtomic(commentaryPath(t.type, t.slug), {
    text,
    generatedAt: new Date().toISOString(),
    generator: 'claude-code',
    reviewed: false,
  });
  saved++;
  console.log(`${label} 저장`);
}
console.log(`완료: 저장 ${saved}건, 실패 ${failed}건. 다음 단계: npm run review`);
