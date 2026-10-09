#!/usr/bin/env python3
"""유튜브 스튜디오 업로드(어사이드 브라우저, 한국어 UI). 사용: upload_youtube.py out/<id>/meta-shorts.json [--dry]
meta = {file, title, desc, tags[], playlist, privacy: public|unlisted|private, schedule: "YYYY-MM-DD HH:MM"|null}
전제: 어사이드에 유튜브(스튜디오) 로그인이 되어 있음. 채널은 자동 감지. 마지막 줄 'URL <주소>'. --dry 는 공개 직전에 멈춤(초안만 남음)."""
import json, os, re, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(HERE, "aside_tab.py")
ACC = os.environ.get("ASIDE_ACCOUNT", "")
def repl(code):
    cmd = ["aside", "repl"] + (["--account", ACC] if ACC else []) + [code]
    return re.sub(r"\x1b\[[0-9;]*m", "", subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout)
def find_tab():
    for attempt in range(2):
        out = repl("const ts=await listBrowserTabs(); console.log('IDS '+JSON.stringify(ts.filter(t=>(t.url||'').includes('studio.youtube.com')).map(t=>t.targetId)))")
        m = re.search(r"IDS (.*)", out)
        for tid in (json.loads(m.group(1)) if m else []):
            try:
                if "ALIVE 1" in repl(f"const t=await attachBrowserTab('{tid}'); console.log('ALIVE '+await t.evaluate(()=>1))"): return tid
            except Exception: continue
        repl("const t=await openTab('https://studio.youtube.com/'); await new Promise(r=>setTimeout(r,8000)); console.log('OPENED '+(await t.url()))")
        time.sleep(2)
    raise SystemExit("스튜디오 탭을 열 수 없어요. 어사이드에서 studio.youtube.com 에 로그인돼 있는지 확인")
T = find_tab()
def run(*a): return subprocess.run(["python3", S, T, *a], capture_output=True, text=True).stdout
def ev(js):
    m = re.search(r"RES (.*)", run("eval", js)); return json.loads(m.group(1)) if m else None
def key(k, code, vk):
    repl(f"const tab=await attachBrowserTab('{T}'); for(const type of ['rawKeyDown','keyUp']) await tab._sendToTarget('Input.dispatchKeyEvent',{{type,key:'{k}',code:'{code}',windowsVirtualKeyCode:{vk}}}); console.log('key')")
def cset(sel, text, select_all=True):
    r = ev(f"(()=>{{const e={sel};if(!e)return null;e.scrollIntoView({{block:'center'}});const r=e.getBoundingClientRect();return [r.x+Math.min(30,r.width/2),r.y+r.height/2]}})()")
    if not r: raise SystemExit(f"입력란 없음: {sel}")
    run("click", str(r[0]), str(r[1]))
    if select_all: ev("(()=>{const e=document.activeElement;if(e.select)e.select();else document.execCommand('selectAll');return 1})()")
    run("type", text)
def click_text(txt, scope="document"):
    return ev(f"(()=>{{const e=[...{scope}.querySelectorAll('ytcp-button,button,tp-yt-paper-item,ytcp-ve,li')].filter(e=>e.offsetParent&&e.innerText.trim()=={json.dumps(txt)}).pop();if(!e)return false;e.click();return true}})()")
def wait(js, sec=60):
    for _ in range(sec):
        if ev(js): return True
        time.sleep(1)
    return False
m = json.load(open(sys.argv[1])); DRY = "--dry" in sys.argv
if not os.path.exists(m["file"]): raise SystemExit("영상 파일 없음: " + m["file"])
run("goto", "https://studio.youtube.com/"); time.sleep(2)
# 이전 업로드 창(공유 완료·처리 중 대화상자)이 남아 있으면 닫는다
ev("(()=>{[...document.querySelectorAll('ytcp-button,button')].filter(e=>e.offsetParent&&/^(닫기|Close)$/.test(e.innerText.trim())).forEach(e=>e.click());return 1})()"); time.sleep(1)
if ev("!!document.querySelector('ytcp-uploads-dialog')"):
    repl(f"const tab=await attachBrowserTab('{T}'); for(const type of ['rawKeyDown','keyUp']) await tab._sendToTarget('Input.dispatchKeyEvent',{{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27}}); console.log('esc')"); time.sleep(2)
