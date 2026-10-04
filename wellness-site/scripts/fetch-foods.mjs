// 식약처 식품영양성분DB를 받아 data/foods.json 을 만든다.
//   npm run fetch:foods                 전체 수집
//   npm run fetch:foods -- --inspect    원본 응답 1건 출력 (필드 매핑 확인용)
//   npm run fetch:foods -- --max 500    최대 건수 제한
import path from 'node:path';
import { parseArgs } from 'node:util';
import { ENDPOINT, FIELD_MAP, SOURCE, includeItem } from './mfds-config.mjs';
import { DATA_DIR, writeJsonAtomic } from '../src/lib/data.mjs';

const { values: args } = parseArgs({
  options: { inspect: { type: 'boolean' }, max: { type: 'string' }, 'min-count': { type: 'string', default: '50' } },
});

const key = process.env.MFDS_API_KEY;
if (!key) {
  console.error('MFDS_API_KEY 가 없습니다. .env 에 공공데이터포털 인증키(Decoding)를 넣으세요.');
  process.exit(1);
}

const PAGE_SIZE = 100;
const max = args.max ? Number(args.max) : Infinity;

async function fetchPage(pageNo) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('serviceKey', key);
  url.searchParams.set('pageNo', String(pageNo));
  url.searchParams.set('numOfRows', String(PAGE_SIZE));
  url.searchParams.set('type', 'json');
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        // 인증키 오류 등은 XML 로 내려온다
        throw new Error(`JSON 이 아닌 응답: ${text.slice(0, 300)}`);
      }
      const body = json.body ?? json.response?.body;
      if (!body) throw new Error(`예상과 다른 응답 구조: ${text.slice(0, 300)}`);
      const items = body.items?.item ?? body.items ?? [];
      return { items: Array.isArray(items) ? items : [items], total: Number(body.totalCount ?? 0) };
    } catch (err) {
      if (attempt >= 4) throw err;
      const wait = 2 ** attempt * 1000;
      console.warn(`페이지 ${pageNo} 실패 (${err.message}), ${wait / 1000}초 후 재시도`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

function toNumber(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/,/g, '').trim();
  if (s === '' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function mapItem(item) {
  const nutrients = {};
  for (const [k, field] of Object.entries(FIELD_MAP.nutrients)) nutrients[k] = toNumber(item[field]);
  return {
    id: String(item[FIELD_MAP.id]).trim(),
    name: String(item[FIELD_MAP.name]).trim(),
    category: String(item[FIELD_MAP.category] ?? '기타').trim(),
    basis: String(item[FIELD_MAP.basis] ?? '100g').trim(),
    nutrients,
  };
}

const first = await fetchPage(1);
if (args.inspect) {
  console.log(`totalCount: ${first.total}`);
  console.log(JSON.stringify(first.items[0], null, 2));
  process.exit(0);
}

const foods = [];
const seen = new Set();
const totalPages = Math.ceil(first.total / PAGE_SIZE);
for (let page = 1; page <= totalPages && foods.length < max; page++) {
  const { items } = page === 1 ? first : await fetchPage(page);
  for (const item of items) {
    if (!includeItem(item)) continue;
    const food = mapItem(item);
    if (!food.id || seen.has(food.id) || food.nutrients.energy_kcal === null) continue;
    seen.add(food.id);
    foods.push(food);
    if (foods.length >= max) break;
  }
  process.stdout.write(`\r${page}/${totalPages} 페이지, ${foods.length}건`);
}
process.stdout.write('\n');

// API 장애로 빈 결과가 오면 기존 데이터를 덮어쓰지 않는다.
if (foods.length < Number(args['min-count'])) {
  console.error(`수집 건수(${foods.length})가 최소 기준보다 적어 저장하지 않습니다.`);
  process.exit(1);
}

writeJsonAtomic(path.join(DATA_DIR, 'foods.json'), {
  meta: { isSample: false, ...SOURCE, fetchedAt: new Date().toISOString() },
  foods,
});
console.log(`data/foods.json 저장 완료 (${foods.length}건)`);
