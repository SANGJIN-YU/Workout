// 쿠팡 파트너스 링크. 운동용품·주방 도구처럼 효능 주장이 필요 없는 상품만 넣는다.
// 건강기능식품·다이어트 식품 링크는 효능 표현 규제 때문에 넣지 않는다.
//
// 형식: { label: '상품 설명', url: 'https://link.coupang.com/a/xxxx' }
export const AFFILIATE_LINKS = {
  food: [], // 예: 주방 전자저울
  exercise: [], // 예: 요가매트, 줄넘기
  bmr: [], // 예: 체중계
};

// 쿠팡 파트너스 운영정책상 필수 고지 문구
export const COUPANG_DISCLOSURE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
