// 데이터와 해설문을 검사한다. 오류가 있으면 종료 코드 1.
//   npm run validate                  개발용 (샘플 데이터·미확인 MET 값은 경고)
//   npm run validate -- --production  배포용 (위 항목도 오류로 처리)
import { parseArgs } from 'node:util';
import { loadFoods, loadExercises, listCommentary } from '../src/lib/data.mjs';
import { NUTRIENTS, energyLooksConsistent, pickComparisons } from '../src/lib/nutrition.mjs';
import { checkCommentary } from '../src/lib/compliance.mjs';
import { foodPayload, comparePayload } from '../src/lib/payload.mjs';

const { values: args } = parseArgs({ options: { production: { type: 'boolean' } } });
const errors = [];
const warnings = [];
const strict = (msg) => (args.production ? errors : warnings).push(msg);

// 1. 식품 데이터
const { meta, foods } = loadFoods();
if (meta.isSample) strict('샘플 데이터를 사용 중입니다 (data/foods.json 없음).');
if (!meta.isSample && !meta.source) errors.push('foods.json meta.source(출처)가 비어 있습니다.');
const ids = new Set();
let inconsistent = 0;
for (const f of foods) {
  if (!f.id || !f.name) errors.push(`id 또는 name 누락: ${JSON.stringify(f).slice(0, 80)}`);
  if (ids.has(f.id)) errors.push(`중복 id: ${f.id}`);
  ids.add(f.id);
  for (const { key } of NUTRIENTS) {
    const v = f.nutrients?.[key];
    if (v !== null && v !== undefined && (typeof v !== 'number' || v < 0)) errors.push(`${f.name} ${key} 값 이상: ${v}`);
  }
  if (!energyLooksConsistent(f.nutrients)) inconsistent++;
}
// 일부 식품(알코올 등)은 공식에서 벗어날 수 있어 비율로 판단한다. 비율이 높으면 필드 매핑 오류일 가능성이 크다.
if (foods.length && inconsistent / foods.length > 0.2) {
  errors.push(`열량-영양소 불일치 식품이 ${inconsistent}/${foods.length}건입니다. scripts/mfds-config.mjs 필드 매핑을 확인하세요.`);
} else if (inconsistent) {
  warnings.push(`열량-영양소 불일치 식품 ${inconsistent}건 (허용 범위)`);
}

// 2. 운동 데이터
const { exercises } = loadExercises();
for (const e of exercises) {
  if (!(e.met > 0 && e.met < 25)) errors.push(`${e.id} MET 값 이상: ${e.met}`);
  if (!e.verified) strict(`${e.id} MET 값 미확인 (verified=false)`);
}

// 3. 해설문 (승인 여부와 상관없이 전부 검사)
const foodById = new Map(foods.map((f) => [f.id, f]));
const compareBySlug = new Map(pickComparisons(foods).map((c) => [c.slug, c]));
for (const c of listCommentary()) {
  let payload;
  if (c.type === 'food' && foodById.has(c.slug)) payload = foodPayload(foodById.get(c.slug));
  else if (c.type === 'compare' && compareBySlug.has(c.slug)) {
    const { a, b } = compareBySlug.get(c.slug);
    payload = comparePayload(a, b);
  }
  if (!payload) {
    warnings.push(`해설문 대상 페이지가 없음 (사이트에 노출 안 됨): ${c.type}/${c.slug}`);
    continue;
  }
  for (const p of checkCommentary(c.text ?? '', payload)) errors.push(`${c.type}/${c.slug}: ${p}`);
}

for (const w of warnings) console.warn(`경고: ${w}`);
for (const e of errors) console.error(`오류: ${e}`);
console.log(`식품 ${foods.length}건, 비교 ${compareBySlug.size}쌍, 운동 ${exercises.length}건 검사 — 오류 ${errors.length}, 경고 ${warnings.length}`);
process.exit(errors.length ? 1 : 0);