ch = ev("(location.href.match(/channel\\/(UC[\\w-]+)/)||[])[1]||''")
if not ch: raise SystemExit("채널을 못 찾았어요. 어사이드에서 유튜브 스튜디오에 로그인한 뒤 다시")
run("goto", f"https://studio.youtube.com/channel/{ch}/videos/short")
click_text("만들기"); time.sleep(1); click_text("동영상 업로드"); time.sleep(3)
run("upload", "0", m["file"])
if not wait("[...document.querySelectorAll('#textbox')].filter(e=>e.offsetParent).length>=2", 90):
    if ev("document.body.innerText.includes('일일 업로드 한도')"): raise SystemExit("LIMIT 일일 업로드 한도 도달 — 내일 다시")
    raise SystemExit("세부정보 화면 안 뜸")
time.sleep(2)
TB = "[...document.querySelectorAll('#textbox')].filter(e=>e.offsetParent)"
cset(TB + "[0]", m["title"]); cset(TB + "[1]", m["desc"])
if m.get("playlist"):
    ev("(()=>{const d=document.querySelector('ytcp-video-metadata-playlists');d.scrollIntoView({block:'center'});(d.querySelector('ytcp-dropdown-trigger')||d).click();return 1})()"); time.sleep(2)
    pl = m["playlist"]
    if not wait(f"[...document.querySelectorAll('ytcp-playlist-dialog li')].some(e=>e.offsetParent&&e.innerText.trim()=={json.dumps(pl)})", 15):
        # 재생목록이 없으면 새로 만든다
        made = ev(f"(()=>{{const b=[...document.querySelectorAll('ytcp-playlist-dialog ytcp-button,ytcp-playlist-dialog button,ytcp-playlist-dialog tp-yt-paper-item')].find(e=>e.offsetParent&&/새 재생목록/.test(e.innerText));if(!b)return false;b.click();return true}})()")
        time.sleep(1.5)
        if made:
            cset("[...document.querySelectorAll('ytcp-playlist-dialog textarea, ytcp-playlist-dialog input, ytcp-playlist-dialog #textbox')].find(e=>e.offsetParent)", pl, select_all=False); time.sleep(0.5)
            click_text("만들기", "document.querySelector('ytcp-playlist-dialog')"); time.sleep(2.5)
    ok = ev(f"(()=>{{const li=[...document.querySelectorAll('ytcp-playlist-dialog li')].find(e=>e.offsetParent&&e.innerText.trim()=={json.dumps(pl)});if(!li)return false;const c=li.querySelector('ytcp-checkbox-lit');if(c&&c.getAttribute('aria-checked')!=='true'&&!c.hasAttribute('checked'))c.click();return true}})()")
    if not ok: print("! 재생목록 못 찾음(건너뜀): " + pl)
    time.sleep(1); click_text("완료", "document.querySelector('ytcp-playlist-dialog')"); time.sleep(1)
ev("(()=>{document.querySelector('tp-yt-paper-radio-button[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]').click();const b=document.querySelector('#toggle-button');if(b&&b.innerText.includes('자세히'))b.click();return 1})()"); time.sleep(2)
ev("(()=>{const r=document.querySelector('tp-yt-paper-radio-button[name=VIDEO_HAS_ALTERED_CONTENT_NO]');r&&r.click();return 1})()")
if m.get("tags"):
    cset("document.querySelector('input[aria-label=태그]')", ", ".join(m["tags"]) + ",", select_all=False); key("Enter", "Enter", 13); time.sleep(1)
