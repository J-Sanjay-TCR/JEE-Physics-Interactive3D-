import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Latex } from './Latex';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

interface UserTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiTutor?: () => void;
  onOpenFormulaHub?: () => void;
  onOpenPdfModal?: () => void;
}

export const UserTutorialModal: React.FC<UserTutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenAiTutor,
  onOpenFormulaHub,
  onOpenPdfModal,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Interactive demo states inside tutorial
  const [demoSlider, setDemoSlider] = useState(45);
  const [demoVelocity, setDemoVelocity] = useState(25);
  const [demoIsPlaying, setDemoIsPlaying] = useState(true);
  const [demoSpeed, setDemoSpeed] = useState(1.0);
  const [demoCameraAngle, setDemoCameraAngle] = useState('Free 3D');
  const [demoVoicePlaying, setDemoVoicePlaying] = useState(false);
  const [activeTrapTab, setActiveTrapTab] = useState<'trap' | 'shortcut'>('trap');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('jee_physics_tutorial_seen');
      setDontShowAgain(saved === 'true');
    }
  }, [isOpen]);

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

  const tutorialSteps = [
    {
      id: 'step-viewport',
      badge: 'Step 1 of 7',
      title: '3D Physics Viewport & Spatial Controls',
      subtitle: 'Complete 360° orbital spatial control with real-time vector diagnostics, trajectory tracing, and coordinate grids.',
      icon: Eye,
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/30',
      accentBg: 'bg-cyan-500/10 text-cyan-400',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#16161e] border border-white/[0.06] rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <MousePointer className="w-4 h-4" />
                <span>Orbit (360°)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">Left-Click & Drag</strong> anywhere on the 3D canvas to rotate the camera around the active apparatus.
              </p>
            </div>

            <div className="p-3 bg-[#16161e] border border-white/[0.06] rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                <Move className="w-4 h-4" />
                <span>Pan Stage</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">Right-Click & Drag</strong> or use two fingers to translate the stage along XY/XZ axes.
              </p>
            </div>

            <div className="p-3 bg-[#16161e] border border-white/[0.06] rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Maximize2 className="w-4 h-4" />
                <span>Zoom & POV</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">Scroll Wheel / Pinch</strong> to zoom into close details or view macro trajectories.
              </p>
            </div>
          </div>

          {/* Interactive Camera Angle Selector Demo */}
          <div className="p-3.5 bg-[#0f0f14] border border-cyan-500/20 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Try Interactive Camera Perspective Presets:
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">Active: {demoCameraAngle}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Free 3D', desc: 'Custom orbital perspective' },
                { name: 'Top (XZ Plane)', desc: 'Direct bird-eye view' },
                { name: 'Side (YZ Plane)', desc: 'Cross-section elevation' },
                { name: 'Front (XY Plane)', desc: 'Direct face-on elevation' },
              ].map((angle) => (
                <button
                  key={angle.name}
                  onClick={() => setDemoCameraAngle(angle.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex flex-col text-left ${
                    demoCameraAngle === angle.name
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'bg-[#181822] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:bg-[#20202c]'
                  }`}
                >
                  <span className="font-bold">{angle.name}</span>
                  <span className="text-[9px] text-zinc-400">{angle.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-300 mb-0.5">Top-Left Diagnostic Toggles:</strong>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Use the top-left buttons to toggle <strong>Live Force Vectors</strong> (<Latex math="\vec{F}_{\text{net}}, \vec{N}, \vec{v}, \vec{a}" />), trajectory ribbons, coordinate axes, and numerical telemetry in real time.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'step-parameters',
      badge: 'Step 2 of 7',
      title: 'Live Physics Parameters & Time Dilation Controls',
      subtitle: 'Slide variables in real time with instantaneous math recalculations and time-dilation controls.',
      icon: Sliders,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-500/30',
      accentBg: 'bg-amber-500/10 text-amber-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Every simulation responds immediately to variable modifications without page reloading. Test hypotheses instantly by altering mass, angle, friction coefficient, or electric field:
          </p>

          {/* Interactive Slider Demo */}
          <div className="p-4 bg-[#16161e] border border-amber-500/30 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Initial Velocity (<Latex math="v_0" />)
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
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Instant Recalculation Results */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="p-2 bg-[#0e0f18] rounded-lg">
                <span className="text-[10px] text-zinc-400 block font-semibold">Max Range (<Latex math="R" />):</span>
                <span className="font-mono font-bold text-amber-300">
                  {((Math.pow(demoVelocity, 2) * Math.sin((2 * demoSlider * Math.PI) / 180)) / 9.8).toFixed(2)} m
                </span>
              </div>
              <div className="p-2 bg-[#0e0f18] rounded-lg">
                <span className="text-[10px] text-zinc-400 block font-semibold">Max Height (<Latex math="H" />):</span>
                <span className="font-mono font-bold text-cyan-300">
                  {((Math.pow(demoVelocity, 2) * Math.pow(Math.sin((demoSlider * Math.PI) / 180), 2)) / (2 * 9.8)).toFixed(2)} m
                </span>
              </div>
              <div className="p-2 bg-[#0e0f18] rounded-lg col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 block font-semibold">Time of Flight (<Latex math="T" />):</span>
                <span className="font-mono font-bold text-emerald-300">
                  {((2 * demoVelocity * Math.sin((demoSlider * Math.PI) / 180)) / 9.8).toFixed(2)} s
                </span>
              </div>
            </div>
          </div>

          {/* Time Controls Showcase */}
          <div className="p-3.5 bg-[#0f0f14] border border-white/[0.08] rounded-xl flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setDemoIsPlaying(!demoIsPlaying)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 hover:bg-amber-500/30 transition"
            >
              {demoIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{demoIsPlaying ? 'Pause Simulation' : 'Resume Simulation'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Slow-Mo & Speed:</span>
              {[0.25, 0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setDemoSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    demoSpeed === s
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                      : 'bg-[#1a1a24] text-zinc-400 hover:text-zinc-200'
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
      badge: 'Step 3 of 7',
      title: 'AI Physics Voice Tutor & Floating Mentor',
      subtitle: 'Instant spoken guidance with Ursa voice, streaming audio waveform, Thinking Mode, and Voice Cache Management.',
      icon: Bot,
      color: 'from-cyan-500 to-indigo-600',
      borderColor: 'border-cyan-500/30',
      accentBg: 'bg-cyan-500/10 text-cyan-400',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#16161e] border border-cyan-500/20 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Floating Mentor Icon (Top-Right)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Click the glowing AI Tutor floating button pinned at the <strong>top-right</strong> of your screen to open the doubt solver at any time without losing your 3D apparatus setup.
              </p>
            </div>

            <div className="p-3 bg-[#16161e] border border-emerald-500/20 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Microphone Voice Doubts</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tap the <strong className="text-emerald-300">Voice Doubt</strong> button to speak naturally. The AI tutor transcribes your speech and speaks back the solution immediately.
              </p>
            </div>
          </div>

          {/* Waveform Visualizer & Audio Demo */}
          <div className="p-4 bg-[#0f0f14] border border-cyan-500/30 rounded-2xl space-y-3">
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

            <div className="flex items-center justify-between gap-3 p-3 bg-[#141524] rounded-xl border border-white/[0.06]">
              <p className="text-xs text-zinc-300">
                "{demoVoicePlaying ? 'Unpacking the torque equation tau = r x F in real-time 3D...' : 'Click to test real-time voice playback with live animated waveform:'}"
              </p>
              <button
                onClick={() => setDemoVoicePlaying(!demoVoicePlaying)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
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
              <div className="p-2.5 bg-[#181928] rounded-lg border border-purple-500/20">
                <strong className="text-purple-300 block font-bold mb-0.5 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5" /> Thinking Mode
                </strong>
                <span className="text-zinc-400">Deep, multi-step JEE Advanced reasoning with calculus derivations.</span>
              </div>
              <div className="p-2.5 bg-[#181928] rounded-lg border border-cyan-500/20">
                <strong className="text-cyan-300 block font-bold mb-0.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Web Grounding
                </strong>
                <span className="text-zinc-400">Live search integration for verified syllabus updates & recent PYQs.</span>
              </div>
              <div className="p-2.5 bg-[#181928] rounded-lg border border-indigo-500/20">
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
      badge: 'Step 4 of 7',
      title: 'Step-by-Step Calculus Derivations & LaTeX Proofs',
      subtitle: 'Understand the fundamental calculus proofs, differential equations, and dimensional analysis behind every law.',
      icon: Activity,
      color: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-500/30',
      accentBg: 'bg-purple-500/10 text-purple-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Never memorize equations blindly. Switch to the <strong className="text-purple-300">Equations & Derivations</strong> panel to inspect rigorous proofs:
          </p>

          <div className="p-4 bg-[#16161e] border border-purple-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Banked Road Maximum Safe Velocity Proof:
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Calculus Step 3 of 4</span>
            </div>

            <div className="p-3 bg-[#0d0d14] rounded-xl border border-white/[0.06] text-center overflow-x-auto">
              <Latex math="N\sin\theta + f_s\cos\theta = \frac{m v^2}{R}, \quad N\cos\theta - f_s\sin\theta = mg" />
              <div className="my-2 border-t border-white/[0.06]" />
              <Latex math="v_{\max} = \sqrt{R g \left(\frac{\tan\theta + \mu_s}{1 - \mu_s\tan\theta}\right)}" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#0e0f18] rounded-lg">
                <strong className="text-zinc-200 block mb-0.5">Dimensional Verification</strong>
                <span className="text-[11px] text-zinc-400">[L T⁻¹] balances both left and right sides perfectly.</span>
              </div>
              <div className="p-2.5 bg-[#0e0f18] rounded-lg">
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
      badge: 'Step 5 of 7',
      title: 'JEE Exam Shortcuts & Negative Marking Trap Alerts',
      subtitle: 'Master 30-second speed tricks and avoid classic traps set by IIT exam setters.',
      icon: AlertTriangle,
      color: 'from-rose-500 to-amber-600',
      borderColor: 'border-rose-500/30',
      accentBg: 'bg-rose-500/10 text-rose-400',
      content: (
        <div className="space-y-4">
          {/* Trap vs Shortcut Toggle */}
          <div className="flex items-center gap-2 p-1 bg-[#10111a] rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setActiveTrapTab('trap')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTrapTab === 'trap'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
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
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>30-Second JEE Shortcuts</span>
            </button>
          </div>

          {activeTrapTab === 'trap' ? (
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>The Friction Direction Trap on Banked Roads:</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                When <Latex math="v < \sqrt{Rg\tan\theta}" />, the vehicle has a tendency to slide <strong>downward</strong> along the incline. Friction acts <strong>UP</strong> the incline! If you blindly assume friction always points down, you will select the wrong MCQ option and lose marks.
              </p>
              <div className="p-2.5 bg-[#0e0f18] rounded-xl text-[11px] text-rose-200 font-mono text-center">
                <Latex math="v_{\min} = \sqrt{R g \left(\frac{\tan\theta - \mu_s}{1 + \mu_s\tan\theta}\right)}" />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>The Superposition & Extreme Angle Shortcut:</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                For maximum range on an inclined plane with inclination <Latex math="\beta" />, test limiting values: as <Latex math="\beta \to 0" />, the optimum launch angle must smoothly converge to <Latex math="\theta = 45^\circ" />.
              </p>
              <div className="p-2.5 bg-[#0e0f18] rounded-xl text-[11px] text-amber-200 font-mono text-center">
                <Latex math="\theta_{\text{opt}} = 45^\circ + \frac{\beta}{2}" />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'step-arena',
      badge: 'Step 6 of 7',
      title: 'Dynamic JEE Question Arena & Conceptual Hints',
      subtitle: 'Solve dynamically generated JEE Main & Advanced numericals synced to your active parameters.',
      icon: Award,
      color: 'from-teal-500 to-emerald-600',
      borderColor: 'border-teal-500/30',
      accentBg: 'bg-teal-500/10 text-teal-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Click the <strong className="text-teal-300">Practice Arena</strong> tab in the right dock. The system dynamically generates multi-concept JEE questions using your exact slider values:
          </p>

          <div className="p-4 bg-[#16161e] border border-teal-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                JEE Advanced 2024 Pattern
              </span>
              <span className="text-[11px] text-zinc-400 font-bold">+4 / -1 Marking Scheme</span>
            </div>

            <p className="text-xs font-semibold text-zinc-200 leading-relaxed">
              A sports car of mass <Latex math="m = 1200\text{ kg}" /> rounds a track of radius <Latex math="R = 80\text{ m}" /> banked at <Latex math="\theta = 25^\circ" />. What is the minimum coefficient of static friction <Latex math="\mu_s" /> required to prevent sliding at <Latex math="v = 30\text{ m/s}" />?
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['A) 0.38', 'B) 0.52 (Correct)', 'C) 0.65', 'D) 0.81'].map((opt, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-[11px] font-semibold border ${
                    i === 1
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#10111c] border-white/[0.06] text-zinc-400'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'step-pdf-hub',
      badge: 'Step 7 of 7',
      title: 'Publication-Grade PDF Formula Compendiums',
      subtitle: 'Export high-resolution, beautifully formatted vector cheat sheets for all 18 JEE chapters.',
      icon: BookOpen,
      color: 'from-indigo-500 to-cyan-500',
      borderColor: 'border-indigo-500/30',
      accentBg: 'bg-indigo-500/10 text-indigo-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Need revision materials before your mock test? Generate publication-grade PDF cheat sheets covering all 18 JEE Physics chapters with formulas, calculus derivations, exam traps, and dimensional breakdowns:
          </p>

          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-cyan-950/40 border border-indigo-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white">Chapter PDF Compendiums</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                18 Chapters Available
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Export ready-to-print study sheets with pristine typography, vector diagrams, shortcut tables, and negative marking warnings.
            </p>

            <div className="flex items-center gap-3 pt-2">
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
        </div>
      ),
    },
  ];

  const currentStepData = tutorialSteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] w-screen h-screen bg-[#07080D] text-zinc-100 flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Fullscreen Header with 'Step by Step Tutorial' Heading */}
          <header className="px-4 sm:px-8 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0E17]/90 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2.5 sm:p-3 rounded-2xl ${currentStepData.accentBg} border ${currentStepData.borderColor} shadow-lg shrink-0`}>
                <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Step by Step Tutorial
                    </span>
                  </h1>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                    Interactive Guide
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium hidden xs:block">
                  JEE 3D Physics Laboratory • Feature-by-Feature Architecture & Navigation Tour
                </p>
              </div>
            </div>

            {/* Quick Step Indicators in Header (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#141522] border border-white/[0.06]">
              {tutorialSteps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    idx === currentStep
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                      : idx < currentStep
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                  title={`Jump to ${step.title}`}
                >
                  <span>{idx + 1}</span>
                  <span className="hidden xl:inline text-[11px] font-medium truncate max-w-[80px]">
                    {step.title.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Action: Step Counter & Exit Tutorial */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#151624] border border-white/[0.08] text-xs font-mono font-bold text-cyan-300">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>

              <button
                onClick={handleFinish}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                title="Exit Tutorial (Esc)"
              >
                <span>Exit Tutorial</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Full-Width Step Progress Bar */}
          <div className="w-full bg-[#10111A] border-b border-white/[0.06] px-4 sm:px-8 py-2 shrink-0">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-7 gap-2">
                {tutorialSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all duration-300 relative ${
                      idx === currentStep
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/50 ring-2 ring-cyan-400/40'
                        : idx < currentStep
                        ? 'bg-emerald-500/80'
                        : 'bg-zinc-800/80 hover:bg-zinc-700'
                    }`}
                    title={`Jump to ${step.title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Full-Display Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 flex flex-col justify-start items-center">
            <div className="w-full max-w-5xl space-y-6">
              {/* Active Step Presentation Banner */}
              <div className={`p-6 sm:p-8 rounded-3xl border ${currentStepData.borderColor} bg-gradient-to-br from-[#121320] via-[#0E0F19] to-[#0A0B12] shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${currentStepData.accentBg} ${currentStepData.borderColor}`}>
                        {currentStepData.badge}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">Feature Guide & Easy Explanation</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                      {currentStepData.title}
                    </h2>
                  </div>

                  <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${currentStepData.borderColor} bg-white/[0.02]`}>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-zinc-300">Live Hands-on Interactive Demo</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed mt-4">
                  {currentStepData.subtitle}
                </p>

                {/* Step Detailed Interactive Content */}
                <div className="mt-6 pt-2">
                  {currentStepData.content}
                </div>
              </div>
            </div>
          </main>

          {/* Bottom Full-Display Navigation Dock */}
          <footer className="px-4 sm:px-8 py-3.5 border-t border-white/[0.08] bg-[#0A0B12]/95 backdrop-blur-xl shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span>Don't show automatically on start</span>
              </label>

              <span className="hidden md:inline text-[11px] text-zinc-500 font-mono">
                Keyboard: <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">←</kbd> Prev &bull; <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">→</kbd> / <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">Enter</kbd> Next &bull; <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/[0.08] text-zinc-300">Esc</kbd> Exit
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-2xl bg-[#181824] hover:bg-[#222234] text-zinc-200 border border-white/[0.1] text-xs sm:text-sm font-bold transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
              )}

              {currentStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95"
                >
                  <span>Start Experimenting</span>
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
