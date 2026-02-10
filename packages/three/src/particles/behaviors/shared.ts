import type { ParticleBehaviorConfig } from "./types";

export const TAU = Math.PI * 2;

export const createSeededRandom = (seed: number): (() => number) => {
  let state = (seed >>> 0) || 0x9e3779b9;

  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomInRange = (
  random: () => number,
  min: number,
  max: number,
): number => min + random() * (max - min);

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
};

export const getNumber = (
  config: ParticleBehaviorConfig,
  key: string,
  fallback: number,
): number => {
  const value = toNumber(config[key]);
  return value ?? fallback;
};

export const getRange = (
  config: ParticleBehaviorConfig,
  key: string,
  fallback: [number, number],
): [number, number] => {
  const value = config[key];
  if (!Array.isArray(value) || value.length !== 2) {
    return fallback;
  }

  const min = toNumber(value[0]);
  const max = toNumber(value[1]);

  if (min === undefined || max === undefined) {
    return fallback;
  }

  return min <= max ? [min, max] : [max, min];
};

export const getVector3 = (
  config: ParticleBehaviorConfig,
  key: string,
  fallback: [number, number, number],
): [number, number, number] => {
  const value = config[key];
  if (!Array.isArray(value) || value.length !== 3) {
    return fallback;
  }

  const x = toNumber(value[0]);
  const y = toNumber(value[1]);
  const z = toNumber(value[2]);

  if (x === undefined || y === undefined || z === undefined) {
    return fallback;
  }

  return [x, y, z];
};

export const normalizeVector = (
  vector: [number, number, number],
): [number, number, number] => {
  const magnitude = Math.hypot(vector[0], vector[1], vector[2]);
  if (magnitude <= 1e-6) {
    return [0, 0, 0];
  }

  return [
    vector[0] / magnitude,
    vector[1] / magnitude,
    vector[2] / magnitude,
  ];
};

export const randomDirection = (random: () => number): [number, number, number] => {
  const z = randomInRange(random, -1, 1);
  const angle = randomInRange(random, 0, TAU);
  const radius = Math.sqrt(Math.max(0, 1 - z * z));

  return [radius * Math.cos(angle), radius * Math.sin(angle), z];
};
