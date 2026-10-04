// 식약처 식품영양성분DB(공공데이터포털) API 설정.
//
// ⚠️ 필드명은 실제 응답으로 확인되지 않았다. API 키를 받으면 먼저
//    npm run fetch:foods -- --inspect
// 로 원본 응답 1건을 출력해서 아래 FIELD_MAP 을 맞출 것.

export const ENDPOINT =
  process.env.MFDS_ENDPOINT ??
  'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02';

export const FIELD_MAP = {
  id: 'FOOD_CD',
  name: 'FOOD_NM_KR',
  category: 'FOOD_CAT1_NM',
  basis: 'NUTRI_AMOUNT_SERVING',
  nutrients: {
    energy_kcal: 'AMT_NUM1',
    protein_g: 'AMT_NUM3',
    fat_g: 'AMT_NUM4',
    carbohydrate_g: 'AMT_NUM6',
    sugars_g: 'AMT_NUM7',
    fiber_g: 'AMT_NUM8',
    sodium_mg: 'AMT_NUM13',
  },
};

/**
 * 수집 대상 필터. DB에는 브랜드 가공식품이 대량 포함되어 있으므로,
 * --inspect 결과를 보고 원재료·일반 음식 위주로 범위를 좁힐 것.
 * (예: 특정 DB 분류만 허용, 브랜드명 있는 항목 제외)
 */
export function includeItem(item) {
  return Boolean(item[FIELD_MAP.name]);
}

export const SOURCE = {
  source: '식품의약품안전처 식품영양성분 데이터베이스',
  sourceUrl: 'https://various.foodsafetykorea.go.kr/nutrient/',
};
