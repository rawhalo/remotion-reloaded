import { getRenderEnvironment, type RenderEnvironment } from "@remotion-reloaded/config";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
  ShaderMaterial,
} from "three";
import { hasWebGpuApi } from "../canvas/rendererDetection";
import {
  createParticleSeedStates,
  type ParticleBehaviorConfig,
  type ParticleBehaviorType,
  type ParticleFallbackBehavior,
  type ParticleSeedState,
} from "./behaviors";
import { clamp, getNumber, randomInRange, createSeededRandom } from "./behaviors/shared";
import { resolveFallbackBehavior, simulateCpuFallbackPositions } from "./cpuFallback";
import particleComputeShaderWgsl from "./shaders/particle.compute.wgsl";
import particleFragmentShaderGlsl from "./shaders/particle.frag.glsl";
import particleVertexShaderGlsl from "./shaders/particle.vert.glsl";

const PREFIX = "[remotion-reloaded]";
const EMPTY_CONFIG: ParticleBehaviorConfig = {};

export const MAX_PARTICLE_COUNT = 100_000;
export const DEFAULT_FALLBACK_COUNT = 500;

export type GPUParticlesRenderer = "auto" | "webgl" | "webgpu";

export type ParticleRenderStrategy = "webgpu-compute" | "webgl-vertex" | "cpu";

const BEHAVIOR_TO_INDEX: Record<ParticleBehaviorType, number> = {
  "flow-field": 0,
  explosion: 1,
  orbit: 2,
  attract: 3,
};

export const PARTICLE_SHADER_SOURCES = {
  computeWgsl: particleComputeShaderWgsl,
  vertexGlsl: particleVertexShaderGlsl,
  fragmentGlsl: particleFragmentShaderGlsl,
};

export interface GPUParticlesProps {
  count: number;
  behavior?: ParticleBehaviorType;
  config?: ParticleBehaviorConfig;
  seed?: number;
  color?: string | readonly string[];
  size?: number | [number, number];
  opacity?: number;
  renderer?: GPUParticlesRenderer;
  fallbackCount?: number;
  fallbackBehavior?: ParticleFallbackBehavior;
  maxCount?: number;
  environment?: RenderEnvironment;
  onEngineResolved?: (resolution: ResolvedParticleEngine) => void;
}

export interface ResolvedParticleEngine {
  environment: RenderEnvironment;
  requestedRenderer: GPUParticlesRenderer;
  strategy: ParticleRenderStrategy;
  resolvedRenderer: "webgpu" | "webgl" | "cpu";
  requestedCount: number;
  clampedCount: number;
  fallbackCount: number;
  count: number;
  behavior: ParticleBehaviorType;
  fallbackBehavior: ParticleFallbackBehavior;
  effectiveBehavior: ParticleBehaviorType | "simple";
}

export interface ResolveParticleEngineOptions {
  count: number;
  behavior?: ParticleBehaviorType;
  fallbackCount?: number;
  fallbackBehavior?: ParticleFallbackBehavior;
  renderer?: GPUParticlesRenderer;
  maxCount?: number;
  environment?: RenderEnvironment;
  webGpuApiAvailable?: boolean;
}

const normalizeInteger = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
};

const normalizeSeed = (seed: number): number => {
  const int = normalizeInteger(seed, 1);
  return int === 0 ? 1 : int;
};

const normalizeOpacity = (opacity: number): number => {
  if (!Number.isFinite(opacity)) {
    return 1;
  }

  return clamp(opacity, 0, 1);
};

const normalizeSizeRange = (size: number | [number, number]): [number, number] => {
  if (Array.isArray(size)) {
    if (size.length !== 2) {
      return [4, 4];
    }

    const min = Number.isFinite(size[0]) ? Math.max(0, size[0]) : 4;
    const max = Number.isFinite(size[1]) ? Math.max(0, size[1]) : min;
    return min <= max ? [min, max] : [max, min];
  }

  if (!Number.isFinite(size)) {
    return [4, 4];
  }

  const safe = Math.max(0, size);
  return [safe, safe];
};

const normalizePalette = (input: string | readonly string[] | undefined): Color[] => {
  const rawColors =
    input === undefined
      ? ["#ffffff"]
      : typeof input === "string"
        ? [input]
        : input.length > 0
          ? [...input]
          : ["#ffffff"];

  const palette = rawColors
    .map((value) => {
      try {
        return new Color(value);
      } catch {
        return null;
      }
    })
    .filter((entry): entry is Color => entry !== null);

  return palette.length > 0 ? palette : [new Color("#ffffff")];
};

