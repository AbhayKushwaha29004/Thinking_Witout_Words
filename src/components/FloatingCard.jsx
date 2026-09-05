import { useRef, useEffect } from 'react';

/**
 * Card that tilts toward the mouse cursor in 3D
 */
export default function FloatingCard({ children, className = '', style = {}, intensity = 8 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `perspective(800px) rotateY(${dx * intensity}deg) rotateX(${-dy * intensity}deg) translateZ(8px)`;
      el.style.boxShadow = `${-dx * 12}px ${dy * 12}px 40px rgba(124,58,237,0.18), 0 20px 60px rgba(0,0,0,0.4)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      el.style.boxShadow = '';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [intensity]);

  return (
    <div ref={ref} className={`glass-card ${className}`}
      style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', ...style }}>
      {children}
    </div>
  );
}
