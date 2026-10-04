# wellness-site: Claude Code 작업 안내

공공데이터(식약처 식품영양성분DB 등)로 식품 영양성분 비교, 운동 소모 열량, 기초대사량 계산기 페이지를 만드는 정적 사이트. 수익원은 애드센스, 쿠팡 파트너스, 디지털 상품. 배경과 전략은 `docs/DESIGN.md` 참고.

## 명령어 (항상 `wellness-site/` 에서 실행)

```bash
npm install
npm run dev                         # 로컬 미리보기 http://localhost:4321
npm test                            # 단위 테스트 (node:test)
npm run validate                    # 데이터·해설문 검사 (--production: 배포 기준)
npm run build
npm run fetch:foods -- --inspect    # 식약처 API 원본 응답 1건 출력 (.env 에 MFDS_API_KEY 필요)
npm run fetch:foods                 # data/foods.json 생성
npm run commentary -- --limit 20    # claude -p 로 해설문 생성 (reviewed=false)
npm run review                      # 사람이 해설문 승인
```

## 구조

- `src/lib/*.mjs`: 순수 로직. Astro 페이지와 Node 스크립트가 함께 쓴다. 로직을 바꾸면 `tests/` 도 갱신한다.
- `src/pages/`: Astro 페이지. 데이터는 빌드 시점에 `src/lib/data.mjs` 로 읽는다.
- `data/foods.json`: 실제 데이터 (GitHub Actions 가 매일 갱신해서 커밋). 없으면 `foods.sample.json` 을 쓴다.
- `content/commentary/{food|compare}/{slug}.json`: AI 해설문. `reviewed: true` 만 노출된다.
- `scripts/`: 수집, 해설문 생성, 검토, 검증 스크립트.
- `../.github/workflows/wellness-site.yml`: 일일 갱신·배포 (AI 사용 안 함).

## 반드시 지킬 규칙

1. **효능 주장 금지**: 사이트 문구나 해설문에 질병, 치료·예방, 다이어트·체중 감량, 면역력, 해독 같은 표현을 쓰지 않는다. 식품표시광고법·의료법 위반 소지가 있다. 금지 목록은 `src/lib/compliance.mjs`.
2. **숫자는 코드가 넣는다**: 페이지의 수치는 데이터에서 직접 렌더링한다. AI 가 만든 문장의 숫자는 `findUnknownNumbers` 검사를 통과해야 한다.
3. **모든 데이터 페이지에 출처와 면책 문구**: `SourceNote`, `MedicalDisclaimer` 컴포넌트를 쓴다.
4. **제휴 링크는 `Affiliate` 컴포넌트로만**: 쿠팡 필수 고지 문구가 자동으로 붙는다. 건강기능식품·다이어트 식품 링크는 넣지 않는다.
5. **얇은 페이지 대량 생성 금지**: 페이지 유형을 늘릴 때는 페이지마다 고유한 데이터 가치가 있어야 한다. 조합 폭발을 피한다 (`pickComparisons` 처럼 제한).
6. **샘플 데이터로 운영 배포 금지**: `validate --production` 이 막는다. 이 검사를 우회하지 않는다.

## 현재 상태와 다음 할 일

완료:
- 사이트 뼈대, 식품·비교·운동·계산기 페이지, 소개·면책·개인정보 페이지
- 해설문 생성 → 자동 검사 → 사람 승인 파이프라인 (`claude -p` 로 실제 동작 확인)
- 일일 갱신·배포 워크플로

다음 (순서대로):
1. [ ] 공공데이터포털에서 "식품의약품안전처_식품영양성분DB정보" 활용 신청 → `.env` 에 `MFDS_API_KEY`
2. [ ] `npm run fetch:foods -- --inspect` 로 실제 응답 확인 → `scripts/mfds-config.mjs` 의 `FIELD_MAP` 수정 (**필드명은 아직 실제 응답으로 확인 안 됨**)
3. [ ] `includeItem` 필터 결정: 브랜드 가공식품을 뺄지, 원재료·일반 음식 위주로 할지
4. [ ] `data/exercises.json` 의 MET 값을 Compendium 출판본과 대조 → `verified: true`
5. [ ] 도메인 구매, Cloudflare Pages 프로젝트 생성, GitHub Secrets/Variables 설정 (워크플로 상단 주석 참고)
6. [ ] Google Search Console 등록, sitemap 제출
7. [ ] 페이지 50개 이상 + 승인된 해설문이 쌓이면 애드센스 신청
8. [ ] 건강기능식품 "식약처 인정 기능성" 페이지 유형 추가 검토 (`docs/DESIGN.md` 5장)
