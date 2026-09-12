import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sliders,
  Activity,
  Bot,
  BookOpen,
  Award,
  Zap,
  RotateCw,
  Maximize2,
  Play,
  Pause,
  Compass,
  CheckCircle2,
  Sparkles,
  MousePointer,
  Move,
  Layers,
  ArrowRight,
  Mic,
  Volume2,
  FileDown,
  BrainCircuit,
  Globe,
  Database,
  Search,
  Check,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  Loader2,
  BookmarkCheck,
  Lightbulb,
  Cpu,
  Atom,
} from 'lucide-react';
import { Latex } from './Latex';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import confetti from 'canvas-confetti';

interface UserTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiTutor?: () => void;
  onOpenFormulaHub?: () => void;
  onOpenPdfModal?: () => void;
  onOpenQuestionArena?: () => void;
  onOpenSpotlightTour?: () => void;
}

export const UserTutorialModal: React.FC<UserTutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenAiTutor,
  onOpenFormulaHub,
  onOpenPdfModal,
  onOpenQuestionArena,
  onOpenSpotlightTour,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  // Interactive demo states inside tutorial
  const [demoSlider, setDemoSlider] = useState(45);
  const [demoVelocity, setDemoVelocity] = useState(25);
  const [demoIsPlaying, setDemoIsPlaying] = useState(true);
  const [demoSpeed, setDemoSpeed] = useState(1.0);
  const [demoCameraAngle, setDemoCameraAngle] = useState('Free 3D');
  const [demoVoicePlaying, setDemoVoicePlaying] = useState(false);
  const [activeTrapTab, setActiveTrapTab] = useState<'trap' | 'shortcut'>('trap');

  // New features interactive demo states
  const [demoNeonGlow, setDemoNeonGlow] = useState<'vibrant' | 'subtle' | 'off'>('vibrant');
  const [demoAiDifficulty, setDemoAiDifficulty] = useState<'JEE Main' | 'JEE Advanced'>('JEE Main');
  const [demoAiGenerating, setDemoAiGenerating] = useState(false);
  const [demoAiSelectedOption, setDemoAiSelectedOption] = useState<number | null>(null);
  const [demoAiSubmitted, setDemoAiSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('jee_physics_tutorial_seen');
      setDontShowAgain(saved === 'true');
    }
  }, [isOpen]);

  // Track visited steps for neat progress indicator
  useEffect(() => {
    setVisitedSteps((prev) => new Set([...prev, currentStep]));
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < tutorialSteps.length - 1) {
          setCurrentStep((s) => s + 1);
        } else {
          handleFinish();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((s) => s - 1);
        }
      } else if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('jee_physics_tutorial_seen', 'true');
    } else {
      localStorage.removeItem('jee_physics_tutorial_seen');
    }
    onClose();
  };

  const tutorialSteps = useMemo(
    () => [
      {
        id: 'step-ui-map',
        badge: 'Step 01 • Interface',
        title: 'UI Layout & Laboratory Control Map',
        shortTitle: 'UI & Button Map',
        subtitle: 'Master the laboratory layout. Find every 3D tool, parameter slider, and AI solver in seconds.',
        icon: Compass,
        accentColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        accentBg: 'bg-emerald-500/10 text-emerald-400',
        isNew: false,
        content: (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              The laboratory workspace is divided into 4 key functional zones. Review the interactive map below to quickly navigate between 3D apparatus, parameter controls, formulas, and tests.
            </p>

            {/* Visual Screen Map Diagram */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-[#070914] rounded-2xl border border-white/[0.1] overflow-hidden flex flex-col font-mono text-[10px] shadow-2xl">
              {/* Top Bar Mockup */}
              <div className="h-8 border-b border-white/[0.1] flex items-center justify-between px-3 bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-cyan-400 rounded-full" />
                  </div>
                  <span className="text-cyan-300 font-bold">Menu / 18 Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold flex items-center gap-1">
                    <Bot className="w-3 h-3 text-indigo-400" />
                    <span>AI Voice Tutor</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                    <FileDown className="w-3 h-3 text-emerald-400" />
                    <span>PDF Sheets</span>
                  </div>
                </div>
              </div>

              {/* Main Area Mockup */}
              <div className="flex-1 flex relative">
                {/* Canvas Top-Left (Diagnostics) */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <div className="px-2.5 py-1 rounded-lg bg-[#0e1222]/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Live Force Vectors</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#0e1222]/90 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Trajectory Ribbons</span>
                  </div>
                </div>

                {/* Center Canvas */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/20 flex flex-col items-center justify-center text-center">
                    <Atom className="w-6 h-6 text-cyan-400 animate-spin [animation-duration:10s]" />
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                      3D Apparatus
                    </span>
                  </div>
                </div>

                {/* Right Controls Panel Mockup */}
                <div className="w-36 sm:w-52 border-l border-white/[0.1] bg-[#0c0f1d]/90 p-2.5 flex flex-col gap-2 relative">
                  <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Sim Controls</span>
                  </div>
                  <div className="h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center px-2 text-amber-300 font-medium">
                    Mass & Velocity
                  </div>
                  <div className="h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center px-2 text-cyan-300 font-bold">
                    ✦ Neon Glow Shader
                  </div>
                  <div className="h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center px-2 text-indigo-300 font-medium">
                    Time Dilation / Slow-Mo
                  </div>
                  <div className="mt-auto flex gap-1 pt-2 border-t border-white/[0.08]">
                    <div className="flex-1 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
                      ▶ Play / Pause
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar Mockup */}
              <div className="h-7 border-t border-white/[0.1] flex items-center justify-between px-3 bg-white/[0.02]">
                <span className="text-[9px] text-zinc-500 font-mono">18 Topic Explorers</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">Projectile</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px]">Rotational</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px]">Electro</span>
                </div>
              </div>
            </div>

            {/* Quick Reference Locator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#121422] rounded-xl border border-white/[0.08] flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <strong className="text-zinc-100 block mb-0.5 font-bold">Top-Right: AI Mentor & Compendiums</strong>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Click the floating glowing AI button for spoken doubt resolution. Next to it are PDF formula sheets & syllabus progress.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121422] rounded-xl border border-white/[0.08] flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <strong className="text-zinc-100 block mb-0.5 font-bold">Sidebar & Controls Panel</strong>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Adjust mass, launch angle, velocity, friction, neon glow intensity, simulation speed (0.25x to 2x), and freeze time.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121422] rounded-xl border border-white/[0.08] flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-zinc-100 block mb-0.5 font-bold">Top-Left: Diagnostics & Vectors</strong>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Toggle live force vectors (<Latex math="\vec{F}_{\text{net}}, \vec{N}, \vec{v}, \vec{a}" />), numerical telemetry, and dotted trajectory ribbons.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121422] rounded-xl border border-white/[0.08] flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <strong className="text-zinc-100 block mb-0.5 font-bold">Bottom Dock: 18 JEE Chapters</strong>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Quickly switch across Classical Mechanics, Thermodynamics, Waves, Electromagnetism, and Modern Physics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'step-viewport',
        badge: 'Step 02 • Visuals',
        title: '3D Physics Viewport & NEW Neon Glowing Visualizer',
        shortTitle: '3D View & Neon Glow',
        subtitle: 'Complete 360° orbital spatial control with real-time vector diagnostics and customizable eye-safe neon glow shaders.',
        icon: Eye,
        accentColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30',
        accentBg: 'bg-cyan-500/10 text-cyan-400',
        isNew: true,
        content: (
          <div className="space-y-4">
            {/* Spatial Navigation Instruction Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#111422] border border-cyan-500/20 rounded-xl flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <MousePointer className="w-4 h-4 text-cyan-400" />
                  <span>Orbit (360°)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-200">Left-Click & Drag</strong> anywhere on the 3D canvas to freely rotate around the apparatus in full spherical coordinates.
                </p>
              </div>

              <div className="p-3.5 bg-[#111422] border border-indigo-500/20 rounded-xl flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Move className="w-4 h-4 text-indigo-400" />
                  <span>Pan Stage</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-200">Right-Click & Drag</strong> or two fingers on mobile to translate the stage along XY and XZ coordinate axes.
                </p>
              </div>

              <div className="p-3.5 bg-[#111422] border border-amber-500/20 rounded-xl flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <span>Zoom & Telephoto</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-200">Scroll Wheel / Pinch</strong> to inspect micro particle collisions or zoom out for macro projectile trajectories.
                </p>
              </div>
            </div>

            {/* Interactive Camera Angle Selector Demo */}
            <div className="p-3.5 bg-[#0e111d] border border-cyan-500/20 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Try Camera Presets:
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                  Active: {demoCameraAngle}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Free 3D', desc: 'Orbital perspective' },
                  { name: 'Top (XZ Plane)', desc: 'Direct bird-eye' },
                  { name: 'Side (YZ Plane)', desc: 'Elevation cut' },
                  { name: 'Front (XY Plane)', desc: 'Face-on angle' },
                ].map((angle) => (
                  <button
                    key={angle.name}
                    onClick={() => setDemoCameraAngle(angle.name)}
                    className={`p-2.5 rounded-xl text-xs font-semibold transition flex flex-col text-left ${
                      demoCameraAngle === angle.name
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                        : 'bg-[#151928] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:bg-[#1a1f32]'
                    }`}
                  >
                    <span className="font-bold">{angle.name}</span>
                    <span className="text-[9px] text-zinc-400">{angle.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* NEW FEATURE: Neon Glowing Effects Interactive Sandbox */}
            <div className="p-4 bg-gradient-to-br from-[#0c1122] via-[#090d1a] to-[#060812] border border-cyan-500/35 rounded-2xl space-y-3.5 relative overflow-hidden shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                    <Sparkles className="w-3 h-3" /> NEW FEATURE
                  </span>
                  <span className="text-xs font-bold text-white">3D Apparatus Neon Glow Shaders</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase tracking-wider bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  Mode: {demoNeonGlow}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Customizable GLSL shader glow located under <em>"3D Model Neon Glow Effect"</em> in the simulation panel. Choose between eye-safe cyber glow, subtle rim lighting, or realistic diffuse shading:
              </p>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 p-1 bg-[#101424] border border-white/[0.08] rounded-xl">
                {(['vibrant', 'subtle', 'off'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDemoNeonGlow(level)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 capitalize ${
                      demoNeonGlow === level
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {level === 'vibrant' && <Sparkles className="w-3.5 h-3.5" />}
                    {level === 'subtle' && <Zap className="w-3.5 h-3.5" />}
                    {level === 'off' && <Eye className="w-3.5 h-3.5" />}
                    <span>{level}</span>
                  </button>
                ))}
              </div>

              {/* Visual Simulation Canvas Preview */}
              <div className="p-4 bg-[#050711] rounded-xl border border-white/[0.08] relative overflow-hidden flex flex-col items-center justify-center min-h-[130px]">
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-400 px-2 mb-1">
                  <span>Vector & Trajectory Contrast Preview</span>
                  <span className={demoNeonGlow === 'vibrant' ? 'text-cyan-300 font-bold' : demoNeonGlow === 'subtle' ? 'text-emerald-300 font-bold' : 'text-zinc-400'}>
                    {demoNeonGlow === 'vibrant' ? '✦ Eye-Safe Cyber Glow' : demoNeonGlow === 'subtle' ? '✧ Gentle Rim Highlight' : 'Realistic Diffuse'}
                  </span>
                </div>

                <div className="w-full h-16 relative flex items-center justify-center">
                  <svg className="w-full h-16 overflow-visible" viewBox="0 0 300 60">
                    <path
                      d="M 10 50 Q 150 -15 290 50"
                      fill="none"
                      stroke={
                        demoNeonGlow === 'vibrant'
                          ? '#00F0FF'
                          : demoNeonGlow === 'subtle'
                          ? '#10B981'
                          : '#64748B'
                      }
                      strokeWidth={demoNeonGlow === 'vibrant' ? '2.5' : demoNeonGlow === 'subtle' ? '2' : '1.5'}
                      strokeDasharray={demoNeonGlow === 'off' ? '4 4' : 'none'}
                      style={{
                        filter:
                          demoNeonGlow === 'vibrant'
                            ? 'drop-shadow(0 0 4px #00F0FF) drop-shadow(0 0 8px rgba(0, 240, 255, 0.4))'
                            : demoNeonGlow === 'subtle'
                            ? 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))'
                            : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <circle
                      cx="150"
                      cy="17"
                      r={demoNeonGlow === 'vibrant' ? '5.5' : '4.5'}
                      fill={demoNeonGlow === 'vibrant' ? '#FFFFFF' : demoNeonGlow === 'subtle' ? '#A7F3D0' : '#94A3B8'}
                      style={{
                        filter:
                          demoNeonGlow === 'vibrant'
                            ? 'drop-shadow(0 0 5px #00F0FF)'
                            : demoNeonGlow === 'subtle'
                            ? 'drop-shadow(0 0 3px #10B981)'
                            : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <line
                      x1="150"
                      y1="17"
                      x2="150"
                      y2="42"
                      stroke={demoNeonGlow === 'vibrant' ? '#F43F5E' : '#E11D48'}
                      strokeWidth="2"
                      style={{
                        filter: demoNeonGlow === 'vibrant' ? 'drop-shadow(0 0 3px #F43F5E)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </svg>
                </div>

                <div className="text-[11px] text-zinc-300 text-center font-medium mt-1">
                  {demoNeonGlow === 'vibrant' && (
                    <span className="text-cyan-300">
                      <strong>Vibrant:</strong> Glowing high-contrast outline highlights trajectory ribbons and velocity vectors in dark environments.
                    </span>
                  )}
                  {demoNeonGlow === 'subtle' && (
                    <span className="text-emerald-300">
                      <strong>Subtle:</strong> Soft rim reflections preserve geometry depth while preventing eye strain during long study sessions.
                    </span>
                  )}
                  {demoNeonGlow === 'off' && (
                    <span className="text-zinc-400">
                      <strong>Off:</strong> Standard physical diffuse shading with zero post-processing illumination bloom.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'step-parameters',
        badge: 'Step 03 • Controls',
        title: 'Live Physics Parameters & Time Dilation Controls',
        shortTitle: 'Parameters & Time',
        subtitle: 'Slide variables with real-time recalculations and sub-frame Runge-Kutta numerical differential updates.',
        icon: Sliders,
        accentColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        accentBg: 'bg-amber-500/10 text-amber-400',
        isNew: false,
        content: (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Every apparatus recalculates physical quantities instantly upon slider movement. Test what-if scenarios directly by changing mass, launch angle, surface friction, or electric field:
            </p>

            {/* Interactive Slider Demo Card */}
            <div className="p-4 bg-[#121422] border border-amber-500/30 rounded-2xl space-y-3.5 shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Launch Angle (<Latex math="\theta" />)
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      {demoSlider}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={demoSlider}
                    onChange={(e) => setDemoSlider(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Muzzle Velocity (<Latex math="v_0" />)
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      {demoVelocity} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={demoVelocity}
                    onChange={(e) => setDemoVelocity(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Instant Numerical Recalculation Results */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.06] text-xs">
                <div className="p-2.5 bg-[#0b0d18] rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block font-semibold">Max Range (<Latex math="R" />):</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {((Math.pow(demoVelocity, 2) * Math.sin((2 * demoSlider * Math.PI) / 180)) / 9.8).toFixed(2)} m
                  </span>
                </div>
                <div className="p-2.5 bg-[#0b0d18] rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block font-semibold">Max Apex (<Latex math="H" />):</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    {((Math.pow(demoVelocity, 2) * Math.pow(Math.sin((demoSlider * Math.PI) / 180), 2)) / (2 * 9.8)).toFixed(2)} m
                  </span>
                </div>
                <div className="p-2.5 bg-[#0b0d18] rounded-xl border border-white/[0.04] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-400 block font-semibold">Flight Time (<Latex math="T" />):</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">
                    {((2 * demoVelocity * Math.sin((demoSlider * Math.PI) / 180)) / 9.8).toFixed(2)} s
                  </span>
                </div>
              </div>
            </div>

            {/* Time Controls Showcase */}
            <div className="p-3.5 bg-[#101322] border border-white/[0.08] rounded-xl flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => setDemoIsPlaying(!demoIsPlaying)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 hover:bg-amber-500/30 transition"
              >
                {demoIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{demoIsPlaying ? 'Pause Simulation' : 'Resume Simulation'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Speed:</span>
                {[0.25, 0.5, 1.0, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDemoSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      demoSpeed === s
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                        : 'bg-[#181b2e] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'step-ai-tutor',
        badge: 'Step 04 • AI Mentor',
        title: 'AI Physics Voice Tutor & Floating Mentor',
        shortTitle: 'AI Spoken Tutor',
        subtitle: 'Instant spoken guidance with Ursa voice synthesis, streaming CSS waveform, Thinking Mode, and PYQ search grounding.',
        icon: Bot,
        accentColor: 'text-indigo-400',
        borderColor: 'border-indigo-500/30',
        accentBg: 'bg-indigo-500/10 text-indigo-400',
        isNew: false,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#121526] border border-cyan-500/20 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Floating Mentor Icon (Top-Right)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Click the glowing AI Tutor floating button pinned at the <strong>top-right</strong> to ask questions at any time without losing your 3D apparatus setup.
                </p>
              </div>

              <div className="p-3.5 bg-[#121526] border border-emerald-500/20 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Microphone Voice Doubts</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Tap <strong className="text-emerald-300">Voice Doubt</strong> to speak freely. The AI tutor transcribes your speech and speaks the solution immediately.
                </p>
              </div>
            </div>

            {/* Waveform Visualizer & Audio Demo */}
            <div className="p-4 bg-[#0e111f] border border-indigo-500/30 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Live CSS Audio Waveform Visualizer</span>
                </div>
                <AudioWaveformVisualizer
                  isPlaying={demoVoicePlaying}
                  voiceName="Ursa"
                  size="sm"
                  showLabel={true}
                />
              </div>

              <div className="flex items-center justify-between gap-3 p-3 bg-[#15192c] rounded-xl border border-white/[0.06]">
                <p className="text-xs text-zinc-300">
                  "{demoVoicePlaying ? 'Unpacking the torque equation tau = r x F in real-time 3D...' : 'Click to test real-time voice playback with live animated waveform:'}"
                </p>
                <button
                  onClick={() => setDemoVoicePlaying(!demoVoicePlaying)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    demoVoicePlaying
                      ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{demoVoicePlaying ? 'Stop Audio' : 'Test Voice Demo'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 bg-[#161a2d] rounded-xl border border-purple-500/20">
                  <strong className="text-purple-300 block font-bold mb-0.5 flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5" /> Thinking Mode
                  </strong>
                  <span className="text-zinc-400">Deep, multi-step JEE Advanced reasoning with calculus derivations.</span>
                </div>
                <div className="p-2.5 bg-[#161a2d] rounded-xl border border-cyan-500/20">
                  <strong className="text-cyan-300 block font-bold mb-0.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Web Grounding
                  </strong>
                  <span className="text-zinc-400">Live search integration for verified syllabus updates & recent PYQs.</span>
                </div>
                <div className="p-2.5 bg-[#161a2d] rounded-xl border border-indigo-500/20">
                  <strong className="text-indigo-300 block font-bold mb-0.5 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" /> Voice Cache
                  </strong>
                  <span className="text-zinc-400">Instant audio replay cache with performance management.</span>
                </div>
              </div>
            </div>

            {onOpenAiTutor && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiTutor();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Spoken AI Physics Mentor Now</span>
              </button>
            )}
          </div>
        ),
      },
      {
        id: 'step-calculus',
        badge: 'Step 05 • Proofs',
        title: 'Step-by-Step Calculus Derivations & LaTeX Proofs',
        shortTitle: 'Calculus Proofs',
        subtitle: 'Understand the fundamental calculus proofs, differential equations, and dimensional balance behind every physics law.',
        icon: Activity,
        accentColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        accentBg: 'bg-purple-500/10 text-purple-400',
        isNew: false,
        content: (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Never memorize equations blindly. Switch to the <strong className="text-purple-300">Equations & Derivations</strong> panel to inspect rigorous mathematical proofs:
            </p>

            <div className="p-4 bg-[#121422] border border-purple-500/30 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Banked Road Maximum Safe Velocity Proof:
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Calculus Step 3 of 4</span>
              </div>

              <div className="p-3 bg-[#0a0d16] rounded-xl border border-white/[0.06] text-center overflow-x-auto">
                <Latex math="N\sin\theta + f_s\cos\theta = \frac{m v^2}{R}, \quad N\cos\theta - f_s\sin\theta = mg" />
                <div className="my-2 border-t border-white/[0.06]" />
                <Latex math="v_{\max} = \sqrt{R g \left(\frac{\tan\theta + \mu_s}{1 - \mu_s\tan\theta}\right)}" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#0e101d] rounded-lg border border-white/[0.04]">
                  <strong className="text-zinc-200 block mb-0.5">Dimensional Verification</strong>
                  <span className="text-[11px] text-zinc-400">[L T⁻¹] balances both left and right sides perfectly.</span>
                </div>
                <div className="p-2.5 bg-[#0e101d] rounded-lg border border-white/[0.04]">
                  <strong className="text-zinc-200 block mb-0.5">Asymptotic Limiting Cases</strong>
                  <span className="text-[11px] text-zinc-400">
                    When <Latex math="\mu_s = 0" />, formula reduces cleanly to <Latex math="v = \sqrt{Rg\tan\theta}" />.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'step-traps',
        badge: 'Step 06 • JEE Traps',
        title: 'JEE Exam Shortcuts & Negative Marking Trap Alerts',
        shortTitle: 'Traps & Shortcuts',
        subtitle: 'Master 30-second speed tricks and avoid classic traps set by IIT-JEE examiners.',
        icon: AlertTriangle,
        accentColor: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        accentBg: 'bg-rose-500/10 text-rose-400',
        isNew: false,
        content: (
          <div className="space-y-4">
            {/* Trap vs Shortcut Toggle */}
            <div className="flex items-center gap-2 p-1 bg-[#101322] rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTrapTab('trap')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTrapTab === 'trap'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Negative Marking Traps</span>
              </button>
              <button
                onClick={() => setActiveTrapTab('shortcut')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTrapTab === 'shortcut'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>30-Second JEE Shortcuts</span>
              </button>
            </div>

            {activeTrapTab === 'trap' ? (
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2.5 shadow-md">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Friction Direction Trap on Banked Curves:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  When <Latex math="v < \sqrt{Rg\tan\theta}" />, the vehicle tends to slide <strong>downward</strong> along the incline. Friction acts <strong>UP</strong> the incline! If you assume friction always opposes circular center force, you will pick the wrong option and lose marks.
                </p>
                <div className="p-2.5 bg-[#0a0c16] rounded-xl text-[11px] text-rose-200 font-mono text-center border border-rose-500/20">
                  <Latex math="v_{\min} = \sqrt{R g \left(\frac{\tan\theta - \mu_s}{1 + \mu_s\tan\theta}\right)}" />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2.5 shadow-md">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>The Inclined Plane Angle Shortcut:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  For maximum range on an inclined plane with slope <Latex math="\beta" />, test limiting boundary conditions: as <Latex math="\beta \to 0" />, the optimum launch angle smoothly converges to <Latex math="\theta = 45^\circ" />.
                </p>
                <div className="p-2.5 bg-[#0a0c16] rounded-xl text-[11px] text-amber-200 font-mono text-center border border-amber-500/20">
                  <Latex math="\theta_{\text{opt}} = 45^\circ + \frac{\beta}{2}" />
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'step-arena',
        badge: 'Step 07 • AI Practice',
        title: 'Dynamic JEE Question Arena & NEW AI Custom Generator',
        shortTitle: 'AI Question Arena',
        subtitle: 'Solve dynamically generated JEE Main & Advanced questions derived directly from your live physical simulation parameters.',
        icon: Award,
        accentColor: 'text-teal-400',
        borderColor: 'border-teal-500/30',
        accentBg: 'bg-teal-500/10 text-teal-400',
        isNew: true,
        content: (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Click the <strong className="text-teal-300">Practice Arena</strong> tab in the right dock. The system features a built-in question bank and the <strong>NEW AI Custom Question Generator</strong>:
            </p>

            {/* AI Generator Showcase Card */}
            <div className="p-4 bg-gradient-to-br from-[#0c1220] via-[#090e18] to-[#060812] border border-teal-500/35 rounded-2xl space-y-3.5 relative overflow-hidden shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                    <Sparkles className="w-3 h-3" /> NEW FEATURE
                  </span>
                  <span className="text-xs font-bold text-white">AI Parameter-Grounded Question Generator</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/25">
                    Live Parameters Grounding
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Inside the Question Arena, tap <strong>"Generate Custom Question"</strong>. The AI tutor reads the exact physical parameters you just configured in the 3D simulation and calculates a brand new, syllabus-aligned numerical problem:
              </p>

              {/* Active Parameter Snapshot Chip */}
              <div className="p-2.5 bg-[#121626] rounded-xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active 3D Parameters:</span>
                  <span className="font-mono text-teal-300 font-bold text-[11px]">
                    {demoAiDifficulty === 'JEE Main'
                      ? 'v₀ = 25 m/s • θ = 45° • g = 9.8 m/s²'
                      : 'm = 3 kg • θ = 30° • μₖ = 0.2 • g = 9.8 m/s²'}
                  </span>
                </div>

                {/* Difficulty Switcher */}
                <div className="flex items-center gap-1 p-0.5 bg-[#0A0D18] rounded-lg border border-white/[0.08]">
                  {(['JEE Main', 'JEE Advanced'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        setDemoAiDifficulty(diff);
                        setDemoAiSelectedOption(null);
                        setDemoAiSubmitted(false);
                      }}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition ${
                        demoAiDifficulty === diff
                          ? 'bg-teal-500 text-slate-950 shadow-xs font-black'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Simulation Button */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setDemoAiGenerating(true);
                    setDemoAiSelectedOption(null);
                    setDemoAiSubmitted(false);
                    setTimeout(() => {
                      setDemoAiGenerating(false);
                    }, 400);
                  }}
                  disabled={demoAiGenerating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-75"
                >
                  {demoAiGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing from Active Physical Parameters...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulate Custom Question Generation</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-zinc-400 font-medium">
                  Click to test parameter-grounded question formulation
                </span>
              </div>

              {/* Generated Question Interactive Preview Card */}
              <div className="p-4 bg-[#0e1222] border border-teal-500/30 rounded-xl space-y-3 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> AI Custom ({demoAiDifficulty})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Parameter Snapshot Synchronized
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    +4 Correct / -1 Penalty
                  </span>
                </div>

                {demoAiDifficulty === 'JEE Main' ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-zinc-100 leading-relaxed">
                      A particle is projected from horizontal ground with the active simulation launch speed <Latex math="v_0 = 25\,\text{m/s}" /> at an elevation angle of <Latex math="\theta = 45^\circ" /> under gravity <Latex math="g = 9.8\,\text{m/s}^2" />. What is the total horizontal range <Latex math="R" /> of the trajectory?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'A', text: '63.8 m', isCorrect: true },
                        { label: 'B', text: '15.9 m', isCorrect: false },
                        { label: 'C', text: '31.9 m', isCorrect: false },
                        { label: 'D', text: '95.7 m', isCorrect: false },
                      ].map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDemoAiSelectedOption(idx);
                            setDemoAiSubmitted(true);
                            if (opt.isCorrect) {
                              confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
                            }
                          }}
                          className={`p-2.5 rounded-xl text-left text-[11px] font-semibold border transition flex items-center justify-between ${
                            demoAiSubmitted && opt.isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : demoAiSubmitted && demoAiSelectedOption === idx && !opt.isCorrect
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                              : demoAiSelectedOption === idx
                              ? 'bg-teal-500/20 border-teal-500/40 text-teal-200'
                              : 'bg-[#15192d] border-white/[0.06] text-zinc-300 hover:bg-[#1c223c]'
                          }`}
                        >
                          <span>{opt.label}) {opt.text}</span>
                          {demoAiSubmitted && opt.isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-zinc-100 leading-relaxed">
                      A block of mass <Latex math="m = 3\,\text{kg}" /> is released on an incline of angle <Latex math="\theta = 30^\circ" /> with kinetic friction coefficient <Latex math="\mu_k = 0.2" /> (<Latex math="g = 9.8\,\text{m/s}^2" />). Find the net downward acceleration <Latex math="a" /> along the incline.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'A', text: '3.20 m/s²', isCorrect: true },
                        { label: 'B', text: '4.90 m/s²', isCorrect: false },
                        { label: 'C', text: '6.60 m/s²', isCorrect: false },
                        { label: 'D', text: '1.70 m/s²', isCorrect: false },
                      ].map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDemoAiSelectedOption(idx);
                            setDemoAiSubmitted(true);
                            if (opt.isCorrect) {
                              confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
                            }
                          }}
                          className={`p-2.5 rounded-xl text-left text-[11px] font-semibold border transition flex items-center justify-between ${
                            demoAiSubmitted && opt.isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : demoAiSubmitted && demoAiSelectedOption === idx && !opt.isCorrect
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                              : demoAiSelectedOption === idx
                              ? 'bg-teal-500/20 border-teal-500/40 text-teal-200'
                              : 'bg-[#15192d] border-white/[0.06] text-zinc-300 hover:bg-[#1c223c]'
                          }`}
                        >
                          <span>{opt.label}) {opt.text}</span>
                          {demoAiSubmitted && opt.isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Derivation Feedback Reveal */}
                {demoAiSubmitted && (
                  <div className="p-3 bg-[#080b16] rounded-xl border border-emerald-500/30 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Step-by-Step Mathematical Derivation:</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-mono">
                      {demoAiDifficulty === 'JEE Main'
                        ? 'R = (v₀² sin 2θ) / g = (25² · sin 90°) / 9.8 = 625 / 9.8 = 63.8 m'
                        : 'a = g(sin 30° - 0.2 · cos 30°) = 9.8 · (0.5 - 0.1732) = 3.20 m/s²'}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA to Open Question Arena */}
              {onOpenQuestionArena && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuestionArena();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Launch Live Practice Arena with Active Parameters</span>
                </button>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'step-pdf-hub',
        badge: 'Step 08 • Export',
        title: 'Publication-Grade PDF Formula Compendiums & Hotkeys',
        shortTitle: 'PDF Notes & Hotkeys',
        subtitle: 'Export high-resolution vector cheat sheets for all 18 JEE chapters and use pro keyboard shortcuts.',
        icon: BookOpen,
        accentColor: 'text-indigo-400',
        borderColor: 'border-indigo-500/30',
        accentBg: 'bg-indigo-500/10 text-indigo-400',
        isNew: false,
        content: (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Export high-resolution study cheat sheets covering all 18 JEE Physics chapters with formulas, calculus derivations, exam traps, and dimensional breakdowns:
            </p>

            <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-cyan-950/40 border border-indigo-500/30 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Chapter PDF Compendiums</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  18 Chapters Ready
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Export ready-to-print study sheets with pristine typography, vector diagrams, shortcut tables, and negative marking warnings.
              </p>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {onOpenPdfModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPdfModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md shadow-cyan-500/25"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Open PDF Formula Compendium</span>
                  </button>
                )}
                {onOpenFormulaHub && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFormulaHub();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Browse 100+ Formulas</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Pro Hotkey Grid */}
            <div className="p-3.5 bg-[#0e111e] rounded-xl border border-white/[0.06] space-y-2">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Essential Laboratory Keyboard Shortcuts:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-[#141728] rounded-lg border border-white/[0.04]">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 mr-1.5">Space</kbd>
                  <span className="text-zinc-400">Play / Pause</span>
                </div>
                <div className="p-2 bg-[#141728] rounded-lg border border-white/[0.04]">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 mr-1.5">R</kbd>
                  <span className="text-zinc-400">Reset Stage</span>
                </div>
                <div className="p-2 bg-[#141728] rounded-lg border border-white/[0.04]">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 mr-1.5">A</kbd>
                  <span className="text-zinc-400">AI Voice Tutor</span>
                </div>
                <div className="p-2 bg-[#141728] rounded-lg border border-white/[0.04]">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 mr-1.5">F</kbd>
                  <span className="text-zinc-400">Focus Mode</span>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [
      demoSlider,
      demoVelocity,
      demoIsPlaying,
      demoSpeed,
      demoCameraAngle,
      demoVoicePlaying,
      activeTrapTab,
      demoNeonGlow,
      demoAiDifficulty,
      demoAiGenerating,
      demoAiSelectedOption,
      demoAiSubmitted,
      onClose,
      onOpenAiTutor,
      onOpenFormulaHub,
      onOpenPdfModal,
      onOpenQuestionArena,
    ]
  );

  const safeStep = Math.max(
    0,
    Math.min(tutorialSteps.length - 1, Number.isFinite(currentStep) ? currentStep : 0)
  );
  const currentStepData = tutorialSteps[safeStep] || tutorialSteps[0];
  const StepIcon = currentStepData?.icon || Compass;
  const progressPercent = Math.round(((safeStep + 1) / tutorialSteps.length) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#04060E]/85 backdrop-blur-md p-2 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Main Elevated Workbench Modal Container */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-6xl h-full max-h-[92vh] bg-[#070913] text-zinc-100 rounded-3xl border border-cyan-500/25 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
          >
            {/* Top Sleek Workbench Header */}
            <header className="px-5 sm:px-8 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E1B]/95 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-md">
                  <Compass className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                      JEE Advanced 3D Physics Lab
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      Tutorial Guide
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                    Interactive feature walkthrough, 3D controls, AI mentorship & exam tools
                  </p>
                </div>
              </div>

              {/* Step Progress Pill & Exit Button */}
              <div className="flex items-center gap-2 sm:gap-3">
                {onOpenSpotlightTour && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSpotlightTour();
                    }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    title="Switch to Live On-Screen Spotlight Walkthrough"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="hidden md:inline">Spotlight Tour</span>
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131628] border border-white/[0.08] text-xs font-mono">
                  <span className="text-cyan-300 font-bold">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">{progressPercent}%</span>
                </div>

                <button
                  onClick={handleFinish}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  title="Close Tutorial (Esc)"
                >
                  <span className="hidden sm:inline">Close</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Mobile / Tablet Horizontal Stepper Strip */}
            <div className="lg:hidden w-full bg-[#0a0d1a] border-b border-white/[0.06] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {tutorialSteps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    idx === currentStep
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : visitedSteps.has(idx)
                      ? 'bg-[#141728] text-zinc-300 border border-white/[0.06]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{idx + 1}.</span>
                  <span>{step.shortTitle}</span>
                  {step.isNew && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>
              ))}
            </div>

            {/* Main Workbench Body: Left Sidebar + Right Stage */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Navigation Rail (Desktop) */}
              <aside className="hidden lg:flex w-64 xl:w-72 bg-[#090C18] border-r border-white/[0.08] flex-col shrink-0">
                <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <span>Table of Contents</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{progressPercent}% Done</span>
                </div>

                {/* Chapter List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
                  {tutorialSteps.map((step, idx) => {
                    const ItemIcon = step?.icon || Compass;
                    const isActive = idx === currentStep;
                    const isCompleted = visitedSteps.has(idx) && !isActive;

                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(idx)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/15 text-white border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                              isActive
                                ? 'bg-cyan-400 text-slate-950 font-black'
                                : isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-[#131626] text-zinc-500 border border-white/[0.06]'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : idx + 1}
                          </div>

                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${isActive ? 'text-cyan-200' : 'text-zinc-300'}`}>
                              {step.shortTitle}
                            </span>
                            <span className="text-[10px] text-zinc-500 block truncate">
                              {step.badge}
                            </span>
                          </div>
                        </div>

                        {step.isNew && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950 shrink-0 ml-2">
                            NEW
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sidebar Bottom Progress Bar */}
                <div className="p-3.5 border-t border-white/[0.06] bg-[#070912]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>Course Progress</span>
                    <span className="text-cyan-400 font-bold">{currentStep + 1} / {tutorialSteps.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </aside>

              {/* Right Main Stage (Interactive Step Display) */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-7 custom-scrollbar flex flex-col justify-start">
                <div className="w-full max-w-4xl mx-auto space-y-4">
                  {/* Step Top Banner Card */}
                  <div className={`p-5 sm:p-6 rounded-2xl border ${currentStepData.borderColor} bg-gradient-to-br from-[#0F1222] via-[#0C0E1A] to-[#070810] shadow-xl relative overflow-hidden`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${currentStepData.accentBg} ${currentStepData.borderColor}`}>
                            {currentStepData.badge}
                          </span>
                          {currentStepData.isNew && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-3 h-3" /> NEW UPGRADE
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                          {currentStepData.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${currentStepData.borderColor} bg-white/[0.03]`}>
                          <StepIcon className={`w-5 h-5 ${currentStepData.accentColor}`} />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-3">
                      {currentStepData.subtitle}
                    </p>

                    {/* Step Interactive Body */}
                    <div className="mt-5 pt-1">
                      {currentStepData.content}
                    </div>
                  </div>
                </div>
              </main>
            </div>

            {/* Bottom Sticky Control Dock */}
            <footer className="px-5 sm:px-8 py-3.5 border-t border-white/[0.08] bg-[#0A0D1A]/95 backdrop-blur-xl shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 transition select-none">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <span>Don't show automatically on start</span>
                </label>

                <span className="hidden md:inline text-[11px] text-zinc-500 font-mono">
                  Keys: <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">←</kbd> Prev &bull; <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">→</kbd> / <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">Enter</kbd> Next &bull; <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">Esc</kbd> Close
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="px-4 py-2 rounded-xl bg-[#141728] hover:bg-[#1c2138] text-zinc-200 border border-white/[0.08] text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}

                {currentStep < tutorialSteps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95"
                  >
                    <span>Start Experimenting</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
