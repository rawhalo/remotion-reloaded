import { useGSAP } from "@remotion-reloaded/gsap";
import { Effect } from "@remotion-reloaded/effects";

export const LogoReveal = () => {
  const { scopeRef } = useGSAP((timeline) => {
    timeline.from(".logo", {
      y: 56,
      opacity: 0,
      scale: 0.86,
      duration: 1,
      ease: "power3.out",
    });

    timeline.from(
      ".tagline",
      {
        y: 22,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      },
      "-=0.45",
    );
  });

  return (
    <div
      ref={scopeRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 30% 20%, #1d4ed8 0%, #030712 58%)",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      }}
    >
      <Effect type="glow" radius={16} color="rgba(96, 165, 250, 0.85)">
        <h1
          className="logo"
          style={{
            margin: 0,
            fontSize: 138,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Reloaded
        </h1>
      </Effect>
      <p
        className="tagline"
        style={{
          marginTop: 22,
          fontSize: 30,
          opacity: 0.9,
        }}
      >
        Advanced motion design tools for Remotion
      </p>
    </div>
  );
};
