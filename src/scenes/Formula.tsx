import React from "react";
import { spring, interpolate } from "remotion";
import type { View } from "../Lecture";
import { C, SPRING, FONT } from "../theme";
import { Rich } from "../Rich";

// 마지막 단계: 공식 카드가 문제 영역 위로 올라오고, 정답 도장이 찍힌다.
export const Formula: React.FC<{ v: View }> = ({ v }) => {
  const { script: s, frame, fps, wide, formulaF, revealF } = v;
  const stampOn = revealF !== null && frame >= revealF;
  const stamp = stampOn ? spring({ frame: frame - (revealF as number), fps, config: SPRING.accent, durationInFrames: 22 }) : 0;
  const showF = s.formula && formulaF !== null && frame >= formulaF;
  const up = showF ? spring({ frame: frame - (formulaF as number), fps, config: SPRING.enter, durationInFrames: 20 }) : 0;
  const pad = wide ? 48 : 44;
  return (
    <>
      {stampOn ? (
        <div style={{ position: "absolute", right: wide ? 820 : 60, top: wide ? 180 : 330, width: wide ? 190 : 220, height: wide ? 190 : 220, borderRadius: "50%", border: `10px solid ${C.coral}`, color: C.coral, display: "grid", placeItems: "center", fontFamily: FONT.head, fontSize: wide ? 54 : 62, lineHeight: 1.05, textAlign: "center", background: "rgba(255,255,255,.88)", transform: `rotate(-12deg) scale(${interpolate(stamp, [0, 1], [1.8, 1])})`, opacity: Math.min(1, stamp * 2), zIndex: 6 }}>
          정답<br />{s.answer}
        </div>
      ) : null}
      {showF ? (
        <div style={{ position: "absolute", zIndex: 5, left: wide ? 1160 : pad, right: pad, top: wide ? 170 : 340, background: C.green, color: "#fff", borderRadius: 32, padding: wide ? "28px 32px" : "40px 44px", boxShadow: "0 20px 50px rgba(8,90,72,.35)", opacity: up, transform: `translateY(${(1 - up) * 60}px)` }}>
          <h2 style={{ fontFamily: FONT.head, fontWeight: 400, fontSize: wide ? 44 : 60, margin: "0 0 14px" }}>{s.formula!.title}</h2>
          {s.formula!.lines.map((l, i) => {
            const p = spring({ frame: frame - (formulaF as number) - 6 - i * 5, fps, config: SPRING.enter, durationInFrames: 14 });
            return <div key={i} style={{ fontSize: wide ? 28 : 36, fontWeight: 800, lineHeight: 1.5, opacity: p, transform: `translateX(${(1 - p) * -20}px)`, wordBreak: "keep-all" }}><Rich text={l} hl={{}} /></div>;
          })}
        </div>
      ) : null}
    </>
  );
};