const samplePaletteColor = (palette: readonly Color[], t: number): Color => {
  if (palette.length === 1) {
    return palette[0].clone();
  }

  const clamped = clamp(t, 0, 1);
  const segmentCount = palette.length - 1;
  const scaled = clamped * segmentCount;
  const segment = Math.min(segmentCount - 1, Math.floor(scaled));
  const localAlpha = scaled - segment;

  return palette[segment].clone().lerp(palette[segment + 1], localAlpha);
};

interface ParticleBuffers {
  positions: Float32Array;
  velocities: Float32Array;
  meta: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

const buildParticleBuffers = (
  states: readonly ParticleSeedState[],
  palette: readonly Color[],
  sizeRange: [number, number],
  seed: number,
): ParticleBuffers => {
  const positions = new Float32Array(states.length * 3);
  const velocities = new Float32Array(states.length * 3);
  const meta = new Float32Array(states.length * 4);
  const colors = new Float32Array(states.length * 3);
  const sizes = new Float32Array(states.length);

  const random = createSeededRandom(seed + 97);

  for (let index = 0; index < states.length; index += 1) {
    const state = states[index];
    const positionOffset = index * 3;
    const metaOffset = index * 4;

    positions[positionOffset] = state.position[0];
    positions[positionOffset + 1] = state.position[1];
    positions[positionOffset + 2] = state.position[2];

    velocities[positionOffset] = state.velocity[0];
    velocities[positionOffset + 1] = state.velocity[1];
    velocities[positionOffset + 2] = state.velocity[2];

    meta[metaOffset] = state.phase;
    meta[metaOffset + 1] = state.life;
    meta[metaOffset + 2] = state.mass;
    meta[metaOffset + 3] = state.orbitRadius;

    const color = samplePaletteColor(palette, random());
    colors[positionOffset] = color.r;
    colors[positionOffset + 1] = color.g;
    colors[positionOffset + 2] = color.b;

    sizes[index] = randomInRange(random, sizeRange[0], sizeRange[1]);
  }

  return {
    positions,
    velocities,
    meta,
    colors,
    sizes,
  };
};

const createGeometry = (buffers: ParticleBuffers): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(buffers.positions, 3));
  geometry.setAttribute("color", new BufferAttribute(buffers.colors, 3));
  geometry.setAttribute("aVelocity", new BufferAttribute(buffers.velocities, 3));
  geometry.setAttribute("aMeta", new BufferAttribute(buffers.meta, 4));
  geometry.setAttribute("aSize", new BufferAttribute(buffers.sizes, 1));
  return geometry;
};

const createCpuMaterial = (
  sizeRange: [number, number],
  opacity: number,
): PointsMaterial =>
  new PointsMaterial({
    size: sizeRange[1],
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    vertexColors: true,
    blending: AdditiveBlending,
  });

interface ShaderMaterialParams {
  fps: number;
  opacity: number;
  behaviorIndex: number;
  speed: number;
  gravity: number;
  strength: number;
  curl: number;
  noiseScale: number;
  radius: number;
  isWebGpuCompute: boolean;
}

const createVertexShaderMaterial = ({
  fps,
  opacity,
  behaviorIndex,
  speed,
  gravity,
  strength,
  curl,
  noiseScale,
  radius,
  isWebGpuCompute,
}: ShaderMaterialParams): ShaderMaterial =>
  new ShaderMaterial({
    vertexShader: particleVertexShaderGlsl,
    fragmentShader: particleFragmentShaderGlsl,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: AdditiveBlending,
    uniforms: {
      uFrame: { value: 0 },
      uFps: { value: fps },
      uBehavior: { value: behaviorIndex },
      uSpeed: { value: speed },
      uGravity: { value: gravity },
      uStrength: { value: strength },
      uCurl: { value: curl },
      uNoiseScale: { value: noiseScale },
      uRadius: { value: radius },
      uOpacity: { value: opacity },
      uComputeHint: { value: isWebGpuCompute ? 1 : 0 },
    },
  });

const getResolvedRenderer = (strategy: ParticleRenderStrategy): "webgpu" | "webgl" | "cpu" => {
  if (strategy === "webgpu-compute") {
    return "webgpu";
  }

  if (strategy === "webgl-vertex") {
    return "webgl";
  }

  return "cpu";
};

