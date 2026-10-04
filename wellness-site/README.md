# 웰니스 데이터 노트

공공데이터로 식품 영양성분 비교, 운동 소모 열량, 기초대사량 계산기를 제공하는 정적 사이트. 설계와 수익 전략은 [docs/DESIGN.md](docs/DESIGN.md), Claude Code 작업 안내는 [CLAUDE.md](CLAUDE.md)를 보세요.

## 노트북에서 시작하기

필요한 것: Node.js 22.12 이상, Claude Code

```bash
git clone https://github.com/SANGJIN-YU/Workout.git
cd Workout
git checkout claude/wellness-site-mvp   # main 에 병합되기 전이라면
cd wellness-site
npm install
npm run dev        # http://localhost:4321 에서 확인
claude             # Claude Code 실행 → CLAUDE.md 를 읽고 이어서 작업
```

지금은 샘플 데이터(실제 값 아님)로 동작합니다. 화면 위에 노란 배너가 보이고, 검색엔진 노출이 차단(noindex)되어 있습니다.

## 실제 데이터 연결

1. [공공데이터포털](https://www.data.go.kr)에서 "식품의약품안전처_식품영양성분DB정보"를 활용 신청합니다.
2. `.env.example` 을 `.env` 로 복사하고 `MFDS_API_KEY` 에 인증키(Decoding)를 넣습니다.
3. `npm run fetch:foods -- --inspect` 로 응답 필드를 확인하고 `scripts/mfds-config.mjs` 를 맞춥니다.
4. `npm run fetch:foods` → `npm run validate`

## 주간 루틴 (약 30분)

```bash
git pull
npm run commentary -- --limit 20   # Claude Code 로 해설문 생성 + 자동 검사
npm run review                     # 하나씩 읽고 승인(y) / 삭제(n)
npm run validate
git add content && git commit -m "해설문 추가" && git push
```

## 매일 자동으로 일어나는 일

`.github/workflows/wellness-site.yml` (AI 사용 안 함)

식약처 데이터 수집 → 테스트·검증 → 변경분 커밋 → 빌드 → 운영 검증 → Cloudflare Pages 배포

필요한 Secrets/Variables 목록은 워크플로 파일 상단에 있습니다. 설정 전에는 수집·배포 단계가 자동으로 건너뜁니다.
