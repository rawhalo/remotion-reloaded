import { Composition } from "remotion";
import { GSAPSeekTest } from "./compositions/gsap/GSAPSeekTest";
import { GSAPDelayRenderTest } from "./compositions/gsap/GSAPDelayRenderTest";
import { GSAPTargetLifecycleTest } from "./compositions/gsap/GSAPTargetLifecycleTest";
import { CSSFilterTest } from "./compositions/effects/CSSFilterTest";
import { SVGFilterTest } from "./compositions/effects/SVGFilterTest";
import { WebGLProbe } from "./compositions/webgl/WebGLProbe";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Spike 0.1: GSAP Determinism */}
      <Composition
        id="GSAPSeekTest"
        component={GSAPSeekTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GSAPDelayRenderTest"
        component={GSAPDelayRenderTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GSAPTargetLifecycleTest"
        component={GSAPTargetLifecycleTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Spike 0.2: CSS/SVG Filter Coverage */}
      <Composition
        id="CSSFilterTest"
        component={CSSFilterTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SVGFilterTest"
        component={SVGFilterTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Spike 0.3: WebGL/WebGPU Probe */}
      <Composition
        id="WebGLProbe"
        component={WebGLProbe}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
