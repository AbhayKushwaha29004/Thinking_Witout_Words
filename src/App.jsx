import { useEffect, useRef, useState, Suspense } from 'react';
import ParticleBackground from './components/ParticleBackground.jsx';
import LoadingScreen      from './components/LoadingScreen.jsx';
import GlowCursor         from './components/GlowCursor.jsx';
import HeroSection        from './sections/HeroSection.jsx';
import CotCostSection     from './sections/CotCostSection.jsx';
import LatentReasoningSection from './sections/LatentReasoningSection.jsx';
import ScalingSection     from './sections/ScalingSection.jsx';
import BDHSection         from './sections/BDHSection.jsx';
import ParetoSection      from './sections/ParetoSection.jsx';
import LimitationsSection from './sections/LimitationsSection.jsx';
import { updateScrollProgress, getActiveSection } from './utils/scrollAnimation.js';

const NAV_SECTIONS = [
  { id: 'cot-cost', label: 'The Problem' },
  { id: 'demo',     label: 'Live Demo'   },
  { id: 'scaling',  label: 'Scaling'     },
  { id: 'bdh',      label: 'BDH-CQ'     },
  { id: 'pareto',   label: 'Frontier'    },
  { id: 'limits',   label: 'Limits'      },
];

function GlowDivider() {
  return (
    <div style={{
      height: 1, margin: '0 3rem', position: 'relative', zIndex: 1,
      background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.2),rgba(6,182,212,0.15),transparent)',
    }} />
  );
}

export default function App() {
  const [loaded,        setLoaded]        = useState(false);
  const [appVisible,    setAppVisible]    = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled,      setScrolled]      = useState(false);
  const observerRef = useRef(null);

  /* scroll-reveal observer */
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
      );
      document.querySelectorAll('.fade-in').forEach(el => observerRef.current.observe(el));
    }, 200);
    return () => { clearTimeout(t); observerRef.current?.disconnect(); };
  }, [loaded]);

  useEffect(() => {
    function onScroll() {
      updateScrollProgress();
      setScrolled(window.scrollY > 30);
      setActiveSection(getActiveSection(['hero', ...NAV_SECTIONS.map(s => s.id)]));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleLoaded() {
    setLoaded(true);
    setTimeout(() => setAppVisible(true), 80);
  }

  return (
    <>
      {/* Custom cursor */}
      <GlowCursor />

      {/* Loading screen */}
      <LoadingScreen onComplete={handleLoaded} />

      {/* Main app — fades in after loading */}
      <div style={{
        opacity: appVisible ? 1 : 0,
        transform: appVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 1s cubic-bezier(0.4,0,0.2,1), transform 1s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Scroll progress */}
        <div className="scroll-progress" aria-hidden="true" />

        {/* Particles */}
        <ParticleBackground />

        {/* Nav */}
        <nav className="nav" role="navigation" aria-label="Main navigation"
          style={{
            background: scrolled
              ? 'rgba(2,2,15,0.75)'
              : 'rgba(2,2,15,0.35)',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
            transition: 'background 0.4s ease, box-shadow 0.4s ease',
          }}>
          <button
            className="nav-logo"
            style={{ background:'none',border:'none',cursor:'pointer', padding:0 }}
            onClick={() => scrollTo('hero')}
            aria-label="Scroll to top"
          >
            🧠 Thinking Without Words
          </button>
          <div className="nav-links" role="menubar">
            {NAV_SECTIONS.map((s, i) => (
              <button key={s.id}
                className={`nav-link ${activeSection===s.id?'active':''}`}
                onClick={() => scrollTo(s.id)}
                role="menuitem"
                aria-current={activeSection===s.id?'page':undefined}
                style={{
                  animationDelay: `${i*60}ms`,
                  opacity: appVisible ? 1 : 0,
                  transform: appVisible ? 'translateY(0)' : 'translateY(-12px)',
                  transition: `opacity 0.5s ease ${300+i*60}ms, transform 0.5s ease ${300+i*60}ms, color 0.3s, background 0.3s, border-color 0.3s`,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <main>
          <Suspense fallback={<div style={{height:'100vh'}}/>}>
            <HeroSection onScrollToDemo={() => scrollTo('demo')} />
          </Suspense>

          <GlowDivider />
          <CotCostSection />
          <GlowDivider />
          <LatentReasoningSection />
          <GlowDivider />
          <ScalingSection />
          <GlowDivider />
          <BDHSection />
          <GlowDivider />
          <ParetoSection />
          <GlowDivider />
          <LimitationsSection />
        </main>

        {/* Footer */}
        <footer className="footer" role="contentinfo">
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{
              fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.6rem',
              marginBottom:'1rem', letterSpacing:'-0.02em',
              background:'linear-gradient(135deg,var(--primary-light),var(--accent-light))',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>
              Thinking Without Words
            </div>
            <p style={{ marginBottom:'0.5rem', color:'var(--text-secondary)' }}>
              DataForge 2026 × Pathway Track — Alternatives to Chain-of-Thought Reasoning
            </p>
            <p style={{ marginBottom:'1.5rem', fontSize:'0.82rem' }}>
              Sources:{' '}
              <a href="https://arxiv.org/abs/2509.26507" target="_blank" rel="noopener noreferrer">BDH (arXiv:2509.26507)</a> ·{' '}
              <a href="https://arxiv.org/abs/2412.06769" target="_blank" rel="noopener noreferrer">Coconut (Hao et al.)</a> ·{' '}
              <a href="https://arxiv.org/abs/1911.01547" target="_blank" rel="noopener noreferrer">ARC (Chollet)</a> ·{' '}
              <a href="https://arxiv.org/abs/1610.06258" target="_blank" rel="noopener noreferrer">Fast Weights (Ba et al.)</a>
            </p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'2rem' }}>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn" style={{fontSize:'0.8rem'}}>GitHub →</a>
              <a href="#" className="btn" style={{fontSize:'0.8rem'}}>📄 Concept Summary PDF</a>
              <a href="https://arxiv.org/abs/2509.26507" target="_blank" rel="noopener noreferrer" className="btn" style={{fontSize:'0.8rem'}}>🐉 BDH Paper →</a>
            </div>
            <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', maxWidth:600, margin:'0 auto', lineHeight:1.8 }}>
              The toy model in §02 is an independent illustration — NOT official BDH/BDH-CQ.
              All BDH-CQ figures are developer-reported from published technical reports.
              AI assistance was used in development; all components understood and defensible by the team.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
