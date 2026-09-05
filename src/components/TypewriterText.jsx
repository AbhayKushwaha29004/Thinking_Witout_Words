import { useEffect, useRef, useState } from 'react';

export default function TypewriterText({ text, speed = 38, startDelay = 0, className = '', style = {} }) {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor] = useState(true);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let i = 0;
        setTimeout(() => {
          const id = setInterval(() => {
            setDisplayed(text.slice(0, ++i));
            if (i >= text.length) {
              clearInterval(id);
              setTimeout(() => setCursor(false), 1200);
            }
          }, speed);
        }, startDelay);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [text, speed, startDelay]);

  return (
    <span ref={ref} className={className} style={style}>
      {displayed}
      {cursor && <span style={{ borderRight: '2px solid var(--accent)', marginLeft: 2, animation: 'cursorBlink 0.8s step-end infinite' }} />}
    </span>
  );
}
