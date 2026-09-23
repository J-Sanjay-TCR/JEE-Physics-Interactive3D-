import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Atom,
  Orbit,
  Sparkles,
  Cpu,
  Zap,
  CheckCircle2,
  FastForward,
  Activity,
  Radio,
  Maximize2,
  Gauge,
  Compass,
} from 'lucide-react';
import { Latex } from './Latex';

interface GlobalPhysicsLoaderProps {
  onComplete?: () => void;
  conceptTitle?: string;
  isInitial?: boolean;
}

export const JEE_INSIGHTS = [
  {
    title: 'Kinematics & Ballistic Parabola',
    formula: 'R = \\frac{u^2 \\sin 2\\theta}{g}',
    fact: 'At complementary launch angles (θ and 90° - θ), horizontal ranges are identical for equal muzzle velocity. Maximum height ratio is tan²θ.',
    topic: 'Mechanics',
  },
  {
    title: 'Rotational Dynamics & Precession',
    formula: '\\boldsymbol{\\tau} = I\\boldsymbol{\\alpha} = \\frac{d\\mathbf{L}}{dt}',
    fact: 'Angular momentum L = Iω is strictly conserved when net external torque is zero. Gyroscopic precession frequency is Ω_p = τ / L.',
    topic: 'Rigid Body',
  },
  {
    title: 'Cyclotron Resonance & Lorentz Force',
    formula: 'f_c = \\frac{qB}{2\\pi m}',
    fact: 'Cyclotron frequency is independent of particle velocity and orbital radius, enabling resonant RF voltage acceleration.',
    topic: 'Electromagnetism',
  },
  {
    title: 'Simple Harmonic Motion & Energy',
    formula: 'T = 2\\pi \\sqrt{\\frac{m}{k}}, \\quad E = \\frac{1}{2}kA^2',
    fact: 'In ideal SHM, total mechanical energy continuously transfers between kinetic and potential reservoirs with zero net dissipation.',
    topic: 'Oscillations',
  },
  {
    title: 'Wave Optics & Young Double Slit',
    formula: '\\beta = \\frac{\\lambda D}{d}',
    fact: 'Fringe width β scales directly with light wavelength λ and screen distance D, and inversely with slit separation d.',
    topic: 'Optics',
  },
  {
    title: 'Bohr Quantum Radius & Energy',
    formula: 'E_n = -\\frac{13.6 \\text{ eV}}{n^2}, \\quad r_n = n^2 a_0',
    fact: 'Bohr orbital radius scales as n², while electron binding energy scales as -1/n², yielding quantized atomic spectral lines.',
    topic: 'Modern Physics',
  },
  {
    title: 'Carnot Heat Engine & Entropy',
    formula: '\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W}{Q_H}',
    fact: 'No thermal heat engine operating between two finite temperatures can exceed the efficiency of a reversible Carnot cycle.',
    topic: 'Thermodynamics',
  },
  {
    title: 'Maxwell-Ampère Induction Law',
    formula: '\\oint \\mathbf{B} \\cdot d\\boldsymbol{\\ell} = \\mu_0 I_{\\text{enc}} + \\mu_0\\varepsilon_0 \\frac{\\partial \\Phi_E}{\\partial t}',
    fact: 'Maxwell added displacement current μ₀ε₀(∂Φ_E/∂t) to Ampère\'s law, mathematically predicting electromagnetic light waves.',
    topic: 'Electrodynamics',
  },
];

export const CALIBRATION_STAGES = [
  {
    label: 'Harmonizing Quantum Wavefunctions & Coordinates',
    icon: Cpu,
    detail: 'Setting up Hilbert basis, |n, ℓ, m⟩ eigenstates & 3D coordinate apparatus',
    badge: 'Ĥψ = Eψ',
  },
  {
    label: 'Compiling WebGL 3D Apparatus & Vector Shaders',
    icon: Atom,
    detail: 'Initializing GPU vertex pipelines, Fresnel reflections & vector diagnostics',
    badge: '∇ × E = -∂B/∂t',
  },
  {
    label: 'Calibrating 4th-Order Symplectic Numerical Solvers',
    icon: Orbit,
    detail: 'Zero-drift Runge-Kutta differential integrators with mechanical energy conservation',
    badge: 'dE/dt = 0',
  },
  {
    label: 'Indexing 18-Chapter JEE Syllabus & Question Bank',
    icon: Zap,
    detail: 'Connecting 499+ formulas, past JEE Advanced problems, and interactive simulations',
    badge: '499+ Formulas',
  },
  {
    label: 'Virtual Physics Laboratory Synchronized & Online',
    icon: CheckCircle2,
    detail: '3D apparatus optics, telemetry monitors, and real-time interactive physics live',
    badge: 'Ready • 60 FPS',
  },
];

