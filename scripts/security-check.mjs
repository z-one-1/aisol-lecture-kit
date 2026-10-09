// 공개(커밋·배포) 전 비밀값·개인 식별자 검사. 사용: node scripts/security-check.mjs  (걸리면 exit 1)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "./lib.mjs";
const SKIP = /node_modules|package-lock\.json|\.git\/|^out\/|^public\/voice|^public\/howto|^inbox\/|\.env$|config\.json$|\.(png|jpg|jpeg|mp4|mp3|wav|woff2?|ttf)$/;
const RULES = [
  [/sk_[A-Za-z0-9]{20,}/, "일레븐랩스 API 키"], [/sk-ant-[A-Za-z0-9_-]{20,}/, "Anthropic API 키"], [/xi-api-key"?\s*[:=]\s*"?[A-Za-z0-9]{20,}/, "API 키 값"],
  [/AIza[0-9A-Za-z_-]{30,}/, "Google API 키"], [/ya29\.[0-9A-Za-z_-]+/, "Google 토큰"], [/ghp_[A-Za-z0-9]{30,}/, "GitHub 토큰"],
  [/UC[0-9A-Za-z_-]{22}/, "유튜브 채널 ID(하드코딩)"], [/[A-Za-z0-9._%+-]+@(gmail|naver|daum|kakao)\.com/, "이메일"], [/01[016789]-?\d{3,4}-?\d{4}/, "휴대폰 번호"],
  [/\/Users\/[a-z0-9_]+\//, "개인 홈 경로"], [/targetId\s*[:=]\s*"[0-9A-F]{32}"/, "어사이드 탭 ID"],
];
let bad = 0;
function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); const rel = relative(ROOT, p) + (statSync(p).isDirectory() ? "/" : ""); if (SKIP.test(rel)) continue; if (statSync(p).isDirectory()) walk(p); else { const t = readFileSync(p, "utf8"); for (const [re, name] of RULES) { const m = t.match(re); if (m) { bad++; console.log(`✖ ${rel}: ${name} → ${m[0].slice(0, 12)}…`); } } } } }
walk(ROOT);
if (bad) { console.error(`\n${bad}건 발견 — 공개 전에 지우거나 config/.env로 옮기세요`); process.exit(1); }
console.log("✔ 비밀값·개인 식별자 0건");
