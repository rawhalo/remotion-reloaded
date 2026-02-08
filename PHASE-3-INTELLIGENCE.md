# Phase 3: Intelligence Layer
## Detailed Specification

**Version:** 1.0  
**Status:** Planning  
**Dependencies:** Phase 1 & 2 Complete  

---

## Overview

Phase 3 adds semantic understanding to video creation. Instead of specifying exact values, AI agents describe *intent*—mood, style, narrative structure—and the system translates these into appropriate visual parameters.

---

## 3.1 Semantic Style System

### Concept

Bridge the gap between AI's natural language understanding ("make it feel premium") and specific visual parameters (24fps, letterboxing, slow dollies, desaturated colors).

### Style Dimensions

#### Mood

```tsx
import { StyleProvider } from '@remotion-reloaded/style';

<StyleProvider mood="energetic">
  <MyComposition />
</StyleProvider>
```

| Mood | Motion Characteristics | Color Tendency | Pacing |
|------|----------------------|----------------|--------|
| `energetic` | Snappy eases, quick cuts | High contrast, saturated | Fast |
| `calm` | Gentle eases, slow transitions | Soft, muted | Slow |
| `dramatic` | Bold movements, holds | High contrast, shadows | Variable |
| `playful` | Bouncy, overshoots | Bright, varied | Medium-fast |
| `sophisticated` | Subtle, precise | Refined palette | Medium |
| `urgent` | Quick, direct | Warm warnings | Very fast |
| `mysterious` | Slow reveals, shadows | Dark, selective lighting | Slow |
| `inspirational` | Rising motions, crescendo | Warm, hopeful | Building |

#### Genre

```tsx
<StyleProvider genre="tech-product-launch">
  <ProductVideo />
</StyleProvider>
```

| Genre | Visual Language | Typography | Transitions |
|-------|----------------|------------|-------------|
| `tech-product-launch` | Clean, minimal, floating products | Geometric sans | Smooth morphs |
| `corporate-explainer` | Professional, structured | Classic sans | Clean wipes |
| `social-media-ad` | Bold, attention-grabbing | Impact fonts | Quick cuts |
| `documentary` | Naturalistic, subtle | Serif or humanist | Crossfades |
| `music-video` | Expressive, sync to beat | Stylized | Beat-matched |
| `tutorial` | Clear, educational | Readable sans | Simple cuts |
| `fashion` | High contrast, editorial | Elegant serif | Slow dissolves |
| `sports` | Dynamic, intense | Bold condensed | Fast wipes |

#### Era / Aesthetic

```tsx
<StyleProvider era="2024-minimal">
  <BrandVideo />
</StyleProvider>
```

| Era | Characteristics |
|-----|-----------------|
| `2024-minimal` | Lots of whitespace, subtle motion, system fonts |
| `2020s-gradient` | Mesh gradients, glass morphism, soft shadows |
| `2010s-flat` | Flat colors, geometric shapes, bold primary colors |
| `90s-web` | Pixel fonts, bright colors, simple animations |
| `80s-retro` | Neon, grid lines, chrome text, synthwave |
| `70s-analog` | Film grain, warm tones, organic shapes |
| `vintage-film` | Scratches, vignette, desaturated |
| `y2k` | Glossy, 3D chrome, bubble fonts |

### Style Composition

```tsx
<StyleProvider 
  mood="energetic"
  genre="tech-product-launch"
  era="2024-minimal"
  overrides={{
    primaryColor: '#6366f1',
    accentColor: '#ec4899',
    fontFamily: 'Inter',
    transitionSpeed: 1.2  // Multiplier
  }}
>
  <Composition />
</StyleProvider>
```

### Style Extraction

```tsx
import { useStyle } from '@remotion-reloaded/style';

const MyComponent = () => {
  const style = useStyle();

  // Access computed values
  const {
    colors,           // { primary, secondary, accent, background, text }
    motion,           // { defaultEase, defaultDuration, staggerDelay }
    typography,       // { headingFont, bodyFont, scale }
    transitions,      // { default, dramatic, subtle }
  } = style;

  return (
    <div style={{ color: colors.primary }}>
      <GSAPTimeline ease={motion.defaultEase}>
        ...
      </GSAPTimeline>
    </div>
  );
};
```

### Brand DNA System

Beyond individual style properties, brands have a holistic "physics"—how they move, what they avoid, and what constraints they enforce. The Brand DNA system formalizes this.

#### Brand Configuration File

