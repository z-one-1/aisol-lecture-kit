import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import type { LectureProps, Script, Timing } from "./types";
import { C, SPRING, SUBJECT, FONT } from "./theme";
import { estimateTiming } from "./timing";
import { Header } from "./scenes/Header";
import { ProblemCard } from "./scenes/ProblemCard";
import { Notes } from "./scenes/Notes";
import { WorkBoard } from "./scenes/WorkBoard";
import { Teacher } from "./scenes/Teacher";
import { Formula } from "./scenes/Formula";

export type View = {
  script: Script; timing: Timing; frame: number; fps: number; wide: boolean;
  cur: number; stage: number; hl: Record<string, number>; notesOn: Record<number, number>;
  work: { text: string; f: number }[]; revealF: number | null; formulaF: number | null; accent: string;
};

export const Lecture: React.FC<LectureProps> = ({ script, timing }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const wide = width > height;
  const T = timing ?? estimateTiming(script);
  const sf = (i: number) => Math.round(T.steps[i].start * fps);
  let cur = 0;
  for (let i = 0; i < script.steps.length; i++) if (frame >= sf(i)) cur = i;
  const hl: Record<string, number> = {}; const notesOn: Record<number, number> = {}; const work: View["work"] = [];
  let revealF: number | null = null;
  script.steps.forEach((s, i) => {
    if (i > cur) return;
    const f = sf(i);
    (s.hl ?? []).forEach((k) => { hl[k] = spring({ frame: frame - f, fps, config: SPRING.panel, durationInFrames: 16 }); });
    if (s.note !== undefined) notesOn[s.note] = f + 6;
    if (s.work) work.push({ text: s.work, f: f + 4 });
    if (s.reveal && revealF === null) revealF = f + Math.round(fps * 0.9);
  });
  const last = script.steps.length - 1;
  if (revealF === null && cur === last) revealF = sf(last) + Math.round(fps * 0.6);
  const formulaF = script.formula ? sf(last) + 2 : null;
  const v: View = { script, timing: T, frame, fps, wide, cur, stage: script.steps[cur].stage, hl, notesOn, work, revealF, formulaF, accent: SUBJECT[script.subject].color };

  // 무대: 크림 종이 + 느리게 흐르는 점 패턴 + 아주 약한 푸시인(정지 프레임 방지)
  const total = Math.round(T.total * fps);
  const push = interpolate(frame, [0, total], [1, 1.025], { easing: Easing.inOut(Easing.sin), extrapolateRight: "clamp" });
  const drift = (frame / fps) * 6;
  const pad = wide ? 48 : 44;
  const pr = script.problem;
  const tall = !!(pr.box || pr.passage || pr.choices?.some((c) => c.length > 4));
  return (
    <AbsoluteFill style={{ background: C.cream, fontFamily: FONT.body, color: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.peach} 2.2px, transparent 2.6px)`, backgroundSize: "54px 54px", backgroundPosition: `${drift}px ${drift * 0.6}px`, opacity: 0.55 }} />
      {timing ? script.steps.map((_, i) => (
        <Sequence key={i} from={sf(i)} durationInFrames={Math.max(1, Math.round(T.steps[i].dur * fps) + 2)}>
          <Audio src={staticFile(`voice/${script.id}/s${i + 1}.mp3`)} />
        </Sequence>
      )) : null}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
        <Header v={v} />
        {wide ? (
          <div style={{ position: "absolute", left: pad, right: pad, top: 170, bottom: 250, display: "grid", gridTemplateColumns: "1080px 1fr", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}><ProblemCard v={v} />{tall ? null : <WorkBoard v={v} />}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}><Notes v={v} />{tall ? <WorkBoard v={v} /> : null}</div>
          </div>
        ) : (
          <div style={{ position: "absolute", left: pad, right: pad, top: 340, bottom: 600, display: "flex", flexDirection: "column", gap: 22 }}>
            <ProblemCard v={v} /><WorkBoard v={v} /><Notes v={v} />
          </div>
        )}
        <Formula v={v} />
        <Teacher v={v} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: pad, bottom: wide ? 22 : 300, color: C.muted, fontSize: wide ? 20 : 22, fontWeight: 700 }}>
        AI 음성(본인 목소리 복제) · {script.brand ?? "에이솔"}
      </div>
    </AbsoluteFill>
  );
};
