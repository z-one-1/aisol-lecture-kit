#!/bin/bash
# 매일 1회: inbox 분류 → (클로드 필요 시) 전사 → 영상 제작 → 메타 → 업로드. 로그는 out/cron.log
cd "$(dirname "$0")/.." || exit 1
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
{
  echo "== $(date '+%F %T')"
  node scripts/ingest.mjs
  if grep -q '"kind": "\(text\|image\|pdf\)"' inbox/_queue.json 2>/dev/null; then
    claude -p "inbox/_queue.json 의 text·image·pdf 항목을 CLAUDE.md 규칙대로 problems JSON으로 만들어. 끝나면 'INGEST_DONE'만 출력." --permission-mode acceptEdits
  fi
  node scripts/batch.mjs --date "$(date -v+1d '+%F' 2>/dev/null || date -d tomorrow '+%F')"
  node scripts/upload.mjs
} >> out/cron.log 2>&1
