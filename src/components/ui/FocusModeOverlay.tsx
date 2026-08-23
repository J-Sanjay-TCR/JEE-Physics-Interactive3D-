import React, { useState, useEffect } from 'react';
import { PhysicsConcept, RealtimeQuantity } from '../../types';
import {
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  LineChart,
  BookOpen,
  Sparkles,
  Layers,
  TrendingUp,
  Tag,
  Grid,
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  FastForward,
  Eye,
  Info,
  Maximize2,
} from 'lucide-react';
import { Latex } from './Latex';
import { LiveGraphPanel } from './LiveGraphPanel';
import { EquationPanel } from './EquationPanel';

interface FocusModeOverlayProps {
  concept: PhysicsConcept;
  params: Record<string, number>;
  onChangeParam: (id: string, val: number) => void;
  liveQuantities: RealtimeQuantity[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  simTime: number;
  onExitFocusMode: () => void;
  showVectors: boolean;
  showLabels: boolean;
  showTrajectory: boolean;
  showGrid: boolean;
  showAxes: boolean;
  onToggleVectors: () => void;
  onToggleLabels: () => void;
  onToggleTrajectory: () => void;
  onToggleGrid: () => void;
  onToggleAxes: () => void;
  onApplyPreset: (preset: Record<string, number>) => void;
  isDark?: boolean;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  concept,
  params,
  onChangeParam,
  liveQuantities,
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onChangeSpeed,
  simTime,
  onExitFocusMode,
  showVectors,
  showLabels,
  showTrajectory,
  showGrid,
  showAxes,
  onToggleVectors,
  onToggleLabels,
  onToggleTrajectory,
  onToggleGrid,
  onToggleAxes,
  onApplyPreset,
  isDark = true,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'params' | 'graphs' | 'equations'>('params');
  const [showTelemetryBar, setShowTelemetryBar] = useState(true);

  // Global hotkeys for immersive lab experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onExitFocusMode();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onExitFocusMode();
      } else if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocusMode, onTogglePlay, onReset]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 overflow-hidden z-20 select-none">
      {/* 1. TOP FLOATING ISLAND BAR */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap pointer-events-auto">
        {/* Left: Concept Title & Focus Mode Badge */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#0C0D14]/90 backdrop-blur-xl p-2 sm:px-4 sm:py-2.5 rounded-2xl border border-white/[0.12] shadow-2xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="min-w-0 pr-1 sm:pr-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">
                {concept.title}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Focus Mode (F)
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate hidden sm:block">
              {concept.topic} • {concept.subtitle}
            </p>
          </div>
        </div>

        {/* Center/Right: Visual Layer Toggles & Controls */}
        <div className="flex items-center gap-1.5 bg-[#0C0D14]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/[0.12] shadow-2xl">
          {/* Vectors */}
          <button
            onClick={onToggleVectors}
            title="Toggle Vectors"
            className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              showVectors
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Vectors</span>
          </button>

          {/* Labels */}
          <button
            onClick={onToggleLabels}
            title="Toggle Labels"
            className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              showLabels
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Labels</span>
          </button>

          {/* Trajectory Path */}
          <button
            onClick={onToggleTrajectory}
            title="Toggle Trajectory Path"
            className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              showTrajectory
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Path</span>
          </button>

          {/* Grid */}
          <button
            onClick={onToggleGrid}
            title="Toggle Grid"
            className={`p-2 rounded-xl text-xs transition ${
              showGrid
                ? 'bg-white/15 text-zinc-100 border border-white/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Axes */}
          <button
            onClick={onToggleAxes}
            title="Toggle Coordinate Axes"
            className={`p-2 rounded-xl text-xs transition ${
              showAxes
                ? 'bg-white/15 text-zinc-100 border border-white/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-px bg-white/[0.12] mx-0.5" />

          {/* Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            title={isDrawerOpen ? "Hide Overlay Drawer (P)" : "Open Controls & Graphs Overlay (P)"}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isDrawerOpen
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/10 text-zinc-200 hover:bg-white/20 border border-white/[0.1]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDrawerOpen ? 'Hide Drawer' : 'Controls & Graphs'}</span>
          </button>

          {/* Exit Focus Mode Button */}
          <button
            onClick={onExitFocusMode}
            title="Exit Focus Mode (Esc or F)"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition flex items-center gap-1.5 shadow-md shadow-rose-950/30"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus</span>
          </button>
        </div>
      </div>

      {/* 2. RIGHT-SIDE COLLAPSIBLE FLOATING DRAWER (Controls, Telemetry, Graphs, Formulas) */}
      <div
        className={`absolute top-20 right-3 sm:right-5 bottom-28 w-80 sm:w-96 max-w-[90vw] pointer-events-auto transition-all duration-300 ease-in-out flex flex-col z-30 ${
          isDrawerOpen
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[110%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full bg-[#0C0D14]/95 backdrop-blur-2xl rounded-3xl border border-white/[0.12] shadow-2xl flex flex-col overflow-hidden text-zinc-100">
          {/* Drawer Header & Tabs */}
          <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between gap-2 shrink-0 bg-[#12131C]">
            <div className="flex items-center gap-1 bg-[#08080C] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setDrawerTab('params')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  drawerTab === 'params'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Sliders</span>
              </button>
              <button
                onClick={() => setDrawerTab('graphs')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  drawerTab === 'graphs'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Graphs</span>
              </button>
              <button
                onClick={() => setDrawerTab('equations')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  drawerTab === 'equations'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Formulas</span>
              </button>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition"
              title="Minimize Overlay Drawer (P)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {drawerTab === 'params' && (
              <div className="space-y-4">
                {/* Special Case Presets if available */}
                {concept.specialCases && concept.specialCases.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Boundary & Critical Cases</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {concept.specialCases.map((sc) => (
                        <button
                          key={sc.id}
                          onClick={() => sc.parameterPreset && onApplyPreset(sc.parameterPreset)}
                          className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-left transition flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-amber-200 block truncate group-hover:text-amber-100">
                              {sc.title}
                            </span>
                            <span className="text-[10px] text-amber-300/70 block truncate">
                              {sc.description}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parameters Sliders List */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Physics Parameters</span>
                    <span className="text-cyan-400 font-mono text-[10px]">
                      {concept.parameters.length} Variables
                    </span>
                  </div>

                  {concept.parameters.map((p) => {
                    const val = params[p.id] ?? p.defaultVal;
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-[#14141E] border border-white/[0.08] space-y-2 hover:border-white/[0.15] transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-200 truncate pr-2">
                            {p.label}
                          </span>
                          <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-[11px] shrink-0">
                            {val.toFixed(2)} {p.unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={p.min}
                            max={p.max}
                            step={p.step}
                            value={val}
                            onChange={(e) => onChangeParam(p.id, parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>{p.min} {p.unit}</span>
                          <span className="text-zinc-400">{p.symbol}</span>
                          <span>{p.max} {p.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {drawerTab === 'graphs' && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Real-Time Analytical Curve</span>
                </div>
                <div className="w-full">
                  <LiveGraphPanel
                    graphConfigs={concept.graphConfigs}
                    params={params}
                    simTime={simTime}
                  />
                </div>
              </div>
            )}

            {drawerTab === 'equations' && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Governing Laws & Equations</span>
                </div>
                <div className="space-y-2.5">
                  {concept.formulas.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-[#14141E] border border-white/[0.08] space-y-1.5"
                    >
                      <div className="text-xs font-bold text-zinc-200">{f.name}</div>
                      <div className="p-2 rounded-xl bg-[#0A0A0E] border border-white/[0.06] text-center overflow-x-auto">
                        <Latex math={f.latex} className="text-cyan-300 font-mono text-xs" />
                      </div>
                      <p className="text-[11px] text-zinc-400">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FLOATING PLAYBACK DOCK & LIVE QUANTITIES */}
      <div className="flex items-end justify-between gap-3 pointer-events-auto flex-wrap">
        {/* Playback Controls Island */}
        <div className="flex items-center gap-2 bg-[#0C0D14]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/[0.12] shadow-2xl">
          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Simulation</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            title="Reset Simulation Time (R)"
            className="p-2.5 rounded-xl border border-white/[0.08] bg-[#161622] hover:bg-[#202030] text-zinc-300 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time indicator */}
          <div className="px-3 py-2 rounded-xl bg-[#161622] border border-white/[0.08] font-mono text-xs text-cyan-300 font-bold flex items-center gap-1.5">
            <span className="text-zinc-500 font-sans text-[10px]">TIME</span>
            <span>{simTime.toFixed(2)}s</span>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#161622] p-1 rounded-xl border border-white/[0.08]">
            <FastForward className="w-3.5 h-3.5 text-zinc-500 ml-1 hidden sm:inline" />
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${
                  speed === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Telemetry Quantities HUD Pills */}
        {liveQuantities.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0C0D14]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/[0.12] shadow-2xl max-w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Telemetry:</span>
            </div>

            {liveQuantities.slice(0, 4).map((q, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-xl bg-[#161622] border border-white/[0.08] flex items-center gap-1.5 text-xs shrink-0"
              >
                <span className="text-zinc-400 text-[11px] font-medium">{q.label}:</span>
                <span className="font-mono font-bold text-cyan-300 text-xs">
                  {typeof q.value === 'number' ? q.value.toFixed(2) : q.value}
                </span>
                <span className="text-zinc-500 text-[10px]">{q.unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
