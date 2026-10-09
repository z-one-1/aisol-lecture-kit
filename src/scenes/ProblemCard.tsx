import React from "react";
import { spring, interpolate } from "remotion";
import type { View } from "../Lecture";
import { C, SPRING, FONT } from "../theme";
import { Rich, circ } from "../Rich";

export const ProblemCard: React.FC<{ v: View }> = ({ v }) => {
  const { script: s, frame, fps, wide, hl, revealF, accent } = v;
  const p = s.problem;
  const enter = spring({ frame: frame - 4, fps, config: SPRING.enter, durationInFrames: 18 });
  const serif = s.subject === "english";
  const compact = (p.choices?.some((c) => c.length > 4)) || (p.box?.length ?? 0) > 3;
  const fs = wide ? (serif ? 28 : compact ? 27 : 30) : (serif ? 28.5 : s.subject === "math" ? 36 : compact ? 29 : 32);
  const card: React.CSSProperties = { background: C.paper, borderRadius: 26, boxShadow: "0 10px 30px rgba(12,122,98,.12)", padding: wide ? "22px 28px" : "24px 28px", fontSize: fs, lineHeight: serif ? 1.5 : 1.55, fontFamily: serif ? FONT.serif : FONT.body, fontWeight: serif ? 400 : 500, wordBreak: "keep-all" };
  const ansIdx = ["①", "②", "③", "④", "⑤"].indexOf(s.answer);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
      {p.given ? (
        <div style={{ ...card, position: "relative", border: `4px solid ${C.green}`, paddingTop: 40 }}>
          <span style={{ position: "absolute", left: 24, top: -22, background: C.green, color: "#fff", fontFamily: FONT.body, fontWeight: 900, fontSize: 24, padding: "6px 16px", borderRadius: 12 }}>주어진 문장</span>
          <Rich text={p.given} hl={hl} hlColor={accent} />
        </div>
      ) : null}
      {p.text ? <div style={{ ...card }}><b style={{ color: C.green, marginRight: 10, fontFamily: FONT.body }}>{s.num}</b><Rich text={p.text} hl={hl} hlColor={accent} /></div> : null}
      {p.passage ? <div style={{ ...card, textAlign: "justify" }}><Rich text={p.passage} hl={hl} hlColor={accent} /></div> : null}
      {p.box ? (
        <div style={{ ...card, position: "relative", border: `2.5px solid ${C.ink}`, borderRadius: 18, paddingTop: 30, fontSize: compact ? fs - 1 : fs - 2, padding: compact ? "26px 24px 14px" : undefined }}>
          <span style={{ position: "absolute", left: "50%", top: -18, transform: "translateX(-50%)", background: C.paper, padding: "0 14px", fontWeight: 900, fontFamily: FONT.body }}>〈보기〉</span>
          {p.box.map((line, i) => <div key={i} style={{ padding: "3px 0" }}><Rich text={line} hl={hl} hlColor={accent} /></div>)}
        </div>
      ) : null}
      {p.choices ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 8 : 10, fontSize: compact ? fs - 7 : fs - 4, fontFamily: FONT.body, fontWeight: 600 }}>
          {p.choices.map((c, i) => {
            const isAns = i === ansIdx && revealF !== null && frame >= revealF;
            const pop = isAns ? spring({ frame: frame - (revealF as number), fps, config: SPRING.accent, durationInFrames: 20 }) : 0;
            const short = c.length <= 4;
            return (
              <div key={i} style={{ flex: short ? "1 1 0" : "1 1 100%", display: "flex", gap: 10, alignItems: "flex-start", background: isAns ? C.green : C.paper, color: isAns ? "#fff" : C.ink, borderRadius: 16, padding: short ? "10px 12px" : compact ? "6px 14px" : "8px 16px", boxShadow: "0 6px 18px rgba(12,122,98,.10)", transform: `scale(${1 + 0.06 * Math.sin(Math.min(1, pop) * Math.PI)})`, justifyContent: short ? "center" : "flex-start", lineHeight: compact ? 1.35 : 1.45 }}>
                <span style={{ fontWeight: 900 }}>{circ(i)}</span><span><Rich text={c} hl={hl} hlColor={accent} /></span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
