# 내 목소리로 문제 풀이 영상 만들기 (aisol-lecture-kit)

문제 하나 붙여 넣으면 **내 목소리**로 풀이해 주는 강의 영상(쇼츠 9:16 + 유튜브 16:9)이 나옵니다.
촬영 없음, 편집 없음. 필요한 건 세 가지: **일레븐랩스(목소리) + Claude Code(대본·실행) + 이 키트(Remotion 영상)**.

> 영어·국어·수학 예시 3개가 `problems/` 에 들어 있고, 완성 영상은 에이솔 유튜브 @aisol_edu 에서 볼 수 있어요.

## 0. 비용(2026-10 기준, 공식 가격 페이지)
| 항목 | 플랜 | 월 비용 | 메모 |
|---|---|---|---|
| 일레븐랩스 | Starter | $6 (연간 $5) | 30,000크레딧 ≈ 30분. **목소리 복제는 Starter부터**(Free 불가). 상업 이용 OK |
| Claude | Pro | $20 (연간 $17) | Claude Code 포함(Free는 불가) |
| Remotion | Free | $0 | 개인·3인 이하 회사 무료 |
| 영상 1편(60~90초) | | 약 400크레딧 ≈ $0.08 | Starter로 월 70편 안팎 |

합계 **월 약 $26**으로 시작합니다. Claude는 $100~$200짜리 Max 요금제가 아니어도 됩니다. Pro($20)로 이 키트는 충분히 돌아갑니다.
더 아끼려면 구독 없이 **Claude API 종량제**(콘솔 계정에서 API 키 발급 → Claude Code 실행 시 `ANTHROPIC_API_KEY` 사용)로도 됩니다. 대본 1편에 몇십 원 수준입니다. 무료(Free) 플랜은 Claude Code를 쓸 수 없습니다.

> 🎙 **목소리는 반드시 본인 것**을 직접 녹음해 복제하세요. 조용한 방에서 1~2분, 평소 수업하듯 또박또박. 마이크는 이어폰 마이크면 충분하고, 녹음 중간에 장비를 바꾸지 마세요. 다른 사람 목소리는 동의 없이 복제하면 안 됩니다.

## 1. 목소리 복제 (일레븐랩스, 5분)
1. elevenlabs.io 가입 → Starter 구독.
2. **Voices → Add a new voice → Instant Voice Clone**. 조용한 곳에서 1~2분 또박또박 읽어 녹음(또는 mp3 업로드). 이름은 `my-voice`.
3. 만든 목소리의 **Voice ID**를 복사해 둡니다(목소리 카드 → ID).
4. 프로필 → **API Keys → Create** 로 키를 하나 만들어 복사해 둡니다. (키는 비밀번호처럼 다룹니다. 화면 공유·영상에 노출 금지)

> 본인 목소리만 복제하세요. 다른 사람 목소리는 동의 없이 복제하면 안 됩니다.

## 2. 설치 (터미널, 10분)
```bash
# Node.js 22 이상이 없으면 https://nodejs.org 에서 LTS 설치
curl -fsSL https://claude.ai/install.sh | bash        # Claude Code (윈도우: irm https://claude.ai/install.ps1 | iex)
git clone https://github.com/z-one-1/aisol-lecture-kit.git
cd aisol-lecture-kit
npm install
npx remotion browser ensure   # 영상 렌더용 브라우저 1회 다운로드(1~2분, 첫 렌더 때 자동으로도 받지만 미리 받아 두면 안정적)
cp .env.example .env     # 윈도우: copy .env.example .env
```
`.env` 를 열어 `ELEVENLABS_API_KEY=` 와 `ELEVENLABS_VOICE_ID=` 뒤에 1단계에서 복사한 값을 붙여 넣고 저장합니다.

## 3. 문제 주고 영상 만들기 (Claude Code)
```bash
claude
```
Claude Code가 열리면 이렇게 말합니다(문제는 복사해 붙여 넣기):
```
이 문제 풀이 영상 만들어 줘. 과목은 수학, 고1 2026년 9월 모의고사 6번, 정답은 ④.
(문제 전문 붙여 넣기)
```
Claude Code가 `problems/…json` 을 쓰고 `npm run make` 까지 실행합니다. 끝나면 `out/` 에 mp4 두 개가 생깁니다.

직접 돌리고 싶으면:
```bash
npm run make problems/2709-h1-math-06.json      # 점검 → 음성 → 렌더(쇼츠+가로)
npm run studio                                    # 브라우저 미리보기
```

## 4. 유튜브 올리기
`out/<id>-shorts.mp4` 는 쇼츠, `out/<id>-wide.mp4` 는 일반 영상으로 업로드하면 됩니다. AI 음성(본인 목소리 복제) 사용 사실은 영상 하단에 표시됩니다.

## 이걸로 할 수 있는 것
- 수학: 메인 교재 전 문항 풀이 영상을 학원 내부용으로(교재 문항은 공개 업로드 금지, 저작권).
- 영어·국어: 모의고사 전 문항 풀이 영상. 문항 JSON만 바꾸면 양산.

## 폴더
`problems/` 문제·대본 JSON · `src/` 영상 디자인(Remotion) · `scripts/` 음성·렌더 명령 · `public/voice/` 생성된 음성(커밋 안 함) · `out/` 완성 영상

## 문제 해결
- `ELEVENLABS_API_KEY가 없어요` → `.env` 확인. `401` → 키 오타. `크레딧 부족` → 일레븐랩스 플랜 확인.
- 렌더가 느리면 `npm run render problems/x.json -- --shorts` 로 쇼츠만(가로만은 `-- --wide`).
- 글이 넘치면 `sub`·`say` 를 줄이거나 단계를 나눕니다.

MIT License · 만든 곳: 에이솔(학원 AI) · 문의: 유튜브 @aisol_edu
