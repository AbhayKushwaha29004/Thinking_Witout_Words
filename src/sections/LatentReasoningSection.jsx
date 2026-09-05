import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { runLatentModelWithProbs, PUZZLES, COLOR_PALETTE } from '../utils/latentModel.js';

const COLOR_NAMES = ['Dark','Purple','Cyan','Green','Yellow','Pink','Red','White'];
const MAX_ITER = 20;

/* ─────────────────────────────────────────────────────────────
   ANIMATED NEURON GRAPH  (canvas, no Three.js needed here)
───────────────────────────────────────────────────────────── */
function NeuronGraph({ hiddenState, isPlaying }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const hsRef     = useRef(hiddenState);
  const playRef   = useRef(isPlaying);
  useEffect(() => { hsRef.current  = hiddenState; }, [hiddenState]);
  useEffect(() => { playRef.current = isPlaying;  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    let frame  = 0;

    const setup = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    setup();
    window.addEventListener('resize', setup);

    /* 8 input neurons left, 12 hidden right */
    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const neurons = () => {
      const w = W(), h = H();
      const ns = [];
      for (let i = 0; i < 8;  i++) ns.push({ x: w*0.2,  y: h*0.07 + (h*0.86/7)*i,  layer:0 });
      for (let i = 0; i < 12; i++) ns.push({ x: w*0.8,  y: h*0.04 + (h*0.92/11)*i, layer:1 });
      return ns;
    };

    const edges = [];
    for (let i = 0; i < 8; i++) {
      edges.push([i, 8+(i*2)%12], [i, 8+(i*2+1)%12], [i, 8+(i+5)%12]);
    }

    function draw() {
      ctx.clearRect(0, 0, W(), H());
      frame++;
      const ns  = neurons();
      const hs  = hsRef.current || [];
      const mn  = Math.min(...hs), mx = Math.max(...hs);
      const rng = mx - mn || 1;
      const acts = ns.map((_, i) => {
        const idx = Math.floor((i / ns.length) * hs.length);
        return hs[idx] !== undefined ? (hs[idx]-mn)/rng : 0;
      });

      /* edges */
      edges.forEach(([a,b]) => {
        const s = (acts[a]+acts[b])/2;
        const pulse = playRef.current ? 0.5 + 0.5*Math.sin(frame*0.12+a*0.4) : 1;
        ctx.beginPath();
        ctx.moveTo(ns[a].x, ns[a].y);
        ctx.lineTo(ns[b].x, ns[b].y);
        ctx.strokeStyle = `rgba(124,58,237,${(s*0.5*pulse).toFixed(3)})`;
        ctx.lineWidth   = 0.5 + s*1.5;
        ctx.stroke();

        /* travelling pulse dot */
        if (playRef.current && s > 0.3) {
          const t = ((frame*0.012 + a*0.15) % 1);
          const px = ns[a].x + (ns[b].x-ns[a].x)*t;
          const py = ns[a].y + (ns[b].y-ns[a].y)*t;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI*2);
          ctx.fillStyle = `rgba(34,211,238,${(s*0.9).toFixed(2)})`;
          ctx.fill();
        }
      });

      /* neurons */
      ns.forEach((n,i) => {
        const a = acts[i];
        const pulse = playRef.current ? 1 + 0.2*Math.sin(frame*0.15+i*0.6) : 1;
        const r = (3.5 + a*7)*pulse;
        if (a > 0.35) {
          const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*3.5);
          g.addColorStop(0, `rgba(124,58,237,${(a*0.35).toFixed(3)})`);
          g.addColorStop(1, 'rgba(124,58,237,0)');
          ctx.beginPath(); ctx.arc(n.x,n.y,r*3.5,0,Math.PI*2);
          ctx.fillStyle = g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2);
        ctx.fillStyle = n.layer===0
          ? `rgba(167,139,250,${(0.35+a*0.65).toFixed(2)})`
          : `rgba(34,211,238,${(0.35+a*0.65).toFixed(2)})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', setup);
    };
  }, []); // mount once

  return (
    <canvas ref={canvasRef}
      style={{ width:'100%', height:'100%', display:'block' }}
      aria-label="Neuron activation network" />
  );
}

/* ─────────────────────────────────────────────────────────────
   LIVE HEATMAP  (32 neurons)
───────────────────────────────────────────────────────────── */
function LiveHeatmap({ hiddenState, iteration }) {
  if (!hiddenState?.length) return null;
  const mn = Math.min(...hiddenState), mx = Math.max(...hiddenState);
  const rng = mx - mn || 1;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)',
        textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>
        <span>Hidden state · 32 neurons</span>
        <span style={{ color:'var(--accent)', background:'rgba(6,182,212,0.1)',
          padding:'2px 8px', borderRadius:100, border:'1px solid rgba(6,182,212,0.2)' }}>
          iter {iteration}
        </span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(16,1fr)', gap:3,
        padding:8, background:'rgba(2,2,15,0.6)', borderRadius:10,
        border:'1px solid rgba(124,58,237,0.1)' }}>
        {hiddenState.map((v,i) => {
          const n  = (v-mn)/rng;
          const ri = Math.round(6  + n*118);
          const gi = Math.round(6  + n*176);
          const bi = Math.round(20 + n*217);
          return (
            <div key={i} title={`Neuron ${i}: ${v.toFixed(3)}`} style={{
              height:14, borderRadius:3,
              background:`rgb(${ri},${gi},${bi})`,
              boxShadow: n>0.75 ? `0 0 6px rgba(${ri},${gi},${bi},0.7)` : 'none',
              transition:'background 0.3s ease, box-shadow 0.3s ease',
            }} />
          );
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between',
        marginTop:5, fontSize:'0.6rem', color:'var(--text-muted)' }}>
        <span>← inhibited</span><span>active →</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONFIDENCE BARS  (per cell, 8 colors)
───────────────────────────────────────────────────────────── */
function ConfidenceBars({ probs, correctColor }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {probs.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:12, height:12, borderRadius:3, flexShrink:0,
            background:COLOR_PALETTE[i],
            border: i===correctColor ? '2px solid var(--green)' : '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.04)',
            borderRadius:4, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:4,
              width:`${(p*100).toFixed(1)}%`,
              background: i===correctColor
                ? 'linear-gradient(90deg,var(--green),#34d399)'
                : 'linear-gradient(90deg,var(--primary),var(--accent))',
              transition:'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: i===correctColor ? '0 0 8px rgba(16,185,129,0.5)' : 'none',
            }} />
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem',
            color: i===correctColor ? 'var(--green)' : 'var(--text-muted)',
            width:28, textAlign:'right', fontWeight: i===correctColor ? 700 : 400 }}>
            {(p*100).toFixed(0)}%
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem',
            color:'var(--text-muted)', width:40 }}>
            {COLOR_NAMES[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GRID DISPLAY  (clickable predicted cells)
───────────────────────────────────────────────────────────── */
function GridDisplay({ grid, mask, label, isTarget=false, onCellClick, selectedCell }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem',
        color:'var(--text-muted)', marginBottom:8,
        textTransform:'uppercase', letterSpacing:'1.5px' }}>{label}</div>
      <div style={{ display:'inline-grid', gridTemplateColumns:'repeat(3,1fr)',
        gap:5, padding:6, background:'rgba(124,58,237,0.05)',
        borderRadius:10, border:'1px solid rgba(124,58,237,0.1)' }}>
        {grid.map((val,i) => {
          const isPredicted = mask?.[i];
          const isSelected  = selectedCell===i && isPredicted && !isTarget;
          return (
            <div key={i}
              onClick={() => isPredicted && !isTarget && onCellClick?.(i)}
              role={isPredicted && !isTarget ? 'button' : undefined}
              tabIndex={isPredicted && !isTarget ? 0 : undefined}
              onKeyDown={e => e.key==='Enter' && isPredicted && !isTarget && onCellClick?.(i)}
              style={{
                width:46, height:46, borderRadius:7,
                background: val>=0 ? COLOR_PALETTE[Math.min(val,7)] : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '2px solid var(--yellow)'
                  : isPredicted
                    ? `2px solid ${isTarget ? 'var(--green)' : 'var(--primary-light)'}`
                    : '2px solid transparent',
                opacity: val<0 ? 0.12 : 1,
                cursor: isPredicted && !isTarget ? 'pointer' : 'default',
                transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isSelected
                  ? '0 0 16px rgba(245,158,11,0.7)'
                  : isPredicted && isTarget
                    ? '0 0 10px rgba(16,185,129,0.4)'
                    : isPredicted
                      ? '0 0 10px rgba(124,58,237,0.4)'
                      : 'none',
                transform: isSelected ? 'scale(1.14)' : 'scale(1)',
              }}
              aria-label={`Cell ${i+1}${isPredicted?' (predicted)':''}: ${val>=0?COLOR_NAMES[Math.min(val,7)]:'hidden'}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ITERATION TIMELINE  (clickable dots)
───────────────────────────────────────────────────────────── */
function IterTimeline({ total, current, onClick }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap', justifyContent:'center' }}>
      {Array.from({length:total},(_,i) => (
        <button key={i} onClick={() => onClick(i+1)}
          title={`Jump to iteration ${i+1}`}
          style={{
            width: i===current-1 ? 20 : 10, height:10,
            borderRadius:5, border:'none', cursor:'pointer',
            transition:'all 0.2s ease',
            background: i<current
              ? i===current-1 ? 'var(--accent)' : 'var(--primary)'
              : 'rgba(255,255,255,0.08)',
            boxShadow: i===current-1 ? '0 0 10px var(--accent-glow)' : 'none',
            padding:0,
          }}
          aria-label={`Iteration ${i+1}`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCURACY CURVE  SVG  (with animated current-dot)
───────────────────────────────────────────────────────────── */
function AccuracyCurve({ curve, current }) {
  const W=220, H=130, pad={top:14,right:12,bottom:28,left:32};
  const iW=W-pad.left-pad.right, iH=H-pad.top-pad.bottom;
  const cx = i => pad.left + (i/(MAX_ITER-1))*iW;
  const cy = v => pad.top  + (1-v)*iH;
  const pathD = curve.map((v,i)=>`${i===0?'M':'L'} ${cx(i)} ${cy(v)}`).join(' ');
  const areaD = `${pathD} L ${cx(MAX_ITER-1)} ${cy(0)} L ${cx(0)} ${cy(0)} Z`;
  const curX  = cx(current-1);
  const curY  = cy(curve[current-1]??0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'auto'}}
      aria-label="Accuracy over iterations">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,0.25,0.5,0.75,1].map(v=>(
        <g key={v}>
          <line x1={pad.left} y1={cy(v)} x2={pad.left+iW} y2={cy(v)}
            stroke="rgba(124,58,237,0.1)" strokeWidth="1"/>
          <text x={pad.left-4} y={cy(v)+4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
            {Math.round(v*100)}%
          </text>
        </g>
      ))}
      <text x={pad.left+iW/2} y={H-4} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
        Iterations →
      </text>
      <path d={areaD} fill="url(#cg)"/>
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round"/>
      {/* plateau marker */}
      <line x1={cx(9)} y1={pad.top} x2={cx(9)} y2={pad.top+iH}
        stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="3,2"/>
      <text x={cx(9)+2} y={pad.top+10} fill="var(--yellow)" fontSize="7">plateau</text>
      {/* current position dot */}
      <circle cx={curX} cy={curY} r="9" fill="none"
        stroke="var(--accent)" strokeWidth="1" opacity="0.35"/>
      <circle cx={curX} cy={curY} r="5"
        fill="var(--accent)" stroke="var(--bg-deep)" strokeWidth="2"/>
      <text x={curX} y={curY-11} fill="var(--accent-light)" fontSize="8"
        textAnchor="middle" fontWeight="700">
        {Math.round((curve[current-1]??0)*100)}%
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────────────────────── */
export default function LatentReasoningSection() {
  const [iterations,   setIterations]   = useState(1);
  const [puzzleIdx,    setPuzzleIdx]    = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const playRef = useRef(null);

  const puzzle = PUZZLES[puzzleIdx];

  /* run model */
  const result = useMemo(
    () => runLatentModelWithProbs(puzzle, iterations),
    [puzzle, iterations]
  );

  /* precompute accuracy curve */
  const curve = useMemo(
    () => Array.from({length:MAX_ITER}, (_,i) => runLatentModelWithProbs(puzzle,i+1).accuracy),
    [puzzle]
  );

  /* auto-play */
  const startPlay = useCallback(() => { setIterations(1); setIsPlaying(true); }, []);

  useEffect(() => {
    if (!isPlaying) { clearInterval(playRef.current); return; }
    playRef.current = setInterval(() => {
      setIterations(prev => {
        if (prev >= MAX_ITER) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 220);
    return () => clearInterval(playRef.current);
  }, [isPlaying]);

  useEffect(() => {
    setIterations(1); setIsPlaying(false); setSelectedCell(null);
  }, [puzzleIdx]);

  const accPct   = Math.round(result.accuracy * 100);
  const accClass = accPct >= 80 ? 'high' : accPct >= 40 ? 'mid' : 'low';
  const cellProbs = selectedCell !== null ? result.cellProbs?.[selectedCell] : null;

  return (
    <section className="section fade-in" id="demo" aria-labelledby="demo-title">

      {/* Header */}
      <div className="section-header">
        <div className="section-number">§ 02</div>
        <h2 className="section-title" id="demo-title">Watch the Model Think</h2>
        <p className="section-desc">
          A real recurrent model solves ARC-style grids by refining its hidden state —
          zero words generated. Hit <strong style={{color:'var(--accent)'}}>▶ Watch It Think</strong>{' '}
          and observe accuracy climb iteration by iteration.
        </p>
      </div>

      {/* Disclosure */}
      <div className="callout warning" style={{maxWidth:780, margin:'0 auto 3rem'}}>
        <strong>Honest disclosure:</strong> This is an independent toy GRU model (pure JS),
        NOT official BDH/BDH-CQ. BDH-CQ evidence with proper sourcing is in §04.
      </div>

      {/* ── Puzzle picker + play controls ── */}
      <div className="glass-card glass-card-glow fade-in" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', alignItems:'center',
          justifyContent:'space-between', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:'0.65rem',
              color:'var(--text-muted)', textTransform:'uppercase',
              letterSpacing:'1.5px', marginBottom:10}}>
              Choose a puzzle
            </div>
            <div className="btn-group" role="group" aria-label="Puzzle selection">
              {PUZZLES.map((p,i) => {
                const dc = p.difficulty==='hard' ? 'var(--red)'
                         : p.difficulty==='medium' ? 'var(--yellow)' : 'var(--green)';
                return (
                  <button key={i}
                    className={`btn ${puzzleIdx===i?'btn-primary':''}`}
                    style={{fontSize:'0.78rem', padding:'0.45rem 0.9rem', position:'relative'}}
                    onClick={() => setPuzzleIdx(i)}
                    aria-pressed={puzzleIdx===i}>
                    {p.name}
                    <span style={{position:'absolute',top:-4,right:-4,width:8,height:8,
                      borderRadius:'50%',background:dc,border:'1px solid var(--bg-deep)'}}/>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
            <button
              className="btn btn-primary"
              style={{padding:'0.7rem 1.5rem', fontSize:'0.88rem', minWidth:170}}
              onClick={isPlaying ? () => setIsPlaying(false) : startPlay}
              aria-label={isPlaying ? 'Pause' : 'Watch It Think'}>
              {isPlaying ? '⏸ Pause' : '▶ Watch It Think'}
            </button>
            <button className="btn"
              style={{padding:'0.7rem 1rem'}}
              onClick={() => { setIterations(1); setIsPlaying(false); }}
              aria-label="Reset">
              ↺
            </button>
          </div>
        </div>

        <p style={{marginTop:'0.9rem', fontSize:'0.86rem',
          color:'var(--text-secondary)', fontStyle:'italic', lineHeight:1.6}}>
          <span style={{
            color: puzzle.difficulty==='hard' ? 'var(--red)'
                 : puzzle.difficulty==='medium' ? 'var(--yellow)' : 'var(--green)',
            fontFamily:'var(--font-mono)', fontSize:'0.7rem',
            textTransform:'uppercase', marginRight:'0.5rem', fontStyle:'normal',
          }}>
            [{puzzle.difficulty}]
          </span>
          {puzzle.description}
          <span style={{color:'var(--text-muted)', marginLeft:'0.5rem'}}>
            · Click a purple-bordered cell in the Model grid to see its confidence.
          </span>
        </p>
      </div>

      {/* ── Three-column main area ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1.5fr 1fr',
        gap:'1.5rem',
        alignItems:'start',
      }} className="three-col-grid">

        {/* COL 1 — neuron graph + heatmap */}
        <div className="glass-card fade-in" style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
          <div style={{fontFamily:'var(--font-heading)', fontWeight:600,
            fontSize:'0.92rem', color:'var(--text)'}}>
            Neurons Firing
          </div>
          <div style={{height:240, borderRadius:8, overflow:'hidden',
            background:'rgba(2,2,15,0.7)',
            border:'1px solid rgba(124,58,237,0.08)'}}>
            <NeuronGraph hiddenState={result.h} isPlaying={isPlaying}/>
          </div>
          <LiveHeatmap hiddenState={result.h} iteration={iterations}/>
        </div>

        {/* COL 2 — grids + timeline + insight */}
        <div className="glass-card fade-in">
          {/* Accuracy badge row */}
          <div style={{display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.5rem'}}>
            <div style={{fontFamily:'var(--font-heading)', fontWeight:600,
              fontSize:'0.92rem', color:'var(--text)'}}>
              Model vs. Ground Truth
            </div>
            <div className={`accuracy-badge ${accClass}`}
              aria-live="polite" style={{marginTop:0, fontSize:'0.8rem'}}>
              {accPct>=80?'✓':accPct>=40?'~':'✗'} {accPct}% correct
            </div>
          </div>

          {/* Three grids */}
          <div style={{display:'flex', alignItems:'center',
            justifyContent:'center', gap:'0.75rem',
            flexWrap:'wrap', marginBottom:'1.5rem'}}>
            <GridDisplay grid={puzzle.inputGrid} label="Input"/>
            <div style={{display:'flex', flexDirection:'column',
              alignItems:'center', gap:3}}>
              <div style={{fontSize:'1.3rem', color:'var(--text-muted)', opacity:0.4}}>→</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:'0.6rem',
                color:'var(--accent)'}}>
                {iterations} iter
              </div>
            </div>
            <GridDisplay
              grid={result.predictions}
              mask={puzzle.mask}
              label="Model"
              onCellClick={setSelectedCell}
              selectedCell={selectedCell}
            />
            <div style={{fontSize:'1.3rem', color:'var(--text-muted)', opacity:0.4}}>→</div>
            <GridDisplay
              grid={puzzle.targetGrid}
              mask={puzzle.mask}
              label="Truth"
              isTarget
            />
          </div>

          {/* Timeline */}
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:'0.62rem',
              color:'var(--text-muted)', textTransform:'uppercase',
              letterSpacing:'1.5px', marginBottom:8}}>
              Click any dot to jump
            </div>
            <IterTimeline total={MAX_ITER} current={iterations} onClick={i => { setIsPlaying(false); setIterations(i); }}/>
          </div>

          {/* Slider */}
          <div className="control-group" style={{margin:'0.5rem 0 1rem'}}>
            <label className="control-label" htmlFor="iter-slider">
              <span>Iterations</span>
              <span className="control-value">{iterations} / {MAX_ITER}</span>
            </label>
            <input id="iter-slider" type="range" min="1" max={MAX_ITER} value={iterations}
              onChange={e => { setIsPlaying(false); setIterations(Number(e.target.value)); }}
              aria-label="Number of latent reasoning iterations"/>
          </div>

          {/* Dynamic insight */}
          <div className={`callout ${iterations<=3?'danger':iterations<=10?'warning':'info'}`}
            style={{padding:'0.85rem 1rem', margin:0}}>
            {iterations<=3 && <><strong>🎲 Almost random:</strong> Only {iterations} iteration{iterations>1?'s':''}. The state hasn't formed a coherent representation yet.</>}
            {iterations>3 && iterations<=8 && <><strong>🔄 Converging:</strong> The hidden state is accumulating evidence. Accuracy is climbing.</>}
            {iterations>8 && iterations<=14 && <><strong>🎯 Near optimal:</strong> Pattern is captured. Additional iterations yield diminishing returns.</>}
            {iterations>14 && <><strong>📊 Plateau:</strong> The model has extracted everything it can from this representation. This is the architectural ceiling.</>}
          </div>

          {/* Zero-token note */}
          <div style={{marginTop:'1rem', padding:'0.9rem',
            background:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(6,182,212,0.06))',
            borderRadius:10, border:'1px solid rgba(124,58,237,0.12)'}}>
            <p style={{fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.7}}>
              <span style={{color:'var(--primary-light)',fontWeight:700}}>0 tokens</span>{' '}
              of chain-of-thought generated. All reasoning lives in the{' '}
              <span style={{color:'var(--accent-light)'}}>32-dim hidden state</span>.
              Slider = compute budget, not token count.
            </p>
          </div>
        </div>

        {/* COL 3 — confidence + curve */}
        <div className="glass-card fade-in" style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
          {/* Confidence panel */}
          <div>
            <div style={{fontFamily:'var(--font-heading)', fontWeight:600,
              fontSize:'0.92rem', color:'var(--text)', marginBottom:'0.75rem'}}>
              Cell Confidence
            </div>
            {cellProbs ? (
              <>
                <div style={{fontFamily:'var(--font-mono)', fontSize:'0.68rem',
                  color:'var(--accent)', marginBottom:'0.75rem'}}>
                  Cell {selectedCell+1} · {puzzle.mask[selectedCell]?'predicted':'visible'}
                  <span style={{color:'var(--text-muted)', marginLeft:'0.5rem'}}>
                    correct = <span style={{color:'var(--green)'}}>{COLOR_NAMES[puzzle.targetGrid[selectedCell]]}</span>
                  </span>
                </div>
                <ConfidenceBars probs={cellProbs} correctColor={puzzle.targetGrid[selectedCell]}/>
              </>
            ) : (
              <div style={{padding:'1.25rem', background:'rgba(124,58,237,0.04)',
                borderRadius:8, border:'1px dashed rgba(124,58,237,0.15)',
                textAlign:'center'}}>
                <div style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>👆</div>
                <div style={{fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.65}}>
                  Click a <span style={{color:'var(--primary-light)'}}>purple-bordered cell</span>{' '}
                  in the Model grid to inspect its color probability distribution
                </div>
              </div>
            )}
          </div>

          {/* Accuracy curve */}
          <div>
            <div style={{fontFamily:'var(--font-heading)', fontWeight:600,
              fontSize:'0.92rem', color:'var(--text)', marginBottom:'0.75rem'}}>
              Accuracy Curve
            </div>
            <AccuracyCurve curve={curve} current={iterations}/>
            <p style={{fontSize:'0.75rem', color:'var(--text-muted)',
              marginTop:'0.5rem', lineHeight:1.6}}>
              The curve shows why more compute helps — up to a point.
              This is latent inference-time scaling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
