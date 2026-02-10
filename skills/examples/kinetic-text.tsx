import { Effect } from '@remotion-reloaded/effects';
import {
  GSAPFrom,
  GSAPSequence,
  GSAPTimeline,
  GSAPTo,
} from '@remotion-reloaded/gsap';

export const KineticText = ({ text = 'Design in Motion' }: { text?: string }) => {
  const words = text.split(' ').filter(Boolean);

  return (
    <GSAPTimeline
      className="kinetic-root"
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: '#020617',
      }}
    >
      <GSAPFrom target=".kinetic-word" duration={0.55} stagger={0.08} vars={{ y: 36, opacity: 0 }} />
      <GSAPSequence position="+=0.2">
        <GSAPTo target=".kinetic-word" duration={0.4} vars={{ letterSpacing: '0.12em' }} />
        <GSAPTo target=".kinetic-word" duration={0.3} vars={{ letterSpacing: '0.08em' }} />
      </GSAPSequence>

      <Effect type="contrast" amount={1.2}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="kinetic-word"
              style={{ color: '#f8fafc', fontSize: 78, fontWeight: 700 }}
            >
              {word}
            </span>
          ))}
        </div>
      </Effect>
    </GSAPTimeline>
  );
};
