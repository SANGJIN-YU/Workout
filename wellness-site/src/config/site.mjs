export const SITE = {
  name: '웰니스 데이터 노트',
  description: '공공데이터로 확인하는 식품 영양성분 비교, 운동 소모 열량, 기초대사량 계산기',
  // 애드센스 승인 후 .env 에 PUBLIC_ADSENSE_CLIENT=ca-pub-xxxx 를 넣으면 광고 스크립트가 들어간다.
  adsenseClient: import.meta.env.PUBLIC_ADSENSE_CLIENT ?? '',
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL ?? '',
};