```json
// .brand.json (or brand.config.ts)
{
  "name": "Acme Corp",
  "version": "1.0",

  "motion": {
    "signature": "luxury",
    "spring": { "damping": 25, "stiffness": 80 },
    "defaultEase": "power2.out",
    "transitionSpeed": 0.8
  },

  "colors": {
    "primary": "#1a1a2e",
    "accent": "#e94560",
    "allowed": ["#1a1a2e", "#e94560", "#ffffff", "#f5f5f5"],
    "forbidden": ["#ff0000", "#00ff00"]
  },

  "constraints": {
    "logo": {
      "minSize": 48,
      "clearSpace": "10%",
      "positions": ["top-left", "bottom-right"],
      "neverOn": ["busy-backgrounds", "low-contrast"]
    },
    "typography": {
      "maxFonts": 2,
      "headingFont": "Playfair Display",
      "bodyFont": "Inter"
    },
    "colorRules": [
      { "never": "red", "for": "positive-metrics" },
      { "always": "accent", "for": "cta-buttons" }
    ],
    "motionRules": [
      { "never": "bounce", "for": "serious-content" },
      { "prefer": "fade", "for": "transitions" }
    ]
  },

  "signatures": {
    "luxury": {
      "description": "Moves like a heavy luxury car—slow, smooth, deliberate",
      "spring": { "damping": 30, "stiffness": 60 },
      "ease": "power1.inOut",
      "transitionDuration": 1.2
    },
    "tech": {
      "description": "Moves like a responsive app—snappy, precise, efficient",
      "spring": { "damping": 15, "stiffness": 200 },
      "ease": "power3.out",
      "transitionDuration": 0.4
    },
    "playful": {
      "description": "Moves like a bouncy ball—elastic, overshooting, fun",
      "spring": { "damping": 8, "stiffness": 150 },
      "ease": "back.out(1.7)",
      "transitionDuration": 0.6
    }
  }
}
```

#### Brand Provider

```tsx
import { BrandProvider, useBrand } from '@remotion-reloaded/style';
import brandConfig from './brand.config';

<BrandProvider config={brandConfig}>
  <MyComposition />
</BrandProvider>

// In components:
const MyComponent = () => {
  const brand = useBrand();

  return (
    <div style={{
      color: brand.colors.primary,
      fontFamily: brand.constraints.typography.headingFont
    }}>
      <GSAPTimeline ease={brand.motion.defaultEase}>
        ...
      </GSAPTimeline>
    </div>
  );
};
```

#### Brand Validation

The system validates compositions against brand constraints at build time:

```tsx
import { validateBrand } from '@remotion-reloaded/style';

const violations = await validateBrand(composition, brandConfig);

// Returns:
[
  {
    type: 'color-violation',
    message: 'Used #ff0000 which is in forbidden colors',
    frame: 45,
    element: '.error-text',
    severity: 'error'
  },
  {
    type: 'motion-violation',
    message: 'Used bounce easing for serious-content section',
    frame: 120,
    element: '.hero-title',
    severity: 'warning'
  },
  {
    type: 'logo-violation',
    message: 'Logo appears on busy background without contrast overlay',
    frame: 200,
    severity: 'error'
  }
]
```

#### AI Agent Brand Enforcement

When a brand config is present, the AI agent:
1. Reads `.brand.json` before generating any composition
2. Auto-applies motion signature to all animations
3. Validates generated code against constraints
4. Rejects or auto-corrects violations before presenting to user

---

## 3.2 Audio-Reactive Primitives

### Concept

Audio as a design driver—not just visualizers, but content that responds meaningfully to sound.

### Audio Analysis

```tsx
import { AudioAnalysis, useAudio } from '@remotion-reloaded/audio';

<AudioAnalysis src={staticFile('music.mp3')}>
  {({ bass, mid, treble, energy, beats, spectrum }) => (
    <ResponsiveContent 
      bass={bass}           // 0-1, low frequency energy
      mid={mid}             // 0-1, mid frequency energy  
      treble={treble}       // 0-1, high frequency energy
      energy={energy}       // 0-1, overall loudness
      beats={beats}         // { onBeat, bpm, beatProgress }
      spectrum={spectrum}   // Float32Array of frequency bins
    />
  )}
</AudioAnalysis>
```

### Beat Detection

