import { useEffect, useRef } from 'react';
import katex from 'katex';

export default function KatexEquation({ latex, label, description, display = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
        });
      } catch (e) {
        if (ref.current) ref.current.textContent = latex;
      }
    }
  }, [latex, display]);

  return (
    <div className="equation-block">
      {label && <div className="equation-label">{label}</div>}
      <div ref={ref} style={{ color: 'var(--text)', overflowX: 'auto' }} />
      {description && (
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginTop: '0.75rem',
          lineHeight: 1.6,
          textAlign: 'left',
        }}>
          {description}
        </p>
      )}
    </div>
  );
}
