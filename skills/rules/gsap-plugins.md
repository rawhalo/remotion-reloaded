# GSAP Plugins

Remotion Reloaded exposes registration helpers and guarded plugin utilities for:
- MorphSVG
- SplitText
- DrawSVG

## Registration Patterns

## Register everything once

```ts
import '@remotion-reloaded/gsap/register-all';
```

## Register per plugin

```ts
import '@remotion-reloaded/gsap/morphsvg';
import '@remotion-reloaded/gsap/splittext';
import '@remotion-reloaded/gsap/drawsvg';
```

## Runtime registration helpers

```ts
import {
  registerMorphSVGPlugin,
  registerSplitTextPlugin,
  registerDrawSVGPlugin,
} from '@remotion-reloaded/gsap';

registerMorphSVGPlugin();
registerSplitTextPlugin();
registerDrawSVGPlugin();
```

## Guarded Helpers

These helpers throw clear plugin-registration errors when missing.

```ts
import { createSplitText, drawSVG, morphSVG } from '@remotion-reloaded/gsap';

const split = createSplitText('.headline', { type: 'chars' });
timeline.from(split.chars, { y: 20, opacity: 0, stagger: 0.02 });

timeline.from('.path', { drawSVG: drawSVG('0%'), duration: 1.2 });
timeline.to('#logo', { morphSVG: morphSVG('#logo-alt') });
```

## Check Registration

```ts
import { isPluginRegistered } from '@remotion-reloaded/gsap';

if (!isPluginRegistered('SplitText')) {
  // register plugin or skip split-text animations
}
```