```tsx
import { useBeatSync } from '@remotion-reloaded/audio';

const BeatSyncedElement = () => {
  const { onBeat, beatProgress, bpm } = useBeatSync();
  
  return (
    <div style={{
      transform: `scale(${onBeat ? 1.1 : 1})`,
      transition: 'transform 0.1s'
    }}>
      {/* Pulses on beat */}
    </div>
  );
};
```

### Audio-Reactive Components

```tsx
import { 
  AudioReactiveScale,
  AudioReactiveColor,
  AudioReactivePosition,
  AudioReactiveRotation
} from '@remotion-reloaded/audio';

// Scale responds to bass
<AudioReactiveScale 
  source="bass"
  range={[1, 1.3]}
  smoothing={0.8}
>
  <Logo />
</AudioReactiveScale>

// Color shifts with energy
<AudioReactiveColor
  source="energy"
  from="#1a1a2e"
  to="#e94560"
  smoothing={0.9}
>
  <Background />
</AudioReactiveColor>

// Position driven by frequency
<AudioReactivePosition
  source="mid"
  axis="y"
  range={[-20, 20]}
  smoothing={0.7}
>
  <FloatingElement />
</AudioReactivePosition>
```

### Waveform & Spectrum Visualization

```tsx
import { Waveform, Spectrum, CircularSpectrum } from '@remotion-reloaded/audio';

// Classic waveform
<Waveform 
  color="#ffffff"
  height={100}
  resolution={128}
  smoothing={0.8}
/>

// Bar spectrum
<Spectrum 
  bars={64}
  color={['#6366f1', '#ec4899']}  // Gradient
  height={200}
  gap={2}
  smoothing={0.85}
/>

// Circular visualizer
<CircularSpectrum
  radius={150}
  bars={128}
  color="#ffffff"
  mirror={true}
/>
```

### Beat-Triggered Events

```tsx
import { OnBeat, OnBar, OnDrop } from '@remotion-reloaded/audio';

<OnBeat>
  {(beatNumber) => (
    <GlitchFlash intensity={0.3} duration={2} />
  )}
</OnBeat>

<OnBar interval={4}>
  {(barNumber) => (
    <SceneTransition type="cut" />
  )}
</OnBar>

<OnDrop threshold={0.8}>
  {() => (
    <MajorVisualChange />
  )}
</OnDrop>
```

### Semantic Audio Sync (Stretch Goal)

Beyond beat detection, understand the *meaning* of audio content and sync visuals semantically.

```tsx
import { SemanticAudioSync, OnWord, OnPhrase } from '@remotion-reloaded/audio';

// Analyze speech/lyrics and trigger on specific words
<SemanticAudioSync
  src={staticFile('voiceover.mp3')}
  transcript={transcript}  // Or auto-transcribe
>
  {({ currentWord, currentPhrase, sentiment, keywords }) => (
    <ResponsiveContent
      highlight={keywords.includes(currentWord)}
      mood={sentiment}
    />
  )}
</SemanticAudioSync>

// Trigger visual events on specific words
<OnWord word="skyrocket" tolerance={0.1}>
  {(timestamp) => (
    <GraphSpike direction="up" at={timestamp} />
  )}
</OnWord>

<OnWord word="crash" tolerance={0.1}>
  {(timestamp) => (
    <GraphDrop at={timestamp} />
  )}
</OnWord>

// React to phrases/sentences
<OnPhrase match="introducing our new product">
  {(startTime, endTime) => (
    <ProductReveal from={startTime} to={endTime} />
  )}
</OnPhrase>
```

#### Semantic Timing Analysis

```tsx
import { analyzeSemanticTiming } from '@remotion-reloaded/audio';

const timing = await analyzeSemanticTiming(audioFile, {
  transcript: true,
  sentiment: true,
  keywords: ['launch', 'growth', 'innovation'],
});

// Returns:
{
  words: [
    { word: 'introducing', start: 0.5, end: 1.2, sentiment: 'neutral' },
    { word: 'revolutionary', start: 1.3, end: 2.1, sentiment: 'positive' },
    // ...
  ],
  keywordTimestamps: [
    { keyword: 'growth', timestamp: 5.4 },
    { keyword: 'innovation', timestamp: 12.1 },
  ],
  sentimentCurve: [
    { time: 0, sentiment: 0.5 },
    { time: 5, sentiment: 0.8 },
    // ...
  ]
}
```

---

## 3.3 Design Intelligence

### Concept

Videos that understand composition principles—safe zones, visual hierarchy, balance, and rhythm.

### Auto Layout

