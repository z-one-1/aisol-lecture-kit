// 영상 렌더: npm run render problems/<문제>.json [--shorts|--wide]  (기본: 둘 다)
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readScript, die, ok, save } from "./lib.mjs";

const s = readScript(process.argv[2]);
const flags = process.argv.slice(3);
const which = flags.includes("--shorts") ? ["Lecture"] : flags.includes("--wide") ? ["LectureWide"] : ["Lecture", "LectureWide"];
const tfile = join(ROOT, "public", "voice", s.id, "timing.json");
const timing = existsSync(tfile) ? JSON.parse(readFileSync(tfile, "utf8")) : null;
if (!timing) console.warn("! 음성(timing.json)이 없어 무음·어림 길이로 렌더합니다. 먼저 npm run tts 를 실행하세요");
mkdirSync(join(ROOT, "out"), { recursive: true });
const props = join(ROOT, "out", `.props-${s.id}.json`);
save(props, { script: s, timing });
const outs = [];
for (const comp of which) {
  const out = join(ROOT, "out", `${s.id}-${comp === "Lecture" ? "shorts" : "wide"}.mp4`);
  const r = spawnSync("npx", ["remotion", "render", "src/index.ts", comp, out, `--props=${props}`, "--codec=h264", "--crf=18"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) die(`렌더 실패: ${comp}`);
  outs.push(out);
}
ok("완성:\n  " + outs.join("\n  "));
