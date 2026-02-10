import {
  getNumber,
  randomDirection,
  randomInRange,
} from "./shared";
import type {
  ParticleBehaviorDefinition,
  CreateParticleStateParams,
  SampleParticlePositionParams,
} from "./types";

const createOrbitState = ({ random, config }: CreateParticleStateParams) => {
  const baseRadius = getNumber(config, "radius", 3);
  const jitter = getNumber(config, "jitter", 0.5);
  const direction = randomDirection(random);

  return {
    position: [
      direction[0] * jitter,
      direction[1] * jitter,
      direction[2] * jitter,
    ] as [number, number, number],
    velocity: [
      randomInRange(random, -0.15, 0.15),
      randomInRange(random, -0.05, 0.05),
      randomInRange(random, -0.15, 0.15),
    ] as [number, number, number],
    phase: randomInRange(random, 0, Math.PI * 2),
    life: randomInRange(random, 2, 5),
    mass: randomInRange(random, 0.9, 1.2),
    orbitRadius: randomInRange(random, baseRadius * 0.7, baseRadius * 1.3),
    attractBias: randomDirection(random),
  };
};

const sampleOrbitPosition = ({
  state,
  seconds,
  config,
}: SampleParticlePositionParams): [number, number, number] => {
  const speed = getNumber(config, "speed", 0.6);
  const radius = Math.max(0.1, state.orbitRadius);
  const wobble = getNumber(config, "wobble", 0.35);

  const angle = state.phase + seconds * speed;
  const wobblePhase = angle * 2 + state.phase;

  return [
    Math.cos(angle) * radius + state.position[0],
    Math.sin(wobblePhase) * radius * wobble + state.position[1],
    Math.sin(angle) * radius + state.position[2],
  ];
};

export const orbitBehavior: ParticleBehaviorDefinition = {
  type: "orbit",
  createState: createOrbitState,
  sample: sampleOrbitPosition,
};
