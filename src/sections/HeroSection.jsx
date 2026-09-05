import { useEffect, useRef } from 'react';
import BrainCanvas3D from '../components/BrainCanvas3D.jsx';

export default function HeroSection({ onScrollToDemo }) {
  const statsRef = useRef(null);

  // Animate stat numbers counting up
  useEffect(() => {
    const counters = statsRef.current?.querySelectorAll('[data-target]');
    if (!counters) return;
    counters.forEach(el => {
      const target = parseFloat(el.dataset.target);
      const isDecimal = el.dataset.decimal === 'true';
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = prefix + (isDecimal ? start.toFixed(4) : Math.floor(start)) + suffix;
      }, 20);
    });
  }, []);

  return (
    <section className="hero" id="hero" aria-label="Introduction">
      {/* Animated grid lines backdrop */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
      }} />

      {/* Top badge */}
      <div className="hero-badge">
        <span className="dot" aria-hidden="true" />
        DataForge 2026 × Pathway × NeurIPS Education Track
      </div>

      {/* Main title */}
      <h1>
        Thinking<br />
        Without Words
      </h1>

      <p className="hero-subtitle">
        How AI models reason by refining hidden states —
        no chain-of-thought, no wasted tokens. A deep-dive into latent reasoning with BDH-CQ.
      </p>

      {/* One-sentence claim */}
      <div className="hero-claim" role="note" aria-label="Central falsifiable claim">
        <span className="label">The One Falsifiable Claim</span>
        <p>
          "A model can solve novel reasoning tasks by iteratively refining a hidden state rather
          than generating a verbal chain of thought — more latent iterations improve accuracy up
          to a point, but some problems resist latent reasoning entirely."
        </p>
      </div>

      {/* 3D Brain — the star of the show */}
      <div style={{
        width: '100%', maxWidth: 520,
        margin: '0 auto 2.5rem',
        filter: 'drop-shadow(0 0 60px rgba(124,58,237,0.3))',
      }}>
        <BrainCanvas3D iterations={10} />
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
        <button className="btn btn-primary" onClick={onScrollToDemo}
          style={{ padding: '0.85rem 2rem', fontSize: '0.9rem' }}
          aria-label="Jump to interactive demo">
          ▶ Try the Interactive Demo
        </button>
        <a className="btn" href="#bdh"
          style={{ padding: '0.85rem 2rem', fontSize: '0.9rem' }}
          aria-label="Read BDH-CQ case study">
          🧠 BDH-CQ Case Study
        </a>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="stats-row" style={{ maxWidth: 720, width: '100%', marginBottom: '4rem' }}>
        <div className="stat-card">
          <div className="stat-value cyan"
            data-target="29.5" data-decimal="true" data-suffix="%">0%</div>
          <div className="stat-label">BDH-CQ on ARC-AGI-1</div>
        </div>
        <div className="stat-card">
          <div className="stat-value purple"
            data-target="0.0007" data-decimal="true" data-prefix="$">$0</div>
          <div className="stat-label">Cost per task (high effort)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">0</div>
          <div className="stat-label">CoT tokens needed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value pink"
            data-target="10" data-suffix="×">0×</div>
          <div className="stat-label">Cheaper than Claude 3.5</div>
        </div>
      </div>

      {/* Audience + prereqs pill row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
        {[
          { label: 'Audience', value: 'CS undergrads & data scientists' },
          { label: 'Prereqs', value: 'Basic neural networks + attention' },
          { label: 'Topic', value: 'Alternatives to Chain-of-Thought' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.45rem 1rem', borderRadius: 100,
            background: 'rgba(13,13,31,0.6)',
            border: '1px solid rgba(124,58,237,0.12)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.78rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
            <span style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Section nav preview */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
        {[
          { n: '01', label: 'The Problem', href: '#cot-cost' },
          { n: '02', label: 'Live Demo', href: '#demo' },
          { n: '03', label: 'Scaling', href: '#scaling' },
          { n: '04', label: 'BDH-CQ', href: '#bdh' },
          { n: '05', label: 'Frontier', href: '#pareto' },
          { n: '06', label: 'Limits', href: '#limits' },
        ].map(s => (
          <a key={s.n} href={s.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.8rem', borderRadius: 100,
            background: 'rgba(6,182,212,0.05)',
            border: '1px solid rgba(6,182,212,0.1)',
            fontSize: '0.72rem', color: 'var(--text-muted)',
            transition: 'var(--transition)', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.1)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.65rem' }}>{s.n}</span>
            {s.label}
          </a>
        ))}
      </div>

      <div className="scroll-indicator" aria-hidden="true">
        <span>Scroll to explore</span>
        <div className="arrow" />
      </div>
    </section>
  );
}
