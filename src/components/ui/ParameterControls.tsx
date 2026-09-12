import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsParameter, RealtimeQuantity, SpecialCase } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sliders,
  Activity,
  Sparkles,
  ChevronRight,
  Info,
  HelpCircle,
  Zap,
  TrendingUp,
  X,
  Camera,
  EyeOff,
} from 'lucide-react';
import { Latex } from './Latex';
import { useTheme } from '../../context/ThemeContext';
import { getParamPhysicalSignificance } from '../../utils/physicsSignificance';

interface ParameterControlsProps {
  parameters: PhysicsParameter[];
  values: Record<string, number>;
  onChangeParam: (id: string, val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  liveQuantities: RealtimeQuantity[];
  specialCases?: SpecialCase[];
  onApplySpecialCase?: (preset: Record<string, number>) => void;
  simulationType?: string;
  isARMode?: boolean;
  onToggleAR?: () => void;
  bloomIntensity?: 'vibrant' | 'subtle' | 'off';
  onChangeBloom?: (val: 'vibrant' | 'subtle' | 'off') => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  values,
  onChangeParam,
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onChangeSpeed,
  liveQuantities,
  specialCases,
  onApplySpecialCase,
  simulationType,
  isARMode = false,
  onToggleAR,
  bloomIntensity,
  onChangeBloom,
}) => {
  const { isDark, isCyberpunk } = useTheme();
  // Track active tooltip or expanded insight card for each parameter
  const [activeTooltipParamId, setActiveTooltipParamId] = useState<string | null>(null);
  const [expandedInsightParamId, setExpandedInsightParamId] = useState<string | null>(null);

  return (
    <div
      className={`backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border shadow-xl flex flex-col gap-4 sm:gap-5 transition-colors ${
        isDark ? 'bg-[#111114]/90 border-white/[0.08]' : 'bg-white/95 border-slate-200 shadow-slate-200'
      }`}
    >
      {/* 1. Simulation Playback & Speed Bar */}
      <div
        className={`flex items-center justify-between pb-3 sm:pb-4 border-b flex-wrap gap-2.5 ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onTogglePlay}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg min-h-[44px] touch-manipulation active:scale-95 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
            }`}
            title={isPlaying ? 'Pause 3D Simulation' : 'Run 3D Physics Simulation'}
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

          <button
            onClick={onReset}
            title="Reset Simulation Clock (t = 0s)"
            className={`p-2.5 rounded-xl border transition min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation active:scale-95 ${
              isDark
                ? 'text-zinc-400 hover:text-zinc-100 bg-[#1A1A22] hover:bg-[#22222C] border-white/[0.08]'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onToggleAR && (
            <button
              onClick={onToggleAR}
              id="btn-ar-view-toggle"
              className={`px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md min-h-[44px] touch-manipulation active:scale-95 ${
                isARMode
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : isDark
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title={isARMode ? "Exit AR Camera View" : "Project 3D Simulation into Room via Device Camera (AR View)"}
              aria-label="Toggle AR View"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{isARMode ? 'Exit AR View' : 'AR View'}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold ${
                  isARMode ? 'bg-black/30 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {isARMode ? 'LIVE' : '3D AR'}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Neon Bloom Quick Toggle */}
          {onChangeBloom && bloomIntensity && (
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-[#060B18] border-cyan-500/25 shadow-inner' : 'bg-slate-100 border-slate-300'
              }`}
              title="Neon Glow Effects (Bloom)"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 ml-1.5 hidden sm:inline" />
              {(['vibrant', 'subtle', 'off'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onChangeBloom(level)}
                  className={`px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition touch-manipulation capitalize ${
                    bloomIntensity === level
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                      : isDark
                      ? 'text-zinc-500 hover:text-cyan-300'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          {/* Speed Multiplier */}
          <div
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border ${
              isDark ? 'bg-[#0A0A0E] border-white/[0.08]' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <FastForward className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline shrink-0" />
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.1"
              value={speed}
              onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1.5 bg-slate-200 dark:bg-[#22222C] rounded-lg appearance-none cursor-pointer accent-cyan-500 touch-pan-x"
              title={`Playback Speed: ${speed.toFixed(1)}x`}
            />
            <span className={`text-[11px] font-mono font-bold w-8 text-right shrink-0 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* AR View Active Status Banner in 3D Controls */}
      {isARMode && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 shadow-sm animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-emerald-200 flex items-center justify-between">
              <span>AR Physical Environment Mode Active</span>
              {onToggleAR && (
                <button
                  onClick={onToggleAR}
                  className="text-[11px] underline hover:text-white transition font-medium"
                >
                  Exit AR
                </button>
              )}
            </div>
            <p className="text-emerald-300/80 text-[11px] mt-0.5">
              The 3D physics model is rendered directly over your physical room via the camera stream. Adjust parameters below to see the simulated apparatus behave in your real environment.
            </p>
          </div>
        </div>
      )}

      {/* 3D Model Neon Glowing Effects Control Panel Block */}
      {onChangeBloom && bloomIntensity && (
        <div
          id="neon-glow-control-panel"
          className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
            isDark ? 'bg-[#0B0F19]/90 border-cyan-500/25 shadow-sm' : 'bg-cyan-50/80 border-cyan-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                bloomIntensity === 'vibrant'
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : bloomIntensity === 'subtle'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                  : isDark ? 'bg-[#161622] text-zinc-500' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {bloomIntensity === 'vibrant' ? (
                <Sparkles className="w-4 h-4" />
              ) : bloomIntensity === 'subtle' ? (
                <Zap className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>
                  3D Model Neon Glow Effect
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider ${
                    bloomIntensity === 'vibrant'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : bloomIntensity === 'subtle'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                  }`}
                >
                  {bloomIntensity}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                {bloomIntensity === 'vibrant'
                  ? 'High-intensity optical bloom with radiant neon trails & glowing lasers'
                  : bloomIntensity === 'subtle'
                  ? 'Balanced, soft scientific glow for bright highlights and beacons'
                  : 'Zero post-processing bloom with crisp realistic diffuse shading'}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center p-1 rounded-xl border shrink-0 ${
              isDark ? 'bg-[#060A12] border-white/[0.08]' : 'bg-white border-slate-300 shadow-xs'
            }`}
          >
            {(['vibrant', 'subtle', 'off'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onChangeBloom(level)}
                id={`btn-neon-glow-${level}`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition touch-manipulation capitalize flex items-center gap-1.5 min-h-[36px] ${
                  bloomIntensity === level
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-sm'
                    : isDark
                    ? 'text-zinc-400 hover:text-cyan-300'
                    : 'text-slate-600 hover:text-cyan-700'
                }`}
              >
                {level === 'vibrant' && <Sparkles className="w-3.5 h-3.5" />}
                {level === 'subtle' && <Zap className="w-3.5 h-3.5" />}
                {level === 'off' && <EyeOff className="w-3.5 h-3.5" />}
                <span>{level}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Live Physical Quantities HUD Grid */}
      <div>
        <div
          className={`flex items-center justify-between gap-1.5 mb-2.5 text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <span>Real-Time Computed Quantities</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Live Apparatus State</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {liveQuantities.map((q, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-2.5 border flex flex-col justify-between transition-colors shadow-xs ${
                isDark ? 'bg-[#0A0A0E]/90 border-white/[0.08]' : 'bg-slate-50/90 border-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-between gap-1 text-[11px] font-medium truncate ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                <span className="truncate">{q.label}</span>
                {q.symbol && (
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                    <Latex math={q.symbol} />
                  </span>
                )}
              </div>
              <div
                className="text-xs sm:text-sm font-bold truncate mt-1.5 mono-num"
                style={{ color: q.color || (isDark ? '#38bdf8' : '#0284c7') }}
              >
                {q.formatted || `${q.value.toFixed(2)} ${q.unit}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Special Cases & JEE Boundary Presets */}
      {specialCases && specialCases.length > 0 && onApplySpecialCase && (
        <div
          className={`p-3 sm:p-3.5 rounded-xl border flex flex-col gap-2 ${
            isDark ? 'bg-[#0B0B0F] border-amber-500/20' : 'bg-amber-50/70 border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-amber-300' : 'text-amber-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              JEE Special Cases & Boundary Limits
            </span>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">1-Click 3D Preset</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar pt-1">
            {specialCases.map((sc) => (
              <button
                key={sc.id}
                onClick={() => sc.parameterPreset && onApplySpecialCase(sc.parameterPreset)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 shadow-xs text-left min-h-[36px] touch-manipulation active:scale-95 ${
                  isDark
                    ? 'bg-amber-950/30 hover:bg-amber-500/20 text-amber-200 border-amber-500/30 hover:border-amber-400'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300'
                }`}
                title={sc.description}
              >
                <span className="truncate max-w-[200px]">{sc.title}</span>
                <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Adjustable Parameters Sliders with Context-Aware Tooltips */}
      <div>
        <div
          className={`flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Physics Parameters</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium normal-case flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>Hover / tap (i) for live physical insights</span>
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {parameters.map((p) => {
            const currentVal = values[p.id] !== undefined ? values[p.id] : p.defaultVal;
            const insight = getParamPhysicalSignificance(p, currentVal, values, simulationType);
            const isHovered = activeTooltipParamId === p.id;
            const isExpanded = expandedInsightParamId === p.id;

            return (
              <div
                key={p.id}
                onMouseEnter={() => setActiveTooltipParamId(p.id)}
                onMouseLeave={() => setActiveTooltipParamId(null)}
                className={`relative flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 ${
                  isHovered || isExpanded
                    ? isDark
                      ? 'bg-[#181822] border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                      : 'bg-cyan-50/70 border-cyan-300 shadow-md shadow-cyan-100'
                    : isDark
                    ? 'bg-[#14141A]/80 border-white/[0.06]'
                    : 'bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                {/* Header: Label, Symbol, Insight Toggle & Value Input */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <label
                      htmlFor={`slider-${p.id}`}
                      className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate cursor-pointer ${
                        isDark ? 'text-zinc-100' : 'text-slate-900'
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      {p.symbol && (
                        <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                          (<Latex math={p.symbol} />)
                        </span>
                      )}
                    </label>

                    {/* Mobile & PC Context Insight Toggle Button */}
                    <button
                      onClick={() => setExpandedInsightParamId(isExpanded ? null : p.id)}
                      className={`p-1 rounded-md transition text-[11px] flex items-center justify-center shrink-0 min-h-[28px] min-w-[28px] ${
                        isExpanded
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : isDark
                          ? 'text-cyan-400 hover:bg-cyan-500/20'
                          : 'text-cyan-700 hover:bg-cyan-100'
                      }`}
                      title={isExpanded ? 'Hide Physical Significance' : 'View Real-Time Physical Significance'}
                      aria-label={`Toggle physical significance for ${p.label}`}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Editable Value Box */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border shrink-0 ${
                      isDark ? 'bg-[#0E0E12] border-white/[0.08]' : 'bg-white border-slate-300 shadow-2xs'
                    }`}
                  >
                    <input
                      type="number"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={currentVal}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value);
                        if (!isNaN(num)) onChangeParam(p.id, Math.max(p.min, Math.min(p.max, num)));
                      }}
                      className={`w-14 sm:w-16 text-right bg-transparent text-xs sm:text-sm font-bold focus:outline-none mono-num ${
                        isDark ? 'text-cyan-300' : 'text-cyan-700'
                      }`}
                    />
                    <span className="text-[11px] text-zinc-500 font-medium">{p.unit}</span>
                  </div>
                </div>

                {/* Slider Track with Enhanced Touch Padding */}
                <div className="relative flex items-center gap-2 py-1">
                  <span className="text-[10px] font-mono text-zinc-500 w-8 shrink-0 text-left">{p.min}</span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      id={`slider-${p.id}`}
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={currentVal}
                      onFocus={() => setActiveTooltipParamId(p.id)}
                      onBlur={() => setActiveTooltipParamId(null)}
                      onChange={(e) => onChangeParam(p.id, parseFloat(e.target.value))}
                      className="w-full h-3 bg-slate-200 dark:bg-[#22222C] rounded-lg appearance-none cursor-pointer accent-cyan-500 touch-pan-x"
                    />

                    {/* Floating Context-Aware Tooltip above slider thumb on hover/focus */}
                    {isHovered && !isExpanded && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none hidden md:block w-72 p-2.5 rounded-xl bg-[#0F101A]/95 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="flex items-center justify-between gap-1 border-b border-white/[0.08] pb-1.5 mb-1.5">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3 text-cyan-400" />
                            Physical Significance
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">{insight.percentage}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-200 leading-relaxed font-medium">
                          {insight.significance.replace(/\$/g, '')}
                        </p>
                        {insight.boundaryStatus && (
                          <div
                            className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ backgroundColor: `${insight.boundaryStatus.color}25`, color: insight.boundaryStatus.color }}
                          >
                            {insight.boundaryStatus.label}
                          </div>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F101A]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 w-8 shrink-0 text-right">{p.max}</span>
                </div>

                {/* Boundary Status Pill (if applicable at current value) */}
                {insight.boundaryStatus && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 border shadow-2xs"
                      style={{
                        backgroundColor: `${insight.boundaryStatus.color}15`,
                        borderColor: `${insight.boundaryStatus.color}40`,
                        color: insight.boundaryStatus.color,
                      }}
                    >
                      <span>{insight.boundaryStatus.label}</span>
                    </span>
                  </div>
                )}

                {/* Expanded Context-Aware Physical Significance Card (For Mobile & PC Deep Guidance) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                          isDark
                            ? 'bg-[#0E0F17] border-cyan-500/30 text-zinc-200'
                            : 'bg-white border-cyan-200 text-slate-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                          <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Live Dynamic Physical Significance
                          </span>
                          <button
                            onClick={() => setExpandedInsightParamId(null)}
                            className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
                            title="Close Insight"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Significance Text & Equation */}
                        <div className="text-xs leading-relaxed space-y-1.5">
                          <p className="font-medium text-zinc-300 dark:text-zinc-200">
                            {insight.significance.includes('$') ? (
                              <span>{insight.significance.replace(/\$/g, '')}</span>
                            ) : (
                              insight.significance
                            )}
                          </p>

                          <div
                            className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 overflow-x-auto ${
                              isDark ? 'bg-[#151622] text-cyan-300 border border-white/[0.04]' : 'bg-slate-100 text-cyan-800'
                            }`}
                          >
                            <span className="text-[10px] text-zinc-500 uppercase font-sans">Formula:</span>
                            <Latex math={insight.proportionality} />
                          </div>

                          {/* JEE Insight Takeaway */}
                          <div
                            className={`p-2 rounded-lg text-[11px] font-medium border flex items-start gap-1.5 ${
                              isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{insight.jeeInsight.replace(/\$/g, '')}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
