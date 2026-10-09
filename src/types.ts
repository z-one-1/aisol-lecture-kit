export type Subject = "english" | "korean" | "math";
export type Pose = "smile" | "think" | "wow" | "wink";

export type Step = {
  stage: number;          // 0,1,2 … STEP 진행 표시 인덱스
  cat?: Pose;             // 고양이 표정
  say: string;            // 음성 대본(TTS)
  sub: string;            // 화면 자막(짧게)
  hl?: string[];          // 문제 텍스트에서 형광펜 칠할 구절
  note?: number;          // 체크할 단서 노트 인덱스
  work?: string;          // 풀이 보드에 추가할 줄($...$ 수식 가능)
  reveal?: boolean;       // 정답 공개 시점
};

export type Problem = {
  text?: string;          // 발문(수식은 $...$)
  given?: string;         // 주어진 문장(영어 삽입형)
  passage?: string;       // 지문({m1}~{m5} = 번호 자리)
  box?: string[];         // <보기> 줄
  choices?: string[];     // 선택지
};

export type Script = {
  id: string;
  subject: Subject;
  grade: string;
  exam: string;
  num: string;
  points?: string;
  type: string;
  badge?: string;
  problem: Problem;
  stepsLabel: string[];
  notes?: string[];
  steps: Step[];
  answer: string;
  formula?: { title: string; lines: string[] };
  brand?: string;         // 우상단 브랜드 문구(기본 "에이솔")
};

export type Timing = { steps: { start: number; dur: number }[]; total: number };

export type LectureProps = { script: Script; timing?: Timing | null };
