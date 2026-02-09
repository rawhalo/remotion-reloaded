/**
 * Spike 0.2 — Test 1: CSS filter coverage
 *
 * Tests which planned effects can be achieved with CSS filter().
 * Each row shows the effect applied to a test card.
 *
 * CSS filter functions available:
 * blur(), brightness(), contrast(), drop-shadow(), grayscale(),
 * hue-rotate(), invert(), opacity(), saturate(), sepia()
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

interface EffectDemoProps {
  name: string;
  filter: string;
  status: "works" | "partial" | "impossible";
}

const EffectDemo: React.FC<EffectDemoProps> = ({ name, filter, status }) => {
  const statusColor = {
    works: "#4ade80",
    partial: "#fbbf24",
    impossible: "#ef4444",
  }[status];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <div
        style={{
          width: 140,
          fontSize: 14,
          fontFamily: "monospace",
          color: statusColor,
          textAlign: "right",
        }}
      >
        {name}
      </div>
      <div style={{ filter }}>
        <TestCard label={name} />
      </div>
      <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace", width: 300 }}>
        {filter || "(no filter)"}
      </div>
    </div>
  );
};

export const CSSFilterTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate intensity from 0 to 1 over 2 seconds
  const intensity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const effects: EffectDemoProps[] = [
    {
      name: "blur",
      filter: `blur(${intensity * 10}px)`,
      status: "works",
    },
    {
      name: "glow",
      filter: `drop-shadow(0 0 ${intensity * 20}px rgba(233, 69, 96, 0.8)) drop-shadow(0 0 ${intensity * 40}px rgba(233, 69, 96, 0.4))`,
      status: "works",
    },
    {
      name: "sepia",
      filter: `sepia(${intensity})`,
      status: "works",
    },
    {
      name: "blackAndWhite",
      filter: `grayscale(${intensity})`,
      status: "works",
    },
    {
      name: "hueSaturation",
      filter: `hue-rotate(${intensity * 180}deg) saturate(${1 + intensity * 2}) brightness(${1 + intensity * 0.2})`,
      status: "works",
    },
    {
      name: "contrast",
      filter: `contrast(${1 + intensity})`,
      status: "works",
    },
    {
      name: "invert",
      filter: `invert(${intensity})`,
      status: "works",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a23",
        padding: 40,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ color: "#fff", fontSize: 20, marginBottom: 20, fontFamily: "monospace" }}>
        CSS filter() coverage — intensity: {(intensity * 100).toFixed(0)}% — frame {frame}
      </div>

      {effects.map((effect) => (
        <EffectDemo key={effect.name} {...effect} />
      ))}
    </AbsoluteFill>
  );
};
