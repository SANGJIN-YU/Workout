// 영양성분 정의와 비교 로직. Astro 페이지와 Node 스크립트가 함께 사용한다.

export const NUTRIENTS = [
  { key: 'energy_kcal', label: '열량', unit: 'kcal' },
  { key: 'carbohydrate_g', label: '탄수화물', unit: 'g' },
  { key: 'sugars_g', label: '당류', unit: 'g' },
  { key: 'fiber_g', label: '식이섬유', unit: 'g' },
  { key: 'protein_g', label: '단백질', unit: 'g' },
  { key: 'fat_g', label: '지방', unit: 'g' },
  { key: 'sodium_mg', label: '나트륨', unit: 'mg' },
];

export function round(value, digits = 1) {
  if (value === null || value === undefined) return null;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function compareSlug(a, b) {
  const [x, y] = [a.id, b.id].sort();
  return `${x}-vs-${y}`;
}

/** 두 식품의 영양성분 차이(b - a)를 계산한다. 값이 없는 성분은 diff=null. */
export function compareFoods(a, b) {
  return NUTRIENTS.map(({ key, label, unit }) => {
    const va = a.nutrients[key];
    const vb = b.nutrients[key];
    const has = typeof va === 'number' && typeof vb === 'number';
    return { key, label, unit, a: va ?? null, b: vb ?? null, diff: has ? round(vb - va) : null };
  });
}

/**
 * 비교 페이지 대상 쌍을 고른다.
 * 같은 분류 안에서 열량이 가까운 식품끼리만 묶어 의미 있는 비교만 만든다.
 * (모든 조합을 만들면 얇은 페이지가 대량 생성되어 검색엔진 스팸 정책에 걸릴 수 있다.)
 */
export function pickComparisons(foods, perFood = 3) {
  const byCategory = new Map();
  for (const f of foods) {
    if (typeof f.nutrients.energy_kcal !== 'number') continue;
    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category).push(f);
  }
  const pairs = new Map();
  for (const group of byCategory.values()) {
    for (const f of group) {
      const nearest = group
        .filter((g) => g.id !== f.id)
        .sort(
          (x, y) =>
            Math.abs(x.nutrients.energy_kcal - f.nutrients.energy_kcal) -
            Math.abs(y.nutrients.energy_kcal - f.nutrients.energy_kcal),
        )
        .slice(0, perFood);
      for (const g of nearest) {
        const slug = compareSlug(f, g);
        if (!pairs.has(slug)) {
          const [a, b] = f.id < g.id ? [f, g] : [g, f];
          pairs.set(slug, { slug, a, b });
        }
      }
    }
  }
  return [...pairs.values()].sort((x, y) => x.slug.localeCompare(y.slug));
}

/**
 * 열량 ≈ 4×탄수화물 + 4×단백질 + 9×지방 검사.
 * 데이터 오류(단위 혼동, 필드 매핑 실수)를 잡기 위한 것이라 허용 오차를 넉넉히 둔다.
 */
export function energyLooksConsistent(n, tolerance = 0.35) {
  const { energy_kcal: e, carbohydrate_g: c, protein_g: p, fat_g: f } = n;
  if ([e, c, p, f].some((v) => typeof v !== 'number')) return true;
  const estimate = 4 * c + 4 * p + 9 * f;
  if (e < 20 && estimate < 20) return true;
  return Math.abs(estimate - e) / Math.max(e, 1) <= tolerance;
}
