import { useState } from 'react';
import { ARC_RESULTS } from '../data/bdh_data.js';

export default function ParetoSection() {
  const [tooltip, setTooltip] = useState(null);
  const [filter, setFilter] = useState('all');

  const width = 560;
  const height = 360;
  const pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxCost = 0.2;
  const maxAcc = 0.7;

  function cx(cost) { return pad.left + (cost / maxCost) * innerW; }
  function cy(acc) { return pad.top + (1 - acc / maxAcc) * innerH; }

  const typeColors = {
    latent: '#06b6d4',
    cot: '#ec4899',
    tta: '#f59e0b',
    programmatic: '#10b981',
  };

  const typeLabels = {
    latent: 'Latent (BDH-CQ)',
    cot: 'Chain-of-Thought',
    tta: 'Test-Time Adaptation',
    programmatic: 'Programmatic',
  };

  const filtered = filter === 'all' ? ARC_RESULTS : ARC_RESULTS.filter(r => r.type === filter);

  return (
    <section className="section fade-in" id="pareto" aria-labelledby="pareto-title">
      <div className="section-header">
        <div className="section-number">§ 05</div>
        <h2 className="section-title" id="pareto-title">The Cost–Accuracy Frontier</h2>
        <p className="section-desc">
          A system lies on the Pareto frontier when no alternative is both cheaper and more accurate.
          BDH-CQ shifts this frontier for ARC-AGI-1.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}
           className="two-col-grid">
        <div className="glass-card fade-in" style={{ overflow: 'hidden' }}>
          {/* Filter */}
          <div className="btn-group" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}
               role="group" aria-label="Filter by model type">
            {['all', 'latent', 'cot', 'tta', 'programmatic'].map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f === 'all' ? 'All Models' : typeLabels[f]}
              </button>
            ))}
          </div>

          <div className="chart-container" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}
              aria-label="Cost-accuracy Pareto frontier chart for ARC-AGI-1">
              <defs>
                <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="rgba(124,58,237,0.4)" />
                </marker>
              </defs>

              {/* Grid */}
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map(v => (
                <g key={v}>
                  <line x1={pad.left} y1={cy(v)} x2={pad.left + innerW} y2={cy(v)}
                    stroke="rgba(124,58,237,0.1)" strokeWidth="1" />
                  <text x={pad.left - 8} y={cy(v) + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">
                    {Math.round(v * 100)}%
                  </text>
                </g>
              ))}
              {[0, 0.05, 0.10, 0.15, 0.20].map(v => (
                <g key={v}>
                  <line x1={cx(v)} y1={pad.top} x2={cx(v)} y2={pad.top + innerH}
                    stroke="rgba(124,58,237,0.1)" strokeWidth="1" />
                  <text x={cx(v)} y={pad.top + innerH + 18} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                    ${v.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Axis labels */}
              <text x={pad.left + innerW / 2} y={height - 4} fill="var(--text-secondary)" fontSize="12" textAnchor="middle">
                Cost per Task →
              </text>
              <text x={12} y={pad.top + innerH / 2} fill="var(--text-secondary)" fontSize="12" textAnchor="middle"
                transform={`rotate(-90, 12, ${pad.top + innerH / 2})`}>
                ARC-AGI-1 Accuracy →
              </text>

              {/* Pareto frontier line */}
              {filter === 'all' && (
                <path
                  d={`M ${cx(0.00007)} ${cy(0.182)} L ${cx(0.00035)} ${cy(0.250)} L ${cx(0.00070)} ${cy(0.295)} L ${cx(0.05)} ${cy(0.422)} L ${cx(0.15)} ${cy(0.620)}`}
                  fill="none" stroke="rgba(124,58,237,0.25)" strokeWidth="1.5" strokeDasharray="6,3"
                />
              )}

              {/* Data points */}
              {filtered.map((r, i) => {
                const color = typeColors[r.type];
                const x = cx(r.costPerTask);
                const y = cy(r.accuracy);
                return (
                  <g key={i}>
                    {r.highlight && (
                      <circle cx={x} cy={y} r="18" fill={color} opacity="0.1" />
                    )}
                    <circle
                      cx={x} cy={y} r={r.highlight ? 8 : 6}
                      fill={color}
                      opacity={r.highlight ? 1 : 0.7}
                      style={{ cursor: 'pointer', filter: r.highlight ? `drop-shadow(0 0 6px ${color})` : 'none' }}
                      onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, r })}
                      onMouseLeave={() => setTooltip(null)}
                      aria-label={`${r.model}: ${Math.round(r.accuracy * 100)}% accuracy, $${r.costPerTask}/task`}
                    />
                    {r.highlight && (
                      <text x={x + 12} y={y - 8} fill={color} fontSize="10" fontWeight="600">
                        {r.model.replace('BDH-CQ', '').trim()}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                {typeLabels[type]}
              </div>
            ))}
          </div>

          <div className="callout warning" style={{ marginTop: '1rem' }}>
            <strong>Note:</strong> All values are developer-reported or from public benchmarks.
            Not all systems were evaluated under identical conditions. See sources in README.
          </div>
        </div>

        {/* Right: insight */}
        <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '0.5rem' }}>
              Intelligence per Dollar
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              BDH-CQ: <strong style={{ color: 'var(--accent-light)' }}>421 accuracy pts / $</strong><br />
              Claude 3.5: ~26 accuracy pts / $
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--pink)', marginBottom: '0.5rem' }}>
              Key Limitation
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              29.5% means 70.5% of ARC puzzles are still unsolved. Latent reasoning alone is not enough.
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="chart-tooltip" style={{
          position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 50,
          pointerEvents: 'none', zIndex: 200,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div style={{ color: typeColors[tooltip.r.type], fontWeight: 600, marginBottom: '0.25rem' }}>
              {tooltip.r.model}
            </div>
            <div>Accuracy: {Math.round(tooltip.r.accuracy * 100)}%</div>
            <div>Cost: ${tooltip.r.costPerTask}/task</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem', maxWidth: 180 }}>
              {tooltip.r.source}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
