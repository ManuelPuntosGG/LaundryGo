import { useEffect, useState } from 'react';
import { useWaterLevel } from '@/context/WaterLevelContext';

export function WaterBackground() {
  const { scheduleStep } = useWaterLevel();
  const [scrollHeight, setScrollHeight] = useState<number>(65);

  // Scroll tracking when not on Schedule page
  useEffect(() => {
    if (scheduleStep !== null) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          const progress = docHeight > 0 ? Math.min(Math.max(currentScroll / docHeight, 0), 1) : 0;

          // Height scales from 65px at the very top up to 260px at bottom of page
          const minH = 65;
          const maxH = 260;
          setScrollHeight(Math.round(minH + progress * (maxH - minH)));
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [scheduleStep]);

  // Determine current water height
  let targetHeight = scrollHeight;
  if (scheduleStep !== null) {
    switch (scheduleStep) {
      case 1:
        targetHeight = 90;
        break;
      case 2:
        targetHeight = 180;
        break;
      case 3:
        targetHeight = 270;
        break;
      case 4:
        targetHeight = 360;
        break;
      case 5: // Order confirmed / Success screen
        targetHeight = 450;
        break;
      default:
        targetHeight = 90;
    }
  }

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-0 overflow-hidden select-none bg-linear-to-t from-blue-600/25 via-sky-500/15 to-transparent"
      style={{
        height: `${targetHeight}px`,
        transition: 'height 750ms cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'height',
      }}
    >
      {/* Wave Layer 1 - Deep Stream */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden opacity-60">
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-slow"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#water-gradient-1)"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,80C960,96,1056,128,1152,122.7C1248,117,1344,75,1392,53.3L1440,32L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"
          />
          <defs>
            <linearGradient id="water-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wave Layer 2 - Middle Flow Stream (Reversed Direction) */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden opacity-75">
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#water-gradient-2)"
            d="M0,96L60,106.7C120,117,240,139,360,128C480,117,600,75,720,64C840,53,960,75,1080,90.7C1200,107,1320,117,1380,122.7L1440,128L1440,160L1380,160C1320,160,1200,160,1080,160C960,160,840,160,720,160C600,160,480,160,360,160C240,160,120,160,60,160L0,160Z"
          />
          <defs>
            <linearGradient id="water-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wave Layer 3 - Surface Crest */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden opacity-90">
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-fast"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#water-gradient-3)"
            d="M0,32L40,48C80,64,160,96,240,96C320,96,400,64,480,58.7C560,53,640,75,720,90.7C800,107,880,117,960,106.7C1040,96,1120,64,1200,53.3C1280,43,1360,53,1400,58.7L1440,64L1440,160L1400,160C1360,160,1280,160,1200,160C1120,160,1040,160,960,160C880,160,800,160,720,160C640,160,560,160,480,160C400,160,320,160,240,160C160,160,80,160,40,160L0,160Z"
          />
          <defs>
            <linearGradient id="water-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.75" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Ambient Rising Micro-Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        <span className="water-bubble bubble-1" />
        <span className="water-bubble bubble-2" />
        <span className="water-bubble bubble-3" />
        <span className="water-bubble bubble-4" />
        <span className="water-bubble bubble-5" />
        <span className="water-bubble bubble-6" />
      </div>

      {/* Surface Light Shimmer Crest Highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-sky-400/30 via-white/80 to-sky-400/30 blur-2xs pointer-events-none" />
    </div>
  );
}
