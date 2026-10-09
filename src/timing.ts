import type { Script, Timing } from "./types";
export const LEAD = 0.6, GAP = 0.35, TAIL = 1.8;
// 음성 파일이 아직 없을 때(스튜디오 미리보기) 글자 수로 길이를 어림한다.
export function estimateTiming(script: Script): Timing {
  let t = LEAD;
  const steps = script.steps.map((s) => { const dur = 0.5 + s.say.replace(/\s/g, "").length * 0.19; const start = t; t += dur + GAP; return { start, dur }; });
  return { steps, total: t + TAIL };
}
