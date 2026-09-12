import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Atom,
  Sparkles,
  Compass,
  Zap,
  Sliders,
  Maximize2,
  BookOpen,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export interface SpotlightStep {
  targetSelector: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  padding?: number;
  borderRadius?: number;
  badge?: string;
  onBeforeStep?: () => void | Promise<void>;
}

export interface SpotlightTutorialOverlayProps {
  initialSteps?: SpotlightStep[];
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  storageKey?: string;
  autoStart?: boolean;
}

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

// Default 5-Step Guided Physics Walkthrough
export const DEFAULT_PHYSICS_TUTORIAL_STEPS: SpotlightStep[] = [
  {
    targetSelector: '#section-top',
    title: 'Active Concept & Formula Header',
    description: 'Track your current physics syllabus chapter, inspect the governing mathematical equation, and toggle between focus views.',
    placement: 'bottom',
    badge: 'SYLLABUS & FORMULAS',
    padding: 10,
    borderRadius: 18,
  },
  {
    targetSelector: '#section-3d',
    title: 'Real-Time 3D Physics Simulation',
    description: 'Drag with your mouse or finger to orbit around the apparatus. Zoom and inspect live vector decompositions and particle trajectories.',
    placement: 'bottom',
    badge: '3D APPARATUS',
    padding: 12,
    borderRadius: 20,
  },
  {
    targetSelector: '#section-controls',
    title: 'Dynamic Parameter Laboratory',
    description: 'Fine-tune initial velocity, launch angles, mass, and field strengths. Observe instant numerical solutions and edge-case behaviors.',
    placement: 'left',
    badge: 'VARIABLE LAB',
    padding: 10,
    borderRadius: 18,
  },
  {
    targetSelector: '#lab-tab-switcher',
    title: 'Live Graphs, Strategy & JEE Archive',
    description: 'Switch between real-time Cartesian graphs, coaching derivations, JEE strategy breakdowns, and interactive practice problems.',
    placement: 'bottom',
    badge: 'LABORATORY HUD',
    padding: 8,
    borderRadius: 14,
  },
  {
    targetSelector: '#draggable-ai-tutor-fab',
    title: 'Voice-Enabled AI Physics Tutor',
    description: 'Drag and tap this floating mentor anytime to receive instant voice explanations, step-by-step problem derivations, and JEE tips.',
    placement: 'left',
    badge: 'AI MENTOR',
    padding: 12,
    borderRadius: 36,
  },
];

// Singleton event subscriber for imperative function calls
type TutorialEventListener = (event: {
  action: 'start' | 'next' | 'prev' | 'skip' | 'goto';
  steps?: SpotlightStep[];
  stepIndex?: number;
}) => void;

const listeners: Set<TutorialEventListener> = new Set();

function emitTutorialEvent(event: {
  action: 'start' | 'next' | 'prev' | 'skip' | 'goto';
  steps?: SpotlightStep[];
  stepIndex?: number;
}) {
  listeners.forEach((listener) => listener(event));
}

// Imperative helper functions exposed for app code & window
export function startTutorial(steps?: SpotlightStep[]) {
  emitTutorialEvent({ action: 'start', steps });
}

export function nextStep() {
  emitTutorialEvent({ action: 'next' });
}

export function prevStep() {
  emitTutorialEvent({ action: 'prev' });
}

export function skipTutorial() {
  emitTutorialEvent({ action: 'skip' });
}

export function goToStep(stepIndex: number) {
  emitTutorialEvent({ action: 'goto', stepIndex });
}

// React Hook
export function useSpotlightTutorial() {
  return {
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    goToStep,
  };
}

// Bind to window for easy direct calls in scripts or console
if (typeof window !== 'undefined') {
  (window as unknown as { startTutorial: typeof startTutorial }).startTutorial = startTutorial;
  (window as unknown as { nextStep: typeof nextStep }).nextStep = nextStep;
  (window as unknown as { prevStep: typeof prevStep }).prevStep = prevStep;
  (window as unknown as { skipTutorial: typeof skipTutorial }).skipTutorial = skipTutorial;
}

