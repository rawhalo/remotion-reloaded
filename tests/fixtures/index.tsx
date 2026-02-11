import React from "react";
import { Composition, registerRoot } from "remotion";
import { AnimatedEffects } from "./compositions/AnimatedEffects";
import { CombinedShowcase } from "./compositions/CombinedShowcase";
import {
  EffectsShowcase,
  type EffectsShowcaseProps,
} from "./compositions/EffectsShowcase";
import { GsapFrameAccuracy } from "./compositions/GsapFrameAccuracy";
import {
  ParticleShowcase,
  type ParticleShowcaseProps,
} from "./compositions/ParticleShowcase";
import {
  ThreeRenderShowcase,
  type ThreeRenderShowcaseProps,
} from "./compositions/ThreeRenderShowcase";

const FPS = 30;
const SIZE = 256;

const RemotionTestRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GSAPFrameAccuracy"
        component={GsapFrameAccuracy}
        durationInFrames={90}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
      <Composition<EffectsShowcaseProps>
        id="EffectsShowcase"
        component={EffectsShowcase}
        defaultProps={{ effectType: "blur", seed: 42 }}
        durationInFrames={1}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
      <Composition
        id="AnimatedEffects"
        component={AnimatedEffects}
        durationInFrames={90}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
      <Composition
        id="CombinedShowcase"
        component={CombinedShowcase}
        durationInFrames={90}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
      <Composition<ThreeRenderShowcaseProps>
        id="ThreeRenderShowcase"
        component={ThreeRenderShowcase}
        defaultProps={{ renderer: "webgl" }}
        durationInFrames={90}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
      <Composition<ParticleShowcaseProps>
        id="ParticleShowcase"
        component={ParticleShowcase}
        defaultProps={{
          behavior: "orbit",
          count: 2400,
          renderer: "auto",
          seed: 42,
        }}
        durationInFrames={90}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
    </>
  );
};

registerRoot(RemotionTestRoot);
