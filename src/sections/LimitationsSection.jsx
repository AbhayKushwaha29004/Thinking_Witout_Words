import { useState } from 'react';
import { runLatentModel, PUZZLES, COLOR_PALETTE } from '../utils/latentModel.js';

const HARD_PUZZLE = {
  id: 99,
  name: "Symbolic Rule",
  description: "This puzzle requires explicit symbolic counting — something latent refinement struggles with regardless of iteration count.",
  inputGrid: [1, 1, 1,  2, 2, -1, 3, -1, 3],
  targetGrid: [1, 1, 1,  2, 2, 2,  3, 3, 3],
  mask:       [0, 0, 0,  0, 0, 1,  0, 1, 0],
  difficulty: "hard",
  isSymbolic: true,
};

function MiniGrid({ grid, mask, label, isTarget = false }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 4, background: 'rgba(124,58,237,0.1)', borderRadius: 8 }}>
        {grid.map((val, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: 4,
            background: val >= 0 ? COLOR_PALETTE[Math.min(val, 7)] : 'rgba(255,255,255,0.05)',
            border: mask?.[i] ? `2px solid ${isTarget ? 'var(--green)' : 'var(--red)'}` : '2px solid transparent',
            opacity: val < 0 ? 0.15 : 1,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  );
}

export default function LimitationsSection() {
  const [iter, setIter] = useState(1);

  const hardResult = runLatentModel(HARD_PUZZLE, iter);
  const easyResult = runLatentModel(PUZZLES[0], iter);

  const limits = [
    {
      icon: '🔢',
      title: 'Symbolic Counting',
      desc: 'Problems requiring explicit counting or arithmetic are hard to solve via state refinement alone.',
      severity: 'high',
    },
    {
      icon: '🔗',
      title: 'Long Dependency Chains',
      desc: 'When the answer depends on many steps of chained deduction, latent state capacity becomes a bottleneck.',
      severity: 'high',
    },
    {
      icon: '📏',
      title: 'Fixed State Capacity',
      desc: 'The hidden state has fixed dimension — storing more information degrades retrieval accuracy (interference).',
      severity: 'medium',
    },
    {
      icon: '🔍',
      title: 'Observability',
      desc: 'You cannot read a latent model\'s "thinking" the way you read CoT. Debugging is harder.',
      severity: 'medium',
    },
    {
      icon: '📊',
      title: '70.5% Failure Rate',
      desc: 'On ARC-AGI-1, BDH-CQ (high effort) still fails on 70.5% of tasks. Most abstract patterns remain unsolved.',
      severity: 'high',
    },
    {
      icon: '🔬',
      title: 'Developer-Reported Only',
      desc: 'All BDH-CQ results are from Pathway\'s own technical report. No independent reproduction at time of writing.',
      severity: 'medium',
    },
  ];

  return (
    <section className="section fade-in" id="limits" aria-labelledby="limits-title">
      <div className="section-header">
        <div className="section-number">§ 06</div>
        <h2 className="section-title" id="limits-title">Limitations & Failure Cases</h2>
        <p className="section-desc">
          Latent reasoning isn't magic. Here's where it breaks — and what that tells us about
          the limits of implicit computation.
        </p>
      </div>

      {/* Interactive failure demo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="two-col-grid">
        <div className="glass-card fade-in">
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Easy Pattern — Latent Reasoning Succeeds
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {PUZZLES[0].description}
          </p>
          <div className="control-group">
            <label className="control-label" htmlFor="limits-iter">
              <span>Iterations</span>
              <span className="control-value">{iter}</span>
            </label>
            <input id="limits-iter" type="range" min="1" max="20" value={iter}
              onChange={e => setIter(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <MiniGrid grid={PUZZLES[0].inputGrid} label="Input" />
            <MiniGrid grid={easyResult.predictions} mask={PUZZLES[0].mask} label="Model" />
            <MiniGrid grid={PUZZLES[0].targetGrid} mask={PUZZLES[0].mask} label="Truth" isTarget />
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span className={`accuracy-badge ${easyResult.accuracy >= 0.8 ? 'high' : easyResult.accuracy >= 0.4 ? 'mid' : 'low'}`}>
              ✓ {Math.round(easyResult.accuracy * 100)}% correct
            </span>
          </div>
        </div>

        <div className="glass-card fade-in">
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Symbolic Counting — Latent Reasoning Struggles
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {HARD_PUZZLE.description}
          </p>
          <div style={{ padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Same slider: {iter} iterations
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <MiniGrid grid={HARD_PUZZLE.inputGrid} label="Input" />
            <MiniGrid grid={hardResult.predictions} mask={HARD_PUZZLE.mask} label="Model" />
            <MiniGrid grid={HARD_PUZZLE.targetGrid} mask={HARD_PUZZLE.mask} label="Truth" isTarget />
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span className={`accuracy-badge ${hardResult.accuracy >= 0.8 ? 'high' : hardResult.accuracy >= 0.4 ? 'mid' : 'low'}`}>
              {hardResult.accuracy >= 0.8 ? '✓' : '✗'} {Math.round(hardResult.accuracy * 100)}% correct
            </span>
          </div>
        </div>
      </div>

      <div className="callout info" style={{ marginTop: '1.5rem' }}>
        <strong>The key insight:</strong> Notice that dragging the slider doesn't reliably help on
        the symbolic puzzle — more latent iterations cannot substitute for explicit symbolic manipulation.
        This is the fundamental limitation of latent reasoning.
      </div>

      {/* Limitation cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {limits.map((l, i) => (
          <div key={i} className="glass-card fade-in" style={{
            borderColor: l.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'var(--border)',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{l.icon}</div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: '0.5rem',
              color: l.severity === 'high' ? 'var(--red)' : 'var(--yellow)',
            }}>
              {l.title}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{l.desc}</div>
          </div>
        ))}
      </div>

      {/* Papers */}
      <div className="glass-card fade-in" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', color: 'var(--text)', fontSize: '1rem' }}>
          Further Reading — Primary Sources
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { title: 'Dragon Hatchling (BDH)', detail: 'arXiv:2509.26507 — Pathway Research', url: 'https://arxiv.org/abs/2509.26507' },
            { title: 'Training LLMs to Reason in Latent Space (Coconut)', detail: 'Hao et al., 2024 — arXiv:2412.06769', url: 'https://arxiv.org/abs/2412.06769' },
            { title: 'On the Measure of Intelligence (ARC)', detail: 'Chollet, 2019 — arXiv:1911.01547', url: 'https://arxiv.org/abs/1911.01547' },
            { title: 'Using Fast Weights to Attend to the Recent Past', detail: 'Ba et al., 2016 — arXiv:1610.06258', url: 'https://arxiv.org/abs/1610.06258' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.9rem' }}>{p.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.detail}</div>
              </div>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                Read →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
