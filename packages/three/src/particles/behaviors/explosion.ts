import {
  getNumber,
  getRange,
  randomDirection,
  randomInRange,
} from "./shared";
import type {
  ParticleBehaviorDefinition,
  CreateParticleStateParams,
  SampleParticlePositionParams,
} from "./types";

const createExplosionState = ({ random, config }: CreateParticleStateParams) => {
  const spread = getNumber(config, "spread", 1);
  const velocity = getNumber(config, "velocity", 5);
  const lifetime = getRange(config, "lifetime", [1, 2]);

  const radialDirection = randomDirection(random);
  const spawnRadius = randomInRange(random, 0, spread);
  const launchDirection = randomDirection(random);

  return {
    position: [
      radialDirection[0] * spawnRadius,
      radialDirection[1] * spawnRadius,
      radialDirection[2] * spawnRadius,
    ] as [number, number, number],
    velocity: [
      launchDirection[0] * velocity,
      launchDirection[1] * velocity,
      launchDirection[2] * velocity,
    ] as [number, number, number],
    phase: randomInRange(random, 0, Math.PI * 2),
    life: randomInRange(random, lifetime[0], lifetime[1]),
    mass: randomInRange(random, 0.6, 1.8),
    orbitRadius: randomInRange(random, 0.1, Math.max(spread, 0.1)),
    attractBias: randomDirection(random),
  };
};

const sampleExplosionPosition = ({
  state,
  seconds,
  config,
}: SampleParticlePositionParams): [number, number, number] => {
  const gravity = getNumber(config, "gravity", -0.18);
  const lifetime = Math.max(0.1, state.life);
  const localTime = (seconds + state.phase * 0.2) % lifetime;

  return [
    state.position[0] + state.velocity[0] * localTime,
    state.position[1] + state.velocity[1] * localTime + 0.5 * gravity * localTime * localTime,
    state.position[2] + state.velocity[2] * localTime,
  ];
};

export const explosionBehavior: ParticleBehaviorDefinition = {
  type: "explosion",
  createState: createExplosionState,
  sample: sampleExplosionPosition,
};
