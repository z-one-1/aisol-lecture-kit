#!/usr/bin/env python3
"""어사이드 브라우저 탭 조작 보조(키트 공통). 사용:
  aside_tab.py <targetId> eval '<js 식>' | shot <out.jpg> | goto <url> | click <x> <y> | type '<text>' | upload <fileInputIndex> <path>
어사이드 계정이 여러 개면 환경변수 ASIDE_ACCOUNT(예: u0)로 지정. 하나면 비워 둔다."""
import json, os, subprocess, sys, base64, re
def repl(code):
    cmd = ["aside", "repl"] + (["--account", os.environ["ASIDE_ACCOUNT"]] if os.environ.get("ASIDE_ACCOUNT") else []) + [code]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return re.sub(r"\x1b\[[0-9;]*m", "", r.stdout + r.stderr)
tid, cmd = sys.argv[1], sys.argv[2]
A = f'const tab=await attachBrowserTab({json.dumps(tid)});'
if cmd == "eval":
    print(repl(A + f'const v=await tab.evaluate({json.dumps(sys.argv[3])}); console.log("RES "+JSON.stringify(v));'))
elif cmd == "shot":
    out = repl(A + 'const s=await tab._sendToTarget("Page.captureScreenshot",{format:"jpeg",quality:55}); console.log("IMG "+s.data);')
    m = re.search(r"IMG (\S+)", out)
    if not m: print(out[-600:]); sys.exit(1)
    open(sys.argv[3], "wb").write(base64.b64decode(m.group(1))); print("saved", sys.argv[3])
elif cmd == "goto":
    print(repl(A + f'await tab.goto({json.dumps(sys.argv[3])}); await new Promise(r=>setTimeout(r,4000)); console.log("AT "+(await tab.url()));'))
elif cmd == "click":
    x, y = float(sys.argv[3]), float(sys.argv[4])
    print(repl(A + f'for(const type of ["mouseMoved","mousePressed","mouseReleased"]) await tab._sendToTarget("Input.dispatchMouseEvent",{{type,x:{x},y:{y},button:"left",clickCount:1}}); await new Promise(r=>setTimeout(r,1500)); console.log("clicked");'))
elif cmd == "type":
    print(repl(A + f'await tab._sendToTarget("Input.insertText",{{text:{json.dumps(sys.argv[3], ensure_ascii=False)}}}); console.log("typed");'))
elif cmd == "upload":
    idx, path = int(sys.argv[3]), sys.argv[4]
    print(repl(A + f'const r=await tab._sendToTarget("Runtime.evaluate",{{expression:"document.querySelectorAll(\\"input[type=file]\\")[{idx}]"}}); await tab._sendToTarget("DOM.setFileInputFiles",{{files:[{json.dumps(path)}],objectId:r.result.objectId}}); await new Promise(r=>setTimeout(r,4000)); console.log("uploaded");'))
