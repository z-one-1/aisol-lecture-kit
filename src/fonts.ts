import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 모든 글꼴을 로컬 파일로 싣는다(네트워크 요청 0): 본문 Pretendard(OFL), 제목 Black Han Sans(OFL), 라벨 Jua(OFL)
const fonts: [string, string, number][] = [
  ["Pretendard", "Pretendard-Medium.woff2", 500], ["Pretendard", "Pretendard-Bold.woff2", 700], ["Pretendard", "Pretendard-Black.woff2", 900],
  ["Black Han Sans", "BlackHanSans-Regular.ttf", 400], ["Jua", "Jua-Regular.ttf", 400],
];
export const fontsReady = Promise.all(fonts.map(([family, file, weight]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight: String(weight) })));
