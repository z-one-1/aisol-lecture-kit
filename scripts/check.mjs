// 문제 JSON 점검: npm run check problems/<문제>.json
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadEnv, readScript, die, ok } from "./lib.mjs";
loadEnv();
const s = readScript(process.argv[2]);
const errs = [];
if (!["english", "korean", "math"].includes(s.subject)) errs.push("subject는 english/korean/math 중 하나");
for (const k of ["grade", "exam", "num", "type", "answer"]) if (!s[k]) errs.push(`${k} 누락`);
if (!Array.isArray(s.stepsLabel) || s.stepsLabel.length < 2) errs.push("stepsLabel은 2~3개");
if (!s.steps?.length) errs.push("steps가 비어 있음");
(s.steps ?? []).forEach((st, i) => {
  if (!st.say) errs.push(`steps[${i}].say 누락`);
  if (!st.sub) errs.push(`steps[${i}].sub 누락`);
  if (st.sub && st.sub.length > 34) errs.push(`steps[${i}].sub 너무 김(${st.sub.length}자, 34자 이하)`);
  if (st.say && st.say.length > 90) errs.push(`steps[${i}].say 너무 김(${st.say.length}자, 90자 이하로 끊기)`);
  if (st.stage >= s.stepsLabel.length) errs.push(`steps[${i}].stage가 stepsLabel 범위 밖`);
  if (st.note !== undefined && !(s.notes ?? [])[st.note]) errs.push(`steps[${i}].note 인덱스가 notes에 없음`);
});
if (!s.problem || !(s.problem.text || s.problem.passage || s.problem.given)) errs.push("problem.text(또는 passage/given) 필요");
if (errs.length) { console.error("✖ 문제 JSON 수정 필요:\n - " + errs.join("\n - ")); process.exit(1); }
ok(`${s.id}: steps ${s.steps.length}개, 대본 ${s.steps.reduce((a, b) => a + b.say.length, 0)}자`);
if (!process.env.ELEVENLABS_API_KEY) console.warn("! .env에 ELEVENLABS_API_KEY가 없어요 (.env.example을 .env로 복사해 채우세요)");
if (!process.env.ELEVENLABS_VOICE_ID) console.warn("! .env에 ELEVENLABS_VOICE_ID가 없어요");
if (!existsSync(join(ROOT, "node_modules"))) console.warn("! npm install을 먼저 실행하세요");
