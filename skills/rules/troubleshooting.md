# Troubleshooting

## GSAP plugin error: plugin is not registered

Symptom:
- `PluginNotRegisteredError` mentioning MorphSVG, SplitText, or DrawSVG.

Fix:

```ts
import '@remotion-reloaded/gsap/register-all';
```

Or register targeted plugins before use.

## GSAP selector not animating

Symptom:
- Timeline runs but target does not move.

Checks:
- Attach `scopeRef` to a parent element.
- Ensure targets are mounted at frame 0.
- Confirm selector class/id exists in rendered markup.

## Unknown effect type

Symptom:
- `<Effect type="...">` throws unknown type error.

Fix:

```ts
import { getAvailableEffectTypes } from '@remotion-reloaded/effects';

console.log(getAvailableEffectTypes());
```

Use one of the registered names from the list.

## Effect looks different on Lambda

Symptom:
- WebGL effects disappear or degrade.

Reason:
- Some WebGL effects use fallback mode `skip` in Lambda.

Fixes:
- Prefer CSS/SVG effects or presets for Lambda-critical shots.
- Use `neon` when a CSS fallback is acceptable.

## Three renderer fallback confusion

Symptom:
- Requested `webgpu` but scene runs on WebGL.

Fix:
- Inspect `onRendererResolved` to verify runtime decision.
- Use `detectWebGpuSupport()` and `resolveRenderer()` for preflight checks.

## Particle count too high warning

Symptom:
- Console warning about clamped particle count.

Fix:
- Lower `count`.
- Split into multiple `GPUParticles` instances.
- Set explicit `maxCount` / `fallbackCount`.

## remotion-reloaded CLI doctor failures

Symptom:
- `remotion-reloaded doctor` reports missing config/dependencies.

Fixes:
- Run `remotion-reloaded init` in project root.
- Confirm `remotion.config.*` includes `withReloaded()`.
- Install missing dependencies in `package.json`.
