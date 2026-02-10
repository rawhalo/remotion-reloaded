import {
  sampleParticlePosition,
  type ParticleBehaviorConfig,
  type ParticleBehaviorType,
  type ParticleFallbackBehavior,
  type ParticleSeedState,
} from "./behaviors";

export interface SimulateCpuFallbackOptions {
  behavior: ParticleBehaviorType;
  fallbackBehavior?: ParticleFallbackBehavior;
  states: readonly ParticleSeedState[];
  frame: number;
  fps: number;
  config?: ParticleBehaviorConfig;
  target?: Float32Array;
}

const resolveSeconds = (frame: number, fps: number): number => {
  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 30;
  return frame / safeFps;
};

export const resolveFallbackBehavior = (
  behavior: ParticleBehaviorType,
  fallbackBehavior: ParticleFallbackBehavior | undefined,
): ParticleFallbackBehavior => fallbackBehavior ?? behavior;

const sampleSimpleFallbackPosition = (
  state: ParticleSeedState,
  seconds: number,
): [number, number, number] => {
  const drift = seconds * 0.5;

  return [
    state.position[0] + state.velocity[0] * drift,
    state.position[1] + state.velocity[1] * drift - 0.12 * seconds * seconds,
    state.position[2] + state.velocity[2] * drift,
  ];
};

export const simulateCpuFallbackPositions = ({
  behavior,
  fallbackBehavior,
  states,
  frame,
  fps,
  config = {},
  target,
}: SimulateCpuFallbackOptions): Float32Array => {
  const resolvedBehavior = resolveFallbackBehavior(behavior, fallbackBehavior);
  const seconds = resolveSeconds(frame, fps);
  const positions =
    target && target.length === states.length * 3
      ? target
      : new Float32Array(states.length * 3);

  for (let index = 0; index < states.length; index += 1) {
    const state = states[index];
    const next =
      resolvedBehavior === "simple"
        ? sampleSimpleFallbackPosition(state, seconds)
        : sampleParticlePosition({
            behavior: resolvedBehavior,
            state,
            seconds,
            index,
            count: states.length,
            config,
          });

    const offset = index * 3;
    positions[offset] = next[0];
    positions[offset + 1] = next[1];
    positions[offset + 2] = next[2];
  }

  return positions;
};