chk = ev("(()=>{const q=s=>document.querySelector(s);return {t:[...document.querySelectorAll('#textbox')].filter(e=>e.offsetParent).map(e=>e.innerText.trim().slice(0,40)),kids:(q('tp-yt-paper-radio-button[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]')||{}).getAttribute?.('aria-checked')}})()")
print("CHECK", json.dumps(chk, ensure_ascii=False))
if not chk or chk["kids"] != "true" or not chk["t"][0].startswith(m["title"][:20]): raise SystemExit("세부정보 확인 실패")
for _ in range(8):
    if ev("!!(document.querySelector('#done-button')||{}).offsetParent"): break
    ev("(()=>{[...document.querySelectorAll('ytcp-button,button,tp-yt-paper-button')].filter(e=>e.offsetParent&&e.innerText.trim()=='닫기'&&!e.closest('ytcp-video-share-dialog')).forEach(e=>e.click());return 1})()")
    r = ev("(()=>{const b=document.querySelector('#next-button');const r=b.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
    run("click", str(r[0]), str(r[1])); time.sleep(2.5)
if not wait("!!(document.querySelector('#done-button')||{}).offsetParent", 20): raise SystemExit("공개 단계 안 뜸")
url = ev("(document.querySelector('ytcp-video-info a')||{}).href||''")
if m.get("schedule"):
    d, hm = m["schedule"].split(); y, mo, da = d.split("-")
    if not ev("!!(document.querySelector('#datepicker-trigger')||{}).offsetParent"): ev("(()=>{const e=document.querySelector('#second-container-expand-button')||[...document.querySelectorAll('ytcp-uploads-dialog *')].find(x=>x.offsetParent&&x.innerText&&x.innerText.trim().startsWith('예약')&&x.children.length<4);e&&e.click();return 1})()"); time.sleep(1.5)
    ev("(()=>{document.querySelector('#datepicker-trigger').click();return 1})()"); time.sleep(1.5)
    pick = f"(()=>{{const mon=[...document.querySelectorAll('.calendar-month')].find(m=>m.querySelector('.calendar-month-label').innerText.trim()=='{y}년 {int(mo)}월');if(!mon)return null;const c=[...mon.querySelectorAll('.calendar-day')].find(e=>e.innerText.trim()=='{int(da)}');if(!c)return null;c.scrollIntoView({{block:'center'}});const r=c.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}})()"
    r = ev(pick)
    for _ in range(30):
        if r: break
        ev("(()=>{const L=document.querySelector('ytcp-scrollable-calendar tp-yt-iron-list');const sc=(L&&(L.scrollTarget||L.parentElement));if(sc)sc.scrollTop+=240;return 1})()"); time.sleep(0.4); r = ev(pick)
    if not r: raise SystemExit("달력 날짜 못 찾음")
    run("click", str(r[0]), str(r[1])); time.sleep(1.5)
    h, mi = map(int, hm.split(":")); ap = "오후" if h >= 12 else "오전"; h12 = h - 12 if h > 12 else (12 if h == 0 else h)
    ev("(()=>{const i=[...document.querySelectorAll('input')].find(e=>e.offsetParent&&/^(오전|오후) /.test(e.value));i.click();i.focus();return 1})()"); time.sleep(1.2)
    if not ev(f"(()=>{{const it=[...document.querySelectorAll('tp-yt-paper-item')].find(e=>e.offsetParent&&e.innerText.trim()=={json.dumps(f'{ap} {h12}:{mi:02d}')});if(!it)return false;it.scrollIntoView({{block:'center'}});it.click();return true}})()"): raise SystemExit("시각 항목 없음(15분 단위로 맞추세요)")
    time.sleep(1)
else:
    name = {"public": "PUBLIC", "unlisted": "UNLISTED", "private": "PRIVATE"}.get(m.get("privacy", "public"), "PUBLIC")
    ev(f"(()=>{{document.querySelector('tp-yt-paper-radio-button[name={name}]').click();return 1}})()")
time.sleep(1)
if DRY: print("DRY 멈춤(게시 안 함, 초안 남음)"); print("URL", url); sys.exit(0)
ev("(()=>{document.querySelector('#done-button').click();return 1})()")
wait("!!document.querySelector('ytcp-video-share-dialog, ytcp-uploads-still-processing-dialog')", 30); time.sleep(2)
txt = ev("[...document.querySelectorAll('ytcp-video-share-dialog,ytcp-uploads-still-processing-dialog,tp-yt-paper-dialog')].filter(e=>e.offsetParent).map(e=>e.innerText).join(' ')") or ""
mm = re.search(r"https://youtube\.com/shorts/[\w-]+", txt) or re.search(r"https://youtu\S+", url or "")
ev("(()=>{const b=[...document.querySelectorAll('ytcp-button,button')].find(e=>e.offsetParent&&e.innerText.trim()=='닫기');b&&b.click();return 1})()")
print("URL", mm.group(0) if mm else url)