```tsx
import { AutoLayout, LayoutSlot } from '@remotion-reloaded/layout';

<AutoLayout
  principle="rule-of-thirds"
  balance="asymmetric"
  padding={0.05}  // 5% safe area
>
  <LayoutSlot position="focus-1">
    <Title />
  </LayoutSlot>
  
  <LayoutSlot position="below-focus-1" spacing={20}>
    <Subtitle />
  </LayoutSlot>
  
  <LayoutSlot position="corner-bottom-right" safeArea="platform">
    <Logo />
  </LayoutSlot>
</AutoLayout>
```

### Platform-Aware Safe Zones

```tsx
import { SafeZone, PlatformOverlay } from '@remotion-reloaded/layout';

<SafeZone 
  platform="tiktok"  // or "youtube", "instagram-reels", "instagram-feed"
  showGuides={preview}
>
  <Content />
</SafeZone>

// Debug overlay showing where UI elements appear
<PlatformOverlay platform="tiktok" opacity={0.3} />
```

| Platform | Safe Zones |
|----------|------------|
| TikTok | Bottom 15% (captions), right 10% (buttons), top 10% (status bar) |
| Instagram Reels | Similar to TikTok |
| YouTube | Bottom 20% (progress bar, info), top corners (logo, subscribe) |
| Instagram Feed | Minimal, mostly safe |
| Twitter/X | Bottom bar consideration |

### Content-Aware Safe Zones (Stretch Goal)

Beyond static platform safe zones, analyze video/image content to find optimal placement.

```tsx
import { SaliencyAnalysis, ContentAwareSafeZone } from '@remotion-reloaded/layout';

// Pre-analyze footage for saliency (faces, key objects)
const saliencyMap = await analyzeSaliency(videoFile, {
  detectFaces: true,
  detectText: true,
  detectObjects: ['logo', 'product'],
  keyframes: 'auto',  // or specific frame numbers
});

// Use saliency data to place content in negative space
<ContentAwareSafeZone
  saliency={saliencyMap}
  avoid={['faces', 'text']}
  padding={20}
>
  <OverlayText>Your message here</OverlayText>
</ContentAwareSafeZone>

// Dynamic repositioning as footage changes
<ContentAwareSafeZone
  saliency={saliencyMap}
  position="auto"  // Finds best position per frame
  transitionSmoothing={0.9}  // Smooth repositioning
>
  <LowerThird name="John Smith" title="CEO" />
</ContentAwareSafeZone>
```

#### Saliency Heatmap Visualization

```tsx
// Debug tool to see saliency analysis
<SaliencyOverlay
  saliency={saliencyMap}
  opacity={0.5}
  showFaces={true}
  showSafeZones={true}
/>
```

### Typography Hierarchy

```tsx
import { TypeScale, Heading, Body, Caption } from '@remotion-reloaded/layout';

<TypeScale 
  base={16}
  ratio={1.25}  // Minor third
  family={{ heading: 'Inter', body: 'Inter' }}
>
  <Heading level={1}>Main Title</Heading>      {/* 16 * 1.25^4 = 39px */}
  <Heading level={2}>Subtitle</Heading>         {/* 16 * 1.25^3 = 31px */}
  <Body>Regular text content</Body>             {/* 16px */}
  <Caption>Small print</Caption>                {/* 16 / 1.25 = 13px */}
</TypeScale>
```

### Visual Balance Analysis

```tsx
import { BalanceAnalyzer } from '@remotion-reloaded/layout';

// Development tool to analyze frame balance
<BalanceAnalyzer>
  <YourComposition />
</BalanceAnalyzer>

// Returns warnings like:
// - "Heavy left side: 65% visual weight"
// - "Text too close to edge: 12px margin (recommend 5%)"
// - "Low contrast: title on background ratio 2.1:1 (recommend 4.5:1)"
```

### Responsive Compositions

```tsx
import { ResponsiveComposition } from '@remotion-reloaded/layout';

<ResponsiveComposition
  breakpoints={{
    portrait: { width: 1080, height: 1920 },   // 9:16
    square: { width: 1080, height: 1080 },     // 1:1
    landscape: { width: 1920, height: 1080 },  // 16:9
  }}
>
  {({ aspect, width, height }) => (
    <AdaptiveLayout aspect={aspect}>
      <Content />
    </AdaptiveLayout>
  )}
</ResponsiveComposition>
```

---

## 3.4 Emotional Arc Mapping

### Concept

Videos have narrative shape. This system understands pacing, tension, and release.

