import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, die } from "./lib.mjs";
export function loadConfig() {
  const p = join(ROOT, "config.json");
  if (!existsSync(p)) die("config.json 이 없어요. 클로드 코드에 '내 채널 기본값 잡아 줘'라고 하거나 config.example.json 을 복사하세요");
  return JSON.parse(readFileSync(p, "utf8"));
}
export const SUBJ = { english: "영어", korean: "국어", math: "수학" };
export function fill(tpl, vars) { return tpl.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m)); }