export const resolveParticleEngine = ({
  count,
  behavior = "flow-field",
  fallbackCount,
  fallbackBehavior = "simple",
  renderer = "auto",
  maxCount = MAX_PARTICLE_COUNT,
  environment = getRenderEnvironment(),
  webGpuApiAvailable = hasWebGpuApi(),
}: ResolveParticleEngineOptions): ResolvedParticleEngine => {
  const requestedCount = normalizeInteger(count, 0);
  const clampedCount = Math.min(requestedCount, Math.max(1, maxCount));

  const fallbackRequested =
    fallbackCount === undefined
      ? Math.min(DEFAULT_FALLBACK_COUNT, clampedCount)
      : normalizeInteger(fallbackCount, 0);

  const resolvedFallbackCount = Math.min(
    clampedCount,
    Math.min(fallbackRequested, Math.max(1, maxCount)),
  );

  const resolvedFallbackBehavior = resolveFallbackBehavior(behavior, fallbackBehavior);

  const shouldUseWebGpu =
    renderer === "webgpu"
      ? webGpuApiAvailable
      : renderer === "auto"
        ? webGpuApiAvailable
        : false;

  const strategy: ParticleRenderStrategy =
    environment === "lambda"
      ? "cpu"
      : shouldUseWebGpu
        ? "webgpu-compute"
        : "webgl-vertex";

  const countForStrategy = strategy === "cpu" ? resolvedFallbackCount : clampedCount;
  const effectiveBehavior =
    strategy === "cpu" ? resolvedFallbackBehavior : behavior;

  return {
    environment,
    requestedRenderer: renderer,
    strategy,
    resolvedRenderer: getResolvedRenderer(strategy),
    requestedCount,
    clampedCount,
    fallbackCount: resolvedFallbackCount,
    count: countForStrategy,
    behavior,
    fallbackBehavior: resolvedFallbackBehavior,
    effectiveBehavior,
  };
};

