# Phase 2: Cinematography & Motion
## Detailed Specification

**Version:** 1.0  
**Status:** Planning  
**Dependencies:** Phase 1 Complete  

---

## Overview

Phase 2 transforms Remotion from a motion graphics tool into a cinematographic system. Videos created with these primitives will feel *directed*—as if a camera operator and editor made deliberate creative choices—rather than simply *animated*.

---

## 2.1 Camera System

### Concept

Even in 2D compositions, the illusion of camera movement creates depth, focus, and narrative direction. The camera system provides intuitive controls for simulating physical camera behaviors.

### Core Components

#### `<Camera>` Container

```tsx
import { Camera, Dolly, Pan, Tilt, Zoom, Shake } from '@remotion-reloaded/camera';

export const CinematicScene: React.FC = () => (
  <Camera 
    initial={{ x: 0, y: 0, zoom: 1, rotation: 0 }}
    bounds={{ x: [-100, 100], y: [-100, 100] }}
  >
    <Dolly axis="in" from={1} to={1.3} start={0} duration={60} ease="power2.inOut" />
    <Pan direction="right" degrees={10} start={60} duration={30} />
    <Shake intensity={0.02} frequency={2} start={0} />
    
    <MyContent />
  </Camera>
);
```

#### Camera Movements

| Movement | Description | Parameters |
|----------|-------------|------------|
| `<Dolly>` | Push in/pull out (zoom maintaining perspective) | `axis`, `from`, `to`, `start`, `duration` |
| `<Zoom>` | True zoom (focal length change) | `from`, `to`, `start`, `duration` |
| `<Pan>` | Horizontal rotation | `direction`, `degrees`, `start`, `duration` |
| `<Tilt>` | Vertical rotation | `direction`, `degrees`, `start`, `duration` |
| `<Truck>` | Horizontal slide | `direction`, `distance`, `start`, `duration` |
| `<Pedestal>` | Vertical slide | `direction`, `distance`, `start`, `duration` |
| `<Crane>` | Combined vertical + zoom | `from`, `to`, `start`, `duration` |
| `<Orbit>` | Circular movement around subject | `degrees`, `radius`, `start`, `duration` |

#### Camera Behaviors

```tsx
// Handheld shake - organic, human imperfection
<Shake 
  intensity={0.03}
  frequency={4}
  rotation={true}
  seed={42}
/>

// Steadicam - smooth floating motion
<Steadicam 
  dampening={0.8}
  weight={0.5}
/>

// Breathing - subtle rhythmic movement
<Breathing 
  scale={[0.99, 1.01]}
  rhythm={3}
/>
```

#### Rack Focus Simulation

```tsx
<Camera>
  <RackFocus 
    from="foreground"
    to="background" 
    at={45}
    duration={15}
    ease="power2.inOut"
  />
  
  <Layer depth={0} name="foreground">
    <ForegroundContent />
  </Layer>
  <Layer depth={10} name="midground">
    <MidgroundContent />
  </Layer>
  <Layer depth={20} name="background">
    <BackgroundContent />
  </Layer>
</Camera>
```

### Parallax System

```tsx
import { ParallaxContainer, ParallaxLayer } from '@remotion-reloaded/camera';

<ParallaxContainer movement={{ x: 50, y: 20 }} duration={90}>
  <ParallaxLayer depth={0} speed={1.5}>
    <ForegroundElements />
  </ParallaxLayer>
  
  <ParallaxLayer depth={1} speed={1.0}>
    <MainContent />
  </ParallaxLayer>
  
  <ParallaxLayer depth={2} speed={0.5}>
    <BackgroundElements />
  </ParallaxLayer>
</ParallaxContainer>
```

### Special Camera Effects

```tsx
// Vertigo/Dolly Zoom (Hitchcock effect)
<VertigoZoom
  start={0}
  duration={60}
  intensity={0.3}
/>

// Whip Pan (fast blur transition)
<WhipPan
  direction="left"
  at={45}
  blurStrength={20}
  duration={8}
/>

// Lens Distortion
<LensDistortion
  type="barrel"
  strength={0.1}
  animated={true}
/>
```

### Virtual Cameraman (Behavior-Based Tracking)

Instead of defining explicit camera keyframes, define *behaviors* that react to scene content.

