// js/utils/confetti.js
// Leichtgewichtiges Konfetti auf einem Canvas, ohne externe Abhängigkeit.

/**
 * Zwei Salven aus den unteren Ecken plus Konfetti-Regen von oben.
 * Der Canvas entfernt sich nach Ablauf selbst.
 */
function launchConfetti({ duration = 3800, particleCount = 180 } = {}) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    particleCount = 40;
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#fde047"];
  const width = window.innerWidth;
  const height = window.innerHeight;

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const burst = i < particleCount * 0.6;
    const fromLeft = i % 2 === 0;
    const angle = burst
      ? (fromLeft ? -Math.PI / 3 : (-2 * Math.PI) / 3) + (Math.random() - 0.5) * 0.7
      : Math.PI / 2;
    const speed = burst ? 10 + Math.random() * 8 : 1 + Math.random() * 2;
    return {
      x: burst ? (fromLeft ? 0 : width) : Math.random() * width,
      y: burst ? height * 0.85 : -20 - Math.random() * height * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      tilt: Math.random() * Math.PI * 2,
    };
  });

  const start = performance.now();
  const frame = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = Math.max(0, Math.min(1, (duration - elapsed) / 700));

    particles.forEach((p) => {
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.22;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      p.tilt += 0.12;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(1, Math.cos(p.tilt));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  };
  requestAnimationFrame(frame);
}
