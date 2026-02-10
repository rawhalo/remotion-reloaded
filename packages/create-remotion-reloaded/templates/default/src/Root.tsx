import { Composition } from "remotion";
import { HelloReloaded } from "./compositions/HelloReloaded";
import { LogoReveal } from "./compositions/LogoReveal";
import { ParticleDemo } from "./compositions/ParticleDemo";

export const Root = () => {
  return (
    <>
      <Composition
        id="HelloReloaded"
        component={HelloReloaded}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LogoReveal"
        component={LogoReveal}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ParticleDemo"
        component={ParticleDemo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
