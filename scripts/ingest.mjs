// inbox/ 에 넣은 파일을 분류한다. .json → problems/ 로 복사, 텍스트·사진·PDF → 클로드 코드가 전사할 목록(inbox/_queue.json)
// 사용: node scripts/ingest.mjs
import { readdirSync, copyFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { ROOT, ok, save } from "./lib.mjs";
const IN = join(ROOT, "inbox"); const files = readdirSync(IN).filter((f) => !f.startsWith("_") && !f.startsWith("."));
const queue = [];
for (const f of files) {
  const p = join(IN, f); if (statSync(p).isDirectory()) continue;
  const ext = extname(f).toLowerCase();
  if (ext === ".json") { copyFileSync(p, join(ROOT, "problems", f)); queue.push({ file: p, kind: "json", next: `npm run make problems/${f}` }); }
  else if ([".txt", ".md"].includes(ext)) queue.push({ file: p, kind: "text", next: "클로드 코드가 읽고 problems JSON 작성(CLAUDE.md 대본 규칙)" });
  else if ([".jpg", ".jpeg", ".png", ".heic"].includes(ext)) queue.push({ file: p, kind: "image", next: "클로드 코드가 사진을 보고 문제·선택지·정답 전사 → problems JSON" });
  else if (ext === ".pdf") queue.push({ file: p, kind: "pdf", next: "클로드 코드가 pdftoppm/pdftotext 로 쪽별 전사 → 문항별 problems JSON (정답지 대조)" });
  else queue.push({ file: p, kind: "unknown", next: "지원하지 않는 형식" });
}
save(join(IN, "_queue.json"), { at: new Date().toISOString(), items: queue });
ok(`inbox ${queue.length}개: ` + queue.map((q) => `${basename(q.file)}(${q.kind})`).join(", "));
for (const q of queue) console.log(`  - ${basename(q.file)} → ${q.next}`);
