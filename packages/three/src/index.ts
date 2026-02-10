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
export { GPUParticles } from "./GPUParticles";
export type { GPUParticlesProps } from "./GPUParticles";