export const SpotlightTutorialOverlay: React.FC<SpotlightTutorialOverlayProps> = ({
  initialSteps = DEFAULT_PHYSICS_TUTORIAL_STEPS,
  isOpen: propIsOpen,
  onClose,
  onComplete,
  storageKey = 'jee_physics_spotlight_tour_seen',
  autoStart = false,
}) => {
  const [activeSteps, setActiveSteps] = useState<SpotlightStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({
    top: 100,
    left: 100,
    placement: 'bottom',
  });
  const [isMeasuring, setIsMeasuring] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveElementRef = useRef<HTMLElement | null>(null);

  // Sync external isOpen prop if provided
  useEffect(() => {
    if (propIsOpen !== undefined) {
      if (propIsOpen && !isActive) {
        handleStart(initialSteps);
      } else if (!propIsOpen && isActive) {
        handleClose();
      }
    }
  }, [propIsOpen]);

  // Subscribe to imperative events (startTutorial, nextStep, skipTutorial, etc.)
  useEffect(() => {
    const handleEvent: TutorialEventListener = (event) => {
      switch (event.action) {
        case 'start':
          handleStart(event.steps || initialSteps);
          break;
        case 'next':
          handleNext();
          break;
        case 'prev':
          handlePrev();
          break;
        case 'skip':
          handleClose();
          break;
        case 'goto':
          if (event.stepIndex !== undefined) {
            handleGoTo(event.stepIndex);
          }
          break;
      }
    };

    listeners.add(handleEvent);
    return () => {
      listeners.delete(handleEvent);
    };
  }, [initialSteps, activeSteps, currentStepIndex, isActive]);

  // Auto-start check on initial load if requested
  useEffect(() => {
    if (autoStart) {
      try {
        const seen = localStorage.getItem(storageKey);
        if (!seen) {
          const timer = setTimeout(() => {
            handleStart(initialSteps);
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch {
        // Ignore localStorage error
      }
    }
  }, [autoStart, storageKey]);

  const handleStart = (stepsToRun: SpotlightStep[]) => {
    if (!stepsToRun || stepsToRun.length === 0) return;
    prevActiveElementRef.current = document.activeElement as HTMLElement | null;
    setActiveSteps(stepsToRun);
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const handleClose = () => {
    setIsActive(false);
    setSpotlightRect(null);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
    onClose?.();
    if (prevActiveElementRef.current) {
      prevActiveElementRef.current.focus?.();
    }
  };

  const handleFinish = () => {
    setIsActive(false);
    setSpotlightRect(null);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
    onComplete?.();
    onClose?.();
    if (prevActiveElementRef.current) {
      prevActiveElementRef.current.focus?.();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleGoTo = (idx: number) => {
    if (idx >= 0 && idx < activeSteps.length) {
      setCurrentStepIndex(idx);
    }
  };

  // Measure and position spotlight and tooltip relative to current target element
  const updatePositions = useCallback(() => {
    if (!isActive || activeSteps.length === 0) return;

    const step = activeSteps[currentStepIndex];
    if (!step) return;

    const targetEl = document.querySelector(step.targetSelector) as HTMLElement | null;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let targetRect: DOMRect;

    if (targetEl) {
      targetRect = targetEl.getBoundingClientRect();
      // Ensure element is somewhat visible in viewport
      const isInViewport =
        targetRect.top >= -100 &&
        targetRect.left >= -100 &&
        targetRect.bottom <= viewportH + 100 &&
        targetRect.right <= viewportW + 100;

      if (!isInViewport) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    } else {
      // Fallback: center in screen if target selector not present in current view
      targetRect = {
        top: Math.max(80, viewportH * 0.28),
        left: Math.max(20, viewportW * 0.15),
        bottom: Math.min(viewportH - 80, viewportH * 0.65),
        right: Math.min(viewportW - 20, viewportW * 0.85),
        width: Math.min(600, viewportW * 0.7),
        height: Math.min(320, viewportH * 0.38),
        x: Math.max(20, viewportW * 0.15),
        y: Math.max(80, viewportH * 0.28),
        toJSON: () => {},
      };
    }

    const padding = step.padding ?? 10;
    const radius = step.borderRadius ?? 16;

    const newSpotlight: SpotlightRect = {
      x: Math.max(4, targetRect.left - padding),
      y: Math.max(4, targetRect.top - padding),
      width: Math.min(viewportW - 8, Math.max(20, targetRect.width + padding * 2)),
      height: Math.min(viewportH - 8, Math.max(20, targetRect.height + padding * 2)),
      radius,
    };

    setSpotlightRect(newSpotlight);

    // Calculate Tooltip Position
    const tooltipWidth = Math.min(380, viewportW - 32);
    // Estimated card height for placement calculations
    const tooltipHeight = 230;
    const gap = 16;

    const preferred = step.placement || 'auto';

    let resolvedPlacement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    if (preferred === 'auto') {
      const spaceBelow = viewportH - (newSpotlight.y + newSpotlight.height);
      const spaceAbove = newSpotlight.y;
      const spaceRight = viewportW - (newSpotlight.x + newSpotlight.width);
      const spaceLeft = newSpotlight.x;

      if (spaceBelow >= tooltipHeight + gap) {
        resolvedPlacement = 'bottom';
      } else if (spaceAbove >= tooltipHeight + gap) {
        resolvedPlacement = 'top';
      } else if (spaceRight >= tooltipWidth + gap) {
        resolvedPlacement = 'right';
      } else if (spaceLeft >= tooltipWidth + gap) {
        resolvedPlacement = 'left';
      } else {
        resolvedPlacement = spaceBelow > spaceAbove ? 'bottom' : 'top';
      }
    } else {
      resolvedPlacement = preferred;
    }

    let calculatedTop = 0;
    let calculatedLeft = 0;

    switch (resolvedPlacement) {
      case 'bottom':
        calculatedTop = newSpotlight.y + newSpotlight.height + gap;
        calculatedLeft = newSpotlight.x + newSpotlight.width / 2 - tooltipWidth / 2;
        // If bottom pushes card off screen, flip to top
        if (calculatedTop + tooltipHeight > viewportH - 12 && newSpotlight.y > tooltipHeight + gap) {
          calculatedTop = newSpotlight.y - tooltipHeight - gap;
          resolvedPlacement = 'top';
        }
        break;

      case 'top':
        calculatedTop = newSpotlight.y - tooltipHeight - gap;
        calculatedLeft = newSpotlight.x + newSpotlight.width / 2 - tooltipWidth / 2;
        // If top pushes card off screen, flip to bottom
        if (calculatedTop < 12 && viewportH - (newSpotlight.y + newSpotlight.height) > tooltipHeight + gap) {
          calculatedTop = newSpotlight.y + newSpotlight.height + gap;
          resolvedPlacement = 'bottom';
        }
        break;

      case 'right':
        calculatedLeft = newSpotlight.x + newSpotlight.width + gap;
        calculatedTop = newSpotlight.y + newSpotlight.height / 2 - tooltipHeight / 2;
        if (calculatedLeft + tooltipWidth > viewportW - 12) {
          resolvedPlacement = 'bottom';
          calculatedTop = newSpotlight.y + newSpotlight.height + gap;
          calculatedLeft = newSpotlight.x + newSpotlight.width / 2 - tooltipWidth / 2;
        }
        break;

      case 'left':
        calculatedLeft = newSpotlight.x - tooltipWidth - gap;
        calculatedTop = newSpotlight.y + newSpotlight.height / 2 - tooltipHeight / 2;
        if (calculatedLeft < 12) {
          resolvedPlacement = 'bottom';
          calculatedTop = newSpotlight.y + newSpotlight.height + gap;
          calculatedLeft = newSpotlight.x + newSpotlight.width / 2 - tooltipWidth / 2;
        }
        break;
    }

    // Strict clamping to keep within viewport bounds
    const clampedLeft = Math.max(16, Math.min(viewportW - tooltipWidth - 16, calculatedLeft));
    const clampedTop = Math.max(16, Math.min(viewportH - tooltipHeight - 16, calculatedTop));

    setTooltipPos({
      left: clampedLeft,
      top: clampedTop,
      placement: resolvedPlacement,
    });
  }, [isActive, activeSteps, currentStepIndex]);

  // Execute step hooks (like switching views or tabs if needed) and recalculate
  useEffect(() => {
    if (!isActive) return;

    const step = activeSteps[currentStepIndex];
    if (step?.onBeforeStep) {
      Promise.resolve(step.onBeforeStep()).then(() => {
        // Allow DOM to settle before measuring
        setTimeout(updatePositions, 80);
      });
    } else {
      updatePositions();
    }
  }, [isActive, currentStepIndex, activeSteps, updatePositions]);

  // Continuous listener for resize and scroll to keep spotlight attached
  useEffect(() => {
    if (!isActive) return;

    let animFrame: number;
    const handleScrollOrResize = () => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(updatePositions);
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isActive, updatePositions]);

  // Accessibility: Focus trap & Keyboard navigation (Escape = skip, Enter/ArrowRight = next, ArrowLeft = prev)
  useEffect(() => {
    if (!isActive) return;

    // Focus the Next button when step loads
    const timer = setTimeout(() => {
      nextBtnRef.current?.focus();
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && tooltipRef.current) {
        const focusableElements = tooltipRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, currentStepIndex, activeSteps.length]);

  if (!isActive) return null;

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9990] overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spotlight-tutorial-title"
      aria-describedby="spotlight-tutorial-desc"
    >
      {/* 1. Fullscreen SVG Cutout Mask for Dark Dimming Overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-[9991]"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="physics-spotlight-mask">
            {/* White background: fully covered by dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
            {/* Black cutout: transparent opening around spotlight target */}
            {spotlightRect && (
              <rect
                x={spotlightRect.x}
                y={spotlightRect.y}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={spotlightRect.radius}
                ry={spotlightRect.radius}
                fill="#000000"
                style={{
                  transition:
                    'x 0.45s cubic-bezier(0.16, 1, 0.3, 1), y 0.45s cubic-bezier(0.16, 1, 0.3, 1), width 0.45s cubic-bezier(0.16, 1, 0.3, 1), height 0.45s cubic-bezier(0.16, 1, 0.3, 1), rx 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            )}
          </mask>
        </defs>

        {/* Dimming overlay fill: rgba(10, 14, 26, 0.85) */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(10, 14, 26, 0.85)"
          mask="url(#physics-spotlight-mask)"
        />
      </svg>

      {/* 2. Soft Glowing Highlight Ring with Smooth Coordinate Transitions */}
      {spotlightRect && (
        <div
          className="fixed pointer-events-none z-[9992]"
          style={{
            top: spotlightRect.y,
            left: spotlightRect.x,
            width: spotlightRect.width,
            height: spotlightRect.height,
            borderRadius: spotlightRect.radius,
            transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow:
              '0 0 0 2px rgba(0, 240, 255, 0.85), 0 0 24px rgba(0, 240, 255, 0.45), 0 0 50px rgba(168, 85, 247, 0.25), inset 0 0 16px rgba(0, 240, 255, 0.12)',
            border: '1px solid rgba(0, 240, 255, 0.7)',
          }}
        >
          {/* Science Lab Corner Crosshair Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm shadow-[0_0_8px_#00f0ff]" />

          {/* Subtle Ambient Pulse Halo */}
          <div className="absolute inset-0 rounded-[inherit] border border-cyan-400/30 animate-pulse pointer-events-none" />
        </div>
      )}

      {/* 3. Click Shield: Clicking outside the tooltip does nothing to prevent accidental dismissal */}
      <div
        className="fixed inset-0 z-[9993] cursor-default"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-hidden="true"
      />

      {/* 4. Floating Tooltip Card with Smooth Gliding Movement */}
      <div
        ref={tooltipRef}
        className="fixed z-[9995] pointer-events-auto"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 'min(380px, calc(100vw - 32px))',
          transition: 'top 0.45s cubic-bezier(0.16, 1, 0.3, 1), left 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0.4, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl bg-[#0a0e1a]/95 backdrop-blur-xl border border-cyan-500/40 p-4 sm:p-5 text-white shadow-[0_0_35px_rgba(0,240,255,0.2),0_20px_50px_rgba(0,0,0,0.85)]"
        >
          {/* Top Header Bar: Counter, Orbit Icon & Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {/* Physics Pulsing Orbit Accent */}
              <div className="relative flex items-center justify-center w-5 h-5">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-cyan-400 opacity-60" />
                <Atom className="w-4 h-4 text-cyan-400 relative z-10 animate-spin-slow" />
              </div>

              {/* Monospace Step Indicator */}
              <span className="font-mono text-xs text-cyan-300 font-bold tracking-wider">
                STEP {String(currentStepIndex + 1).padStart(2, '0')} // {String(activeSteps.length).padStart(2, '0')}
              </span>
            </div>

            {/* Optional Physics Badge */}
            {currentStep.badge && (
              <span className="font-mono text-[9.5px] uppercase font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-md tracking-wider">
                {currentStep.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            id="spotlight-tutorial-title"
            className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug mb-1.5 flex items-center gap-2"
          >
            {currentStep.title}
          </h3>

          {/* Description */}
          <p
            id="spotlight-tutorial-desc"
            className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4 font-normal"
          >
            {currentStep.description}
          </p>

          {/* Step Progress Indicators (Dots) */}
          <div className="flex items-center gap-1.5 mb-4">
            {activeSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleGoTo(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
                    : idx < currentStepIndex
                    ? 'w-2 bg-cyan-600/70 hover:bg-cyan-500'
                    : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
                title={`Go to step ${idx + 1}`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            {/* Skip Tutorial Link */}
            <button
              onClick={handleClose}
              className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors underline underline-offset-4 decoration-zinc-600 hover:decoration-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded px-1 py-0.5"
            >
              Skip tutorial
            </button>

            {/* Next / Back Action Buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl border border-white/15 hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-1 active:scale-95 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <button
                ref={nextBtnRef}
                onClick={handleNext}
                className="px-3.5 py-1.5 rounded-xl border border-cyan-400/80 bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-bold text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_22px_rgba(0,240,255,0.45)] transition-all flex items-center gap-1 active:scale-95 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <span>{isLastStep ? 'Explore Lab' : 'Next'}</span>
                {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