```tsx
import { Camera, CameraBehavior } from '@remotion-reloaded/camera';

// Follow a subject element
<Camera>
  <CameraBehavior
    type="follow-subject"
    subjectRef={speakerRef}
    smoothing={0.85}
    leadSpace={{ x: 100, y: 0 }}  // Keep subject off-center
    bounds={{ zoom: [0.8, 1.5] }}
  />

  <Speaker ref={speakerRef} />
  <Background />
</Camera>

// Frame multiple subjects
<Camera>
  <CameraBehavior
    type="frame-group"
    subjects={[actorARef, actorBRef]}
    padding={0.15}  // 15% padding around group
    reframeThreshold={50}  // Reframe when subjects move 50px
    reframeDuration={30}   // Smooth reframe over 30 frames
  />

  <Actor ref={actorARef} />
  <Actor ref={actorBRef} />
</Camera>

// Look-at behavior (camera points toward target)
<Camera>
  <CameraBehavior
    type="look-at"
    target={focusPointRef}
    easing="power2.out"
    maxRotation={15}  // Degrees
  />

  <FocusPoint ref={focusPointRef} />
  <Content />
</Camera>

// Anticipate motion (lead the subject)
<Camera>
  <CameraBehavior
    type="anticipate"
    subjectRef={movingObjectRef}
    anticipation={0.3}  // How far ahead to look
    velocitySmoothing={0.9}
  />

  <MovingObject ref={movingObjectRef} />
</Camera>
```

#### Behavior Composition

Behaviors can be combined with priorities:

```tsx
<Camera>
  <CameraBehavior type="follow-subject" subjectRef={mainRef} priority={1} />
  <CameraBehavior type="avoid-edges" padding={0.1} priority={2} />
  <CameraBehavior type="smooth-motion" dampening={0.9} priority={3} />

  <Scene />
</Camera>
```

#### AI Agent Mapping for Behaviors

| Natural Language | Behavior Configuration |
|------------------|------------------------|
| "keep the speaker in frame" | `type="follow-subject"` |
| "frame both people in the conversation" | `type="frame-group"` |
| "camera follows the action" | `type="anticipate"` |
| "look at the product when it appears" | `type="look-at"` |

---

## 2.2 Procedural Motion Library

### Concept

Natural motion isn't linear or mechanically perfect. This library provides organic, procedural motion patterns that make animations feel alive.

### Motion Primitives

#### Float

```tsx
import { Float } from '@remotion-reloaded/motion';

<Float 
  amplitude={10}
  frequency={0.5}
  rotationAmplitude={3}
  phase="random"
>
  <Logo />
</Float>
```

#### Breathe

```tsx
<Breathe 
  scale={[0.97, 1.03]}
  duration={2.5}
  ease="sine.inOut"
>
  <ProfilePhoto />
</Breathe>
```

#### Drift

```tsx
<Drift 
  speed={0.5}
  direction="wind"
  turbulence={0.3}
  bounds={{ x: 50, y: 30 }}
>
  <CloudElement />
</Drift>
```

#### Wobble

```tsx
<Wobble 
  amplitude={5}
  frequency={2}
  damping={0.98}
>
  <Badge />
</Wobble>
```

#### Sway

```tsx
<Sway 
  amplitude={8}
  frequency={0.8}
  pivot="top"
>
  <HangingElement />
</Sway>
```

### Physics-Based Motion

#### Spring

```tsx
import { PhysicsSpring } from '@remotion-reloaded/motion';

<PhysicsSpring
  target={{ x: 100, y: 50, scale: 1.2 }}
  stiffness={150}
  damping={15}
  mass={1}
  velocity={{ x: 0, y: -5 }}
>
  <BouncyElement />
</PhysicsSpring>
```

#### Gravity

```tsx
<Gravity 
  acceleration={9.8}
  bounce={0.7}
  friction={0.02}
  floor={500}
  start={30}
>
  <FallingObject />
</Gravity>
```

#### Flocking (Boids)

```tsx
import { Flock, Boid } from '@remotion-reloaded/motion';

<Flock
  separation={25}
  alignment={0.5}
  cohesion={0.3}
  bounds={{ width: 1920, height: 1080 }}
  wrap={true}
>
  {birds.map((bird, i) => (
    <Boid key={i} initial={{ x: bird.x, y: bird.y }}>
      <BirdSprite />
    </Boid>
  ))}
</Flock>
```

### Noise-Driven Motion

```tsx
import { NoiseTransform } from '@remotion-reloaded/motion';

<NoiseTransform
  type="perlin"
  scale={0.01}
  speed={0.5}
  octaves={3}
  properties={{
    x: { amplitude: 50 },
    y: { amplitude: 30 },
    rotation: { amplitude: 5 },
    scale: { amplitude: 0.1, base: 1 }
  }}
>
  <OrganicShape />
</NoiseTransform>
```

