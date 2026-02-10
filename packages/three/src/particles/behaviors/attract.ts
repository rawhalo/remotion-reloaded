import {
  getNumber,
  getVector3,
  randomDirection,
  randomInRange,
} from "./shared";
import type {
  ParticleBehaviorDefinition,
  CreateParticleStateParams,
  SampleParticlePositionParams,
} from "./types";

const createAttractState = ({ random, config }: CreateParticleStateParams) => {
  const spread = getNumber(config, "spread", 6);
  const direction = randomDirection(random);
  const distance = randomInRange(random, spread * 0.25, spread);

  return {
    position: [
      direction[0] * distance,
      direction[1] * distance,
      direction[2] * distance,
    ] as [number, number, number],
    velocity: [
      randomInRange(random, -0.5, 0.5),
      randomInRange(random, -0.5, 0.5),
      randomInRange(random, -0.5, 0.5),
    ] as [number, number, number],
    phase: randomInRange(random, 0, Math.PI * 2),
    life: randomInRange(random, 1.5, 4),
    mass: randomInRange(random, 0.7, 1.6),
    orbitRadius: randomInRange(random, 0.1, 1.5),
    attractBias: randomDirection(random),
  };
};

const sampleAttractPosition = ({
  state,
  seconds,
  config,
}: SampleParticlePositionParams): [number, number, number] => {
  const target = getVector3(config, "target", [0, 0, 0]);
  const strength = Math.max(0.01, getNumber(config, "strength", 1.2));

  const decay = Math.exp((-strength * seconds) / Math.max(state.mass, 0.1));
  const oscillation = 0.35;

  return [
    target[0] + (state.position[0] - target[0]) * decay + Math.sin(seconds * 1.7 + state.phase) * oscillation,
    target[1] + (state.position[1] - target[1]) * decay + Math.cos(seconds * 1.2 + state.phase * 0.5) * oscillation,
    target[2] + (state.position[2] - target[2]) * decay + Math.sin(seconds * 0.9 + state.phase * 0.75) * oscillation,
  ];
};

export const attractBehavior: ParticleBehaviorDefinition = {
  type: "attract",
  createState: createAttractState,
  sample: sampleAttractPosition,
};
