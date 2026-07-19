# 가격/재고 감시 봇 — Phase 0 프로토타입

번개장터 상품을 5분 간격으로 감시하다가, 등록해 둔 키워드+가격상한 조건에 맞는 매물이 올라오면
텔레그램으로 즉시 알린다. [`기획서.md`](./기획서.md)에서 정의한 MVP 범위(플랫폼 1곳, 조건 2종 조합,
무료 1~2개 제한, 5분 주기)를 그대로 구현한다.

## 핵심 루프

1. 텔레그램에서 `/add <키워드> <가격상한>` 으로 조건을 등록한다 (무료 최대 2개, `MAX_FREE_CONDITIONS`로 조정).
2. 백그라운드 잡이 5분마다(`POLL_INTERVAL_SECONDS`) 등록된 키워드별로 번개장터를 검색한다.
3. 키워드가 제목에 포함되고 가격이 상한 이하인 매물을 조건 매칭으로 판정한다 (`matcher.py`).
4. 이미 알림을 보낸 매물(`item_id` 기준)은 SQLite로 dedup하여 재알림하지 않는다.
5. 새로 매칭된 매물은 조건을 등록한 채팅으로 텔레그램 메시지를 보낸다.

## 구조

```
price_watcher/
  config.py          환경변수 로딩
  db.py               SQLite: conditions, seen_items
  bunjang_client.py   번개장터 검색 클라이언트 (교체 가능한 인터페이스)
  matcher.py          키워드 AND 가격상한 매칭 로직 (순수 함수, 테스트 용이)
  bot.py               텔레그램 명령어 + 폴링 잡(JobQueue = APScheduler 내장)
tests/                 matcher/db/bot 로직 단위 테스트 (네트워크 미사용, mock 클라이언트)
```

## 실행 방법

```bash
cd price-watcher
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # TELEGRAM_BOT_TOKEN 채우기 (@BotFather 에서 발급)
python -m price_watcher
```

## 테스트

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

네트워크 호출 없이 순수 로직만 검증한다 (매칭 규칙, dedup, 조건 CRUD, 알림 배치 로직).

## ⚠️ 배포 전 반드시 확인해야 할 것 (기획서 §4, §6 그대로 남김)

이 프로토타입을 만든 샌드박스 환경은 조직 네트워크 정책상 `bunjang.co.kr`로 나가는 요청이
차단되어 있어(egress policy 403), 아래 항목을 라이브로 검증하지 못했다. 실제 서비스 전 반드시
확인할 것:

- [ ] `bunjang_client.py`가 가정한 검색 API(`api.bunjang.co.kr/api/1/find_v2.json`)가 여전히
      유효한지, 실제 응답 필드(`pid`, `name`, `price`, `product_image`)가 맞는지 브라우저
      개발자도구 네트워크 탭으로 확인. 막혀 있거나 구조가 다르면 `BunjangClient.search()`
      인터페이스만 유지한 채 Playwright 기반 구현으로 교체 (다른 코드는 수정 불필요).
- [ ] 번개장터 이용약관(ToS)에 크롤링 금지 조항이 있는지 확인 — 개인 검증과 상업 서비스는
      리스크 수준이 다르다.
- [ ] 로그인/캡차 없이 검색이 가능한지 재확인 (현재 구현은 비로그인 전제).
- [ ] 본인이 1주일 직접 사용하며 오탐(조건에 안 맞는데 알림)/누락(조건에 맞는데 알림 안 옴) 체크.

## 다음 단계 (기획서 §6 대비 진행 상황)

- [x] 감시 플랫폼 확정 — 번개장터
- [x] 알림 채널 확정 — 텔레그램 봇
- [x] 크롤링 프로토타입 + 조건 매칭 로직
- [ ] 로그인 필요 여부 라이브 검증 (네트워크 차단으로 보류)
- [ ] ToS 크롤링 조항 확인
- [ ] 1주일 직접 사용 후 오탐/누락 체크
