import React from "react";
import { spring } from "remotion";
import type { View } from "../Lecture";
import { C, SPRING } from "../theme";
import { Cat } from "../Cat";

// 고양이 선생님 + 말풍선(자막). 단계가 바뀔 때마다 말풍선이 새로 튀어나온다.
export const Teacher: React.FC<{ v: View }> = ({ v }) => {
  const { script: s, frame, fps, wide, cur, timing } = v;
  const step = s.steps[cur];
  const f0 = Math.round(timing.steps[cur].start * fps);
  const pop = spring({ frame: frame - f0, fps, config: SPRING.enter, durationInFrames: 14 });
  const breathe = 1 + 0.015 * Math.sin((frame / fps) * 2 * Math.PI * 0.6);
  const nod = 3 * Math.sin((frame / fps) * 2 * Math.PI * 0.35);
  const size = wide ? 170 : 200;
  const left = wide ? 48 : 30, top = wide ? 1080 - 230 : 1350;
  return (
    <>
      <div style={{ position: "absolute", left, top, width: size, height: size, transform: `scaleY(${breathe}) rotate(${nod}deg)`, transformOrigin: "50% 100%" }}>
        <Cat pose={step.cat ?? "smile"} size={size} />
      </div>
      <div style={{ position: "absolute", left: left + size + 24, right: wide ? 48 : 40, top: top + (wide ? 10 : 0), background: C.ink, color: "#fff", borderRadius: 28, padding: wide ? "18px 26px" : "22px 28px", fontWeight: 900, fontSize: wide ? 34 : 38, lineHeight: 1.38, wordBreak: "keep-all", opacity: pop, transform: `scale(${0.9 + 0.1 * pop})`, transformOrigin: "0% 50%" }}>
        <span style={{ position: "absolute", left: -18, top: 44, border: "14px solid transparent", borderRight: `20px solid ${C.ink}`, borderLeft: 0 }} />
        {step.sub}
      </div>
    </>
  );
};
