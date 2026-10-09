import React from "react";
import { Composition } from "remotion";
import { Lecture } from "./Lecture";
import type { LectureProps } from "./types";
import { estimateTiming } from "./timing";
import { fontsReady } from "./fonts";
import sample from "../problems/2709-h1-math-06.json";

const FPS = 30;
const meta = async ({ props }: { props: LectureProps }) => {
  await fontsReady;
  const t = props.timing ?? estimateTiming(props.script);
  return { durationInFrames: Math.ceil(t.total * FPS), props };
};
const defaultProps: LectureProps = { script: sample as LectureProps["script"], timing: null };

export const Root: React.FC = () => (
  <>
    <Composition id="Lecture" component={Lecture} fps={FPS} width={1080} height={1920} durationInFrames={900} defaultProps={defaultProps} calculateMetadata={meta} />
    <Composition id="LectureWide" component={Lecture} fps={FPS} width={1920} height={1080} durationInFrames={900} defaultProps={defaultProps} calculateMetadata={meta} />
  </>
);
