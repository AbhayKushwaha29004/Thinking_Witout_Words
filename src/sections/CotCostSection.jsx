import { useState, useEffect, useRef } from 'react';
import { COT_COST_DATA } from '../data/bdh_data.js';
import FloatingCard from '../components/FloatingCard.jsx';
import AnimatedCounter from '../components/AnimatedCounter.jsx';

const COT_TOKENS = [
  "Let me think step by step.",
  "First, I need to understand the problem.",
  "The input has 3 rows and 3 columns.",
  "Looking at row 1: [1, 2, 3] — increases by 1.",
  "Looking at row 2: [2, 3, ?] — same pattern?",
  "If pattern holds, ? = 4.",
  "But wait — let me check column patterns too.",
  "Column 1: [1, 2, 3] — increases by 1. ✓",
  "Column 2: [2, 3, 4] — increases by 1. ✓",
  "Column 3: [3, ?, 5] — increases by 1.",
  "So ? = 4. Let me verify diagonals.",
  "Main diagonal: [1, 3, 5] — increases by 2. ✓",
  "Anti-diagonal: [3, 3, 3] — constant. ✓",
  "All patterns consistent. Answer: 4.",
];

export default function CotCostSection() {
  const [difficulty, setDifficulty] = useState(3);
  const [visibleTokens, setVisibleTokens] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const streamRef   = useRef(null);

  const data         = COT_COST_DATA[difficulty - 1];
  const tokenCount   = data.cotTokens;
  const displayTokens = COT_TOKENS.slice(0, Math.min(Math.ceil(tokenCount / 35), COT_TOKENS.length));
  const costPerTask  = (tokenCount * 0.000015).toFixed(5);

  useEffect(() => { startAnimation(); return () => clearInterval(intervalRef.current); }, [difficulty]); // eslint-disable-line

  function startAnimation() {
    clearInterval(intervalRef.current);
    setVisibleTokens([]);
    setIsPlaying(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      setVisibleTokens(prev => [...prev, displayTokens[i]]);
      i++;
      if (i >= displayTokens.length) { clearInterval(intervalRef.current); setIsPlaying(false); }
    }, 300 - difficulty * 28);
  }

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [visibleTokens]);

  return (
    <section className="section fade-in" id="cot-cost" aria-labelledby="cot-title">
      <div className="section-header">
        <div className="section-number">§ 01</div>
        <h2 className="section-title" id="cot-title">The Problem: Thinking Is Expensive</h2>
        <p className="section-desc">
          Chain-of-Thought makes models smarter — but every reasoning token costs the same as
          an output token. Watch costs explode as difficulty rises.
        </p>
      </div>

      <div className="two-col-grid">
        {/* LEFT — controls */}
        <FloatingCard className="fade-in">
          <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'1.5rem', color:'var(--text)', fontSize:'1.05rem' }}>
            Reasoning Problem Difficulty
          </h3>

          <div className="control-group">
            <label className="control-label" htmlFor="difficulty-slider">
              <span>Difficulty</span>
              <span className="control-value">{data.label}</span>
            </label>
            <input id="difficulty-slider" type="range" min="1" max="5" value={difficulty}
              onChange={e => setDifficulty(Number(e.target.value))}
              aria-label="Reasoning problem difficulty" />
          </div>

          {/* Animated stat cards */}
          <div className="stats-row" style={{ marginTop:'1.5rem' }}>
            <div className="stat-card" style={{ background:'rgba(124,58,237,0.08)', borderColor:'rgba(124,58,237,0.2)' }}>
              <div className="stat-value purple">
                <AnimatedCounter key={tokenCount} target={tokenCount} duration={600} />
              </div>
              <div className="stat-label">Reasoning tokens</div>
            </div>
            <div className="stat-card" style={{ background:'rgba(236,72,153,0.08)', borderColor:'rgba(236,72,153,0.2)' }}>
              <div className="stat-value pink">
                $<AnimatedCounter key={costPerTask} target={parseFloat(costPerTask)} decimals={5} duration={600} />
              </div>
              <div className="stat-label">Cost per call</div>
            </div>
          </div>

          {/* Zero-token BDH comparison */}
          <div style={{ marginTop:'1.25rem', padding:'1rem', borderRadius:10,
            background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.06))',
            border:'1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>CoT model</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem', color:'var(--pink)', fontWeight:700 }}>
                {tokenCount} tokens
              </span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>BDH-CQ</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem', color:'var(--green)', fontWeight:700 }}>
                0 tokens 🏆
              </span>
            </div>
          </div>

          <button className="btn btn-primary"
            onClick={startAnimation}
            style={{ marginTop:'1.25rem', width:'100%', justifyContent:'center' }}
            aria-label="Replay token animation">
            {isPlaying ? '⏳ Generating...' : '↺ Replay Animation'}
          </button>
        </FloatingCard>

        {/* RIGHT — token stream */}
        <div className="glass-card fade-in">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', color:'var(--text)', fontSize:'1rem', fontWeight:600 }}>
              CoT Token Stream
            </h3>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {isPlaying && (
                <div style={{ display:'flex', gap:3 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width:4, height:4, borderRadius:'50%',
                      background:'var(--primary-light)',
                      animation:`dotBounce 0.9s ease-in-out ${i*0.2}s infinite`,
                    }} />
                  ))}
                </div>
              )}
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-muted)',
                padding:'2px 8px', borderRadius:100, background:'rgba(124,58,237,0.08)',
                border:'1px solid rgba(124,58,237,0.12)' }}>
                {visibleTokens.length}/{displayTokens.length} steps
              </span>
            </div>
          </div>

          <div ref={streamRef} className="token-stream"
            style={{ maxHeight:280, overflowY:'auto', flexDirection:'column', alignItems:'flex-start' }}
            aria-live="polite">
            {visibleTokens.map((tok, i) => (
              <div key={i} className="token thinking"
                style={{ animationDelay:`${i*0.04}s`, width:'100%', lineHeight:1.6 }}>
                {tok}
              </div>
            ))}
            {isPlaying && <div className="token thinking" style={{ opacity:0.5 }}>▌</div>}
          </div>

          <div style={{ marginTop:'1rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--text-muted)' }}>Answer:</span>
            <span className="token output"
              style={{ opacity:visibleTokens.length>=displayTokens.length ? 1 : 0.15,
                transition:'opacity 0.4s ease', fontSize:'0.9rem', fontWeight:600 }}>
              4
            </span>
            {visibleTokens.length >= displayTokens.length && (
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontStyle:'italic' }}>
                — after {tokenCount} tokens of reasoning
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Animated cost bar chart */}
      <div className="glass-card fade-in" style={{ marginTop:'2rem' }}>
        <h3 style={{ fontFamily:'var(--font-heading)', marginBottom:'1.5rem', fontSize:'1rem', color:'var(--text)', fontWeight:600 }}>
          Reasoning Tokens vs. Difficulty
        </h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
          {COT_COST_DATA.map((d, i) => {
            const isActive = i === difficulty - 1;
            const pct      = (d.cotTokens / 480) * 100;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer' }}
                onClick={() => setDifficulty(i+1)}>
                <span style={{ width:72, fontFamily:'var(--font-mono)', fontSize:'0.72rem',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)', flexShrink:0,
                  fontWeight: isActive ? 600 : 400, transition:'color 0.2s' }}>
                  {d.label}
                </span>
                <div style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:6,
                  height:22, overflow:'hidden', border:`1px solid ${isActive?'rgba(124,58,237,0.3)':'rgba(124,58,237,0.08)'}`,
                  transition:'border-color 0.3s' }}>
                  <div style={{
                    height:'100%', width:`${pct}%`,
                    background: isActive
                      ? 'linear-gradient(90deg,var(--primary),var(--pink))'
                      : 'linear-gradient(90deg,rgba(124,58,237,0.4),rgba(6,182,212,0.4))',
                    borderRadius:6,
                    transition:'width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.3s ease',
                    boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
                    display:'flex', alignItems:'center', paddingLeft:8,
                  }}>
                    {isActive && <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem',
                      color:'rgba(255,255,255,0.9)', fontWeight:600, whiteSpace:'nowrap' }}>
                      ← {d.cotTokens} tokens
                    </span>}
                  </div>
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem',
                  color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                  width:36, textAlign:'right', fontWeight: isActive ? 700 : 400 }}>
                  {d.cotTokens}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:'1.25rem', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
          <div style={{ flex:1, padding:'0.9rem', background:'rgba(236,72,153,0.07)',
            borderRadius:10, border:'1px solid rgba(236,72,153,0.15)', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>CoT (very hard)</div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.4rem', fontWeight:800, color:'var(--pink)' }}>480 tokens</div>
          </div>
          <div style={{ flex:1, padding:'0.9rem', background:'rgba(16,185,129,0.07)',
            borderRadius:10, border:'1px solid rgba(16,185,129,0.15)', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>BDH-CQ</div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.4rem', fontWeight:800, color:'var(--green)' }}>0 tokens</div>
          </div>
        </div>
      </div>
    </section>
  );
}
