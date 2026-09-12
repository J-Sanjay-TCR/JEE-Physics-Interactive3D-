import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Atom, Orbit, Sparkles, Cpu, Zap, CheckCircle2, FastForward, ShieldAlert } from 'lucide-react';

interface GlobalPhysicsLoaderProps {
  onComplete?: () => void;
  conceptTitle?: string;
  isInitial?: boolean;
}

const JEE_INSIGHTS = [
  {
    title: 'Kinematics & Projectiles',
    formula: 'R = \\frac{u^2 \\sin 2\\theta}{g}',
    fact: 'At complementary launch angles (θ and 90° - θ), horizontal ranges are identical for the same initial muzzle velocity.',
  },
  {
    title: 'Rotational Dynamics',
    formula: '\\tau = I\\alpha = \\frac{dL}{dt}',
    fact: 'Angular momentum is strictly conserved in any isolated system where the net external torque is zero: L = Iω = const.',
  },
  {
    title: 'Electromagnetism & Cyclotrons',
    formula: 'f_c = \\frac{qB}{2\\pi m}',
    fact: 'Cyclotron resonance frequency is completely independent of the charged particle\'s speed and orbital radius.',
  },
  {
    title: 'Simple Harmonic Motion',
    formula: 'T = 2\\pi \\sqrt{\\frac{m}{k}}',
    fact: 'In ideal SHM, total mechanical energy continuously oscillates between kinetic and potential states with zero net loss.',
  },
  {
    title: 'Wave Optics & Interference',
    formula: '\\beta = \\frac{\\lambda D}{d}',
    fact: 'Young\'s Double Slit fringe width expands directly with wavelength λ and screen distance D, inversely with slit spacing d.',
  },
];

const CALIBRATION_STAGES = [
  { label: 'Initializing WebGL 3D Physics Pipeline', icon: Cpu, detail: 'Allocating GPU framebuffers & depth buffers' },
  { label: 'Compiling Mechanics & Electromagnetic Shaders', icon: Atom, detail: 'Vertex & fragment GLSL illumination pipelines' },
  { label: 'Calibrating Runge-Kutta 4th Order Integrators', icon: Orbit, detail: 'Δt = 0.001s numerical differential stability' },
  { label: 'Loading 18-Chapter JEE Syllabus & Question Bank', icon: Zap, detail: '100+ formulas, PYQs & vector coordinate maps' },
  { label: 'Virtual Physics Laboratory Calibrated & Ready', icon: CheckCircle2, detail: '3D spatial coordinate apparatus synchronized' },
];

/**
 * Ultra-Cool 3D Quantum Gyroscopic Atom & Particle Visualizer
 */
