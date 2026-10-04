// 해설문 생성에 넘길 데이터. 검증 단계도 같은 데이터를 기준으로 숫자를 대조한다.
import { compareFoods, round } from './nutrition.mjs';

export function foodPayload(food) {
  return { type: 'food', name: food.name, category: food.category, basis: food.basis, nutrients: food.nutrients };
}

export function comparePayload(a, b) {
  const rows = compareFoods(a, b).map((r) => ({
    ...r,
    ratio: r.a && r.b ? round(r.b / r.a) : null,
  }));
  return { type: 'compare', basis: a.basis, a: a.name, b: b.name, category: a.category, rows };
}