### Stagger Patterns

```tsx
import { StaggerGroup, StaggerItem } from '@remotion-reloaded/motion';

<StaggerGroup
  pattern="wave"
  stagger={0.1}
  from="left"
>
  {items.map((item, i) => (
    <StaggerItem key={i}>
      <ListItem>{item}</ListItem>
    </StaggerItem>
  ))}
</StaggerGroup>
```

---

## 2.3 Transition Intelligence

### Concept

Transitions aren't just visual effects—they're narrative tools. This system provides semantically meaningful transitions.

### Transition Types

#### Standard

| Type | Description | Parameters |
|------|-------------|------------|
| `crossfade` | Simple opacity blend | `duration` |
| `cut` | Hard cut | - |
| `fade-black` | Fade through black | `duration`, `hold` |
| `fade-white` | Fade through white | `duration`, `hold` |
| `wipe` | Linear reveal | `direction`, `duration`, `softness` |
| `iris` | Circular reveal | `origin`, `duration`, `shape` |
| `push` | New scene pushes old | `direction`, `duration` |
| `slide` | Scenes slide together | `direction`, `overlap` |

#### Cinematic

```tsx
// Match Cut - visual continuity between scenes
<Transition 
  type="match-cut"
  match="shape"
  duration={3}
/>

// J-Cut - audio from next scene starts early
<Transition 
  type="j-cut"
  audioLead={30}
/>

// L-Cut - audio from current scene continues
<Transition 
  type="l-cut"
  audioTrail={30}
/>

// Whip/Swish Pan
<Transition 
  type="whip-pan"
  direction="right"
  blur={true}
  duration={10}
/>

// Morph - element becomes another
<Transition 
  type="morph"
  from=".scene-a .circle"
  to=".scene-b .logo"
  duration={20}
/>
```

#### Stylized

```tsx
// Glitch transition
<Transition type="glitch" intensity={0.8} blockSize={32} duration={12} />

// Zoom blur
<Transition type="zoom-blur" direction="in" origin="center" duration={15} />

// Slice/Shutter
<Transition type="slice" slices={8} direction="horizontal" stagger={0.05} />

// Liquid/Distort
<Transition type="liquid" turbulence={0.3} duration={20} />
```

---

## 2.4 Temporal Dynamics

### Speed Control

```tsx
import { TimeWarp, SpeedRamp, Freeze, Reverse } from '@remotion-reloaded/time';

<TimeWarp>
  <SpeedRamp from={0} to={60} speed={1.0} />
  <SpeedRamp from={60} to={120} speed={0.25} ease="power2.inOut" />
  <SpeedRamp from={120} to={150} speed={2.0} ease="power2.out" />
  
  <ContentToWarp />
</TimeWarp>
```

### Freeze Frame

```tsx
<Freeze 
  at={75}
  duration={30}
  effect="slight-zoom"
  zoomAmount={1.05}
>
  <ActionSequence />
</Freeze>
```

### Reverse

```tsx
<Reverse 
  segment={[100, 150]}
  speed={1.0}
>
  <ReversibleAction />
</Reverse>
```

### Time Remapping

```tsx
import { TimeRemap } from '@remotion-reloaded/time';

<TimeRemap
  keyframes={[
    { input: 0, output: 0 },
    { input: 30, output: 30 },
    { input: 60, output: 45 },
    { input: 90, output: 90 },
  ]}
  interpolation="smooth"
>
  <AnimatedContent />
</TimeRemap>
```

---

## AI Agent Mapping

| Natural Language | Mapped Components |
|------------------|-------------------|
| "slow push in" | `<Dolly axis="in" ease="power1.inOut">` |
| "handheld feel" | `<Shake intensity={0.02}>` |
| "dreamy floating" | `<Float>` + blur effect |
| "items appear one by one" | `<StaggerGroup pattern="wave">` |
| "dramatic slow motion" | `<SpeedRamp speed={0.25}>` |
| "smooth transition" | `<Transition type="crossfade">` |

---

## Success Criteria

- [ ] Camera system supports all standard movements
- [ ] Parallax renders correctly at all layer depths
- [ ] 10+ procedural motion primitives available
- [ ] Transitions sync audio correctly for J/L cuts
- [ ] Speed ramping maintains audio pitch appropriately
- [ ] All components work with GSAP timelines from Phase 1
- [ ] AI agent can compose scenes using natural language
- [ ] Virtual cameraman behaviors track subjects smoothly
- [ ] Behavior composition resolves priority conflicts correctly