const QuantumAtomVisualizer: React.FC<{ size?: 'lg' | 'sm'; pulseRate?: number }> = ({
  size = 'lg',
}) => {
  const isLg = size === 'lg';
  const containerSize = isLg ? 'w-52 h-52' : 'w-24 h-24';
  const nucleusSize = isLg ? 'w-16 h-16' : 'w-8 h-8';
  const ring1Size = isLg ? 'w-44 h-44' : 'w-20 h-20';
  const ring2Size = isLg ? 'w-44 h-44' : 'w-20 h-20';
  const ring3Size = isLg ? 'w-44 h-44' : 'w-20 h-20';
  const ring4Size = isLg ? 'w-48 h-48' : 'w-22 h-22';

  return (
    <div className={`relative ${containerSize} flex items-center justify-center select-none`}>
      {/* 1. Outer Calibrated Polar Reticle with Quadrant Marks (Large only) */}
      {isLg && (
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dotted pointer-events-none animate-spin [animation-duration:40s]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_6px_#00f0ff]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_6px_#00f0ff]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400/80 rounded-full shadow-[0_0_6px_#10b981]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400/80 rounded-full shadow-[0_0_6px_#10b981]" />
        </div>
      )}

      {/* 2. Expanding Quantum Wave Radiation Ring */}
      <div className="absolute inset-2 rounded-full border border-cyan-400/25 animate-ping opacity-20 [animation-duration:2.5s] pointer-events-none" />
      <div className="absolute inset-6 rounded-full border border-emerald-400/20 animate-ping opacity-15 [animation-duration:3.2s] pointer-events-none" />

      {/* 3. Orbit Shell 1: Equatorial Plane (0° inclination) - Cyan Laser Trail */}
      <div
        className={`absolute ${ring1Size} rounded-full border-2 border-cyan-400/50 border-dashed animate-spin [animation-duration:4s] pointer-events-none`}
        style={{ transform: 'rotateX(72deg)' }}
      >
        {/* Orbiting Quantum Electron 1 with Laser Glow */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_14px_#00f0ff,0_0_24px_rgba(0,240,255,0.8)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
          {/* Subtle Photon Trail Sparkle */}
          <div className="absolute -left-3 w-4 h-0.5 bg-gradient-to-r from-transparent to-cyan-300/80 blur-[0.5px]" />
        </div>
      </div>

      {/* 4. Orbit Shell 2: Leptonic Plane (60° inclination) - Emerald Neon Trail */}
      <div
        className={`absolute ${ring2Size} rounded-full border-2 border-emerald-400/50 border-dashed animate-spin [animation-duration:3.2s] [animation-direction:reverse] pointer-events-none`}
        style={{ transform: 'rotate(60deg) rotateX(72deg)' }}
      >
        {/* Orbiting Quantum Electron 2 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-300 shadow-[0_0_14px_#10b981,0_0_24px_rgba(16,185,129,0.8)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
          <div className="absolute -left-3 w-4 h-0.5 bg-gradient-to-r from-transparent to-emerald-300/80 blur-[0.5px]" />
        </div>
      </div>

      {/* 5. Orbit Shell 3: Hadronic Plane (120° inclination) - Electric Violet Trail */}
      <div
        className={`absolute ${ring3Size} rounded-full border-2 border-purple-400/45 border-dashed animate-spin [animation-duration:5s] pointer-events-none`}
        style={{ transform: 'rotate(120deg) rotateX(72deg)' }}
      >
        {/* Orbiting Quantum Electron 3 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-purple-300 shadow-[0_0_14px_#c084fc,0_0_22px_rgba(192,132,252,0.8)] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* 6. Orbit Shell 4: Polar Magnetic Precession Shell (90° inclination, amber) */}
      {isLg && (
        <div
          className={`absolute ${ring4Size} rounded-full border border-amber-400/30 border-dotted animate-spin [animation-duration:7s] [animation-direction:reverse] pointer-events-none`}
          style={{ transform: 'rotate(210deg) rotateX(80deg)' }}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#f59e0b]" />
        </div>
      )}

      {/* 7. Central Pulsing Quantum Nucleus & Quark Singularity */}
      <div
        className={`relative ${nucleusSize} rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-[2px] shadow-[0_0_30px_rgba(0,240,255,0.6),0_0_60px_rgba(16,185,129,0.3)] flex items-center justify-center z-10`}
      >
        <div className="w-full h-full rounded-full bg-[#050914] flex items-center justify-center overflow-hidden relative">
          {/* Inner Quark Orbit Sparks */}
          <div className="absolute inset-0 flex items-center justify-center animate-spin [animation-duration:3s]">
            <div className="absolute top-1.5 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff]" />
            <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
          </div>

          {/* Atom Core Icon */}
          <Atom className={`${isLg ? 'w-8 h-8' : 'w-4 h-4'} text-white animate-pulse relative z-10`} />

          {/* Central High-Energy Singularity Gleam */}
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-ping [animation-duration:1.8s]" />
        </div>
      </div>

      {/* 8. Holographic Coordinate Axis Crosshair Filaments */}
      {isLg && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent" />
        </div>
      )}
    </div>
  );
};

