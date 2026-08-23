import React, { useState, useRef, useEffect } from 'react';
import { PhysicsTermDefinition, PHYSICS_TERMINOLOGY, getPhysicsTerm } from '../../data/physicsTerminology';
import { Latex } from './Latex';
import { Sparkles, Info, BookOpen, Atom, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminologyTooltipProps {
  term: string | PhysicsTermDefinition;
  children?: React.ReactNode;
  inline?: boolean;
}

export const TerminologyTooltip: React.FC<TerminologyTooltipProps> = ({
  term,
  children,
  inline = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const definition: PhysicsTermDefinition | undefined =
    typeof term === 'string' ? getPhysicsTerm(term) : term;

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Keep within viewport boundaries
      if (left < 12) left = 12;
      if (left + tooltipWidth > window.innerWidth - 12) {
        left = window.innerWidth - tooltipWidth - 12;
      }

      let top = rect.bottom + 8;
      // If close to bottom, show above
      if (rect.bottom + 220 > window.innerHeight && rect.top > 220) {
        top = rect.top - 210;
      }

      setCoords({ top, left });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  if (!definition) {
    return <span>{children || (typeof term === 'string' ? term : '')}</span>;
  }

  const categoryColors = {
    mechanics: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
    electromagnetism: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
    thermal: 'from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/40',
    optics: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
    modern: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40',
    waves: 'from-sky-500/20 to-indigo-500/20 text-sky-300 border-sky-500/40',
  };

  const colorStyle = categoryColors[definition.category] || categoryColors.mechanics;

  return (
    <span className={inline ? 'inline-block relative' : 'relative'}>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggleClick}
        className="cursor-help inline-flex items-center gap-0.5 border-b border-dotted border-cyan-400/70 text-cyan-200 hover:text-cyan-100 hover:border-cyan-300 transition px-0.5 rounded-sm bg-cyan-950/20"
        title="Hover or tap to view technical Physics definition"
        role="button"
        tabIndex={0}
      >
        <span>{children || definition.term}</span>
        <Info className="w-2.5 h-2.5 text-cyan-400/80 inline" />
      </span>

      {/* Floating Tooltip Portal / Overlay */}
      <AnimatePresence>
        {isOpen && coords && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: '320px',
              zIndex: 9999,
            }}
            className="bg-[#0C0D14] border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl shadow-cyan-950/80 text-zinc-200 backdrop-blur-xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded-md border ${colorStyle}`}>
                  <Atom className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    <Latex>{definition.term}</Latex>
                  </h4>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400/90 font-bold">
                    Physics Terminology
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-white/[0.1] text-zinc-400 hover:text-white transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Definition Body */}
            <div className="py-2 text-[11px] text-zinc-300 leading-relaxed">
              <Latex>{definition.definition}</Latex>
            </div>

            {/* Formula & SI Unit if present */}
            {(definition.formula || definition.unit) && (
              <div className="bg-[#12131F] rounded-lg p-2 my-1 border border-white/[0.06] flex flex-col gap-1 text-[11px]">
                {definition.formula && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">Formula:</span>
                    <span className="text-cyan-300 font-mono">
                      <Latex>{`$${definition.formula}$`}</Latex>
                    </span>
                  </div>
                )}
                {definition.unit && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">SI Unit:</span>
                    <span className="text-amber-300 font-mono">
                      <Latex>{`$${definition.unit}$`}</Latex>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* JEE High-Yield Key */}
            <div className="mt-1 pt-1.5 border-t border-white/[0.06] flex items-start gap-1.5 text-[10px] text-amber-200/90">
              <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-tight">
                <strong className="text-amber-300 font-bold">JEE Key: </strong>
                <Latex>{definition.jeeKey}</Latex>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

/**
 * Helper component that scans text and highlights all known physics terms with interactive tooltips
 */
export const HighlightedPhysicsText: React.FC<{ text: string }> = ({ text }) => {
  const termsList = Object.keys(PHYSICS_TERMINOLOGY).sort((a, b) => b.length - a.length);

  // Split text by recognized terms
  const regex = new RegExp(`\\b(${termsList.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, idx) => {
        const matchingDef = getPhysicsTerm(part);
        if (matchingDef) {
          return (
            <TerminologyTooltip key={idx} term={matchingDef}>
              {part}
            </TerminologyTooltip>
          );
        }
        return <Latex key={idx}>{part}</Latex>;
      })}
    </span>
  );
};
