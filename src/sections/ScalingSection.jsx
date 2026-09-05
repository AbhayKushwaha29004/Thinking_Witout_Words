import { useState, useEffect, useRef } from 'react';
import { SCALING_DATA } from '../data/bdh_data.js';

export default function ScalingSection() {
  const svgRef = useRef(null);
  const [activeMode, setActiveMode] = useState('both');
  const [tooltip, setTooltip] = useState(null);

  const width = 580;
  const height = 340;
  const pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  // Scale: cost 0..0.07, accuracy 0..0.4
  const maxCost = 0.07;
  const maxAcc = 0.4;

  function cx(cost) { return pad.left + (cost / maxCost) * innerW; }
  function cy(acc) { return pad.top + (1 - acc / maxAcc) * innerH; }

  const tokenData = SCALING_DATA.tokenScaling;
  const latentData = SCALING_DATA.latentScaling;

  function makePath(data) {
    return data.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${cx(d.cost)} ${cy(d.accuracy)}`
    ).join(' ');
  }

  return (
    <section className="section fade-in" id="scaling" aria-labelledby="scaling-title">
      <div className="section-header">
        <div className="section-number">§ 03</div>
        <h2 className="section-title" id="scaling-title">Inference-Time Scaling</h2>
        <p className="section-desc">
          Two ways to "think harder": generate more reasoning tokens, or run more latent iterations.
          The chart below shows accuracy vs. cost for each approach.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}
           className="two-col-grid">
        <div className="glass-card fade-in" style={{ overflow: 'hidden' }}>
          {/* Toggle */}
          <div className="btn-group" style={{ marginBottom: '1.5rem' }} role="group" aria-label="Scaling mode selection">
            {['tokens', 'latent', 'both'].map(mode => (
              <button
                key={mode}
                className={`btn ${activeMode === mode ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.8rem' }}
                onClick={() => setActiveMode(mode)}
                aria-pressed={activeMode === mode}
              >
                {mode === 'tokens' ? '📝 Token Scaling' : mode === 'latent' ? '🧠 Latent Scaling' : '⚖️ Compare Both'}
              </button>
            ))}
          </div>

          <div className="chart-container" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              style={{ width: '100%', height: 'auto' }}
              aria-label="Inference-time scaling chart: accuracy vs cost"
            >
              {/* Grid */}
              {[0, 0.1, 0.2, 0.3, 0.4].map(v => (
                <g key={v}>
                  <line x1={pad.left} y1={cy(v)} x2={pad.left + innerW} y2={cy(v)}
                    stroke="rgba(124,58,237,0.1)" strokeWidth="1" />
                  <text x={pad.left - 8} y={cy(v) + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end">
                    {Math.round(v * 100)}%
                  </text>
                </g>
              ))}
              {[0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07].map(v => (
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
                Accuracy →
              </text>

              {/* Token scaling path */}
              {(activeMode === 'tokens' || activeMode === 'both') && (
                <>
                  <path d={makePath(tokenData)} fill="none" stroke="var(--pink)" strokeWidth="2.5" strokeDasharray="6,3" />
                  {tokenData.map((d, i) => (
                    <circle key={i} cx={cx(d.cost)} cy={cy(d.accuracy)} r="5"
                      fill="var(--pink)" opacity="0.8"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, data: d, type: 'token' })}
                      onMouseLeave={() => setTooltip(null)}
                      aria-label={`Token scaling: ${d.steps} steps, ${Math.round(d.accuracy * 100)}% accuracy, $${d.cost}`}
                    />
                  ))}
                </>
              )}

              {/* Latent scaling path */}
              {(activeMode === 'latent' || activeMode === 'both') && (
                <>
                  <path d={makePath(latentData)} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  {latentData.map((d, i) => (
                    <circle key={i} cx={cx(d.cost)} cy={cy(d.accuracy)} r="6"
                      fill="var(--accent)" opacity="0.9"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, data: d, type: 'latent' })}
                      onMouseLeave={() => setTooltip(null)}
                      aria-label={`Latent scaling: ${d.steps} steps, ${Math.round(d.accuracy * 100)}% accuracy, $${d.cost}`}
                    />
                  ))}
                  {/* BDH-CQ label on highest point */}
                  <text x={cx(latentData[2].cost) + 8} y={cy(latentData[2].accuracy) - 8}
                    fill="var(--accent-light)" fontSize="11" fontWeight="600">
                    BDH-CQ high
                  </text>
                </>
              )}

              {/* Pareto frontier arrow */}
              {activeMode === 'both' && (
                <text x={cx(0.001)} y={cy(0.37)} fill="var(--primary-light)" fontSize="11" opacity="0.7">
                  ← Pareto frontier
                </text>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 24, height: 2, background: 'var(--pink)', borderRadius: 2, borderTop: '2px dashed var(--pink)' }} />
              Token scaling (CoT)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 24, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
              Latent scaling (BDH-CQ)
            </div>
          </div>

          <div className="callout info" style={{ marginTop: '1.5rem' }}>
            <strong>Evidence note:</strong> BDH-CQ data points are from the developer-reported
            technical report (low/medium/high effort). Token scaling data is illustrative,
            derived from published CoT benchmarks.
          </div>
        </div>

        {/* Right: insight cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 200 }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-light)' }}>10×</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>cheaper per task<br/>vs. Claude 3.5</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary-light)' }}>3</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>compute effort<br/>levels in BDH-CQ</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--pink)' }}>~</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>token scaling<br/>plateaus faster</div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="chart-tooltip" style={{
          position: 'fixed', left: tooltip.x + 10, top: tooltip.y - 40,
          pointerEvents: 'none', zIndex: 200,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div style={{ color: tooltip.type === 'latent' ? 'var(--accent-light)' : 'var(--pink)', fontWeight: 600 }}>
              {tooltip.type === 'latent' ? 'Latent' : 'Token'} scaling
            </div>
            <div>Steps: {tooltip.data.steps}</div>
            <div>Accuracy: {Math.round(tooltip.data.accuracy * 100)}%</div>
            <div>Cost: ${tooltip.data.cost}</div>
          </div>
        </div>
      )}
    </section>
  );
}