/**
 * Global Physics Laboratory Loading Screen
 * Ultra-smooth, optimized, zero-lag with stable callback handling and instant skip.
 */
export const GlobalPhysicsLoader: React.FC<GlobalPhysicsLoaderProps> = ({
  onComplete,
  conceptTitle,
  isInitial = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [insightIndex] = useState(() => Math.floor(Math.random() * JEE_INSIGHTS.length));
  const [isFinishing, setIsFinishing] = useState(false);

  // Stable ref for onComplete callback to guarantee zero interval restarts on parent re-renders
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Safe manual skip handler
  const handleInstantSkip = useCallback(() => {
    setIsFinishing(true);
    setProgress(100);
    setStageIndex(CALIBRATION_STAGES.length - 1);
    setTimeout(() => {
      onCompleteRef.current?.();
    }, 80);
  }, []);

  // Keyboard shortcut listener (Space, Enter, Escape to instantly bypass loading)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleInstantSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleInstantSkip]);

  // High-Precision Smooth Progress Animation
  useEffect(() => {
    // Initial startup takes ~1.4s for calibration feel; concept switches are snappy ~0.55s
    const totalDuration = isInitial ? 1400 : 550;
    const startTime = performance.now();
    let animFrameId: number;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const rawFrac = Math.max(0, Math.min(1, elapsed / totalDuration));
      
      // Easing curve (ease-out cubic for realistic deceleration)
      const easedFrac = Math.max(0, Math.min(1, 1 - Math.pow(1 - rawFrac, 3)));
      const currentVal = Math.max(0, Math.min(100, easedFrac * 100));

      setProgress(currentVal);

      // Map progress to stage index safely clamped to bounds
      const stg = Math.max(
        0,
        Math.min(
          CALIBRATION_STAGES.length - 1,
          Math.floor((currentVal / 100) * CALIBRATION_STAGES.length)
        )
      );
      setStageIndex(stg);

      if (rawFrac < 1) {
        animFrameId = requestAnimationFrame(tick);
      } else {
        setIsFinishing(true);
        setTimeout(() => {
          onCompleteRef.current?.();
        }, 120);
      }
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [isInitial]);

  const safeStageIndex = Math.max(
    0,
    Math.min(CALIBRATION_STAGES.length - 1, Number.isFinite(stageIndex) ? stageIndex : 0)
  );
  const currentStage = CALIBRATION_STAGES[safeStageIndex] || CALIBRATION_STAGES[0];
  const CurrentStageIcon = currentStage?.icon || Atom;

  const safeInsightIndex = Math.max(
    0,
    Math.min(JEE_INSIGHTS.length - 1, Number.isFinite(insightIndex) ? insightIndex : 0)
  );
  const activeInsight = JEE_INSIGHTS[safeInsightIndex] || JEE_INSIGHTS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#04060E] text-white p-4 select-none overflow-hidden"
    >
      {/* Background Deep Space Physics Grid & Quantum Wave Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      <div className="absolute inset-0 bg-radial from-cyan-950/30 via-transparent to-transparent pointer-events-none" />

      {/* Floating Holographic Quantum Formulas Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 font-mono text-cyan-400">
        <span className="absolute top-[10%] left-[8%] text-xs sm:text-sm animate-pulse">∇ × B = μ₀J + μ₀ε₀∂E/∂t</span>
        <span className="absolute top-[20%] right-[12%] text-xs">iℏ ∂ψ/∂t = Ĥψ</span>
        <span className="absolute bottom-[25%] left-[10%] text-xs sm:text-sm">F = dp/dt = m(dv/dt)</span>
        <span className="absolute bottom-[15%] right-[15%] text-xs">E² = (pc)² + (m₀c²)²</span>
        <span className="absolute top-[45%] left-[5%] text-xs">λ_dB = h / p</span>
        <span className="absolute top-[50%] right-[6%] text-xs">∮ E · dA = Q_enc / ε₀</span>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Ultra-Cool 3D Quantum Gyroscopic Atom */}
        <div className="mb-4">
          <QuantumAtomVisualizer size="lg" />
        </div>

        {/* Dynamic Telemetry Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold mb-2.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin [animation-duration:6s]" />
          <span>JEE 3D QUANTUM LAB CALIBRATOR</span>
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-400">RK4 INTEGRATOR</span>
        </div>

        {/* Header Title */}
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white text-center flex items-center justify-center gap-2">
          {conceptTitle ? (
            <span>Calibrating {conceptTitle}</span>
          ) : (
            <span>Synchronizing Physics Engine</span>
          )}
        </h1>

        <p className="text-xs text-zinc-400 text-center mt-1 max-w-sm mx-auto">
          Preparing 3D apparatus shaders, vector diagnostics, and numerical solvers.
        </p>

        {/* Diagnostics & High-Precision Progress Bar Card */}
        <div className="w-full bg-[#0b0e1b] p-4 sm:p-5 rounded-2xl border border-cyan-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.7)] mt-4 mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-2.5">
            <div className="flex items-center gap-2 text-zinc-200">
              <CurrentStageIcon className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="font-bold truncate block text-cyan-200 text-xs">
                  {currentStage.label}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {currentStage.detail}
                </span>
              </div>
            </div>
            <span className="text-cyan-400 font-extrabold text-sm ml-3 shrink-0 font-mono">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Smooth High-Precision Progress Bar with Laser Head */}
          <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-white/[0.08] relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_14px_#00f0ff] transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Laser Sparkle Head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          {/* Calibration Sub-step Indicator Dots */}
          <div className="flex items-center justify-between mt-3 px-1">
            {CALIBRATION_STAGES.map((stg, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5"
                title={`${stg.label}: ${stg.detail}`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    i <= safeStageIndex
                      ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff] scale-110'
                      : 'bg-zinc-800 border border-white/[0.1]'
                  }`}
                >
                  {i < safeStageIndex && <div className="w-1 h-1 rounded-full bg-black" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Yield JEE Physics Principle Card */}
        <div className="w-full p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/25 flex items-start gap-3 text-left">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
            <Orbit className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                JEE Principle: {activeInsight.title}
              </span>
              <span className="text-[10px] font-mono text-zinc-300 bg-white/[0.08] px-1.5 py-0.5 rounded">
                {activeInsight.formula}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {activeInsight.fact}
            </p>
          </div>
        </div>

        {/* Instant Skip Button / Keyboard Indicator */}
        <div className="flex items-center justify-between w-full mt-4 px-1">
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.1] text-zinc-300">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.1] text-zinc-300">Enter</kbd> to skip
          </span>
          <button
            onClick={handleInstantSkip}
            className="text-xs text-cyan-400 hover:text-cyan-200 transition-colors font-mono font-bold flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 ml-auto"
          >
            <span>Skip Calibration & Enter Lab</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * In-Viewport Skeleton Loader for snappy apparatus switches
 * Features the mini quantum atom visualizer
 */
export const ViewportApparatusSkeleton: React.FC<{
  conceptTitle: string;
  isDark?: boolean;
}> = ({ conceptTitle, isDark = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 select-none ${
        isDark ? 'bg-[#050711]/90 text-white backdrop-blur-sm' : 'bg-slate-950/85 text-white backdrop-blur-sm'
      }`}
    >
      {/* Mini Quantum Atom Visualizer */}
      <div className="mb-3">
        <QuantumAtomVisualizer size="sm" />
      </div>

      <div className="text-center max-w-xs">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/25">
          Calibrating Apparatus
        </span>
        <h3 className="text-sm font-bold text-white mt-1.5 truncate">
          {conceptTitle}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Compiling 3D apparatus shaders & physics vectors...
        </p>
      </div>

      {/* Shimmer Progress Line */}
      <div className="w-48 h-1 bg-white/[0.08] rounded-full overflow-hidden mt-3.5">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};
