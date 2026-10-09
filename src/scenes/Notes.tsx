import React from "react";
import { spring } from "remotion";
import type { View } from "../Lecture";
import { C, SPRING, FONT } from "../theme";

export const Notes: React.FC<{ v: View }> = ({ v }) => {
  const { script: s, frame, fps, wide, notesOn } = v;
  if (!s.notes?.length) return null;
  const enter = spring({ frame: frame - 10, fps, config: SPRING.enter, durationInFrames: 18 });
  const cols = wide ? 1 : s.notes.length > 4 ? 3 : 2;
  const fsz = wide ? 22 : cols === 3 ? 21 : s.subject === "korean" ? 22 : 24;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "10px 14px", opacity: enter, transform: `translateY(${(1 - enter) * 24}px)` }}>
      <div style={{ gridColumn: "1 / -1", fontFamily: FONT.soft, fontSize: wide ? 26 : 30, color: C.green }}>단서 노트</div>
      {s.notes.map((n, i) => {
        const f = notesOn[i];
        const on = f !== undefined && frame >= f;
        const pop = on ? spring({ frame: frame - (f as number), fps, config: SPRING.beat, durationInFrames: 14 }) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: fsz, color: on ? C.ink : C.muted, background: C.paper, borderRadius: 14, padding: cols === 3 ? "6px 10px" : "7px 12px", border: on ? `2px solid ${C.green}` : `2px dashed ${C.line}`, transform: `scale(${1 + 0.05 * Math.sin(pop * Math.PI)})` }}>
            <i style={{ fontStyle: "normal", flex: "none", width: 30, height: 30, borderRadius: 8, border: `3px solid ${on ? C.green : "#c8cdda"}`, background: on ? C.green : "transparent", display: "grid", placeItems: "center", color: "#fff", fontSize: 20 }}>{on ? "✓" : ""}</i>
            <span>{n}</span>
          </div>
        );
      })}
    </div>
  );
};
