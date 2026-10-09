import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { C } from "./theme";

// 텍스트 조각: $...$ 는 KaTeX, {m1}~{m9} 는 번호 동그라미, hl 구절은 형광펜(진행도 0~1로 왼쪽부터 칠해짐)
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const circled = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

export const Tex: React.FC<{ tex: string; display?: boolean; color?: string }> = ({ tex, display, color }) => (
  <span style={{ color }} dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false, displayMode: !!display }) }} />
);

export const Rich: React.FC<{ text: string; hl?: Record<string, number>; hlColor?: string; markColor?: string }> = ({ text, hl = {}, hlColor = C.yellow, markColor = C.ink }) => {
  const keys = Object.keys(hl).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(\\$[^$]+\\$|\\{m[1-9]\\}${keys.length ? "|" + keys.map(esc).join("|") : ""})`, "g");
  const parts = text.split(re).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("$") && p.endsWith("$") && p.length > 2) {
          const inner = p.slice(1, -1);
          const prog = hl[p] ?? hl[inner];
          return prog === undefined ? <Tex key={i} tex={inner} /> : <Mark key={i} prog={prog} color={hlColor}><Tex tex={inner} /></Mark>;
        }
        const m = /^\{m([1-9])\}$/.exec(p);
        if (m) return <span key={i} style={{ display: "inline-grid", placeItems: "center", width: "1.3em", height: "1.3em", borderRadius: "50%", border: `2.5px solid ${markColor}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: "0.72em", verticalAlign: "0.1em", margin: "0 0.15em", background: "#fff", color: markColor }}>{m[1]}</span>;
        if (hl[p] !== undefined) return <Mark key={i} prog={hl[p]} color={hlColor}>{p}</Mark>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
};

const Mark: React.FC<{ prog: number; color: string; children: React.ReactNode }> = ({ prog, color, children }) => (
  <span style={{ backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: "no-repeat", backgroundSize: `${Math.round(prog * 100)}% 55%`, backgroundPosition: "0 85%", borderRadius: 4, padding: "0 2px", fontWeight: prog > 0.5 ? 900 : undefined }}>{children}</span>
);
export const circ = (i: number) => circled[i] ?? String(i + 1);
