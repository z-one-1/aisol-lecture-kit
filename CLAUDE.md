# 내 목소리 강의 영상 키트 — Claude Code 운영 지침

이 폴더의 주인은 코딩을 모르는 선생님이다. **명령어를 보여 주지 말고 네가 실행해라.** 설명은 한국어로 짧게, 결과는 파일 경로나 링크로.
사용자가 아래처럼 말하면 그 절차를 그대로 한다. 비밀값(API 키 등)은 **절대 화면에 다시 출력하지 않는다.**

## "설치해 줘" (처음 1번)
1. `npm install` → `npx remotion browser ensure` (각 1~2분, 기다리는 동안 "설치 중" 한 줄만).
2. 사용자가 준 일레븐랩스 **API 키**와 **목소리 ID**를 `.env` 에 쓴다(`.env.example` 형식). 값은 되묻지도, 출력하지도 않는다. 없으면 "일레븐랩스 → Developers → API Keys → Create 로 만든 키와, Voices의 내 목소리 ID를 붙여 주세요" 한 줄.
3. `npm run check problems/2709-h1-math-06.json` 으로 점검. 성공하면 "설치 끝. 이제 문제를 붙여 넣고 '영상 만들어'라고 하세요."

## "내 채널 기본값 잡아 줘" (처음 1번)
질문은 한 번에 하나, 최대 5개: 학원(브랜드) 이름 · 선생님 호칭 · 주로 올릴 과목 · 유튜브 재생목록 이름 · 매일 공개 시각. 답을 `config.example.json` 구조대로 `config.json` 에 쓴다. 어사이드 계정이 여러 개가 아니면 `aside.account` 는 빈칸.

## "이 문제 영상 만들어 (줘)" / "…만들어서 올려"
1. 문제 텍스트(또는 사진)를 읽고 `problems/<과목-시험-번호>.json` 작성 — 아래 **대본 규칙**. 정답을 사용자가 안 줬으면 직접 풀어 확정하고, 확신이 없으면 "정답이 ④ 맞나요?"처럼 한 번 확인.
2. `npm run make problems/<파일>.json` (음성 → 쇼츠·가로 렌더). 실패 메시지는 그대로 읽고 고친다(아래 진단).
3. `npm run meta problems/<파일>.json` (제목·설명·태그 자동).
4. "올려"가 있으면 `npm run upload` → `out/ledger.csv` 의 URL을 알려 준다. 없으면 `out/<id>-shorts.mp4`, `out/<id>-wide.mp4` 경로만.

## "inbox 처리해 (서 올려)"
`npm run ingest` → `inbox/_queue.json` 의 text/image/pdf 항목을 하나씩 problems JSON으로(사진은 직접 보고 전사, PDF는 `pdftoppm`으로 쪽 이미지를 만들어 문항별 전사, 정답지와 대조) → `npm run batch` → (올려면) `npm run upload`. 끝나면 "N편 제작, M편 업로드" 한 줄 + 링크.

## "EBSi에서 (회차) 받아 줘"
`scripts/collect-ebsi.md` 의 지시문을 채워 `aside exec "…"` 실행 → 받은 PDF를 inbox 처리 절차로. 오답률 파일이 있으면 높은 순으로 제작.

## "매일 저녁 N시에 자동으로 돌려 줘"
`cron/README.md` 대로 launchd(맥) 또는 작업 스케줄러(윈도우) 등록. 시각은 사용자 말대로. 등록 후 "매일 N시에 inbox → 제작 → 업로드가 자동으로 돕니다" 한 줄.

## 대본 규칙(problems JSON) — 반말 일타강사 톤
- `say`(음성) 한 줄 90자 이하, 질문→즉답, 숫자·기호는 읽는 소리로("x 제곱", "마이너스 삼", "사 번"). 6~9단계: 단서(stage 0) → 대조/식(1) → 정답+공식(2). 정답 말하는 단계에 `reveal: true`. 마지막은 한 줄 공식. 존댓말·광고·"저희는" 금지. 틀린 풀이 금지(정답지 대조).
- `sub`(자막) 34자 이하, 기호 그대로. `hl` 은 문제 텍스트에 **그대로 있는** 구절만(수식은 `$` 없이 안쪽 문자열).
- 필드: `id, subject(english|korean|math), grade, exam, num, points, type, badge?, problem{text|given|passage|box[]|choices[]}, stepsLabel[3], notes[≤6], steps[], answer("①"~"⑤"), formula{title,lines[3]}`. 예시 3개가 `problems/` 에 있다 — 그 모양을 따른다.

## 진단(실패하면 이 순서로, 사용자에게는 결론만)
- `ELEVENLABS_API_KEY가 없어요` → .env 확인. `401` → 키 오타. `크레딧 부족` → 일레븐랩스 플랜. `voices_read` 권한 오류는 무시해도 됨(TTS만 쓰면 됨).
- 렌더 중 `Tried to download file … chromium` → 네트워크. `npx remotion browser ensure` 재시도.
- 글자가 넘치면 JSON의 `sub`/`say`/`choices` 를 줄인다. `src/` 디자인은 바꾸지 않는다.
- 업로드: 어사이드에 유튜브 로그인이 안 돼 있으면 "어사이드에서 studio.youtube.com 에 로그인해 주세요". `일일 업로드 한도` → 내일 예약으로 돌린다. 스크립트가 실패하면 `config.json`의 `aside.exec` 가 true일 때 어사이드 에이전트에게 자연어로 맡긴다.
- 어사이드 탭이 응답 없음(`Page.enable timeout`) → 그 탭은 두고 새 탭으로. 영상 올리는 중엔 탭을 닫거나 이동하지 않는다.

## 하지 말 것
- `.env`, `config.json`, `public/voice/`, `out/`, `inbox/` 를 커밋하거나 내용을 출력하지 않는다.
- 출판사 교재 문항을 공개 영상에 쓰지 않는다(내부용). EBSi PDF를 재배포하지 않는다. 목소리는 사용자 본인 것만.
- 공개 전 `npm run security-check` 가 0건이어야 한다.
