# WebGPU and Fallback Strategy

Remotion Reloaded uses explicit fallback paths for both scene rendering and particles.

## ThreeCanvas Fallback

- Requested: `renderer="webgpu"` or `renderer="webgl"`
- If WebGPU is unavailable, `ThreeCanvas` resolves to WebGL automatically.

```ts
import { resolveRenderer } from '@remotion-reloaded/three';

const decision = resolveRenderer('webgpu', false);
// decision.resolved === 'webgl'
```

## GPUParticles Fallback

`resolveParticleEngine()` considers:
- requested renderer (`auto`, `webgpu`, `webgl`)
- environment (local vs lambda)
- fallback count and behavior

```ts
import { resolveParticleEngine } from '@remotion-reloaded/three';

const engine = resolveParticleEngine({
  count: 30000,
  behavior: 'flow-field',
  renderer: 'auto',
  environment: 'lambda',
  fallbackCount: 1200,
});
```

## Environment-aware Config

Use `withReloaded()` in `remotion.config.ts` to set Chromium flags and renderer defaults:

```ts
import { withReloaded } from 'remotion-reloaded/config';

export default withReloaded({
  webgpu: true,
  gl: 'angle',
});
```

## Effects Fallback

- WebGL-backed effects may skip on Lambda when no CSS/SVG fallback exists.
- `neon` uses a CSS fallback path.
