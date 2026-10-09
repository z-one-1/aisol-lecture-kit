import React from "react";
import { interpolate, spring } from "remotion";
import type { View } from "../Lecture";
import { C, SPRING, SUBJECT, FONT } from "../theme";

export const Header: React.FC<{ v: View }> = ({ v }) => {
  const { script: s, frame, fps, wide, stage } = v;
  const sub = SUBJECT[s.subject];
  const enter = spring({ frame, fps, config: SPRING.enter, durationInFrames: 18 });
  const h = wide ? 150 : 300;
  const pad = wide ? 48 : 44;
  const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", padding: wide ? "6px 16px" : "10px 20px", borderRadius: 16, fontWeight: 900, fontSize: wide ? 24 : 30 };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: C.green, transform: `translateY(${(enter - 1) * 40}px)` }}>
      <div style={{ position: "absolute", left: pad, right: pad, top: wide ? 34 : 62, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ ...pill, background: "#fff", color: C.green }}>{s.grade} · {s.exam} · {s.num}</span>
        <span style={{ ...pill, background: sub.color, color: C.ink, borderRadius: 999 }}>{sub.label}</span>
        {s.badge ? <span style={{ ...pill, background: C.coral, color: "#fff", borderRadius: 999 }}>{s.badge}</span> : null}
        <span style={{ ...pill, marginLeft: "auto", color: "#fff", border: "2.5px solid rgba(255,255,255,.7)", borderRadius: 999, fontWeight: 700 }}>{s.type}{s.points ? ` · ${s.points}` : ""}</span>
      </div>
      <div style={{ position: "absolute", left: wide ? pad : pad, right: pad, top: wide ? 96 : 212, display: "flex", alignItems: "center", width: wide ? 720 : undefined }}>
        {s.stepsLabel.map((label, i) => {
          const on = i === stage, done = i < stage;
          const pop = spring({ frame: frame - 6 * i - 4, fps, config: SPRING.beat, durationInFrames: 14 });
          return (
            <React.Fragment key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: on || done ? "#fff" : "rgba(255,255,255,.55)", fontWeight: 900, fontSize: wide ? 22 : 28, transform: `scale(${0.8 + 0.2 * pop})` }}>
                <i style={{ fontStyle: "normal", width: wide ? 36 : 44, height: wide ? 36 : 44, borderRadius: "50%", border: `3px solid ${on || done ? "#fff" : "rgba(255,255,255,.55)"}`, display: "grid", placeItems: "center", fontSize: wide ? 20 : 24, background: on ? "#fff" : done ? C.greenDark : "transparent", color: on ? C.green : "#fff", fontFamily: FONT.body }}>{done ? "✓" : i + 1}</i>
                {label}
              </div>
              {i < s.stepsLabel.length - 1 ? <div style={{ flex: 1, height: 4, margin: "0 14px", background: "rgba(255,255,255,.35)", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${interpolate(stage, [i, i + 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`, height: "100%", background: "#fff" }} /></div> : null}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: pad, top: wide ? 100 : 230, color: "rgba(255,255,255,.75)", fontWeight: 700, fontSize: wide ? 20 : 24, display: wide ? "block" : "none" }}>{s.brand ?? "에이솔"}</div>
    </div>
  );
};
