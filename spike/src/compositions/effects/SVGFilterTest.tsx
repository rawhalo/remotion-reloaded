/**
 * Spike 0.2 — Test 2: SVG filter coverage
 *
 * Tests effects that require SVG <filter> elements:
 * - chromaticAberration (feOffset + feBlend on RGB channels)
 * - noise/grain (feTurbulence + feBlend)
 * - duotone (feColorMatrix)
 * - displacement (feTurbulence + feDisplacementMap)
 * - vignette (radial gradient overlay — CSS, not SVG)
 * - film (combination: grain + vignette + subtle color shift)
 */
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const TestCard: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      width: 280,
      height: 160,
      background: "linear-gradient(135deg, #e94560 0%, #0f3460 50%, #16213e 100%)",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: "system-ui, sans-serif",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    }}
  >
    {label}
  </div>
);

export const SVGFilterTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intensity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Deterministic seed for noise (based on frame for animation, or fixed for static)
  const noiseSeed = 42;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a23",
        padding: 40,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* SVG Filter Definitions */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          {/* Chromatic Aberration: offset RGB channels */}
          <filter id="chromatic-aberration" colorInterpolationFilters="sRGB">
            <feOffset in="SourceGraphic" dx={intensity * 5} dy={0} result="red" />
            <feOffset in="SourceGraphic" dx={-intensity * 5} dy={0} result="blue" />
            <feColorMatrix
              in="red"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="redOnly"
            />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="greenOnly"
            />
            <feColorMatrix
              in="blue"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blueOnly"
            />
            <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
            <feBlend in="rg" in2="blueOnly" mode="screen" />
          </filter>

          {/* Noise/Grain: feTurbulence */}
          <filter id="noise-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.65}
              numOctaves={3}
              seed={noiseSeed}
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="grayNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="grayNoise"
              mode="multiply"
              result="noisy"
            />
            {/* Mix original and noisy based on intensity */}
            <feComposite in="noisy" in2="SourceGraphic" operator="arithmetic"
              k1={0} k2={intensity} k3={1 - intensity} k4={0} />
          </filter>

          {/* Duotone: map to two colors via feColorMatrix */}
          <filter id="duotone">
            {/* First desaturate */}
            <feColorMatrix
              type="saturate"
              values="0"
              result="gray"
            />
            {/* Then map: dark=purple(0.2,0.0,0.4), light=gold(1.0,0.8,0.2) */}
            <feColorMatrix
              in="gray"
              type="matrix"
              values={`
                ${0.8 * intensity + (1 - intensity)} ${0.2 * intensity} ${0 * intensity} 0 ${0.2 * intensity * 0.2}
                ${0 * intensity} ${0.8 * intensity + (1 - intensity)} ${0 * intensity} 0 ${0 * intensity}
                ${-0.2 * intensity} ${0 * intensity} ${0.6 * intensity + (1 - intensity)} 0 ${0.4 * intensity * 0.2}
                0 0 0 1 0
              `}
            />
          </filter>

          {/* Displacement: wave-like distortion */}
          <filter id="displacement">
            <feTurbulence
              type="turbulence"
              baseFrequency={0.02}
              numOctaves={2}
              seed={noiseSeed}
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={intensity * 30}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div style={{ color: "#fff", fontSize: 20, marginBottom: 20, fontFamily: "monospace" }}>
        SVG filter coverage — intensity: {(intensity * 100).toFixed(0)}% — frame {frame}
      </div>

      {/* Chromatic Aberration */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 180, fontSize: 14, fontFamily: "monospace", color: "#4ade80", textAlign: "right" }}>
          chromaticAberration
        </div>
        <div style={{ filter: "url(#chromatic-aberration)" }}>
          <TestCard label="Chromatic Aberration" />
        </div>
      </div>

      {/* Noise/Grain */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 180, fontSize: 14, fontFamily: "monospace", color: "#4ade80", textAlign: "right" }}>
          noise (seed={noiseSeed})
        </div>
        <div style={{ filter: "url(#noise-grain)" }}>
          <TestCard label="Noise / Grain" />
        </div>
      </div>

      {/* Duotone */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 180, fontSize: 14, fontFamily: "monospace", color: "#4ade80", textAlign: "right" }}>
          duotone
        </div>
        <div style={{ filter: "url(#duotone)" }}>
          <TestCard label="Duotone" />
        </div>
      </div>

      {/* Displacement */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 180, fontSize: 14, fontFamily: "monospace", color: "#fbbf24", textAlign: "right" }}>
          displacement (wave)
        </div>
        <div style={{ filter: "url(#displacement)" }}>
          <TestCard label="Displacement" />
        </div>
      </div>

      {/* Vignette (CSS radial gradient overlay) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 180, fontSize: 14, fontFamily: "monospace", color: "#4ade80", textAlign: "right" }}>
          vignette (CSS)
        </div>
        <div style={{ position: "relative" }}>
          <TestCard label="Vignette" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 12,
              background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${intensity * 0.8}) 100%)`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
