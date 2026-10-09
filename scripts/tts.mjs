// 대본(steps[].say) → 일레븐랩스 TTS → public/voice/<id>/sN.mp3 + timing.json
// 같은 문장은 다시 생성하지 않는다(크레딧 절약). 사용: npm run tts problems/<문제>.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import { loadEnv, readScript, voiceDir, hash, die, ok, save } from "./lib.mjs";

loadEnv();
const s = readScript(process.argv[2]);
const KEY = process.env.ELEVENLABS_API_KEY, VOICE = process.env.ELEVENLABS_VOICE_ID, MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_v3";
if (!KEY) die("ELEVENLABS_API_KEY가 없어요. .env.example을 .env로 복사해 채우세요");
if (!VOICE) die("ELEVENLABS_VOICE_ID가 없어요. 일레븐랩스 Voices에서 내 목소리 ID를 복사하세요");
const dir = voiceDir(s.id);
const LEAD = 0.6, GAP = 0.35, TAIL = 1.8;

async function speak(text, out) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: true } }),
  });
  if (!r.ok) {
    const body = await r.text();
    if (r.status === 401) die("API 키가 틀렸어요(401). .env의 ELEVENLABS_API_KEY 확인");
    if (r.status === 402 || /quota|credit/i.test(body)) die("크레딧이 부족해요. 일레븐랩스 플랜/크레딧 확인");
    die(`일레븐랩스 오류 ${r.status}: ${body.slice(0, 300)}`);
  }
  writeFileSync(out, Buffer.from(await r.arrayBuffer()));
}
const dur = async (f) => (await parseMedia({ src: f, reader: nodeReader, fields: { durationInSeconds: true }, acknowledgeRemotionLicense: true })).durationInSeconds;

let t = LEAD, made = 0; const steps = [];
for (let i = 0; i < s.steps.length; i++) {
  const text = s.steps[i].say, mp3 = join(dir, `s${i + 1}.mp3`), tag = join(dir, `s${i + 1}.txt`);
  const h = hash(MODEL + "|" + VOICE + "|" + text);
  if (!(existsSync(mp3) && existsSync(tag) && readFileSync(tag, "utf8") === h)) {
    process.stdout.write(`  ${i + 1}/${s.steps.length} 음성 생성… `);
    await speak(text, mp3); writeFileSync(tag, h); made++; console.log("완료");
  }
  const d = await dur(mp3);
  steps.push({ start: +t.toFixed(3), dur: +d.toFixed(3) }); t += d + GAP;
}
const timing = { steps, total: +(t + TAIL).toFixed(3) };
save(join(dir, "timing.json"), timing);
ok(`음성 ${s.steps.length}개(새로 생성 ${made}개), 총 ${timing.total.toFixed(1)}초 → ${dir}`);
