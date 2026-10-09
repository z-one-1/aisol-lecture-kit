import React from "react";
import { spring } from "remotion";
import type { View } from "../Lecture";
import { C, SPRING, FONT } from "../theme";
import { Rich } from "../Rich";

// 풀이 보드: 단계마다 한 줄씩 쌓인다(수학 식 전개, 국어 판정 메모)
export const WorkBoard: React.FC<{ v: View }> = ({ v }) => {
  const { script: s, frame, fps, wide, work, accent } = v;
  const has = s.steps.some((x) => x.work);
  const pr = s.problem;
  const compact = !wide && !!(pr.box || pr.choices?.some((c) => c.length > 4));
  if (!has) return null;
  return (
    <div style={{ background: C.ink, color: "#fff", borderRadius: 22, padding: wide ? "16px 22px" : "18px 24px", minHeight: wide ? 120 : compact ? 96 : 110, flex: wide ? "0 0 auto" : "1 1 auto", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontFamily: FONT.soft, fontSize: wide ? 24 : 28, color: accent }}>풀이</div>
      {work.map((w, i) => {
        const p = spring({ frame: frame - w.f, fps, config: SPRING.enter, durationInFrames: 16 });
        return <div key={i} style={{ fontSize: wide ? 28 : compact ? 27 : 32, fontWeight: 700, opacity: p, transform: `translateX(${(1 - p) * -24}px)`, lineHeight: 1.5 }}><Rich text={w.text} hl={{}} /></div>;
      })}
    </div>
  );
};
