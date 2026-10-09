# 매일 자동으로 돌리기 (세팅 1회)

클로드 코드에 **"매일 저녁 7시에 inbox 처리해서 올리게 예약해 줘"** 라고 말하면 아래를 대신 설정합니다. 직접 하려면:

## 맥 (launchd)
`cron/com.aisol.lecture-kit.plist` 의 `{KIT_DIR}` 를 키트 폴더 절대 경로로 바꾼 뒤:
```
cp cron/com.aisol.lecture-kit.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.aisol.lecture-kit.plist
```
매일 19:00 에 `cron/daily.sh` 가 돌아갑니다: inbox 분류 → 영상 제작 → 메타 → 유튜브 업로드 → `out/ledger.csv` 기록.
사진·PDF 전사처럼 클로드가 필요한 단계는 `claude -p "inbox 처리해서 올려"` 로 실행됩니다(Claude Code 로그인 필요).

## 윈도우 (작업 스케줄러)
작업 스케줄러 → 기본 작업 만들기 → 매일 19:00 → 프로그램: `cmd.exe`, 인수: `/c cd /d {KIT_DIR} && cron\daily.cmd`

## 알림
끝나면 `out/ledger.csv` 에 한 줄 추가됩니다. 카톡·메일 알림은 config.json 의 `notify` 에 방법을 적으면 클로드 코드가 붙여 줍니다.
