import { useRef, useEffect } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = e => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Particle types: small nodes + large "hubs"
    const nodes = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: i < 5 ? 3 + Math.random() * 2 : 1 + Math.random() * 1.5,
      hub: i < 5,
      color: i % 3 === 0 ? [124, 58, 237] : i % 3 === 1 ? [6, 182, 212] : [167, 139, 250],
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;

      // Mouse-attracted hub effect
      nodes.forEach((p, i) => {
        if (p.hub) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            p.vx += (dx / dist) * 0.004;
            p.vy += (dy / dist) * 0.004;
          }
        }
        // Damping
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
      });

      // Draw connections (hub-to-node priority)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const maxDist = (nodes[i].hub || nodes[j].hub) ? 180 : 110;
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * (nodes[i].hub || nodes[j].hub ? 0.25 : 0.1);
            const [r, g, b] = nodes[i].color;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = nodes[i].hub || nodes[j].hub ? 0.8 : 0.4;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(p => {
        const alpha = p.hub
          ? 0.5 + Math.sin(t * 1.5 + p.phase) * 0.25
          : 0.2 + Math.sin(t + p.phase) * 0.1;

        // Outer glow for hubs
        if (p.hub) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.25)`);
          g.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
