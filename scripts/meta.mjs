// 문제 JSON + config → out/<id>/meta-shorts.json, meta-wide.json (제목·설명·태그·재생목록·공개/예약)
// 사용: node scripts/meta.mjs problems/<문제>.json [--date 2026-10-12]
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, readScript, ok, save } from "./lib.mjs";
import { loadConfig, SUBJ, fill } from "./config.mjs";
const s = readScript(process.argv[2]); const cfg = loadConfig();
const di = process.argv.indexOf("--date"); const date = di >= 0 ? process.argv[di + 1] : null;
const vars = { brand: cfg.brand, teacher: cfg.teacher, grade: s.grade, exam: s.exam, subject: SUBJ[s.subject], num: s.num, type: s.type, id: s.id };
const hashtags = cfg.youtube.hashtags.map((h) => fill(h, vars)).join(" ");
const dir = join(ROOT, "out", s.id); mkdirSync(dir, { recursive: true });
const outs = [];
for (const fmt of cfg.render?.formats ?? ["shorts", "wide"]) {
  const file = join(ROOT, "out", `${s.id}-${fmt}.mp4`);
  const m = {
    id: `${s.id}-${fmt}`, file,
    title: fill(fmt === "shorts" ? cfg.youtube.titleTemplateShorts : cfg.youtube.titleTemplate, vars).slice(0, 100),
    desc: fill(cfg.youtube.descTemplate, { ...vars, hashtags: hashtags + (fmt === "shorts" ? " #Shorts" : "") }),
    tags: cfg.youtube.tags.map((t) => fill(t, vars)), playlist: cfg.youtube.playlist, privacy: cfg.youtube.privacy,
    schedule: date ? `${date} ${cfg.youtube.scheduleSlots?.[0] ?? "19:00"}` : null,
    exists: existsSync(file),
  };
  const p = join(dir, `meta-${fmt}.json`); save(p, m); outs.push(p);
}
ok("메타 작성:\n  " + outs.join("\n  "));
