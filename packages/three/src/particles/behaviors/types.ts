export type ParticleBehaviorType =
  | "flow-field"
  | "explosion"
  | "orbit"
  | "attract";

export type ParticleFallbackBehavior = ParticleBehaviorType | "simple";

export type ParticleBehaviorConfigValue =
  | number
  | [number, number]
  | [number, number, number]
  | undefined;

export type ParticleBehaviorConfig = Record<string, ParticleBehaviorConfigValue>;

export interface ParticleSeedState {
  position: [number, number, number];
  velocity: [number, number, number];
  phase: number;
  life: number;
  mass: number;
  orbitRadius: number;
  attractBias: [number, number, number];
}

export interface CreateParticleStateParams {
  random: () => number;
  index: number;
  count: number;
  config: ParticleBehaviorConfig;
}

export interface SampleParticlePositionParams {
  state: ParticleSeedState;
  seconds: number;
  index: number;
  count: number;
  config: ParticleBehaviorConfig;
}

export interface ParticleBehaviorDefinition {
  type: ParticleBehaviorType;
  createState: (params: CreateParticleStateParams) => ParticleSeedState;
  sample: (params: SampleParticlePositionParams) => [number, number, number];
}
