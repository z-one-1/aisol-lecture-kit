// 에이솔 브랜드 토큰 — 초록 무대 + 크림 종이 + 잉크. 과목 보조색: 국어 코랄 · 영어 블루 · 수학 옐로.
export const C = {
  green: "#0c7a62", greenDark: "#085a48", cream: "#fff8ec", ink: "#1b2340",
  coral: "#ff5d73", mint: "#bdeedb", peach: "#ffd9a8", blue: "#4ea8ff", yellow: "#ffc93c",
  paper: "#ffffff", muted: "#9aa0b4", line: "#d7dbe6",
};
export const SUBJECT = {
  english: { label: "영어", color: C.blue },
  korean: { label: "국어", color: C.coral },
  math: { label: "수학", color: C.yellow },
} as const;
// 스프링 토큰(10/9 모션 노트): 등장=enter, 패널=panel, 강조=accent, 비트=beat
export const SPRING = {
  enter: { damping: 20, stiffness: 200 },
  panel: { damping: 200 },
  accent: { damping: 8 },
  beat: { damping: 14, stiffness: 220 },
};
export const FONT = { body: "Pretendard, sans-serif", head: "'Black Han Sans', Pretendard, sans-serif", soft: "Jua, Pretendard, sans-serif", serif: "'Times New Roman', serif" };
