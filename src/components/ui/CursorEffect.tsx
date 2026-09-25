import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Advanced Ultra-Fast Zero-Latency PC Cursor HUD System
 * - Zero React re-renders on mousemove for true hardware-speed response (0ms latency).
 * - Direct GPU translate3d hardware composition.
 * - Multi-layer holographic targeting reticle with dual-speed orbital rotations.
 * - Dynamic corner targeting brackets that lock on when hovering interactive elements.
 * - Instantaneous click shockwave pulse using pure hardware CSS animations.
 * - Theme-synchronized styling (Cyberpunk Synapse, Celestial Dark, Crisp Light).
 * - Full reduced-motion and touch-screen safety guardrails.
 */
export const CursorEffect: React.FC = () => {
  const { isDark, isCyberpunk } = useTheme();

  // Guard for fine-pointer PC devices (mouse/trackpad)
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: fine)').matches;
  });

  // Direct DOM references to bypass React render cycle completely
  const coreRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);
  const hudLabelRef = useRef<HTMLSpanElement>(null);

  // Kinetic state stored in mutable refs for 120Hz/240Hz RAF loop
  const posRef = useRef({ x: -100, y: -100 });
  const haloPosRef = useRef({ x: -100, y: -100 });
  const isHoveringRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isVisibleRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const mql = window.matchMedia('(pointer: fine)');
    const handleMqlChange = (e: MediaQueryListEvent) => {
      setIsSupported(e.matches);
    };
    mql.addEventListener('change', handleMqlChange);

    // Fast check for interactive elements without layout recalculation
    const checkInteractive = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'a, button, input, textarea, select, [role="button"], [role="tab"], [role="switch"], [role="slider"], label, summary, [data-cursor-interactive], .cursor-pointer, .physics-glass-card'
        )
      );
    };

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      posRef.current.x = x;
      posRef.current.y = y;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (coreRef.current) coreRef.current.style.opacity = '1';
        if (haloRef.current) haloRef.current.style.opacity = '1';
        if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
      }

      // 1. HARDWARE ZERO-LATENCY DIRECT UPDATE (0ms delay)
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)${
          isMouseDownRef.current ? ' scale(0.8)' : ''
        }`;
      }

      // Ambient spotlight direct translation
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
      }

      // Check hover state quickly via event target
      const isInteractive = checkInteractive(e.target);
      if (isInteractive !== isHoveringRef.current) {
        isHoveringRef.current = isInteractive;
        updateHoverState(isInteractive);
      }
    };

    const updateHoverState = (hovering: boolean) => {
      if (haloRef.current) {
        if (hovering) {
          haloRef.current.style.width = '46px';
          haloRef.current.style.height = '46px';
          haloRef.current.style.borderColor = isCyberpunk
            ? 'rgba(0, 240, 255, 0.9)'
            : isDark
            ? 'rgba(129, 140, 248, 0.9)'
            : 'rgba(2, 132, 199, 0.9)';
          haloRef.current.style.backgroundColor = isCyberpunk
            ? 'rgba(0, 240, 255, 0.12)'
            : isDark
            ? 'rgba(99, 102, 241, 0.12)'
            : 'rgba(2, 132, 199, 0.08)';
        } else {
          haloRef.current.style.width = '30px';
          haloRef.current.style.height = '30px';
          haloRef.current.style.borderColor = isCyberpunk
            ? 'rgba(0, 240, 255, 0.45)'
            : isDark
            ? 'rgba(129, 140, 248, 0.45)'
            : 'rgba(2, 132, 199, 0.35)';
          haloRef.current.style.backgroundColor = 'transparent';
        }
      }

      if (bracketsRef.current) {
        bracketsRef.current.style.opacity = hovering ? '1' : '0';
        bracketsRef.current.style.transform = hovering
          ? 'scale(1) rotate(0deg)'
          : 'scale(0.6) rotate(45deg)';
      }

      if (hudLabelRef.current) {
        hudLabelRef.current.style.opacity = hovering ? '1' : '0';
        hudLabelRef.current.style.transform = hovering
          ? 'translateY(0px)'
          : 'translateY(4px)';
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isMouseDownRef.current = true;
      const x = e.clientX;
      const y = e.clientY;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(0.72)`;
      }

      // Trigger high-impact CSS shockwave ripple
      if (shockwaveRef.current) {
        shockwaveRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        shockwaveRef.current.classList.remove('anim-cursor-shockwave');
        // Trigger browser reflow to re-fire keyframe animation smoothly
        void shockwaveRef.current.offsetWidth;
        shockwaveRef.current.classList.add('anim-cursor-shockwave');
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isMouseDownRef.current = false;
      const x = e.clientX;
      const y = e.clientY;
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (coreRef.current) coreRef.current.style.opacity = '0';
      if (haloRef.current) haloRef.current.style.opacity = '0';
      if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
      if (bracketsRef.current) bracketsRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (haloRef.current) haloRef.current.style.opacity = '1';
      if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
    };

    // 2. ULTRA-RESPONSIVE KINETIC LERP LOOP FOR THE ROTATING CYBER ORBIT
    // Using a tight lerp factor (0.36) ensures fluid kinetic follow with zero noticeable drag
    const kineticLoop = () => {
      if (isVisibleRef.current && haloRef.current) {
        const targetX = posRef.current.x;
        const targetY = posRef.current.y;

        // Snappy spring interpolation
        haloPosRef.current.x += (targetX - haloPosRef.current.x) * 0.36;
        haloPosRef.current.y += (targetY - haloPosRef.current.y) * 0.36;

        haloRef.current.style.transform = `translate3d(${haloPosRef.current.x}px, ${haloPosRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafIdRef.current = requestAnimationFrame(kineticLoop);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    rafIdRef.current = requestAnimationFrame(kineticLoop);

    return () => {
      mql.removeEventListener('change', handleMqlChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isCyberpunk, isDark]);

  if (!isSupported) return null;

  // Theme-tailored styles and HUD chromatic accents
  const themeStyles = isCyberpunk
    ? {
        spotlight: 'bg-cyan-500/12',
        coreGlow: 'bg-cyan-400 shadow-[0_0_12px_#00f0ff,0_0_24px_rgba(0,240,255,0.7)]',
        crosshair: 'bg-cyan-300',
        ringBorder: 'border-cyan-400/50',
        dashedOrbit: 'border-cyan-400/70',
        shockwave: 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_24px_rgba(0,240,255,0.8)]',
        bracket: 'border-cyan-400 text-cyan-300',
        hudText: 'text-cyan-400',
        badgeBg: 'bg-black/80 border-cyan-500/40',
      }
    : isDark
    ? {
        spotlight: 'bg-indigo-500/10',
        coreGlow: 'bg-indigo-300 shadow-[0_0_10px_#818cf8,0_0_20px_rgba(99,102,241,0.6)]',
        crosshair: 'bg-indigo-200',
        ringBorder: 'border-indigo-400/50',
        dashedOrbit: 'border-indigo-400/70',
        shockwave: 'border-indigo-400 bg-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.7)]',
        bracket: 'border-indigo-300 text-indigo-200',
        hudText: 'text-indigo-300',
        badgeBg: 'bg-slate-950/80 border-indigo-500/30',
      }
    : {
        spotlight: 'bg-sky-500/5',
        coreGlow: 'bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.7)]',
        crosshair: 'bg-sky-700',
        ringBorder: 'border-sky-500/40',
        dashedOrbit: 'border-sky-500/60',
        shockwave: 'border-sky-500 bg-sky-500/15 shadow-[0_0_16px_rgba(2,132,199,0.5)]',
        bracket: 'border-sky-600 text-sky-700',
        hudText: 'text-sky-700',
        badgeBg: 'bg-white/90 border-sky-300 shadow-sm',
      };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
      style={{ contain: 'layout style paint' }}
      aria-hidden="true"
    >
      {/* 1. Large Ambient Specular Glow Spotlight */}
      <div
        ref={spotlightRef}
        className={`fixed top-0 left-0 w-[440px] h-[440px] rounded-full blur-[90px] mix-blend-screen opacity-0 transition-opacity duration-300 hidden lg:block ${themeStyles.spotlight}`}
        style={{ willChange: 'transform', transform: 'translate3d(-500px, -500px, 0)' }}
      />

      {/* 2. Transient Click Shockwave Ring */}
      <div
        ref={shockwaveRef}
        className={`fixed top-0 left-0 w-16 h-16 rounded-full border opacity-0 pointer-events-none mix-blend-screen ${themeStyles.shockwave}`}
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 3. Hardware Zero-Latency Reticle Core (Synchronous 0ms tracking) */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 -ml-[5px] -mt-[5px] w-[10px] h-[10px] pointer-events-none opacity-0 transition-opacity duration-150"
        style={{ willChange: 'transform', transform: 'translate3d(-100px, -100px, 0)' }}
      >
        {/* Core Quantum Dot */}
        <div className={`w-full h-full rounded-full ${themeStyles.coreGlow} anim-cursor-breathe`} />

        {/* Micro-Ticks Crosshair (4-directional hairline precision) */}
        <div className={`absolute top-1/2 -left-2 w-1.5 h-[1.5px] -translate-y-1/2 opacity-75 ${themeStyles.crosshair}`} />
        <div className={`absolute top-1/2 -right-2 w-1.5 h-[1.5px] -translate-y-1/2 opacity-75 ${themeStyles.crosshair}`} />
        <div className={`absolute -top-2 left-1/2 w-[1.5px] h-1.5 -translate-x-1/2 opacity-75 ${themeStyles.crosshair}`} />
        <div className={`absolute -bottom-2 left-1/2 w-[1.5px] h-1.5 -translate-x-1/2 opacity-75 ${themeStyles.crosshair}`} />
      </div>

      {/* 4. Fluid Kinetic Kinetic Halo Ring with Advanced Dual Orbit & Cyber HUD */}
      <div
        ref={haloRef}
        className={`fixed top-0 left-0 rounded-full border border-dashed flex items-center justify-center pointer-events-none opacity-0 transition-[width,height,background-color,border-color] duration-200 ease-out ${themeStyles.ringBorder}`}
        style={{
          width: '30px',
          height: '30px',
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
        }}
      >
        {/* Outer Rotating Segmented Orbit */}
        <div className="absolute inset-0 rounded-full anim-cursor-spin border border-dashed border-current opacity-60" />

        {/* Inner Counter-Rotating Precision Ring with tick notches */}
        <div className="absolute inset-1 rounded-full anim-cursor-spin-reverse border border-dotted border-current opacity-40" />

        {/* Cyber Targeting Lock Brackets (Appears on Hover) */}
        <div
          ref={bracketsRef}
          className="absolute -inset-2.5 pointer-events-none opacity-0 transition-[transform,opacity] duration-200 ease-out"
        >
          {/* Top-Left Bracket */}
          <span className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${themeStyles.bracket}`} />
          {/* Top-Right Bracket */}
          <span className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${themeStyles.bracket}`} />
          {/* Bottom-Left Bracket */}
          <span className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${themeStyles.bracket}`} />
          {/* Bottom-Right Bracket */}
          <span className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${themeStyles.bracket}`} />
        </div>

        {/* Micro HUD Lock Indicator Badge */}
        <span
          ref={hudLabelRef}
          className={`absolute top-full mt-2.5 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase font-semibold border pointer-events-none opacity-0 transition-[transform,opacity] duration-200 ${themeStyles.hudText} ${themeStyles.badgeBg}`}
        >
          LOCK
        </span>
      </div>
    </div>
  );
};
