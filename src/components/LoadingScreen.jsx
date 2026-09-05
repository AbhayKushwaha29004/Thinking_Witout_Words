import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState(0); // 0=loading 1=reveal 2=done
  const [text, setText]         = useState('Initialising neural network...');

  const MESSAGES = [
    'Initialising neural network...',
    'Loading 3D renderer...',
    'Compiling recurrent model...',
    'Preparing interactive demos...',
    'Ready.',
  ];

  useEffect(() => {
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) { p = 100; clearInterval(timer); }
      setProgress(p);
      const idx = Math.min(Math.floor((p / 100) * (MESSAGES.length - 1)), MESSAGES.length - 1);
      setText(MESSAGES[idx]);
    }, 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => { setPhase(2); onComplete?.(); }, 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [progress, onComplete]);

  if (phase === 2) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-deep)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '2rem',
      opacity: phase === 1 ? 0 : 1,
      transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: phase === 1 ? 'none' : 'all',
    }}
      aria-label="Loading screen" role="status"
    >
      {/* Logo mark */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
        border: '1px solid rgba(124,58,237,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
        boxShadow: '0 0 40px rgba(124,58,237,0.3)',
        animation: 'pulse-ring 2s ease-in-out infinite',
      }}>
        🧠
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800,
          fontSize: 'clamp(1.4rem, 4vw, 2rem)',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #fff, var(--primary-light), var(--accent-light))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '0.4rem',
        }}>
          Thinking Without Words
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          DataForge 2026 × Pathway Track
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: 280 }}>
        <div style={{ height: 3, background: 'rgba(124,58,237,0.15)',
          borderRadius: 2, overflow: 'hidden', marginBottom: '0.75rem' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            transition: 'width 0.15s ease',
            boxShadow: '0 0 12px var(--primary-glow)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>{text}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 40px rgba(124,58,237,0.3); }
          50%       { box-shadow: 0 0 70px rgba(124,58,237,0.5), 0 0 120px rgba(124,58,237,0.15); }
        }
      `}</style>
    </div>
  );
}
