#!/usr/bin/env python3
"""스레드(threads.com) 글 게시 + 영상/이미지 첨부 (어사이드 브라우저). 사용:
  post_threads.py --text-file 본문.txt [--file clip.mp4] [--reply-url https://www.threads.com/@계정/post/ID] [--dry]
전제: 어사이드에 스레드 로그인. 문단은 빈 줄로 구분. 영상 첨부 시 게시 뒤 업로드가 이어지므로 탭을 120초 유지한다.
출력 마지막 줄 result: {...}. 실제 게시는 프로필에서 URL을 재조회해 확인한다(중복 게시 방지: 확인 전 재전송 금지)."""
import sys, os, json, subprocess
def arg(k, d=None): return sys.argv[sys.argv.index(k)+1] if k in sys.argv else d
TEXT = open(arg("--text-file"), encoding="utf-8").read().strip() if arg("--text-file") else ""
FILE = os.path.abspath(arg("--file")) if arg("--file") else ""
REPLY = arg("--reply-url", ""); DRY = "--dry" in sys.argv
WAIT = 120000 if FILE else 7000
if not TEXT and not FILE: print("--text-file 또는 --file 필요"); sys.exit(2)
paras = [p.strip() for p in TEXT.split("\n\n") if p.strip()]
js = r'''
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tab = await openTab("https://www.threads.com/"); await sleep(6000);
const REPLY=%s, PARAS=%s, FILE=%s, DRY=%s, WAIT=%d;
const click=async(x,y)=>{ for(const type of ["mouseMoved","mousePressed","mouseReleased"]) await tab._sendToTarget("Input.dispatchMouseEvent",{type,x,y,button:"left",clickCount:1}); };
const key=async(k,mods)=>{ for(const type of ["keyDown","keyUp"]) await tab._sendToTarget("Input.dispatchKeyEvent",{type,key:k,code:k,windowsVirtualKeyCode:13,modifiers:mods||0}); };
if(REPLY){ await tab.evaluate(`location.href=${JSON.stringify(REPLY)}`); await sleep(6000);
  const b=await tab.evaluate(`(()=>{const els=[...document.querySelectorAll("[aria-label]")].filter(e=>/^답글|^Reply/.test(e.getAttribute("aria-label")||"")).concat([...document.querySelectorAll("svg title")].filter(t=>/^(답글|Reply)$/.test(t.textContent.trim())).map(t=>t.closest("svg"))); const e=els.map(e=>e.closest("div[role=button],button,a")||e).map(el=>({el,r:el.getBoundingClientRect()})).filter(o=>o.r.width>0).sort((a,b)=>a.r.y-b.r.y)[0]; if(!e) return null; return {x:e.r.x+e.r.width/2,y:e.r.y+e.r.height/2}})()`);
  if(!b) throw new Error("답글 버튼 없음"); await click(b.x,b.y);
} else { await tab.evaluate(`(()=>{const b=[...document.querySelectorAll("a,button,div[role=button]")].find(e=>/^(새로운 스레드|New thread)$/.test((e.innerText||"").trim())); b&&b.click(); return !!b})()`); }
await sleep(2500);
const ok=await tab.evaluate(`(()=>{const d=document.querySelector("[role=dialog]"); if(!d) return null; const ce=[...d.querySelectorAll("[contenteditable=true]")].find(x=>x.getBoundingClientRect().width>0); ce&&ce.focus(); return !!ce})()`);
if(!ok){ console.log("result: "+JSON.stringify({ok:false,why:"no-dialog"})); } else {
  for(let i=0;i<PARAS.length;i++){ await tab._sendToTarget("Input.insertText",{text:PARAS[i]}); if(i<PARAS.length-1){ await key("Enter",8); await key("Enter",8); } await sleep(150); }
  if(FILE){ const doc=await tab._sendToTarget("DOM.getDocument",{depth:-1}); const q=await tab._sendToTarget("DOM.querySelector",{nodeId:doc.root.nodeId, selector:"[role=dialog] input[type=file]"}); if(q.nodeId){ await tab._sendToTarget("DOM.setFileInputFiles",{nodeId:q.nodeId, files:[FILE]}); await sleep(9000); } }
  const st=await tab.evaluate(`(()=>{const d=document.querySelector("[role=dialog]"); const ce=[...d.querySelectorAll("[contenteditable=true]")].find(x=>x.getBoundingClientRect().width>0); const pb=[...d.querySelectorAll("button,div[role=button]")].find(b=>/^(게시|Post)$/.test(b.innerText.trim())); const r=pb?pb.getBoundingClientRect():null; return {video:!!d.querySelector("video"), img:d.querySelectorAll("img[src^='blob:']").length, draft:ce?ce.innerText:"", post:r?{x:r.x+r.width/2,y:r.y+r.height/2}:null}})()`);
  const mediaOk = !FILE || st.video || st.img>0; const norm=s=>s.replace(/\s+/g," ").trim(); const textOk=norm(st.draft)===norm(PARAS.join("\n\n")); delete st.draft;
  if(DRY || !mediaOk || !textOk || !st.post){ await tab.evaluate(`(()=>{const d=document.querySelector("[role=dialog]"); const c=d&&[...d.querySelectorAll("button,div[role=button]")].find(b=>/^(취소|Cancel)$/.test(b.innerText.trim())); c&&c.click(); return 1})()`); await sleep(1500); await tab.evaluate(`(()=>{const b=[...document.querySelectorAll("button,div[role=button]")].find(b=>/^(저장 안 함|삭제|Discard)$/.test(b.innerText.trim())&&b.getBoundingClientRect().width>0); b&&b.click(); return 1})()`); await sleep(1000); console.log("result: "+JSON.stringify({ok:mediaOk&&textOk&&!!st.post, dry:DRY, textOk, mediaOk, ...st})); }
  else { await click(st.post.x, st.post.y); await sleep(WAIT); const after=await tab.evaluate(`(()=>({dialog:!!document.querySelector("[role=dialog]")}))()`); console.log("result: "+JSON.stringify({ok:false, submitted:!after.dialog, verifyOnProfile:true, ...st})); }
}
''' % (json.dumps(REPLY), json.dumps(paras, ensure_ascii=False), json.dumps(FILE), "true" if DRY else "false", WAIT)
cmd = ["aside", "repl"] + (["--account", os.environ["ASIDE_ACCOUNT"]] if os.environ.get("ASIDE_ACCOUNT") else []) + [js]
r = subprocess.run(cmd, cwd=os.path.expanduser("~"), capture_output=True, text=True, timeout=300)
results = [l for l in (r.stdout + r.stderr).splitlines() if l.startswith("result: ")]
print(results[-1] if results else "No verified result; inspect UI before retry")
sys.exit(0 if results and json.loads(results[-1][8:]).get("ok") else (3 if results else 1))
