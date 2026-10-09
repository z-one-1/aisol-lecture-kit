// out/<id>/meta-*.json 중 아직 안 올린 것을 유튜브에 올리고 out/ledger.csv 에 기록. 사용: node scripts/upload.mjs [--dry] [--only <id>]
import { readdirSync, existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, ok, die } from "./lib.mjs";
import { loadConfig } from "./config.mjs";
const cfg = loadConfig(); const args = process.argv.slice(2); const DRY = args.includes("--dry");
const oi = args.indexOf("--only"); const only = oi >= 0 ? args[oi + 1] : null;
const L = join(ROOT, "out", "ledger.csv"); if (!existsSync(L)) writeFileSync(L, "time,id,channel,url\n");
const done = new Set(readFileSync(L, "utf8").split("\n").slice(1).map((l) => l.split(",")[1]).filter(Boolean));
const env = { ...process.env, ...(cfg.aside?.account ? { ASIDE_ACCOUNT: cfg.aside.account } : {}) };
const dirs = readdirSync(join(ROOT, "out"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).filter((d) => !only || d === only);
let n = 0, fails = [];
for (const d of dirs) for (const f of readdirSync(join(ROOT, "out", d)).filter((f) => /^meta-.*\.json$/.test(f))) {
  const m = JSON.parse(readFileSync(join(ROOT, "out", d, f), "utf8"));
  if (done.has(m.id) || !existsSync(m.file)) continue;
  console.log(`\n▶ 업로드: ${m.id}`);
  const r = spawnSync("python3", [join(ROOT, "scripts", "upload_youtube.py"), join(ROOT, "out", d, f), ...(DRY ? ["--dry"] : [])], { cwd: ROOT, env, encoding: "utf8" });
  const url = (r.stdout.match(/URL (\S+)/) || [])[1];
  if (r.status === 0 && url && !DRY) { appendFileSync(L, `${new Date().toISOString()},${m.id},youtube,${url}\n`); n++; console.log("  ✔ " + url); }
  else if (DRY) console.log("  (dry) " + (r.stdout.trim().split("\n").pop() || ""));
  else {
    const err = (r.stderr + r.stdout).trim().split("\n").pop();
    if (cfg.aside?.exec) {
      console.log("  스크립트 실패(" + err + ") → 어사이드 에이전트에게 자연어로 맡깁니다");
      const prompt = `유튜브 스튜디오(studio.youtube.com)에서 '만들기 → 동영상 업로드'로 파일 ${m.file} 을 올려 줘. 제목: ${m.title}. 설명: ${m.desc}. 재생목록: ${m.playlist}. 아동용 아님. '변경 또는 합성된 콘텐츠'는 예. 태그: ${m.tags.join(", ")}. 공개 설정: ${m.schedule ? "예약 " + m.schedule : m.privacy}. 다 되면 영상 URL만 답해 줘.`;
      const a = spawnSync("aside", ["exec", ...(cfg.aside.account ? ["--account", cfg.aside.account] : []), prompt], { cwd: ROOT, encoding: "utf8", timeout: 900000 });
      const u2 = (a.stdout.match(/https:\/\/(?:youtu\.be|youtube\.com)\/\S+/) || [])[0];
      if (u2) { appendFileSync(L, `${new Date().toISOString()},${m.id},youtube,${u2}\n`); n++; console.log("  ✔(에이전트) " + u2); } else fails.push(m.id);
    } else fails.push(m.id + ": " + err);
  }
}
if (fails.length) console.error("✖ 실패: " + fails.join(" | "));
ok(`업로드 ${n}건 기록 → out/ledger.csv`);
