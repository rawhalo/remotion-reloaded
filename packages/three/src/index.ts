export { ThreeCanvas } from "./canvas/ThreeCanvas";
export type { ThreeCanvasProps } from "./canvas/ThreeCanvas";
export {
  detectWebGpuSupport,
  hasWebGpuApi,
  resolveRenderer,
  type RendererResolution,
  type RendererResolutionReason,
  type ThreeRenderer,
} from "./canvas/rendererDetection";
export {
  resolveThreeQualityPreset,
  type ResolvedThreeQualityPreset,
  type ThreeQualityPreset,
  type ThreeQualityPresetName,
} from "./canvas/qualityPresets";
export {
  GPUParticles,
  MAX_PARTICLE_COUNT,
  DEFAULT_FALLBACK_COUNT,
  PARTICLE_SHADER_SOURCES,
  resolveParticleEngine,
} from "./particles/GPUParticles";
export type {
  GPUParticlesProps,
  GPUParticlesRenderer,
  ParticleRenderStrategy,
  ResolvedParticleEngine,
  ResolveParticleEngineOptions,
} from "./particles/GPUParticles";
export type {
  ParticleBehaviorType,
  ParticleFallbackBehavior,
  ParticleBehaviorConfig,
  ParticleSeedState,
} from "./particles/behaviors";
export {
  createParticleSeedStates,
  sampleParticlePosition,
} from "./particles/behaviors";
export {
  resolveFallbackBehavior,
  simulateCpuFallbackPositions,
} from "./particles/cpuFallback";

export {
  EffectComposer,
  Bloom,
  DepthOfField,
  ChromaticAberration,
  Vignette,
  Noise,
} from "./effects";
export type {
  EffectComposerProps,
  BloomProps,
  DepthOfFieldProps,
  ChromaticAberrationProps,
  VignetteProps,
  NoiseProps,
} from "./effects";
