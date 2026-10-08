import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Move, Zap } from 'lucide-react';
import { unlockAudio } from '../../utils/audioPlayer';

interface DraggableAiTutorFabProps {
  onOpenAiTutor: () => void;
  isOpen?: boolean;
}

export const DraggableAiTutorFab: React.FC<DraggableAiTutorFabProps> = ({
  onOpenAiTutor,
  isOpen = false,
}) => {
  // Store position { x, y } in pixels from top-left of viewport.
  // Default: Prominently located on the BOTTOM-RIGHT for intuitive accessibility
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const fabSize = isMobile ? 62 : 70;
      return {
        x: Math.max(16, window.innerWidth - fabSize - (isMobile ? 16 : 24)),
        y: Math.max(80, window.innerHeight - fabSize - (isMobile ? 84 : 32)),
      };
    }
    return { x: 300, y: 550 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; fabX: number; fabY: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Glimmer Eyes AI & Gaze Tracking State
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sphereTilt, setSphereTilt] = useState<{ rotateX: number; rotateY: number; rotateZ: number }>({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  });
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [eyeEmotion, setEyeEmotion] = useState<'innocent' | 'curious' | 'happy' | 'wonder'>('innocent');
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Autonomous Innocent Gaze Loop (looks around innocently when idle)
  useEffect(() => {
    const idleGazePositions: Array<{ x: number; y: number; tiltZ: number; emotion: 'innocent' | 'curious' | 'wonder' }> = [
      { x: 0, y: 0, tiltZ: 0, emotion: 'innocent' }, // Looking straight forward innocently
      { x: 3.5, y: -2.5, tiltZ: 3, emotion: 'curious' }, // Glancing up-right wonderingly
      { x: -3.8, y: -1, tiltZ: -3.5, emotion: 'wonder' }, // Looking left with cute tilted head
      { x: 0, y: 0, tiltZ: 0, emotion: 'innocent' }, // Centering
      { x: 3.2, y: 1.5, tiltZ: 2, emotion: 'curious' }, // Glancing down-right thoughtfully
      { x: -2.5, y: 2.8, tiltZ: -2, emotion: 'wonder' }, // Glancing down-left gently
      { x: 0, y: -3.5, tiltZ: 0, emotion: 'curious' }, // Looking straight up at the stars
    ];

    let currentIdx = 0;
    const idleInterval = setInterval(() => {
      // Only execute idle innocent roaming if user hasn't moved cursor recently and not dragging
      if (Date.now() - lastInteractionTimeRef.current > 2400 && !isDragging && !isHovered) {
        currentIdx = (currentIdx + 1) % idleGazePositions.length;
        const target = idleGazePositions[currentIdx];
        setEyeOffset({ x: target.x, y: target.y });
        setSphereTilt({
          rotateX: -target.y * 1.5,
          rotateY: target.x * 2.2,
          rotateZ: target.tiltZ,
        });
        setEyeEmotion(target.emotion);
      }
    }, 2800);

    return () => clearInterval(idleInterval);
  }, [isDragging, isHovered]);

  // Organic Blinking Engine (natural blinks & occasional cute double-blinks)
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;

    const triggerBlink = () => {
      setIsBlinking(true);

      const blinkDuration = 110;
      setTimeout(() => {
        setIsBlinking(false);

        // 25% chance of an adorable rapid double-blink
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => {
              setIsBlinking(false);
            }, 90);
          }, 140);
        }
      }, blinkDuration);

      // Schedule next natural blink between 3.2s and 6.0s
      const nextDelay = 3200 + Math.random() * 2800;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3500);

    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, []);

  // Natural Gaze Cursor Tracking with gentle parallax
  const handleGlobalPointerMove = useCallback((e: MouseEvent) => {
    if (isDragging) return;
    lastInteractionTimeRef.current = Date.now();

    const fabEl = fabRef.current;
    if (!fabEl) return;

    const rect = fabEl.getBoundingClientRect();
    const orbCenterX = rect.left + rect.width / 2;
    const orbCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - orbCenterX;
    const dy = e.clientY - orbCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) return;

    // Eye displacement clamped to max 4.2px
    const maxOffset = 4.2;
    const falloffFactor = Math.min(dist / 380, 1);
    const offsetX = (dx / dist) * maxOffset * falloffFactor;
    const offsetY = (dy / dist) * maxOffset * falloffFactor;

    setEyeOffset({ x: offsetX, y: offsetY });
    setSphereTilt({
      rotateX: -offsetY * 1.8,
      rotateY: offsetX * 2.5,
      rotateZ: (dx / (window.innerWidth || 1000)) * 4,
    });
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalPointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalPointerMove);
  }, [handleGlobalPointerMove]);

  // Window Resize Clamping
  useEffect(() => {
    const updateDefaultPos = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 640;
        const fabSize = isMobile ? 62 : 70;
        const initialX = Math.max(16, window.innerWidth - fabSize - (isMobile ? 16 : 24));
        const initialY = Math.max(80, window.innerHeight - fabSize - (isMobile ? 84 : 32));

        setPosition((prev) => {
          const clampedX = Math.min(Math.max(12, prev.x || initialX), window.innerWidth - fabSize - 12);
          const clampedY = Math.min(Math.max(70, prev.y || initialY), window.innerHeight - fabSize - 12);
          return { x: clampedX, y: clampedY };
        });
      }
    };

    window.addEventListener('resize', updateDefaultPos);
    return () => window.removeEventListener('resize', updateDefaultPos);
  }, []);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    unlockAudio();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      fabX: position.x,
      fabY: position.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !isDragging) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.hypot(dx, dy) > 5) {
      hasMovedRef.current = true;
    }

    const fabWidth = fabRef.current?.offsetWidth || 64;
    const fabHeight = fabRef.current?.offsetHeight || 64;

    const newX = dragStartRef.current.fabX + dx;
    const newY = dragStartRef.current.fabY + dy;

    // Constrain within safe viewport boundaries
    const clampedX = Math.min(Math.max(12, newX), window.innerWidth - fabWidth - 12);
    const clampedY = Math.min(Math.max(70, newY), window.innerHeight - fabHeight - 12);

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = null;
  };

  if (isOpen) return null;

  const isNearBottom = typeof window !== 'undefined' ? position.y > window.innerHeight - 150 : true;

  return (
    <div
      id="draggable-ai-tutor-fab"
      ref={fabRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        setIsHovered(true);
        setEyeEmotion('happy');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setEyeEmotion('innocent');
      }}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-40 select-none p-2 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      } transition-transform duration-75`}
    >
      <div className="relative group flex flex-col items-center">
        {/* Upper Attention Badge: Floating AI TUTOR Pill */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 text-slate-950 text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.7)] border border-white/60 pointer-events-none flex items-center gap-1.5 z-30 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent anim-ai-shimmer pointer-events-none" />
          <Sparkles className="w-2.5 h-2.5 fill-slate-950 text-slate-950 anim-ai-sparkle-spin shrink-0" />
          <span className="relative z-10 font-mono">AI TUTOR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse shrink-0" />
        </div>

        {/* Dynamic Altitude Shadow under Floating Sphere */}
        <div className="absolute -bottom-2 w-10 sm:w-12 h-2.5 bg-cyan-900/40 rounded-[100%] blur-[4px] anim-ai-orb-shadow pointer-events-none" />

        {/* Ambient Cyan/Indigo Pulsing Quantum Halo */}
        <div
          className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-500/30 via-sky-400/25 to-indigo-600/35 blur-md pointer-events-none transition-all duration-300 group-hover:blur-lg group-hover:scale-110"
        />

        {/* Gyroscopic Quantum Orbit Ring (3D angled rotating halo) */}
        <div
          className="absolute inset-[-6px] rounded-full border border-cyan-400/40 pointer-events-none anim-ai-ring-spin"
          style={{
            borderWidth: '1.5px',
            borderStyle: 'dashed',
            boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
          }}
        />

        {/* Orbiting Quantum Star Particle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] anim-ai-orbit-1" />
        </div>

        {/* ========================================================= */}
        {/* THE 3D FLOATING SPHERE WITH BRIGHT GLIMMERING EYES        */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={() => {
            if (!hasMovedRef.current) {
              unlockAudio();
              onOpenAiTutor();
            }
          }}
          aria-label="Open AI Physics Tutor"
          className="anim-ai-orb-float relative w-15 h-15 sm:w-17 sm:h-17 rounded-full p-[2px] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(0,240,255,0.4)] border border-cyan-400/80 ring-2 ring-cyan-400/30"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #00f0ff 0deg, #6366f1 120deg, #38bdf8 240deg, #00f0ff 360deg)',
            perspective: '600px',
          }}
        >
          {/* Deep Obsidian 3D Glass Sphere Body */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200"
            style={{
              background: 'radial-gradient(circle at 35% 28%, #1a3258 0%, #0c1833 35%, #050a18 70%, #02040b 100%)',
              boxShadow: 'inset -3px -4px 10px rgba(99,102,241,0.5), inset 3px 3px 8px rgba(34,211,238,0.5)',
              transform: `rotateX(${sphereTilt.rotateX}deg) rotateY(${sphereTilt.rotateY}deg) rotateZ(${sphereTilt.rotateZ}deg)`,
            }}
          >
            {/* Top-Left Glossy Glass Reflection Highlight */}
            <div
              className="absolute top-1.5 left-2 w-7 h-4.5 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.85) 0%, rgba(34,211,238,0.4) 45%, transparent 75%)',
                transform: 'rotate(-25deg)',
              }}
            />

            {/* Bottom Inner Iridescent Ambient Glow */}
            <div
              className="absolute bottom-0 inset-x-0 h-4 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.45) 0%, transparent 80%)',
              }}
            />

            {/* Visor Plate for Eyes (Dark Luminous Recess) */}
            <div
              className="relative w-11 h-7 sm:w-12 sm:h-8 rounded-[18px] bg-[#030611]/90 border border-cyan-500/40 shadow-[inset_0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2.5 sm:gap-3 px-1 transition-all duration-150 overflow-hidden"
              style={{
                transform: `translate3d(${eyeOffset.x * 0.4}px, ${eyeOffset.y * 0.4}px, 0)`,
              }}
            >
              {/* Scanline texture inside visor */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.8) 2px, rgba(34,211,238,0.8) 3px)',
                }}
              />

              {/* Innocent Blush Cheeks (Subtle cute rosy-cyan glow on hover or happy) */}
              <div
                className={`absolute bottom-0.5 left-1.5 w-2 h-1 rounded-full bg-cyan-400/40 blur-[1px] transition-opacity duration-300 ${
                  isHovered || eyeEmotion === 'happy' ? 'opacity-90' : 'opacity-25'
                }`}
              />
              <div
                className={`absolute bottom-0.5 right-1.5 w-2 h-1 rounded-full bg-cyan-400/40 blur-[1px] transition-opacity duration-300 ${
                  isHovered || eyeEmotion === 'happy' ? 'opacity-90' : 'opacity-25'
                }`}
              />

              {/* ===================================== */}
              {/* LEFT BRIGHT GLIMMER EYE              */}
              {/* ===================================== */}
              <div
                className="relative flex items-center justify-center transition-all duration-150 ease-out"
                style={{
                  transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0) scaleY(${isBlinking ? 0.08 : 1})`,
                }}
              >
                {isHovered || eyeEmotion === 'happy' ? (
                  // Happy Curved Eye Arc ^ _ ^
                  <div className="w-3.5 h-3.5 border-t-2 border-white rounded-t-full shadow-[0_0_10px_#22d3ee] anim-ai-eye-twinkle" />
                ) : (
                  // Normal Innocent Glimmer Eye
                  <div
                    className="relative w-3 h-4 sm:w-3.5 sm:h-4.5 rounded-[50%] bg-gradient-to-b from-white via-cyan-300 to-sky-400 shadow-[0_0_12px_#22d3ee,0_0_24px_rgba(6,182,212,0.8)] border border-cyan-100 flex items-center justify-center anim-ai-eye-twinkle overflow-hidden"
                  >
                    {/* Darker Inner Iris Core */}
                    <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-b from-sky-400 to-cyan-600 opacity-70" />

                    {/* Primary Bright Glimmer Star Sparkle (Top-Right) */}
                    <div
                      className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] z-10"
                    />

                    {/* Secondary Innocent Micro-Twinkle Dot (Bottom-Left) */}
                    <div
                      className="absolute bottom-1 left-0.5 w-0.5 h-0.5 rounded-full bg-white/95 z-10"
                    />
                  </div>
                )}
              </div>

              {/* ===================================== */}
              {/* RIGHT BRIGHT GLIMMER EYE             */}
              {/* ===================================== */}
              <div
                className="relative flex items-center justify-center transition-all duration-150 ease-out"
                style={{
                  transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0) scaleY(${isBlinking ? 0.08 : 1})`,
                }}
              >
                {isHovered || eyeEmotion === 'happy' ? (
                  // Happy Curved Eye Arc ^ _ ^
                  <div className="w-3.5 h-3.5 border-t-2 border-white rounded-t-full shadow-[0_0_10px_#22d3ee] anim-ai-eye-twinkle" />
                ) : (
                  // Normal Innocent Glimmer Eye
                  <div
                    className="relative w-3 h-4 sm:w-3.5 sm:h-4.5 rounded-[50%] bg-gradient-to-b from-white via-cyan-300 to-sky-400 shadow-[0_0_12px_#22d3ee,0_0_24px_rgba(6,182,212,0.8)] border border-cyan-100 flex items-center justify-center anim-ai-eye-twinkle overflow-hidden"
                  >
                    {/* Darker Inner Iris Core */}
                    <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-b from-sky-400 to-cyan-600 opacity-70" />

                    {/* Primary Bright Glimmer Star Sparkle (Top-Right) */}
                    <div
                      className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] z-10"
                    />

                    {/* Secondary Innocent Micro-Twinkle Dot (Bottom-Left) */}
                    <div
                      className="absolute bottom-1 left-0.5 w-0.5 h-0.5 rounded-full bg-white/95 z-10"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Micro Antennas / Gyro Ear Nodes on sides */}
            <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-2 rounded-l-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-2 rounded-r-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />

            {/* Bottom Grip / Thruster Vent */}
            <div className="absolute bottom-1 w-3.5 h-1 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee] z-10 flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </button>

        {/* Floating Tooltip Pill */}
        {(isHovered || isDragging) && (
          <div
            className={`absolute ${
              isNearBottom ? 'bottom-full mb-3' : 'top-full mt-3'
            } right-0 whitespace-nowrap bg-[#080B16]/95 backdrop-blur-md border border-cyan-500/60 px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto transition-all animate-in fade-in zoom-in-95 z-30`}
          >
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 shadow-xs shrink-0">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-[11.5px] font-bold text-white flex items-center gap-1.5 font-mono">
                <span>AI Physics Tutor</span>
                <span className="text-[10px] text-cyan-300 font-normal">• Online</span>
              </div>
              <div className="text-[9.5px] text-zinc-300 mt-0.5">
                Click me to ask doubts, explore 3D calculus & step-by-step solutions
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
