import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
export function readScript(file) {
  if (!file) die("사용법: npm run make problems/<문제>.json");
  const p = resolve(file);
  if (!existsSync(p)) die(`파일이 없어요: ${file}`);
  const s = JSON.parse(readFileSync(p, "utf8"));
  if (!s.id) die("problems JSON에 id가 없어요");
  return s;
}
export const voiceDir = (id) => { const d = join(ROOT, "public", "voice", id); mkdirSync(d, { recursive: true }); return d; };
export const hash = (t) => createHash("sha1").update(t).digest("hex").slice(0, 12);
export const die = (msg) => { console.error("✖ " + msg); process.exit(1); };
export const ok = (msg) => console.log("✔ " + msg);
export const save = (p, obj) => writeFileSync(p, JSON.stringify(obj, null, 1));