export const GPUParticles = ({
  count,
  behavior = "flow-field",
  config = EMPTY_CONFIG,
  seed = 42,
  color = "#ffffff",
  size = 4,
  opacity = 1,
  renderer = "auto",
  fallbackCount,
  fallbackBehavior = "simple",
  maxCount = MAX_PARTICLE_COUNT,
  environment,
  onEngineResolved,
}: GPUParticlesProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clampWarningRef = useRef<string | null>(null);
  const webGpuApiAvailable = useMemo(() => hasWebGpuApi(), []);

  const resolvedEngine = useMemo(
    () =>
      resolveParticleEngine({
        count,
        behavior,
        fallbackCount,
        fallbackBehavior,
        renderer,
        maxCount,
        environment,
        webGpuApiAvailable,
      }),
    [
      behavior,
      count,
      environment,
      fallbackBehavior,
      fallbackCount,
      maxCount,
      renderer,
      webGpuApiAvailable,
    ],
  );

  useEffect(() => {
    if (resolvedEngine.requestedCount <= resolvedEngine.clampedCount) {
      return;
    }

    const warningKey = `${resolvedEngine.requestedCount}:${resolvedEngine.clampedCount}`;
    if (clampWarningRef.current === warningKey) {
      return;
    }

    clampWarningRef.current = warningKey;

    console.warn(
      `${PREFIX} GPUParticles count ${resolvedEngine.requestedCount} exceeds safe maximum.\n` +
        `Clamped to ${resolvedEngine.clampedCount} particles. For more particles, consider:\n` +
        "- Multiple GPUParticles instances\n" +
        "- Reducing particle lifetime\n" +
        "- Using instanced rendering for static particles",
    );
  }, [resolvedEngine.clampedCount, resolvedEngine.requestedCount]);

  useEffect(() => {
    onEngineResolved?.(resolvedEngine);
  }, [onEngineResolved, resolvedEngine]);

  const normalizedSeedValue = useMemo(() => normalizeSeed(seed), [seed]);
  const normalizedOpacityValue = useMemo(() => normalizeOpacity(opacity), [opacity]);
  const sizeRange = useMemo(() => normalizeSizeRange(size), [size]);
  const palette = useMemo(() => normalizePalette(color), [color]);

  const stateBehavior: ParticleBehaviorType =
    resolvedEngine.effectiveBehavior === "simple"
      ? resolvedEngine.behavior
      : resolvedEngine.effectiveBehavior;

  const states = useMemo(
    () =>
      createParticleSeedStates({
        count: resolvedEngine.count,
        behavior: stateBehavior,
        seed: normalizedSeedValue,
        config,
      }),
    [config, normalizedSeedValue, resolvedEngine.count, stateBehavior],
  );

  const buffers = useMemo(
    () => buildParticleBuffers(states, palette, sizeRange, normalizedSeedValue),
    [normalizedSeedValue, palette, sizeRange, states],
  );

  const geometry = useMemo(() => createGeometry(buffers), [buffers]);

  const behaviorIndex: number =
    resolvedEngine.effectiveBehavior === "simple"
      ? BEHAVIOR_TO_INDEX[resolvedEngine.behavior]
      : BEHAVIOR_TO_INDEX[resolvedEngine.effectiveBehavior];

  const shaderParams = useMemo(
    () => ({
      speed: getNumber(config, "speed", 1.6),
      gravity: getNumber(config, "gravity", -0.18),
      strength: getNumber(config, "strength", 1.2),
      curl: getNumber(config, "curl", 0.8),
      noiseScale: getNumber(config, "noiseScale", 0.35),
      radius: getNumber(config, "radius", 3),
    }),
    [config],
  );

  const material = useMemo(() => {
    if (resolvedEngine.strategy === "cpu") {
      return createCpuMaterial(sizeRange, normalizedOpacityValue);
    }

    return createVertexShaderMaterial({
      fps,
      opacity: normalizedOpacityValue,
      behaviorIndex,
      speed: shaderParams.speed,
      gravity: shaderParams.gravity,
      strength: shaderParams.strength,
      curl: shaderParams.curl,
      noiseScale: shaderParams.noiseScale,
      radius: shaderParams.radius,
      isWebGpuCompute: resolvedEngine.strategy === "webgpu-compute",
    });
  }, [
    behaviorIndex,
    fps,
    normalizedOpacityValue,
    resolvedEngine.strategy,
    shaderParams.curl,
    shaderParams.gravity,
    shaderParams.noiseScale,
    shaderParams.radius,
    shaderParams.speed,
    shaderParams.strength,
    sizeRange,
  ]);

  useEffect(() => {
    if (!(material instanceof ShaderMaterial)) {
      return;
    }

    material.uniforms.uFrame.value = frame;
    material.uniformsNeedUpdate = true;
  }, [frame, material]);

  useEffect(() => {
    if (!(material instanceof ShaderMaterial)) {
      return;
    }

    material.uniforms.uFps.value = fps;
    material.uniforms.uBehavior.value = behaviorIndex;
    material.uniforms.uSpeed.value = shaderParams.speed;
    material.uniforms.uGravity.value = shaderParams.gravity;
    material.uniforms.uStrength.value = shaderParams.strength;
    material.uniforms.uCurl.value = shaderParams.curl;
    material.uniforms.uNoiseScale.value = shaderParams.noiseScale;
    material.uniforms.uRadius.value = shaderParams.radius;
    material.uniforms.uOpacity.value = normalizedOpacityValue;
    material.uniforms.uComputeHint.value =
      resolvedEngine.strategy === "webgpu-compute" ? 1 : 0;
    material.uniformsNeedUpdate = true;
  }, [
    behaviorIndex,
    fps,
    material,
    normalizedOpacityValue,
    resolvedEngine.strategy,
    shaderParams.curl,
    shaderParams.gravity,
    shaderParams.noiseScale,
    shaderParams.radius,
    shaderParams.speed,
    shaderParams.strength,
  ]);

  useEffect(() => {
    if (resolvedEngine.strategy !== "cpu") {
      return;
    }

    simulateCpuFallbackPositions({
      behavior: resolvedEngine.behavior,
      fallbackBehavior: resolvedEngine.fallbackBehavior,
      states,
      frame,
      fps,
      config,
      target: buffers.positions,
    });

    const positionAttribute = geometry.getAttribute("position") as BufferAttribute;
    positionAttribute.needsUpdate = true;
  }, [
    buffers.positions,
    config,
    fps,
    frame,
    geometry,
    resolvedEngine.behavior,
    resolvedEngine.fallbackBehavior,
    resolvedEngine.strategy,
    states,
  ]);

  const points = useMemo(() => {
    const pointsObject = new Points(geometry, material);
    pointsObject.frustumCulled = false;

    if (resolvedEngine.strategy === "webgpu-compute") {
      pointsObject.userData.computeShader = PARTICLE_SHADER_SOURCES.computeWgsl;
    }

    return pointsObject;
  }, [geometry, material, resolvedEngine.strategy]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <primitive object={points} />;
};
