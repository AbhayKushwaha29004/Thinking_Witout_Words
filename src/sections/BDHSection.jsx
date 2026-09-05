import { useState, useEffect, useRef } from 'react';
import KatexEquation from '../components/KatexEquation.jsx';
import FloatingCard from '../components/FloatingCard.jsx';
import { BDH_ARCH } from '../data/bdh_data.js';

/* ── Animated Architecture Diagram ──────────────────────────── */
function ArchDiagram({ activeNode, setActiveNode }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const activeRef = useRef(activeNode);
  useEffect(() => { activeRef.current = activeNode; }, [activeNode]);

  const nodes = [
    { id:'input',     label:'Input Tokens',         x:55,  y:155, color:'#7c3aed', w:105, h:40 },
    { id:'embed',     label:'Embedding',             x:195, y:155, color:'#6d28d9', w:95,  h:40 },
    { id:'recurrent', label:['Recurrent State','(Hidden h)'],  x:345, y:112, color:'#06b6d4', w:118, h:50 },
    { id:'synapse',   label:['Synaptic Memory','(Fast Weights)'],x:345,y:194, color:'#10b981', w:118, h:50 },
    { id:'output',    label:['Output','(No CoT)'],   x:510, y:155, color:'#ec4899', w:98,  h:50 },
  ];
  const edges = [
    { from:'input', to:'embed' },
    { from:'embed', to:'recurrent' },
    { from:'embed', to:'synapse' },
    { from:'synapse', to:'recurrent' },
    { from:'recurrent', to:'synapse' },
    { from:'recurrent', to:'output' },
  ];
  const nodeDesc = {
    input:     'Demonstration pairs fed as context — no gradient updates at inference.',
    embed:     'Tokens embedded into vectors feeding both recurrent state and fast weights.',
    recurrent: 'Hidden state h accumulates and refines over N latent iterations.',
    synapse:   'Fast weights W store key-value associations: ΔW = η·x·yᵀ (Hebbian write).',
    output:    'Output produced directly from final hidden state — 0 CoT tokens.',
  };

  function ctr(n) { return { x: n.x + n.w/2, y: n.y + n.h/2 }; }

  /* Canvas overlay for travelling pulses */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const pulses = edges.map((e, i) => ({ edge:i, t: i/edges.length, speed: 0.004+i*0.001 }));

    function draw() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      const scaleX = canvas.width  / 660;
      const scaleY = canvas.height / 290;

      pulses.forEach(p => {
        p.t = (p.t + p.speed) % 1;
        const e = edges[p.edge];
        const from = nodes.find(n => n.id===e.from);
        const to   = nodes.find(n => n.id===e.to);
        const fc = ctr(from), tc = ctr(to);
        const px = (fc.x + (tc.x-fc.x)*p.t) * scaleX;
        const py = (fc.y + (tc.y-fc.y)*p.t) * scaleY;
        const color = from.color;

        /* glow dot */
        const g = ctx.createRadialGradient(px,py,0,px,py,8);
        g.addColorStop(0, color + 'cc');
        g.addColorStop(1, color + '00');
        ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle = color; ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ position:'relative', padding:'1.5rem',
      background:'rgba(2,2,15,0.7)', borderRadius:'var(--radius)',
      border:'1px solid rgba(124,58,237,0.1)' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)',
        marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'1.5px' }}>
        BDH-CQ Architecture — click any node · data pulses animate in real time
      </div>

      {/* SVG base */}
      <svg viewBox="0 0 660 290" style={{ width:'100%', height:'auto', display:'block' }}
        aria-label="BDH-CQ architecture diagram">
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(124,58,237,0.5)"/>
          </marker>
          <marker id="arrCyan" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="rgba(6,182,212,0.6)"/>
          </marker>
        </defs>
        {/* Recurrent loop */}
        <path d="M 463 107 Q 540 75 540 160 Q 540 245 463 244"
          fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1.5" strokeDasharray="5,3"
          markerEnd="url(#arrCyan)"/>
        <text x="548" y="163" fill="var(--accent)" fontSize="9.5" textAnchor="middle" fontWeight="600">N iter</text>

        {/* Edges */}
        {edges.map((e,i) => {
          const from = nodes.find(n=>n.id===e.from);
          const to   = nodes.find(n=>n.id===e.to);
          const fc = ctr(from), tc = ctr(to);
          return <line key={i}
            x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y}
            stroke="rgba(124,58,237,0.2)" strokeWidth="1.5"
            markerEnd="url(#arr)"/>;
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const isActive = activeNode===n.id;
          const labels = Array.isArray(n.label) ? n.label : [n.label];
          return (
            <g key={n.id} className="arch-node"
              onClick={() => setActiveNode(isActive ? null : n.id)}
              tabIndex={0} role="button"
              aria-label={`${labels.join(' ')}: ${nodeDesc[n.id]}`}
              onKeyDown={ev => ev.key==='Enter' && setActiveNode(isActive?null:n.id)}>
              {/* glow on active */}
              {isActive && <rect x={n.x-4} y={n.y-4} width={n.w+8} height={n.h+8}
                rx="12" fill={n.color+'22'} stroke={n.color} strokeWidth="1" opacity="0.5"/>}
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="9"
                fill={isActive ? n.color : n.color+'2a'}
                stroke={n.color} strokeWidth={isActive?2.5:1.5}
                style={{ filter:isActive?`drop-shadow(0 0 10px ${n.color})`:'none', transition:'all 0.3s ease' }}/>
              {labels.map((line,li) => (
                <text key={li}
                  x={n.x+n.w/2}
                  y={n.y + (labels.length===1 ? n.h/2+5 : n.h/2-6+li*14)}
                  textAnchor="middle"
                  fill={isActive?'#fff':n.color}
                  fontSize="10.5" fontWeight={isActive?'700':'400'}
                  style={{ transition:'fill 0.2s', pointerEvents:'none' }}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Canvas for animated pulses on top */}
      <canvas ref={canvasRef} style={{
        position:'absolute', inset:'1.5rem',
        width:'calc(100% - 3rem)', height:'calc(100% - 3rem - 2.5rem)',
        pointerEvents:'none', top:'3.5rem',
      }} aria-hidden="true"/>

      {/* Active node description */}
      {activeNode && (
        <div className="callout info" style={{ marginTop:'1rem', animation:'fadeInUp 0.3s ease' }}>
          <strong style={{ color: nodes.find(n=>n.id===activeNode)?.color }}>
            {Array.isArray(nodes.find(n=>n.id===activeNode)?.label)
              ? nodes.find(n=>n.id===activeNode)?.label.join(' ')
              : nodes.find(n=>n.id===activeNode)?.label}:
          </strong>{' '}
          {nodeDesc[activeNode]}
        </div>
      )}
    </div>
  );
}

/* ── Main BDH Section ────────────────────────────────────────── */
export default function BDHSection() {
  const [activeNode, setActiveNode] = useState(null);
  const [activeEq,   setActiveEq]   = useState(0);
  const eq = BDH_ARCH.keyEquations[activeEq];

  return (
    <section className="section fade-in" id="bdh" aria-labelledby="bdh-title">
      <div className="section-header">
        <div className="section-number">§ 04</div>
        <h2 className="section-title" id="bdh-title">BDH-CQ: The Case Study</h2>
        <p className="section-desc">
          Dragon Hatchling (BDH) is Pathway's brain-inspired Post-Transformer.
          BDH-CQ extends it to learn from demonstrations and reason without any chain-of-thought.
        </p>
      </div>

      {/* Animated arch diagram */}
      <div className="fade-in">
        <ArchDiagram activeNode={activeNode} setActiveNode={setActiveNode}/>
      </div>

      {/* Equations */}
      <FloatingCard className="fade-in" style={{ marginTop:'2rem' }}>
        <h3 style={{ fontFamily:'var(--font-heading)', marginBottom:'1.5rem', color:'var(--text)', fontWeight:700 }}>
          Key Equations
          <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)',
            fontWeight:400, marginLeft:'0.75rem' }}>
            Source: Dragon Hatchling paper (arXiv:2509.26507)
          </span>
        </h3>
        <div className="btn-group" style={{ marginBottom:'1.5rem' }} role="tablist">
          {BDH_ARCH.keyEquations.map((e,i) => (
            <button key={i}
              className={`btn ${activeEq===i?'btn-primary':''}`}
              style={{ fontSize:'0.75rem' }}
              onClick={() => setActiveEq(i)}
              role="tab" aria-selected={activeEq===i}>
              {e.label.split(' ').slice(0,2).join(' ')}
            </button>
          ))}
        </div>
        <div style={{ animation:'fadeInUp 0.3s ease', key:activeEq }}>
          <KatexEquation latex={eq.latex} label={eq.label} description={eq.description}/>
        </div>
      </FloatingCard>

      {/* Comparison table */}
      <div className="glass-card fade-in" style={{ marginTop:'2rem', overflow:'hidden' }}>
        <h3 style={{ fontFamily:'var(--font-heading)', marginBottom:'1.5rem', color:'var(--text)', fontWeight:700 }}>
          BDH-CQ vs. Standard Transformer
        </h3>
        <div style={{ overflowX:'auto' }}>
          <table className="comparison-table" aria-label="BDH-CQ vs Transformer comparison">
            <thead>
              <tr>
                <th>Property</th>
                <th>Standard Transformer (CoT)</th>
                <th style={{ color:'var(--accent-light)' }}>BDH-CQ (Latent)</th>
              </tr>
            </thead>
            <tbody>
              {BDH_ARCH.comparison.map((row,i) => (
                <tr key={i}>
                  <td style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>{row.property}</td>
                  <td>{row.transformer}</td>
                  <td className="highlight">{row.bdh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop:'1rem', fontSize:'0.72rem', color:'var(--text-muted)' }}>
          ARC-AGI-1 results from BDH-CQ technical report (developer-reported). Claude 3.5 from Anthropic / ARC Prize 2024.
        </p>
      </div>

      {/* Feature cards with 3D tilt */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginTop:'2rem' }}>
        {[
          { icon:'🔁', title:'No Parameter Updates', desc:'Adapts via recurrent state, not gradient descent.', color:'var(--primary-light)' },
          { icon:'🧠', title:'Synaptic Memory',       desc:'Fast weights store demonstrations as outer-product sums.', color:'var(--accent-light)' },
          { icon:'💰', title:'10× Cheaper',           desc:'$0.0007/task vs $0.008 for comparable CoT models.', color:'var(--green)' },
          { icon:'📊', title:'Scalable Effort',       desc:'Low/medium/high effort — no re-training needed.', color:'var(--yellow)' },
        ].map((item,i) => (
          <FloatingCard key={i} intensity={6} style={{ padding:'1.5rem', animationDelay:`${i*0.1}s` }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.6rem' }}>{item.icon}</div>
            <div style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:'0.4rem',
              color:item.color, fontSize:'0.95rem' }}>{item.title}</div>
            <div style={{ fontSize:'0.83rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{item.desc}</div>
          </FloatingCard>
        ))}
      </div>

      <div className="callout warning" style={{ marginTop:'2rem' }}>
        <strong>Evidence discipline:</strong> All BDH-CQ numbers are developer-reported from the
        published technical report — not independently reproduced. A benchmark ≠ a deployment.
      </div>
    </section>
  );
}
