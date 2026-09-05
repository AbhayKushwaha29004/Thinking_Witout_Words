import { useEffect, useRef } from 'react';

/** Custom glow cursor that follows the mouse */
export default function GlowCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf;
    function animate() {
      // dot snaps instantly
      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top  = `${pos.current.y}px`;
      }
      // ring lags behind
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top  = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(animate);
    }
    animate();

    // Grow on hover over interactive elements
    const grow = () => ringRef.current?.classList.add('cursor-grow');
    const shrink = () => ringRef.current?.classList.remove('cursor-grow');
    document.querySelectorAll('button,a,input,[role="button"]').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div ref={dotRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 10000,
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--accent-light)',
        transform: 'translate(-50%,-50%)',
        boxShadow: '0 0 10px var(--accent-glow)',
        transition: 'none',
      }} aria-hidden="true" />
      {/* Ring */}
      <div ref={ringRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        width: 32, height: 32, borderRadius: '50%',
        border: '1px solid rgba(124,58,237,0.5)',
        transform: 'translate(-50%,-50%)',
        transition: 'width 0.2s, height 0.2s, border-color 0.2s',
      }} aria-hidden="true" />
      <style>{`
        .cursor-grow { width: 52px !important; height: 52px !important;
          border-color: rgba(124,58,237,0.8) !important; }
        @media (pointer: coarse) { /* hide on touch */ }
      `}</style>
    </>
  );
}
