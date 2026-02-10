import { EffectPreset } from '@remotion-reloaded/effects';
import { useGSAP } from '@remotion-reloaded/gsap';
import { interpolate, useCurrentFrame } from 'remotion';

export const DataCounter = ({ from = 1200, to = 98240 }: { from?: number; to?: number }) => {
  const frame = useCurrentFrame();
  const value = Math.round(
    interpolate(frame, [0, 150], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  const { scopeRef } = useGSAP((timeline) => {
    timeline
      .from('.counter-label', { y: 18, opacity: 0, duration: 0.45 })
      .from('.counter-value', { y: 26, opacity: 0, duration: 0.65, ease: 'power3.out' }, '-=0.2');
  });

  return (
    <EffectPreset name="cinematic" intensity={0.75}>
      <div
        ref={scopeRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="counter-label" style={{ fontSize: 28, opacity: 0.85 }}>
            Quarterly active users
          </div>
          <div className="counter-value" style={{ fontSize: 110, fontWeight: 700, marginTop: 10 }}>
            {value.toLocaleString()}
          </div>
        </div>
      </div>
    </EffectPreset>
  );
};
