// 운동 소모 열량 계산 (MET 공식).
// kcal/분 = MET × 3.5 × 체중(kg) ÷ 200

export const TABLE_WEIGHTS_KG = [50, 60, 70, 80, 90];
export const TABLE_MINUTES = [10, 30, 60];

export function caloriesBurned(met, weightKg, minutes) {
  return Math.round(((met * 3.5 * weightKg) / 200) * minutes);
}

export function calorieTable(met) {
  return TABLE_WEIGHTS_KG.map((kg) => ({
    kg,
    values: TABLE_MINUTES.map((min) => ({ min, kcal: caloriesBurned(met, kg, min) })),
  }));
}
