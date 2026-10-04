// 기초대사량(Mifflin-St Jeor 공식)과 활동대사량 추정.

export const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: '거의 운동 안 함', factor: 1.2 },
  { key: 'light', label: '가벼운 운동 (주 1~3회)', factor: 1.375 },
  { key: 'moderate', label: '보통 운동 (주 3~5회)', factor: 1.55 },
  { key: 'active', label: '활발한 운동 (주 6~7회)', factor: 1.725 },
  { key: 'very_active', label: '매우 활발 (하루 2회 또는 육체노동)', factor: 1.9 },
];

export function mifflinStJeor({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function estimateTdee(bmr, activityKey) {
  const level = ACTIVITY_LEVELS.find((l) => l.key === activityKey);
  if (!level) throw new Error(`unknown activity level: ${activityKey}`);
  return Math.round(bmr * level.factor);
}