### Arc Definition

```tsx
import { NarrativeArc, Beat } from '@remotion-reloaded/narrative';

<NarrativeArc structure="problem-solution">
  <Beat type="hook" duration={3} energy={0.9}>
    <AttentionGrabber />
  </Beat>
  
  <Beat type="problem" duration={10} energy={0.5}>
    <ProblemStatement />
  </Beat>
  
  <Beat type="tension" duration={5} energy={0.7}>
    <BuildUp />
  </Beat>
  
  <Beat type="solution" duration={15} energy={0.8}>
    <SolutionReveal />
  </Beat>
  
  <Beat type="cta" duration={5} energy={1.0}>
    <CallToAction />
  </Beat>
</NarrativeArc>
```

### Pre-built Structures

| Structure | Beats | Best For |
|-----------|-------|----------|
| `hook-value-cta` | Hook → Value Props → CTA | Ads, promos |
| `problem-solution` | Hook → Problem → Tension → Solution → CTA | Explainers |
| `story-arc` | Setup → Rising Action → Climax → Resolution | Narratives |
| `listicle` | Hook → Item 1 → Item 2 → ... → Wrap | Educational |
| `before-after` | Before State → Transformation → After State | Testimonials |
| `question-answer` | Question → Exploration → Answer | FAQ, educational |

### Automatic Adjustments

When using a narrative arc, the system auto-adjusts:

```tsx
// These happen automatically based on beat energy:
{
  // Music/audio
  musicVolume: energyToVolume(beat.energy),
  musicIntensity: selectTrackSection(beat.energy),
  
  // Visuals
  cutFrequency: energyToCutRate(beat.energy),
  motionIntensity: energyToMotionScale(beat.energy),
  colorTemperature: emotionToColor(beat.type),
  
  // Pacing
  transitionDuration: energyToTransitionSpeed(beat.energy),
  elementCount: energyToDensity(beat.energy)
}
```

### Energy Curves

```tsx
import { EnergyCurve } from '@remotion-reloaded/narrative';

// Custom energy curve
<EnergyCurve
  keyframes={[
    { time: 0, energy: 0.8 },    // Start strong
    { time: 0.2, energy: 0.4 },  // Settle down
    { time: 0.5, energy: 0.6 },  // Build
    { time: 0.8, energy: 1.0 },  // Peak
    { time: 1.0, energy: 0.7 },  // Resolve
  ]}
>
  <Content />
</EnergyCurve>
```

---

## AI Agent Integration

### Prompt → Style Mapping

| Natural Language | Style Configuration |
|------------------|---------------------|
| "Make it feel premium" | `mood="sophisticated"` + slow motion + desaturated |
| "Energetic and fun" | `mood="playful"` + quick cuts + bright colors |
| "Professional corporate" | `genre="corporate-explainer"` + `mood="sophisticated"` |
| "Retro vibes" | `era="80s-retro"` or `era="90s-web"` |
| "Sync to the music" | `<AudioAnalysis>` + beat-reactive components |
| "Build tension then release" | `<NarrativeArc structure="story-arc">` |

### Skill Directives

```markdown
## Style Selection Guide

1. Always wrap compositions in <StyleProvider> with appropriate mood/genre/era
2. Use <AudioAnalysis> when music is provided
3. Apply <SafeZone> for platform-specific content
4. Consider narrative structure for videos > 15 seconds
5. Match typography hierarchy to content importance

## Energy Mapping

- Hook/intro: energy 0.7-0.9 (grab attention)
- Explanation: energy 0.4-0.6 (comprehension)
- Build-up: energy 0.6-0.8 (anticipation)
- Climax/reveal: energy 0.9-1.0 (peak)
- CTA: energy 0.7-0.9 (motivation)
```

---

## Success Criteria

- [ ] Style system covers 90% of common aesthetic requests
- [ ] Audio analysis accurate to ±50ms for beat detection
- [ ] Safe zones correct for top 5 platforms
- [ ] Narrative arcs produce coherent energy progressions
- [ ] AI agent correctly maps mood/genre/era from prompts
- [ ] Typography hierarchy accessible (WCAG AA contrast)
- [ ] Brand DNA validation catches constraint violations at build time
- [ ] AI agent enforces brand constraints without manual checking
- [ ] (Stretch) Semantic audio sync aligns keywords within ±100ms
- [ ] (Stretch) Saliency-based safe zones avoid faces in 90%+ of cases
