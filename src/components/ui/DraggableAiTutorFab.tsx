import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Move } from 'lucide-react';
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
  // Default: Prominently located on the BOTTOM-RIGHT for intuitive accessibility without blocking top headers/actions
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const fabSize = isMobile ? 56 : 64;
      return {
        x: Math.max(16, window.innerWidth - fabSize - (isMobile ? 16 : 24)),
        y: Math.max(80, window.innerHeight - fabSize - (isMobile ? 84 : 28)),
      };
    }
    return { x: 300, y: 550 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; fabX: number; fabY: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Re-calculate position on window resize, preserving ergonomic bottom-right placement
  useEffect(() => {
    const updateDefaultPos = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 640;
        const fabSize = isMobile ? 56 : 64;
        const initialX = Math.max(16, window.innerWidth - fabSize - (isMobile ? 16 : 24));
        const initialY = Math.max(80, window.innerHeight - fabSize - (isMobile ? 84 : 28));

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

    const fabWidth = fabRef.current?.offsetWidth || 56;
    const fabHeight = fabRef.current?.offsetHeight || 56;

    const newX = dragStartRef.current.fabX + dx;
    const newY = dragStartRef.current.fabY + dy;

    // Constrain within safe viewport boundaries (keep clear of top header at y >= 65)
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-40 select-none p-1.5 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      } transition-transform duration-75`}
    >
      {/* Outer Glowing Aura & Attention-Grabbing Badge */}
      <div className="relative group">
        {/* Upper Attention Badge: AI TUTOR with animated shimmer */}
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 text-[9.5px] font-black tracking-wider px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)] border border-cyan-200 pointer-events-none flex items-center gap-1.5 z-20 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent anim-ai-shimmer pointer-events-none" />
          <Sparkles className="w-2.5 h-2.5 fill-slate-950 text-slate-950 animate-spin-slow shrink-0" />
          <span className="relative z-10">AI TUTOR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 border border-emerald-400 animate-ping shrink-0" />
        </div>

        {/* Ambient Pulsing Glow Halo */}
        <div
          className="absolute -inset-3 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 opacity-60 group-hover:opacity-95 rounded-full blur-lg transition duration-500 pointer-events-none anim-ai-quantum-glow"
        />

        {/* Outer Orbiting Particle 1 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] anim-ai-orbit-1" />
        </div>

        {/* Outer Orbiting Particle 2 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_#818cf8] anim-ai-orbit-2" />
        </div>

        {/* Circular Floating AI Button with direct touch & click trigger */}
        <button
          type="button"
          onClick={() => {
            if (!hasMovedRef.current) {
              unlockAudio();
              onOpenAiTutor();
            }
          }}
          aria-label="Open AI Physics Tutor"
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#050711] via-[#0B132B] to-[#0A2540] p-[2px] border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center text-white overflow-hidden ring-2 ring-cyan-400/30 group-hover:scale-105 active:scale-95 transition-all"
        >
          {/* Holographic Rotating Conic Gradient Border Behind */}
          <div
            className="absolute -inset-4 opacity-80 group-hover:opacity-100 anim-ai-hologram-border pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, #00f0ff 90deg, #6366f1 180deg, #a855f7 270deg, transparent 360deg)',
            }}
          />

          {/* Inner Dark Mask */}
          <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-[#070b19] via-[#0a1024] to-[#04060d] z-0" />

          {/* Animated Background Shimmer Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent anim-ai-shimmer pointer-events-none z-0" />

          {/* Concentric Gyroscope / Radar Ring */}
          <div className="absolute inset-1.5 rounded-full border border-cyan-400/30 border-dashed animate-spin-slow pointer-events-none z-0" />
          <div className="absolute inset-2.5 rounded-full border border-indigo-400/20 pointer-events-none z-0" />

          {/* AI Tutor Icon & Visual Elements */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 drop-shadow-[0_0_14px_rgba(6,182,212,1)] anim-ai-neon-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-cyan-200 uppercase mt-0.5 font-mono drop-shadow">
              AI TUTOR
            </span>
          </div>

          {/* Mini Draggable Grip Dot indicator */}
          <div className="absolute bottom-1 w-3.5 h-0.5 rounded-full bg-cyan-400/80 shadow-[0_0_4px_#22d3ee] z-10" />
        </button>

        {/* Floating Tooltip Pill */}
        {(isHovered || isDragging) && (
          <div
            className={`absolute ${
              isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2'
            } right-0 whitespace-nowrap bg-[#080B16]/95 backdrop-blur-md border border-cyan-500/60 px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto transition-all animate-in fade-in zoom-in-95 z-30`}
          >
            <Move className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="text-left">
              <div className="text-[11.5px] font-bold text-white flex items-center gap-2">
                <span>AI Physics Tutor & Doubt Solver</span>
              </div>
              <div className="text-[9.5px] text-zinc-300 mt-0.5">
                Click to ask questions, inspect 3D simulations & explore derivations
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
