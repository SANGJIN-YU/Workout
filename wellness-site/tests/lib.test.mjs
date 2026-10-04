import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareFoods, pickComparisons, energyLooksConsistent, compareSlug } from '../src/lib/nutrition.mjs';
import { caloriesBurned } from '../src/lib/exercise.mjs';
import { mifflinStJeor, estimateTdee } from '../src/lib/bmr.mjs';
import { checkCommentary, findBannedPhrases, findUnknownNumbers } from '../src/lib/compliance.mjs';
import { comparePayload } from '../src/lib/payload.mjs';

const food = (id, category, energy, extra = {}) => ({
  id,
  name: id,
  category,
  basis: '100g',
  nutrients: { energy_kcal: energy, carbohydrate_g: 10, protein_g: 2, fat_g: 1, ...extra },
});

test('compareFoods 는 b - a 차이를 계산한다', () => {
  const rows = compareFoods(food('a', 'x', 100), food('b', 'x', 150));
  assert.equal(rows.find((r) => r.key === 'energy_kcal').diff, 50);
  assert.equal(rows.find((r) => r.key === 'sodium_mg').diff, null);
});

test('pickComparisons 는 같은 분류 안에서만, 중복 없이 짝을 만든다', () => {
  const foods = [food('a', 'x', 100), food('b', 'x', 110), food('c', 'x', 500), food('d', 'y', 105)];
  const pairs = pickComparisons(foods, 1);
  const slugs = pairs.map((p) => p.slug);
  assert.deepEqual(slugs, ['a-vs-b', 'b-vs-c']);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(pairs.every((p) => p.a.category === p.b.category));
});

test('compareSlug 는 순서와 무관하다', () => {
  assert.equal(compareSlug({ id: 'b' }, { id: 'a' }), 'a-vs-b');
});

test('energyLooksConsistent 는 필드 매핑 오류를 잡는다', () => {
  assert.ok(energyLooksConsistent({ energy_kcal: 143, carbohydrate_g: 31, protein_g: 2.5, fat_g: 0.3 }));
  // 단백질과 지방 필드가 뒤바뀐 경우처럼 크게 어긋나면 false
  assert.ok(!energyLooksConsistent({ energy_kcal: 65, carbohydrate_g: 4.8, protein_g: 3.2, fat_g: 33 }));
});

test('caloriesBurned: MET 공식', () => {
  // 8 MET, 70kg, 30분 → 8*3.5*70/200*30 = 294
  assert.equal(caloriesBurned(8, 70, 30), 294);
});

test('mifflinStJeor 와 estimateTdee', () => {
  assert.equal(mifflinStJeor({ sex: 'male', weightKg: 70, heightCm: 175, age: 30 }), 1649);
  assert.equal(mifflinStJeor({ sex: 'female', weightKg: 60, heightCm: 165, age: 30 }), 1320);
  assert.equal(estimateTdee(1000, 'moderate'), 1550);
  assert.throws(() => estimateTdee(1000, 'nope'));
});

test('금지 표현을 잡아낸다', () => {
  assert.ok(findBannedPhrases('현미밥은 당뇨 예방에 좋습니다').length >= 2);
  assert.ok(findBannedPhrases('면역력을 높여 줍니다').length === 1);
  assert.equal(findBannedPhrases('백미밥보다 식이섬유가 많습니다').length, 0);
  assert.equal(findBannedPhrases('예방접종 일정과는 무관합니다').length, 0);
});

test('데이터에 없는 숫자를 잡아낸다', () => {
  const payload = comparePayload(food('백미', 'x', 143, { fiber_g: 0.3 }), food('현미', 'x', 150, { fiber_g: 1.5 }));
  assert.deepEqual(findUnknownNumbers('100g 기준 현미가 150kcal로 7kcal 더 높고 식이섬유는 1.5g입니다.', payload), []);
  assert.deepEqual(findUnknownNumbers('하루 권장량의 30%에 해당합니다.', payload), [30]);
  // 비율(5배)은 payload 의 ratio 로 허용된다
  assert.deepEqual(findUnknownNumbers('식이섬유는 약 5배입니다.', payload), []);
});

test('checkCommentary 는 정상 해설문을 통과시킨다', () => {
  const payload = comparePayload(food('백미', 'x', 143), food('현미', 'x', 150));
  const text = '100g 기준으로 현미의 열량은 150kcal, 백미는 143kcal로 현미가 7kcal 더 높습니다. 탄수화물과 단백질 함량은 두 식품이 같은 수준입니다.';
  assert.deepEqual(checkCommentary(text, payload), []);
});
