import React from "react";
import type { Pose } from "./types";
// 에이솔 고양이(오렌지 줄무늬·검은 안경·초록 나비넥타이). 표정만 바뀌고 생김새는 고정.
const INK = "#1b2340", ORANGE = "#ef8a2e", PINK = "#ff9eb5";
function body(pose: Pose) {
  const eye = (cx: number, cy: number) => `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="15" fill="${INK}"/><circle cx="${cx + 4}" cy="${cy - 6}" r="5" fill="#fff"/><circle cx="${cx - 4}" cy="${cy + 6}" r="2.5" fill="#fff"/>`;
  const eyes = pose === "wink" ? `${eye(76, 108)}<path d="M112 108 q12 -12 24 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : pose === "think" ? `<path d="M64 110 q12 -10 24 0 M112 110 q12 -10 24 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : pose === "wow" ? `<circle cx="76" cy="108" r="14" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="76" cy="108" r="6" fill="${INK}"/><circle cx="124" cy="108" r="14" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="124" cy="108" r="6" fill="${INK}"/>`
    : `${eye(76, 108)}${eye(124, 108)}`;
  const mouth = pose === "wow" ? `<ellipse cx="100" cy="140" rx="6" ry="7" fill="${INK}"/>`
    : pose === "think" ? `<path d="M93 139 q7 -3 14 0" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : `<path d="M88 134 q6 7 12 0 q6 7 12 0" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<path d="M40 74 Q36 22 58 20 Q72 22 92 50 Z" fill="#ffe9d1" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round"/><path d="M52 62 Q52 36 62 34 Q70 38 80 52 Z" fill="${PINK}"/><path d="M160 74 Q164 22 142 20 Q128 22 108 50 Z" fill="#ffe9d1" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round"/><path d="M148 62 Q148 36 138 34 Q130 38 120 52 Z" fill="${PINK}"/><path d="M18 112 Q16 44 100 42 Q184 44 182 112 Q182 162 100 164 Q18 162 18 112 Z" fill="#fff6ea" stroke="${ORANGE}" stroke-width="6"/><g stroke="${ORANGE}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M100 48 v13 M88 50 l2 10 M112 50 l-2 10"/><path d="M24 104 h12 M24 116 h12 M176 104 h-12 M176 116 h-12"/></g><ellipse cx="52" cy="132" rx="14" ry="9" fill="${PINK}" opacity=".75"/><ellipse cx="148" cy="132" rx="14" ry="9" fill="${PINK}" opacity=".75"/><g fill="none" stroke="${INK}" stroke-width="5"><circle cx="76" cy="108" r="24"/><circle cx="124" cy="108" r="24"/><path d="M98 104 h4"/></g>${eyes}<path d="M95 125 h10 l-5 6 z" fill="${PINK}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>${mouth}<g stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".7"><path d="M62 138 h-20 M62 144 l-18 5 M138 138 h20 M138 144 l18 5"/></g><path d="M100 174 L80 164 L80 186 Z M100 174 L120 164 L120 186 Z" fill="#3aa36b" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="100" cy="175" r="6" fill="#3aa36b" stroke="${INK}" stroke-width="3.5"/>`;
}
export const Cat: React.FC<{ pose?: Pose; size?: number; style?: React.CSSProperties }> = ({ pose = "smile", size = 200, style }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} style={style} dangerouslySetInnerHTML={{ __html: body(pose) }} />
);
