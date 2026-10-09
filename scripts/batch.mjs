// problems/ 의 JSON 중 아직 영상이 없는 것을 전부 제작하고 메타까지 만든다. 사용: node scripts/batch.mjs [--date 2026-10-12] [--limit 5]
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, ok } from "./lib.mjs";
const args = process.argv.slice(2); const li = args.indexOf("--limit"); const limit = li > 0 ? +args[li + 1] : 999;
const di = args.indexOf("--date"); const dateArgs = di > 0 ? ["--date", args[di + 1]] : [];
const todo = readdirSync(join(ROOT, "problems")).filter((f) => f.endsWith(".json")).filter((f) => !existsSync(join(ROOT, "out", f.replace(".json", "-shorts.mp4")))).slice(0, limit);
if (!todo.length) { ok("만들 것 없음(problems 전부 완성)"); process.exit(0); }
for (const f of todo) {
  console.log(`\n=== ${f}`);
  for (const [script, extra] of [["make", []], ["meta", dateArgs]]) {
    const r = spawnSync(process.execPath, [join(ROOT, "scripts", `${script}.mjs`), `problems/${f}`, ...extra], { cwd: ROOT, stdio: "inherit" });
    if (r.status !== 0) { console.error(`✖ ${f} ${script} 실패 — 다음으로`); break; }
  }
}
ok(`batch 끝: ${todo.length}건 시도`);
