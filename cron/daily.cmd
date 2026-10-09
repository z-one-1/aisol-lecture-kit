@echo off
cd /d %~dp0\..
node scripts\ingest.mjs >> out\cron.log 2>&1
claude -p "inbox/_queue.json 의 text·image·pdf 항목을 CLAUDE.md 규칙대로 problems JSON으로 만들어. 끝나면 'INGEST_DONE'만 출력." --permission-mode acceptEdits >> out\cron.log 2>&1
node scripts\batch.mjs >> out\cron.log 2>&1
node scripts\upload.mjs >> out\cron.log 2>&1
