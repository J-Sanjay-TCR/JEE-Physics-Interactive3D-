import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Move, Zap } from 'lucide-react';
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
  // Default: Prominently located on the UPSIDE RIGHT (Top-Right) for immediate user attention!
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const fabSize = window.innerWidth < 640 ? 56 : 64;
      return {
        x: Math.max(16, window.innerWidth - fabSize - 24),
        y: window.innerWidth < 640 ? 76 : 88, // Upside right, below top nav
      };
    }
    return { x: 300, y: 88 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; fabX: number; fabY: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Re-calculate position on window resize, preserving upside-right placement
  useEffect(() => {
    const updateDefaultPos = () => {
      if (typeof window !== 'undefined') {
        const fabSize = window.innerWidth < 640 ? 56 : 64;
        const initialX = Math.max(16, window.innerWidth - fabSize - 24);
        const initialY = window.innerWidth < 640 ? 76 : 88;
        
        setPosition((prev) => {
          const clampedX = Math.min(Math.max(12, prev.x || initialX), window.innerWidth - fabSize - 12);
          const clampedY = Math.min(Math.max(60, prev.y || initialY), window.innerHeight - fabSize - 12);
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

    // Pre-unlock audio on pointer down for instant speech capability
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

    const fabWidth = fabRef.current?.offsetWidth || 60;
    const fabHeight = fabRef.current?.offsetHeight || 60;

    const newX = dragStartRef.current.fabX + dx;
    const newY = dragStartRef.current.fabY + dy;

    const clampedX = Math.min(Math.max(12, newX), window.innerWidth - fabWidth - 12);
    const clampedY = Math.min(Math.max(60, newY), window.innerHeight - fabHeight - 12);

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // If user tapped without dragging, trigger open
    if (!hasMovedRef.current) {
      unlockAudio();
      onOpenAiTutor();
    }
    dragStartRef.current = null;
  };

  if (isOpen) return null;

  return (
    <div
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
      className={`fixed top-0 left-0 z-40 select-none ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'
      } transition-transform duration-75`}
    >
      {/* Outer Glowing Aura & Attention-Grabbing Badge */}
      <div className="relative group">
        {/* Eye-catching Upper Attention Badge - Pulsing & Vibrant */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 text-[9.5px] font-black tracking-wide px-2.5 py-0.5 rounded-full shadow-xl border border-amber-200 pointer-events-none flex items-center gap-1 animate-bounce z-20">
          <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
          <span>AI TUTOR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-ping" />
        </div>

        {/* Ambient Pulsing Glow Halo */}
        <div className="absolute -inset-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-full blur-md opacity-85 group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

        {/* Circular Floating AI Button with direct touch & click trigger */}
        <button
          type="button"
          onClick={(e) => {
            if (!hasMovedRef.current) {
              unlockAudio();
              onOpenAiTutor();
            }
          }}
          aria-label="Open AI Physics Tutor (Upside Right Floating Button)"
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#080B14] via-[#12172E] to-[#0A3254] p-[2.5px] border-2 border-cyan-300 shadow-2xl shadow-cyan-500/60 flex items-center justify-center text-white overflow-hidden ring-2 ring-cyan-400/40 active:scale-95 transition-transform"
        >
          {/* Animated Background Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-blue-600/40 to-indigo-500/40 rounded-full" />
          
          {/* Orbit Ring visual */}
          <div className="absolute inset-1 rounded-full border border-cyan-400/40 animate-spin-slow pointer-events-none" />

          {/* AI Tutor Icon & Visual Elements */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,1)]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 absolute -top-0.5 -right-0.5 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 absolute -top-0.5 -right-0.5" />
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-black tracking-wider text-cyan-100 uppercase mt-0.5 font-mono drop-shadow">
              ASK AI
            </span>
          </div>

          {/* Mini Draggable Grip Dot indicator */}
          <div className="absolute bottom-1 w-3 h-0.5 rounded-full bg-cyan-300/90" />
        </button>

        {/* Floating Tooltip Pill (Below when upside) */}
        {(isHovered || isDragging) && (
          <div className="absolute top-full mt-2 right-0 whitespace-nowrap bg-[#0B0B14]/95 backdrop-blur-md border border-cyan-500/50 px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 pointer-events-none transition-all animate-in fade-in zoom-in-95 z-30">
            <Move className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="text-left">
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span>{isDragging ? 'Dragging Tutor...' : 'Click to Ask Doubts (Voice / Text)'}</span>
                <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-[8.5px] font-mono text-cyan-300 font-bold">
                  Ursa Voice
                </span>
              </div>
              <div className="text-[9px] text-zinc-400">
                Founder Sanjay.J • Formulas • Derivations • PYQs
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
