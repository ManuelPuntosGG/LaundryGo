import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  colorRgb: string;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  vx: number;
  vy: number;
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number;
}

// GoPropertyCare brand green color palette
const GREEN_PALETTE_RGB = [
  '34, 197, 94',  // emerald-500
  '22, 163, 74',  // brand-600
  '134, 239, 172', // brand-300 (mint/sage highlight)
  '16, 185, 129', // teal-emerald
  '74, 222, 128', // brand-400
];

export function DustParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check system prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle density: ~50-70 visible floating particles
    const particleCount = Math.max(45, Math.min(Math.floor((width * height) / 16000), 75));

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const colorRgb = GREEN_PALETTE_RGB[Math.floor(Math.random() * GREEN_PALETTE_RGB.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.8 + Math.random() * 3.2, // Visible size between 1.8px and 5.0px
        colorRgb,
        baseAlpha: 0.25 + Math.random() * 0.35, // Clear, visible translucent glow
        pulseSpeed: 0.012 + Math.random() * 0.022,
        pulsePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.25, // Gentle horizontal drift
        vy: -0.15 - Math.random() * 0.35, // Gentle upward buoyant air drift
        swayAmplitude: 0.6 + Math.random() * 1.2,
        swayFrequency: 0.006 + Math.random() * 0.012,
        swayOffset: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate positions unless reduced-motion is requested
        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(time * p.swayFrequency + p.swayOffset) * p.swayAmplitude * 0.2;
          p.y += p.vy;

          // Wrap around edges seamlessly
          if (p.y < -12) {
            p.y = height + 12;
            p.x = Math.random() * width;
          } else if (p.y > height + 12) {
            p.y = -12;
            p.x = Math.random() * width;
          }

          if (p.x < -12) {
            p.x = width + 12;
          } else if (p.x > width + 12) {
            p.x = -12;
          }
        }

        // Calculate pulsing luminescence
        const currentAlpha = Math.max(
          0.12,
          p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.15
        );

        // Render soft out-of-focus bokeh dust mote
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 2.8
        );
        gradient.addColorStop(0, `rgba(${p.colorRgb}, ${currentAlpha.toFixed(3)})`);
        gradient.addColorStop(0.4, `rgba(${p.colorRgb}, ${(currentAlpha * 0.6).toFixed(3)})`);
        gradient.addColorStop(1, `rgba(${p.colorRgb}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      time++;
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(drawParticles);
      }
    };

    drawParticles();

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (prefersReducedMotion) {
        drawParticles();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Pause on background tabs for battery and performance conservation
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(drawParticles);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full select-none"
    />
  );
}
