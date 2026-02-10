import {
  getNumber,
  getRange,
  randomDirection,
  randomInRange,
  normalizeVector,
} from "./shared";
import type {
  ParticleBehaviorDefinition,
  CreateParticleStateParams,
  SampleParticlePositionParams,
} from "./types";

const createFlowFieldState = ({
  random,
  config,
}: CreateParticleStateParams) => {
  const emitterRadius = getNumber(config, "emitterRadius", 5);
  const speed = getNumber(config, "speed", 1.6);
  const lifetime = getRange(config, "lifetime", [1, 3]);

  const radialDirection = randomDirection(random);
  const radius = randomInRange(random, 0, emitterRadius);
  const driftDirection = randomDirection(random);

  return {
    position: [
      radialDirection[0] * radius,
      radialDirection[1] * radius,
      radialDirection[2] * radius,
    ] as [number, number, number],
    velocity: [
      driftDirection[0] * speed,
      driftDirection[1] * speed,
      driftDirection[2] * speed,
    ] as [number, number, number],
    phase: randomInRange(random, 0, Math.PI * 2),
    life: randomInRange(random, lifetime[0], lifetime[1]),
    mass: randomInRange(random, 0.8, 1.4),
    orbitRadius: randomInRange(random, 0.2, emitterRadius),
    attractBias: randomDirection(random),
  };
};

const sampleFlowFieldPosition = ({
  state,
  seconds,
  config,
}: SampleParticlePositionParams): [number, number, number] => {
  const noiseScale = getNumber(config, "noiseScale", 0.35);
  const speed = getNumber(config, "speed", 1.6);
  const curl = getNumber(config, "curl", 0.8);

  const t = seconds * speed + state.phase;
  const nx = Math.sin(state.position[0] * noiseScale + t * 1.31);
  const ny = Math.cos(state.position[1] * noiseScale - t * 0.87);
  const nz = Math.sin(state.position[2] * noiseScale + t * 0.63);

  const curlVector = normalizeVector([
    ny - nz,
    nz - nx,
    nx - ny,
  ] as [number, number, number]);

  return [
    state.position[0] + state.velocity[0] * (seconds * 0.35) + curlVector[0] * curl * 1.8,
    state.position[1] + state.velocity[1] * (seconds * 0.35) + curlVector[1] * curl * 1.8,
    state.position[2] + state.velocity[2] * (seconds * 0.35) + curlVector[2] * curl * 1.8,
  ];
};

export const flowFieldBehavior: ParticleBehaviorDefinition = {
  type: "flow-field",
  createState: createFlowFieldState,
  sample: sampleFlowFieldPosition,
};
