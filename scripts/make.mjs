// 한 줄 제작: npm run make problems/<문제>.json  = 점검 → 음성 → 영상(쇼츠+가로)
import { spawnSync } from "node:child_process";
import { ROOT, die } from "./lib.mjs";
const file = process.argv[2]; const rest = process.argv.slice(3);
if (!file) die("사용법: npm run make problems/<문제>.json [--shorts|--wide]");
for (const [step, args] of [["check", [file]], ["tts", [file]], ["render", [file, ...rest]]]) {
  const r = spawnSync(process.execPath, [`${ROOT}/scripts/${step}.mjs`, ...args], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
