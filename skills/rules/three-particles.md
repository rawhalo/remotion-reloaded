# Three Particles

`<GPUParticles>` supports WebGPU/WebGL strategies with CPU fallback for constrained environments.

## Supported Behaviors

- `flow-field`
- `explosion`
- `orbit`
- `attract`

## Basic Usage

```tsx
import { GPUParticles } from '@remotion-reloaded/three';

<GPUParticles
  count={12000}
  behavior="flow-field"
  renderer="auto"
  seed={42}
  color={['#60a5fa', '#a78bfa', '#f472b6']}
  size={[0.02, 0.07]}
  config={{ speed: 1.8, curl: 0.9, noiseScale: 0.35 }}
/>;
```

## Fallback Controls

```tsx
<GPUParticles
  count={50000}
  behavior="attract"
  renderer="webgpu"
  fallbackCount={1500}
  fallbackBehavior="simple"
/>
```

## Inspect Resolved Strategy

```tsx
<GPUParticles
  count={8000}
  onEngineResolved={(resolution) => {
    console.info(resolution.strategy, resolution.resolvedRenderer, resolution.count);
  }}
/>
```

## Engine Resolution Utility

```ts
import { resolveParticleEngine } from '@remotion-reloaded/three';

const engine = resolveParticleEngine({
  count: 20000,
  renderer: 'auto',
  behavior: 'orbit',
  environment: 'lambda',
});
```
