import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Ultra-Responsive Zero-Latency Quantum Physics Cursor
 * - Instant 1:1 hardware translation on the core photon dot (0ms delay).
 * - Smooth kinetic plasma ring following with organic physical momentum.
 * - Minimalist, futuristic aesthetic: clean, uncluttered, highly refined.
 * - Separated container architecture for click shockwave to prevent (0,0) jump bugs.
 * - Theme-harmonized glowing styles for Cyberpunk Synapse, Celestial Dark, and Crisp Light.
 * - Automatic graceful disabling on touch/coarse devices and window blur.
 */
export const CursorEffect: React.FC = () => {
  const { isDark, isCyberpunk } = useTheme();

  // Guard for fine-pointer PC devices (mouse / trackpad)
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: fine)').matches;
  });

  // Direct DOM references to bypass React re-renders completely on mouse movements
  const coreRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const shockwaveContainerRef = useRef<HTMLDivElement>(null);
  const shockwaveRingRef = useRef<HTMLDivElement>(null);

  // Mutable tracking coordinates for 120Hz/240Hz RAF loop
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

    // Fast check for interactive elements without expensive layout recalculations
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

      // Reveal elements once valid cursor position is received
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (coreRef.current) coreRef.current.style.opacity = '1';
        if (haloRef.current) haloRef.current.style.opacity = '1';
        if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
      }

      // 1. HARDWARE ZERO-LATENCY INSTANTANEOUS UPDATE (0ms delay)
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)${
          isMouseDownRef.current ? ' scale(0.72)' : ''
        }`;
      }

      // Ambient subtle spotlight translation
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${x - 100}px, ${y - 100}px, 0)`;
      }

      // Fast check for interactive elements under pointer
      const isInteractive = checkInteractive(e.target);
      if (isInteractive !== isHoveringRef.current) {
        isHoveringRef.current = isInteractive;
        updateHoverState(isInteractive);
      }
    };

    const updateHoverState = (hovering: boolean) => {
      if (haloRef.current) {
        if (hovering) {
          haloRef.current.style.width = '44px';
          haloRef.current.style.height = '44px';
          haloRef.current.style.borderColor = isCyberpunk
            ? 'rgba(0, 240, 255, 0.9)'
            : isDark
            ? 'rgba(129, 140, 248, 0.85)'
            : 'rgba(2, 132, 199, 0.85)';
          haloRef.current.style.backgroundColor = isCyberpunk
            ? 'rgba(0, 240, 255, 0.08)'
            : isDark
            ? 'rgba(99, 102, 241, 0.08)'
            : 'rgba(2, 132, 199, 0.06)';
          haloRef.current.style.boxShadow = isCyberpunk
            ? '0 0 16px rgba(0, 240, 255, 0.35)'
            : isDark
            ? '0 0 14px rgba(129, 140, 248, 0.3)'
            : '0 0 12px rgba(2, 132, 199, 0.2)';
        } else {
          haloRef.current.style.width = '26px';
          haloRef.current.style.height = '26px';
          haloRef.current.style.borderColor = isCyberpunk
            ? 'rgba(0, 240, 255, 0.45)'
            : isDark
            ? 'rgba(129, 140, 248, 0.45)'
            : 'rgba(2, 132, 199, 0.4)';
          haloRef.current.style.backgroundColor = 'transparent';
          haloRef.current.style.boxShadow = 'none';
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isMouseDownRef.current = true;
      const x = e.clientX;
      const y = e.clientY;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(0.68)`;
      }

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloPosRef.current.x}px, ${haloPosRef.current.y}px, 0) translate(-50%, -50%) scale(0.88)`;
      }

      // Trigger crisp shockwave pulse directly centered at click coordinate
      if (shockwaveContainerRef.current && shockwaveRingRef.current) {
        shockwaveContainerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        shockwaveRingRef.current.classList.remove('anim-photon-shockwave');
        // Trigger browser reflow to re-fire animation reliably
        void shockwaveRingRef.current.offsetWidth;
        shockwaveRingRef.current.classList.add('anim-photon-shockwave');
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isMouseDownRef.current = false;
      const x = e.clientX;
      const y = e.clientY;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1)`;
      }

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloPosRef.current.x}px, ${haloPosRef.current.y}px, 0) translate(-50%, -50%) scale(1)`;
      }
    };

    const handleHideCursor = () => {
      isVisibleRef.current = false;
      if (coreRef.current) coreRef.current.style.opacity = '0';
      if (haloRef.current) haloRef.current.style.opacity = '0';
      if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
    };

    const handleShowCursor = () => {
      isVisibleRef.current = true;
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (haloRef.current) haloRef.current.style.opacity = '1';
      if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
    };

    // 2. ULTRA-SMOOTH KINETIC LERP LOOP FOR THE HALO AURA
    // High lerp factor (0.42) ensures fluid natural momentum with zero sluggishness
    const kineticLoop = () => {
      if (isVisibleRef.current && haloRef.current) {
        const targetX = posRef.current.x;
        const targetY = posRef.current.y;

        // Snappy kinetic spring interpolation
        haloPosRef.current.x += (targetX - haloPosRef.current.x) * 0.42;
        haloPosRef.current.y += (targetY - haloPosRef.current.y) * 0.42;

        const scaleModifier = isMouseDownRef.current ? ' scale(0.88)' : '';
        haloRef.current.style.transform = `translate3d(${haloPosRef.current.x}px, ${haloPosRef.current.y}px, 0) translate(-50%, -50%)${scaleModifier}`;
      }
      rafIdRef.current = requestAnimationFrame(kineticLoop);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleHideCursor);
    document.addEventListener('mouseenter', handleShowCursor);
    window.addEventListener('blur', handleHideCursor);
    window.addEventListener('focus', handleShowCursor);

    rafIdRef.current = requestAnimationFrame(kineticLoop);

    return () => {
      mql.removeEventListener('change', handleMqlChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleHideCursor);
      document.removeEventListener('mouseenter', handleShowCursor);
      window.removeEventListener('blur', handleHideCursor);
      window.removeEventListener('focus', handleShowCursor);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isCyberpunk, isDark]);

  if (!isSupported) return null;

  // Refined theme color palettes
  const themeStyles = isCyberpunk
    ? {
        spotlight: 'bg-cyan-500/10',
        coreGlow: 'bg-cyan-400 shadow-[0_0_8px_#00f0ff,0_0_18px_rgba(0,240,255,0.7)]',
        ringBorder: 'border-cyan-400/50',
        notchColor: 'bg-cyan-300',
        shockwave: 'border-cyan-400/80 bg-cyan-400/20 shadow-[0_0_20px_rgba(0,240,255,0.7)]',
      }
    : isDark
    ? {
        spotlight: 'bg-indigo-500/8',
        coreGlow: 'bg-indigo-300 shadow-[0_0_8px_#818cf8,0_0_16px_rgba(99,102,241,0.6)]',
        ringBorder: 'border-indigo-400/50',
        notchColor: 'bg-indigo-200',
        shockwave: 'border-indigo-400/80 bg-indigo-400/20 shadow-[0_0_18px_rgba(99,102,241,0.6)]',
      }
    : {
        spotlight: 'bg-sky-500/6',
        coreGlow: 'bg-sky-600 shadow-[0_0_6px_rgba(2,132,199,0.6)]',
        ringBorder: 'border-sky-500/40',
        notchColor: 'bg-sky-600',
        shockwave: 'border-sky-500/80 bg-sky-500/15 shadow-[0_0_14px_rgba(2,132,199,0.5)]',
      };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
      style={{ contain: 'layout style paint' }}
      aria-hidden="true"
    >
      {/* 1. Tasteful Ambient Radial Glow Spotlight */}
      <div
        ref={spotlightRef}
        className={`fixed top-0 left-0 w-[200px] h-[200px] rounded-full blur-[60px] mix-blend-screen opacity-0 transition-opacity duration-300 hidden md:block ${themeStyles.spotlight}`}
        style={{ willChange: 'transform', transform: 'translate3d(-500px, -500px, 0)' }}
      />

      {/* 2. Isolated Click Shockwave Emitter (Outer container centers at click; inner scales) */}
      <div
        ref={shockwaveContainerRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ willChange: 'transform', transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div
          ref={shockwaveRingRef}
          className={`w-14 h-14 rounded-full border pointer-events-none opacity-0 mix-blend-screen ${themeStyles.shockwave}`}
        />
      </div>

      {/* 3. Hardware Zero-Latency Reticle Core (Synchronous 0ms tracking) */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none opacity-0 transition-opacity duration-150"
        style={{ willChange: 'transform', transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      >
        <div className={`w-full h-full rounded-full ${themeStyles.coreGlow} anim-quantum-pulse`} />
      </div>

      {/* 4. Fluid Kinetic Photon Ring (Clean, uncluttered, sleek) */}
      <div
        ref={haloRef}
        className={`fixed top-0 left-0 rounded-full border flex items-center justify-center pointer-events-none opacity-0 transition-[width,height,background-color,border-color,box-shadow] duration-200 ease-out backdrop-blur-[1px] ${themeStyles.ringBorder}`}
        style={{
          width: '26px',
          height: '26px',
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
        }}
      >
        {/* Subtle, minimalist precision notches */}
        <div className="absolute inset-0 rounded-full anim-reticle-subtle opacity-70">
          <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[3px] rounded-full ${themeStyles.notchColor}`} />
          <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[3px] rounded-full ${themeStyles.notchColor}`} />
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[1.5px] rounded-full ${themeStyles.notchColor}`} />
          <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[1.5px] rounded-full ${themeStyles.notchColor}`} />
        </div>
      </div>
    </div>
  );
};
