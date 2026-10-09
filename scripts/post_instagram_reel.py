#!/usr/bin/env python3
"""인스타그램 릴스 게시 (어사이드 브라우저, 한국어 UI). 사용: post_instagram_reel.py --file clip.mp4 --caption-file 캡션.txt [--dry]
전제: 어사이드에 인스타그램 로그인. 절차: 홈 → '새로운 게시물' → 게시물 → 파일 → 자르기 '원본' → 다음·다음 → 캡션 → AI 레이블 → 공유하기 → '릴스가 공유되었습니다' 대기.
마지막 줄 'RESULT shared|dry|fail'. 게시 중엔 탭을 이동하지 않는다."""
import sys, os, json, re, subprocess, time
def arg(k, d=None): return sys.argv[sys.argv.index(k)+1] if k in sys.argv else d
FILE = os.path.abspath(arg("--file")); CAP = open(arg("--caption-file"), encoding="utf-8").read().strip() if arg("--caption-file") else ""; DRY = "--dry" in sys.argv
ACC = os.environ.get("ASIDE_ACCOUNT", "")
def repl(code):
    cmd = ["aside", "repl"] + (["--account", ACC] if ACC else []) + [code]
    return re.sub(r"\x1b\[[0-9;]*m", "", subprocess.run(cmd, cwd=os.path.expanduser("~"), capture_output=True, text=True, timeout=300).stdout)
js = r'''
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tab = await openTab("https://www.instagram.com/"); await sleep(7000);
await tab._sendToTarget("Emulation.setDeviceMetricsOverride",{width:1300,height:900,deviceScaleFactor:2,mobile:false}); await sleep(1500);
const click=async(x,y)=>{ for(const type of ["mouseMoved","mousePressed","mouseReleased"]) await tab._sendToTarget("Input.dispatchMouseEvent",{type,x,y,button:"left",clickCount:1}); };
await tab.evaluate(`(()=>{const b=[...document.querySelectorAll("button")].find(b=>/나중에 하기|Not Now/.test(b.innerText));b&&b.click();return 1})()`);
let p=await tab.evaluate(`(()=>{const s=document.querySelector('svg[aria-label="새로운 게시물"],svg[aria-label="New post"]');if(!s)return null;const b=s.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`);
if(!p) throw new Error("새로운 게시물 버튼 없음(로그인 확인)"); await click(p[0],p[1]); await sleep(2000);
p=await tab.evaluate(`(()=>{const e=[...document.querySelectorAll("a,div")].find(e=>e.offsetParent&&/^(게시물|Post)$/.test((e.innerText||"").trim()));if(!e)return null;const b=e.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`);
if(p){ await click(p[0],p[1]); await sleep(3000); }
const doc=await tab._sendToTarget("DOM.getDocument",{depth:-1}); const q=await tab._sendToTarget("DOM.querySelector",{nodeId:doc.root.nodeId, selector:"div[role=dialog] input[type=file]"});
if(!q.nodeId) throw new Error("파일 입력란 없음"); await tab._sendToTarget("DOM.setFileInputFiles",{nodeId:q.nodeId, files:[%s]}); await sleep(6000);
p=await tab.evaluate(`(()=>{const s=document.querySelector('svg[aria-label="자르기 선택"],svg[aria-label="Select crop"]');if(!s)return null;const b=s.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`);
if(p){ await click(p[0],p[1]); await sleep(1200); const o=await tab.evaluate(`(()=>{const e=[...document.querySelectorAll("div[role=dialog] span,div[role=dialog] div")].find(x=>x.offsetParent&&/^(원본|Original)$/.test((x.innerText||"").trim()));if(!e)return null;const b=e.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`); if(o){ await click(o[0],o[1]); await sleep(1500); } }
const next=async()=>{ const n=await tab.evaluate(`(()=>{const d=[...document.querySelectorAll("div[role=dialog]")].pop();const e=[...d.querySelectorAll("button,div[role=button]")].filter(x=>x.offsetParent&&/^(다음|Next)$/.test(x.innerText.trim())).pop();if(!e)return null;const b=e.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`); if(n){ await click(n[0],n[1]); await sleep(3000); } };
await next(); await next();
await tab.evaluate(`(()=>{const d=[...document.querySelectorAll("div[role=dialog]")].pop();const c=d.querySelector("[contenteditable=true]");c&&c.focus();return 1})()`);
const CAP=%s; const lines=CAP.split("\n");
for(let i=0;i<lines.length;i++){ if(lines[i]) await tab._sendToTarget("Input.insertText",{text:lines[i]}); if(i<lines.length-1){ for(const type of ["keyDown","keyUp"]) await tab._sendToTarget("Input.dispatchKeyEvent",{type,key:"Enter",code:"Enter",windowsVirtualKeyCode:13}); } }
await sleep(800);
const st=await tab.evaluate(`(()=>{const d=[...document.querySelectorAll("div[role=dialog]")].pop();const c=d.querySelector("[contenteditable=true]");const counter=(d.innerText.match(/(\\d+)\\/2,?200/)||[])[1];const cbs=[...d.querySelectorAll("input[type=checkbox]")];const ai=cbs[0];if(ai&&!ai.checked)ai.click();return {len:c?c.innerText.length:0,counter,ai:ai?ai.checked:null}})()`);
if(%s){ console.log("RESULT dry "+JSON.stringify(st)); } else {
  const s=await tab.evaluate(`(()=>{const d=[...document.querySelectorAll("div[role=dialog]")].pop();const e=[...d.querySelectorAll("div[role=button],button,div")].filter(x=>x.offsetParent&&/^(공유하기|Share)$/.test((x.innerText||"").trim())).pop();const b=e.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`);
  await click(s[0],s[1]); let msg="";
  for(let i=0;i<50;i++){ await sleep(3000); msg=await tab.evaluate(`(()=>{const d=[...document.querySelectorAll("div[role=dialog]")].pop();return d?d.innerText.replace(/\\s+/g," ").slice(0,60):"no-dialog"})()`); if(/공유되었습니다|shared/.test(msg)||msg==="no-dialog") break; }
  console.log("RESULT "+(/공유되었습니다|shared/.test(msg)?"shared":"fail")+" "+JSON.stringify(st)+" "+msg);
}
''' % (json.dumps(FILE), json.dumps(CAP, ensure_ascii=False), "true" if DRY else "false")
out = repl(js)
m = [l for l in out.splitlines() if l.startswith("RESULT ")]
print(m[-1] if m else "RESULT fail " + out[-300:])
sys.exit(0 if m and ("shared" in m[-1] or "dry" in m[-1]) else 1)