/**
 * Ultra-Cool 3D Quantum Gyroscopic Atom & Particle Visualizer
 * Mathematically Locked 1:1 Aspect Ratio:
 * - Uses aspect-square shrink-0 on container and percentage radii for all shells
 * - Immune to screen resizing, stretch, or oval distortion
 * - Shell n=1: Equatorial Bohr Ground State (fastest frequency ω₁ ∝ 1/n³)
 * - Shell n=2: Inclined Sommerfeld Shell at 54.7° (Magic Angle)
 * - Shell n=3: Precessing Elliptical Excited Shell at 120°
 * - Shell n=4: Polar Magnetic Meridian at 90° (Zeeman / Larmor Precession)
 * - Central Quark Triad (u, u, d) with virtual gluon exchange
 */
export const QuantumAtomVisualizer: React.FC<{ size?: 'lg' | 'sm' }> = ({
  size = 'lg',
}) => {
  const isLg = size === 'lg';

  if (!isLg) {
    // Compact version with strictly locked 1:1 aspect ratio
    return (
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 aspect-square shrink-0 flex items-center justify-center select-none"
        style={{ perspective: '600px', transformStyle: 'preserve-3d' }}
      >
        {/* Pulsing de Broglie Wave Ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/30 anim-quantum-wave pointer-events-none aspect-square" />

        {/* Orbit 1: Equatorial Cyan */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'rotateX(70deg)', transformStyle: 'preserve-3d' }}
        >
          <div
            className="w-[78%] h-[78%] aspect-square rounded-full border border-cyan-400/60 border-dashed relative flex items-center justify-center anim-quantum-spin-cw"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff]" />
          </div>
        </div>

        {/* Orbit 2: Inclined Emerald */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'rotateZ(60deg) rotateX(70deg)', transformStyle: 'preserve-3d' }}
        >
          <div
            className="w-[88%] h-[88%] aspect-square rounded-full border border-emerald-400/60 border-dashed relative flex items-center justify-center anim-quantum-spin-ccw"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* Nucleus */}
        <div className="relative w-[32%] h-[32%] aspect-square rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-[1.5px] shadow-[0_0_16px_rgba(0,240,255,0.7)] z-10 anim-quantum-pulse flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#050914] flex items-center justify-center">
            <Atom className="w-3.5 h-3.5 text-cyan-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 aspect-square shrink-0 flex items-center justify-center select-none"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {/* 1. Holographic Polar Reticle with Azimuth Degree Markings */}
      <div className="absolute inset-0 w-full h-full aspect-square rounded-full border border-cyan-500/20 border-dotted pointer-events-none">
        {/* Cardinal Axis Markers */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-400/80 font-bold">
          0°
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-400/80 font-bold">
          180°
        </div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-cyan-400/80 font-bold">
          270°
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-cyan-400/80 font-bold">
          90°
        </div>

        {/* Corner Ticks */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-cyan-400/40" />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-cyan-400/40" />
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 border-b border-l border-cyan-400/40" />
        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 border-b border-r border-cyan-400/40" />
      </div>

      {/* 2. Holographic Radar Azimuth Sweep Scanner */}
      <div
        className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] aspect-square rounded-full pointer-events-none anim-quantum-radar opacity-30"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(0, 240, 255, 0.22) 50deg, transparent 60deg)',
        }}
      />

      {/* 3. Expanding de Broglie Wave Packet Radiation Rings */}
      <div
        className="absolute w-[60%] h-[60%] aspect-square rounded-full border border-cyan-400/40 anim-quantum-wave pointer-events-none"
        style={{ '--wave-dur': '2.6s' } as React.CSSProperties}
      />
      <div
        className="absolute w-[60%] h-[60%] aspect-square rounded-full border border-emerald-400/35 anim-quantum-wave pointer-events-none"
        style={{ '--wave-dur': '3.4s', animationDelay: '1.2s' } as React.CSSProperties}
      />

      {/* 4. Magnetic Dipole Field Flux Loops (Toroidal North-South Field Lines) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none anim-quantum-flux"
        style={{ transform: 'rotateY(90deg) rotateX(15deg)', transformStyle: 'preserve-3d' }}
      >
        <div className="w-[84%] h-[52%] rounded-[100%] border border-cyan-400/25 border-dashed" />
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none anim-quantum-flux"
        style={{ transform: 'rotateY(90deg) rotateX(-15deg)', transformStyle: 'preserve-3d' }}
      >
        <div className="w-[84%] h-[52%] rounded-[100%] border border-emerald-400/20 border-dashed" />
      </div>

      {/* 5. Quantum Orbit Shell 1: Equatorial Bohr Ground State (n=1, Cyan) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: 'rotateX(72deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="w-[66%] h-[66%] aspect-square rounded-full border-2 border-cyan-400/50 border-dashed relative flex items-center justify-center anim-quantum-spin-cw"
          style={{ '--spin-dur': '3.6s' } as React.CSSProperties}
        >
          {/* Orbiting Quantum Electron 1 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="absolute -left-5 w-6 h-1 bg-gradient-to-r from-transparent to-cyan-300/80 rounded-full blur-[0.5px]" />
            <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_16px_#00f0ff,0_0_28px_rgba(0,240,255,0.9)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <span className="absolute -top-4 text-[8px] font-mono text-cyan-300 font-bold tracking-tighter opacity-80">
              e⁻(n=1)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Quantum Orbit Shell 2: Sommerfeld First Excited State (n=2, Emerald, Magic Angle 54.7°) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: 'rotateZ(54.7deg) rotateX(72deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="w-[78%] h-[78%] aspect-square rounded-full border-2 border-emerald-400/55 border-dashed relative flex items-center justify-center anim-quantum-spin-ccw"
          style={{ '--spin-dur': '4.5s' } as React.CSSProperties}
        >
          {/* Orbiting Quantum Electron 2 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="absolute -right-5 w-6 h-1 bg-gradient-to-l from-transparent to-emerald-300/80 rounded-full blur-[0.5px]" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-300 shadow-[0_0_16px_#10b981,0_0_26px_rgba(16,185,129,0.85)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="absolute -top-4 text-[8px] font-mono text-emerald-300 font-bold tracking-tighter opacity-80">
              e⁻(n=2)
            </span>
          </div>
        </div>
      </div>

      {/* 7. Quantum Orbit Shell 3: Second Excited Precessing Shell (n=3, Violet, 120° inclination) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: 'rotateZ(120deg) rotateX(72deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="w-[88%] h-[88%] aspect-square rounded-full border-2 border-purple-400/45 border-dashed relative flex items-center justify-center anim-quantum-spin-cw"
          style={{ '--spin-dur': '5.8s' } as React.CSSProperties}
        >
          {/* Orbiting Quantum Electron 3 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-purple-300 shadow-[0_0_14px_#c084fc,0_0_24px_rgba(192,132,252,0.8)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <span className="absolute -top-4 text-[8px] font-mono text-purple-300 font-bold tracking-tighter opacity-80">
              e⁻(n=3)
            </span>
          </div>
        </div>
      </div>

      {/* 8. Quantum Orbit Shell 4: Polar Magnetic Meridian (n=4, Amber, 90° inclination, Zeeman Precession) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: 'rotateZ(210deg) rotateY(80deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="w-[96%] h-[96%] aspect-square rounded-full border border-amber-400/35 border-dotted relative flex items-center justify-center anim-quantum-spin-ccw"
          style={{ '--spin-dur': '7.2s' } as React.CSSProperties}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_#f59e0b]" />
            <span className="absolute -top-3 text-[7px] font-mono text-amber-300 font-bold tracking-tighter opacity-75">
              μ_B
            </span>
          </div>
        </div>
      </div>

      {/* 9. Central Pulsing Quark Nucleus (Proton Structure: {u, u, d}) */}
      <div className="relative w-[26%] h-[26%] aspect-square rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-[2px] shadow-[0_0_35px_rgba(0,240,255,0.7),0_0_70px_rgba(16,185,129,0.35)] flex items-center justify-center z-10 anim-quantum-pulse">
        <div className="w-full h-full rounded-full bg-[#040816] flex items-center justify-center overflow-hidden relative">
          {/* Inner Quark Rotating Confinement Triplet */}
          <div className="absolute inset-0 flex items-center justify-center anim-quantum-quark">
            {/* Up Quark 1 (+2/3e, Cyan) */}
            <div className="absolute top-2 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff] flex items-center justify-center">
              <span className="text-[6px] font-black text-black leading-none">u</span>
            </div>
            {/* Up Quark 2 (+2/3e, Emerald) */}
            <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] flex items-center justify-center">
              <span className="text-[6px] font-black text-black leading-none">u</span>
            </div>
            {/* Down Quark (-1/3e, Rose/Magenta) */}
            <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185] flex items-center justify-center">
              <span className="text-[6px] font-black text-black leading-none">d</span>
            </div>
          </div>

          {/* Central Nuclear Force Icon & Quantum Flash */}
          <Atom className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 animate-pulse drop-shadow-[0_0_10px_#ffffff]" />
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#ffffff] animate-ping" />
        </div>
      </div>

      {/* 10. Holographic Laser Coordinate Axes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent" />
      </div>
    </div>
  );
};

/**
 * Global Physics Laboratory Loading Screen
 * Full Screen Edge-to-Edge Architecture (Mounted via createPortal):
 * - Guarantees full-screen coverage across any viewport or iframe (100vw, 100vh, 100dvh)
 * - Immune to parent container transforms, clippings, or flex constraints
 * - Strict aspect ratio conservation on 3D physics models and UI HUD
 * - Responsive 2-column cockpit layout on widescreen, stacked on mobile
 */
export const GlobalPhysicsLoader: React.FC<GlobalPhysicsLoaderProps> = ({
  onComplete,
  conceptTitle,
  isInitial = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [insightIndex, setInsightIndex] = useState(() =>
    Math.floor(Math.random() * JEE_INSIGHTS.length)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stable ref for onComplete callback
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Safe manual skip handler
  const handleInstantSkip = useCallback(() => {
    setProgress(100);
    setStageIndex(CALIBRATION_STAGES.length - 1);
    setTimeout(() => {
      onCompleteRef.current?.();
    }, 60);
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

  // Periodically cycle through JEE insights if loading takes time
  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % JEE_INSIGHTS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // High-Precision Smooth Progress Animation using requestAnimationFrame
  useEffect(() => {
    const totalDuration = isInitial ? 1500 : 600;
    const startTime = performance.now();
    let animFrameId: number;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const rawFrac = Math.max(0, Math.min(1, elapsed / totalDuration));

      // Ease-out cubic curve for natural physics deceleration
      const easedFrac = 1 - Math.pow(1 - rawFrac, 3);
      const currentVal = Math.min(100, Math.max(0, easedFrac * 100));

      setProgress(currentVal);

      // Map progress to stage index smoothly
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

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen w-full h-[100dvh] min-h-[100dvh] z-[999999] flex flex-col items-center justify-between bg-[#030611] text-white p-4 sm:p-6 md:p-8 select-none overflow-y-auto overflow-x-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        zIndex: 999999,
      }}
    >
      {/* Background Deep Space Physics Grid & Quantum Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-cyan-950/40 via-[#030611]/85 to-[#030611] pointer-events-none" />

      {/* Floating Holographic Theoretical Equations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-18 font-mono text-cyan-400/80">
        <span className="absolute top-[6%] left-[5%] text-xs sm:text-sm animate-pulse">
          iℏ ∂ψ/∂t = Ĥψ
        </span>
        <span className="absolute top-[12%] right-[6%] text-xs sm:text-sm">
          ∇ × B = μ₀J + μ₀ε₀∂E/∂t
        </span>
        <span className="absolute bottom-[16%] left-[6%] text-xs sm:text-sm">
          E² = (pc)² + (m₀c²)²
        </span>
        <span className="absolute bottom-[10%] right-[8%] text-xs sm:text-sm">
          λ_dB = h / p
        </span>
        <span className="absolute top-[48%] left-[2%] text-xs hidden lg:inline">
          ∮ E · dA = Q_enc / ε₀
        </span>
        <span className="absolute top-[58%] right-[3%] text-xs hidden lg:inline">
          τ = Iα = dL/dt
        </span>
      </div>

      {/* Top Cockpit Header Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-400 p-[1px] shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-[#050914] rounded-[7px] flex items-center justify-center">
              <Atom className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-white font-mono">
                JEE 3D Physics Lab
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                v2.4 QUANTUM
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Symplectic RK4 Solver • 60 FPS WebGL Engine
            </p>
          </div>
        </div>

        {/* Live Quantum Telemetry Ribbon */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-semibold">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>|ψ⟩ = |n=3, ℓ=2, m=+1⟩</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            <Activity className="w-3 h-3" />
            <span>Δt = 1.0 ms</span>
          </div>
        </div>
      </header>

      {/* Main Responsive Cockpit Center Stage */}
      <main className="relative z-10 w-full max-w-5xl my-auto py-4 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
        {/* Left Stage: 3D Quantum Gyroscopic Atom Visualizer (Guaranteed 1:1 Aspect Ratio) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <QuantumAtomVisualizer size="lg" />

          {/* Aspect Ratio & Coordinate Calibration Chip */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-mono">
            <Compass className="w-3 h-3 text-cyan-400 animate-spin [animation-duration:12s]" />
            <span>EULER INCLINATION: 54.7° (MAGIC ANGLE)</span>
          </div>
        </div>

        {/* Right Stage: Mission Diagnostics, Calibration Progress & Real KaTeX JEE Card */}
        <div className="w-full max-w-lg flex flex-col justify-center">
          {/* Header Title */}
          <div className="text-center lg:text-left mb-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold mb-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>APPARATUS CALIBRATION PIPELINE</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center lg:justify-start gap-2">
              {conceptTitle ? (
                <span>Calibrating {conceptTitle}</span>
              ) : (
                <span>Calibrating 3D Quantum Apparatus</span>
              )}
            </h1>

            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Synthesizing Runge-Kutta numerical solvers, WebGL vector shaders & JEE curriculum.
            </p>
          </div>

          {/* Diagnostics & High-Precision Progress Bar Card */}
          <div className="w-full bg-[#0b0e1d]/90 p-4 sm:p-5 rounded-2xl border border-cyan-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.8)] mb-3.5 backdrop-blur-md">
            {/* Active Stage & Numerical Progress */}
            <div className="flex items-center justify-between text-xs font-mono mb-2.5">
              <div className="flex items-center gap-2.5 text-zinc-200 min-w-0">
                <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shrink-0">
                  <CurrentStageIcon className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold truncate block text-cyan-200 text-xs">
                      {currentStage.label}
                    </span>
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/25 shrink-0 hidden sm:inline">
                      {currentStage.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                    {currentStage.detail}
                  </span>
                </div>
              </div>

              <span className="text-cyan-400 font-black text-sm sm:text-base ml-3 shrink-0 font-mono tracking-tight">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Smooth High-Precision Progress Bar with Glowing Laser Head */}
            <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-white/[0.08] relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_16px_#00f0ff] transition-all duration-75 relative"
                style={{ width: `${progress}%` }}
              >
                {/* Laser Sparkle Head */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_20px_#00f0ff]" />
              </div>
            </div>

            {/* Calibration Sub-step Indicator Track */}
            <div className="flex items-center justify-between mt-3 px-1">
              {CALIBRATION_STAGES.map((stg, i) => {
                const isPast = i < safeStageIndex;
                const isCurrent = i === safeStageIndex;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5"
                    title={`${stg.label}: ${stg.detail}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                        isCurrent
                          ? 'bg-cyan-400 shadow-[0_0_10px_#00f0ff] scale-125 ring-2 ring-cyan-400/40'
                          : isPast
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : 'bg-zinc-800 border border-white/[0.12]'
                      }`}
                    >
                      {isPast && <div className="w-1.5 h-1.5 rounded-full bg-black font-bold" />}
                      {isCurrent && <div className="w-1 h-1 rounded-full bg-black animate-ping" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High-Yield JEE Physics Principle Card with Real KaTeX Rendering */}
          <div className="w-full p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/25 flex items-start gap-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5 border border-cyan-500/20">
              <Orbit className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                    JEE Principle: {activeInsight.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08] text-zinc-400">
                    {activeInsight.topic}
                  </span>
                </div>
              </div>

              {/* Publication Quality Formula Rendering via KaTeX */}
              <div className="my-1.5 py-1 px-2.5 rounded-lg bg-black/40 border border-cyan-500/20 inline-block text-cyan-200 text-xs sm:text-sm font-serif">
                <Latex math={activeInsight.formula} />
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
                {activeInsight.fact}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Cockpit Footer Bar with Keyboard Controls & Instant Skip */}
      <footer className="relative z-10 w-full max-w-5xl flex items-center justify-between py-2 border-t border-white/[0.06] mt-auto">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline-flex items-center gap-1">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.15] text-cyan-300 text-[10px] font-semibold">
              Space
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.15] text-cyan-300 text-[10px] font-semibold">
              Enter
            </kbd>{' '}
            to skip
          </span>
          <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
            • 499+ JEE Master Formulas Loaded
          </span>
        </div>

        <button
          onClick={handleInstantSkip}
          className="text-xs text-cyan-300 hover:text-white transition-all font-mono font-bold flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 hover:border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.2)] ml-auto cursor-pointer"
        >
          <span>Skip Calibration & Enter Lab</span>
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </footer>
    </motion.div>
  );

  if (!mounted || typeof document === 'undefined') {
    return content;
  }

  return createPortal(content, document.body);
};

/**
 * In-Viewport Skeleton Loader for snappy apparatus switches
 * Features the compact 3D quantum atom visualizer with smooth shimmer
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
        isDark ? 'bg-[#04060E]/90 text-white backdrop-blur-md' : 'bg-slate-950/85 text-white backdrop-blur-md'
      }`}
    >
      {/* Mini Quantum Atom Visualizer with locked aspect ratio */}
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
