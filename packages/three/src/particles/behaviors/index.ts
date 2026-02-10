import { attractBehavior } from "./attract";
import { explosionBehavior } from "./explosion";
import { flowFieldBehavior } from "./flowField";
import { orbitBehavior } from "./orbit";
import { createSeededRandom } from "./shared";
import type {
  ParticleBehaviorConfig,
  ParticleBehaviorDefinition,
  ParticleBehaviorType,
  ParticleFallbackBehavior,
  ParticleSeedState,
} from "./types";

export type {
  ParticleBehaviorConfig,
  ParticleBehaviorType,
  ParticleFallbackBehavior,
  ParticleSeedState,
} from "./types";

export const PARTICLE_BEHAVIORS: Record<ParticleBehaviorType, ParticleBehaviorDefinition> = {
  "flow-field": flowFieldBehavior,
  explosion: explosionBehavior,
  orbit: orbitBehavior,
  attract: attractBehavior,
};

export interface CreateParticleSeedStatesOptions {
  count: number;
  behavior: ParticleBehaviorType;
  seed: number;
  config?: ParticleBehaviorConfig;
}

export interface SampleParticlePositionOptions {
  behavior: ParticleBehaviorType;
  state: ParticleSeedState;
  seconds: number;
  index: number;
  count: number;
  config?: ParticleBehaviorConfig;
}

export const getParticleBehavior = (
  behavior: ParticleBehaviorType,
): ParticleBehaviorDefinition => PARTICLE_BEHAVIORS[behavior];

export const createParticleSeedStates = ({
  count,
  behavior,
  seed,
  config = {},
}: CreateParticleSeedStatesOptions): ParticleSeedState[] => {
  const definition = getParticleBehavior(behavior);
  const random = createSeededRandom(seed);

  const states: ParticleSeedState[] = [];
  for (let index = 0; index < count; index += 1) {
    states.push(
      definition.createState({
        random,
        index,
        count,
        config,
      }),
    );
  }

  return states;
};

export const sampleParticlePosition = ({
  behavior,
  state,
  seconds,
  index,
  count,
  config = {},
}: SampleParticlePositionOptions): [number, number, number] => {
  const definition = getParticleBehavior(behavior);
  return definition.sample({
    state,
    seconds,
    index,
    count,
    config,
  });
};
