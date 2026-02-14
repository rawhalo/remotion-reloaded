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

## Effect + ThreeCanvas render timeout or missing output

Symptom:
- Render stalls or times out when wrapping `ThreeCanvas` with `<Effect>`.

Checks:
- Ensure Remotion config uses `withReloaded()` (or equivalent `chromiumOptions.gl = "angle"`).
- For heavy headless runs, prefer `--chrome-mode=headless-shell --concurrency=0`.

Recommended path:
- Use `remotion-reloaded render --composition-id <id>` as the enforcement command.
- Risky combinations are auto-routed to pre-comp.
- If you need explicit control, run:
  - `remotion-reloaded precomp --source-composition-id <source-id> --effects-composition-id <effects-id>`
- Use unsafe override only intentionally:
  - `--allow-unsafe-single-pass` with timeout guardrails.

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
- Remember: `doctor` is advisory/preflight. Runtime routing happens in `remotion-reloaded render`.
