import { Effect } from '@remotion-reloaded/effects';
import { useGSAP } from '@remotion-reloaded/gsap';

export const LogoReveal = () => {
  const { scopeRef } = useGSAP((timeline) => {
    timeline
      .from('.logo', { y: 64, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .from('.tagline', { y: 20, opacity: 0, duration: 0.45 }, '-=0.3');
  });

  return (
    <div
      ref={scopeRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 20% 20%, #1e3a8a 0%, #020617 60%)',
        color: '#e2e8f0',
      }}
    >
      <Effect type="glow" color="#60a5fa" radius={14}>
        <h1 className="logo" style={{ fontSize: 140, margin: 0, letterSpacing: '0.04em' }}>
          RELOADED
        </h1>
      </Effect>
      <p className="tagline" style={{ marginTop: 20, fontSize: 30, opacity: 0.9 }}>
        cinematic motion primitives for Remotion
      </p>
    </div>
  );
};
