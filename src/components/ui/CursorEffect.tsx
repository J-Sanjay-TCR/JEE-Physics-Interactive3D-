import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Ultra-High-Performance, Zero-Latency Quantum Physics Cursor HUD
 * - 0ms delay hardware-composited transform tracking via requestAnimationFrame
 * - Zero layout reflows: scale transforms instead of width/height layout mutations
 * - Event-delegated pointerover/pointerout checking to eliminate DOM traversal during mousemove
 * - Eliminates backdrop-filter & heavy Gaussian blurs to prevent GPU pipeline stalls on Three.js canvases
 * - User toggleable with persistent localStorage sync ('jee_custom_cursor')
 * - Graceful fallback & auto-cleanup for touch/coarse devices and window unfocus
 */
export const CursorEffect: React.FC = () => {
  const { isDark, isCyberpunk } = useTheme();

  // Support fine-pointer PC devices only
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(pointer: fine)').matches;
      }
    } catch {}
    return false;
  });

  // User preference: toggle custom cursor HUD
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem('jee_custom_cursor') !== 'false';
    } catch {
      return true;
    }
  });

  // Direct DOM references to bypass React re-renders completely
  const coreRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const shockwaveContainerRef = useRef<HTMLDivElement>(null);
  const shockwaveRingRef = useRef<HTMLDivElement>(null);

  // Mutable coordinates for RAF loop
  const targetPos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const isHoveringRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isVisibleRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Listen for external toggle events
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setIsEnabled(customEvent.detail.enabled);
      } else {
        setIsEnabled((prev) => !prev);
      }
    };
    window.addEventListener('jee-toggle-cursor', handleToggle);
    return () => window.removeEventListener('jee-toggle-cursor', handleToggle);
  }, []);

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

    return () => mql.removeEventListener('change', handleMqlChange);
  }, []);

  useEffect(() => {
    if (!isSupported || !isEnabled) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // 1. Ultra-lightweight pointer position recorder (ZERO layout calculation)
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        handleHide();
        return;
      }

      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        currentPos.current.x = e.clientX;
        currentPos.current.y = e.clientY;
        if (coreRef.current) coreRef.current.style.opacity = '1';
        if (haloRef.current) haloRef.current.style.opacity = '1';
      }
    };

    // 2. High-performance event delegation for hover state:
    // Only runs when entering/leaving DOM elements, NEVER during movement across canvas!
    const interactiveSelector =
      'a, button, input, textarea, select, [role="button"], [role="tab"], [role="switch"], [role="slider"], label, summary, [data-cursor-interactive], .cursor-pointer';

    const handlePointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const target = e.target as Element | null;
      const isInteractive = Boolean(target?.closest?.(interactiveSelector));
      if (isInteractive !== isHoveringRef.current) {
        isHoveringRef.current = isInteractive;
        updateReticleHover(isInteractive);
      }
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      // If moving out to null or window boundary, reset hover
      if (!e.relatedTarget) {
        isHoveringRef.current = false;
        updateReticleHover(false);
      }
    };

    const updateReticleHover = (hovering: boolean) => {
      if (!haloRef.current) return;
      if (hovering) {
        haloRef.current.style.transform = `scale(1.48)`;
        haloRef.current.style.borderColor = isCyberpunk
          ? 'rgba(0, 240, 255, 0.95)'
          : isDark
          ? 'rgba(129, 140, 248, 0.9)'
          : 'rgba(2, 132, 199, 0.9)';
        haloRef.current.style.backgroundColor = isCyberpunk
          ? 'rgba(0, 240, 255, 0.12)'
          : isDark
          ? 'rgba(99, 102, 241, 0.12)'
          : 'rgba(2, 132, 199, 0.08)';
        haloRef.current.style.boxShadow = isCyberpunk
          ? '0 0 14px rgba(0, 240, 255, 0.5)'
          : isDark
          ? '0 0 12px rgba(129, 140, 248, 0.4)'
          : '0 0 10px rgba(2, 132, 199, 0.25)';
      } else {
        haloRef.current.style.transform = `scale(1)`;
        haloRef.current.style.borderColor = isCyberpunk
          ? 'rgba(0, 240, 255, 0.45)'
          : isDark
          ? 'rgba(129, 140, 248, 0.45)'
          : 'rgba(2, 132, 199, 0.4)';
        haloRef.current.style.backgroundColor = 'transparent';
        haloRef.current.style.boxShadow = 'none';
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isMouseDownRef.current = true;
      const x = e.clientX;
      const y = e.clientY;

      if (haloRef.current) {
        haloRef.current.style.transform = isHoveringRef.current ? 'scale(1.2)' : 'scale(0.82)';
      }

      if (shockwaveContainerRef.current && shockwaveRingRef.current) {
        shockwaveContainerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        shockwaveRingRef.current.classList.remove('anim-photon-shockwave');
        // Force reflow specifically on this tiny detached element for click pulse
        void shockwaveRingRef.current.offsetWidth;
        shockwaveRingRef.current.classList.add('anim-photon-shockwave');
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isMouseDownRef.current = false;
      if (haloRef.current) {
        haloRef.current.style.transform = isHoveringRef.current ? 'scale(1.48)' : 'scale(1)';
      }
    };

    const handleHide = () => {
      isVisibleRef.current = false;
      if (coreRef.current) coreRef.current.style.opacity = '0';
      if (haloRef.current) haloRef.current.style.opacity = '0';
    };

    const handleShow = () => {
      isVisibleRef.current = true;
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (haloRef.current) haloRef.current.style.opacity = '1';
    };

    // 3. Ultra-Responsive Hardware-Composited Animation Frame Loop
    // Tracks pointer coordinates with 0ms tearing & maximum display refresh rate (120/144/240Hz)
    const tick = () => {
      const tx = targetPos.current.x;
      const ty = targetPos.current.y;

      // 1:1 Instantaneous translation for the photon reticle
      if (coreRef.current && isVisibleRef.current) {
        coreRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }

      // Smooth subtle damping for the trailing halo reticle (0.42 factor for crisp, snappy feel without latency)
      currentPos.current.x += (tx - currentPos.current.x) * 0.42;
      currentPos.current.y += (ty - currentPos.current.y) * 0.42;

      if (haloRef.current && isVisibleRef.current) {
        // Outer halo wrapper positioning
        const haloWrapper = haloRef.current.parentElement;
        if (haloWrapper) {
          haloWrapper.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleHide);
    document.addEventListener('mouseenter', handleShow);
    window.addEventListener('blur', handleHide);
    window.addEventListener('focus', handleShow);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleHide);
      document.removeEventListener('mouseenter', handleShow);
      window.removeEventListener('blur', handleHide);
      window.removeEventListener('focus', handleShow);
    };
  }, [isSupported, isEnabled, isCyberpunk, isDark]);

  if (!isSupported || !isEnabled) return null;

  // Refined theme glow palettes
  const themeStyles = isCyberpunk
    ? {
        coreGlow: 'bg-cyan-400 shadow-[0_0_8px_#00f0ff,0_0_16px_rgba(0,240,255,0.8)]',
        ringBorder: 'border-cyan-400/60',
        notchColor: 'bg-cyan-300',
        shockwave: 'border-cyan-400/80 bg-cyan-400/20 shadow-[0_0_16px_rgba(0,240,255,0.7)]',
      }
    : isDark
    ? {
        coreGlow: 'bg-indigo-300 shadow-[0_0_8px_#818cf8,0_0_14px_rgba(99,102,241,0.6)]',
        ringBorder: 'border-indigo-400/50',
        notchColor: 'bg-indigo-200',
        shockwave: 'border-indigo-400/80 bg-indigo-400/20 shadow-[0_0_14px_rgba(99,102,241,0.6)]',
      }
    : {
        coreGlow: 'bg-sky-600 shadow-[0_0_6px_rgba(2,132,199,0.6)]',
        ringBorder: 'border-sky-500/50',
        notchColor: 'bg-sky-600',
        shockwave: 'border-sky-500/80 bg-sky-500/15 shadow-[0_0_12px_rgba(2,132,199,0.5)]',
      };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* 1. Isolated Click Shockwave Emitter */}
      <div
        ref={shockwaveContainerRef}
        className="fixed top-0 left-0 pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform', transform: 'translate3d(-200px, -200px, 0)' }}
      >
        <div
          ref={shockwaveRingRef}
          className={`w-12 h-12 rounded-full border pointer-events-none opacity-0 ${themeStyles.shockwave}`}
        />
      </div>

      {/* 2. Fluid Reticle Halo Wrapper (Follows with snappy kinetic smoothing) */}
      <div
        className="fixed top-0 left-0 pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform', transform: 'translate3d(-200px, -200px, 0)' }}
      >
        <div
          ref={haloRef}
          className={`w-7 h-7 rounded-full border flex items-center justify-center pointer-events-none opacity-0 transition-transform duration-150 ease-out ${themeStyles.ringBorder}`}
          style={{ willChange: 'transform', transform: 'scale(1)' }}
        >
          {/* Subtle precision reticle notches */}
          <div className="absolute inset-0 rounded-full anim-reticle-subtle opacity-70">
            <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[3px] rounded-full ${themeStyles.notchColor}`} />
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[3px] rounded-full ${themeStyles.notchColor}`} />
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[1.5px] rounded-full ${themeStyles.notchColor}`} />
            <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[1.5px] rounded-full ${themeStyles.notchColor}`} />
          </div>
        </div>
      </div>

      {/* 3. Hardware Zero-Latency Reticle Core (Synchronous 1:1 photon dot) */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
        style={{ willChange: 'transform', transform: 'translate3d(-200px, -200px, 0)' }}
      >
        <div className={`w-full h-full rounded-full ${themeStyles.coreGlow} anim-cursor-pulse`} />
      </div>
    </div>
  );
};
