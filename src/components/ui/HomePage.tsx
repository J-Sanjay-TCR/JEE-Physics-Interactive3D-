import React, { useState } from 'react';
import { PhysicsConcept } from '../../types';
import { ALL_CONCEPTS, CHAPTERS, CATEGORIES } from '../../data/allConcepts';
import { useTheme } from '../../context/ThemeContext';
import { Latex } from './Latex';
import { ChapterPdfSection } from './ChapterPdfSection';
import {
  Atom,
  Sparkles,
  ArrowRight,
  Compass,
  Zap,
  BookOpen,
  Sliders,
  Award,
  Layers,
  CheckCircle2,
  Bookmark,
  Play,
  RotateCcw,
  TrendingUp,
  ChevronRight,
  Activity,
  Bot,
  Flame,
  HelpCircle,
  Download,
  FileText,
  Printer,
  Sun,
  Moon,
} from 'lucide-react';

interface HomePageProps {
  onSelectConcept: (concept: PhysicsConcept, preset?: Record<string, number>) => void;
  onOpenFormulaHub: () => void;
  onOpenPdfModal?: (chapterId?: string) => void;
  onOpenSyllabusDirectory?: () => void;
  onOpenAiTutor: () => void;
  onOpenTutorial: () => void;
  completedConcepts: string[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectConcept,
  onOpenFormulaHub,
  onOpenPdfModal,
  onOpenSyllabusDirectory,
  onOpenAiTutor,
  onOpenTutorial,
  completedConcepts,
  favorites,
  onToggleFavorite,
}) => {
  const { isDark, isCyberpunk, theme, cycleTheme } = useTheme();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Featured flagship 3D concepts for hero showcase
  const featuredConcepts = [
    {
      id: 'youngs-double-slit',
      tag: 'Flagship Wave Optics',
      badgeColor: isCyberpunk
        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40 shadow-[0_0_10px_rgba(217,70,239,0.2)]'
        : isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
      gradient: isCyberpunk
        ? 'from-fuchsia-950/40 via-cyan-950/30 to-[#030712]'
        : isDark ? 'from-indigo-900/40 via-purple-950/30 to-[#0F0F14]' : 'from-indigo-50 via-white to-slate-50',
    },
    {
      id: 'projectile-motion',
      tag: 'High Yield Mechanics',
      badgeColor: isCyberpunk
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
        : isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200',
      gradient: isCyberpunk
        ? 'from-cyan-950/50 via-[#061022] to-[#030712]'
        : isDark ? 'from-cyan-900/40 via-blue-950/30 to-[#0F0F14]' : 'from-cyan-50 via-white to-slate-50',
    },
    {
      id: 'lcr-circuit',
      tag: 'AC Resonance Matrix',
      badgeColor: isCyberpunk
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(0,255,157,0.2)]'
        : isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      gradient: isCyberpunk
        ? 'from-emerald-950/40 via-cyan-950/30 to-[#030712]'
        : isDark ? 'from-emerald-900/40 via-teal-950/30 to-[#0F0F14]' : 'from-emerald-50 via-white to-slate-50',
    },
    {
      id: 'photoelectric-effect',
      tag: 'Modern Physics',
      badgeColor: isCyberpunk
        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
        : isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
      gradient: isCyberpunk
        ? 'from-amber-950/40 via-orange-950/30 to-[#030712]'
        : isDark ? 'from-amber-900/40 via-orange-950/30 to-[#0F0F14]' : 'from-amber-50 via-white to-slate-50',
    },
  ];

  const filteredChapters = CHAPTERS.filter((ch) => {
    if (selectedBranch === 'all') return true;
    if (selectedBranch === 'mechanics') return ch.category === 'mechanics';
    if (selectedBranch === 'electrodynamics') return ch.category === 'electromagnetism';
    if (selectedBranch === 'optics') return ch.category === 'optics' || ch.category === 'waves-oscillations';
    if (selectedBranch === 'modern') return ch.category === 'modern' || ch.category === 'thermal';
    return true;
  });

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-28 lg:pb-10 space-y-8 sm:space-y-10 transition-colors ${
      isCyberpunk
        ? 'bg-[#030712] text-zinc-100'
        : isDark ? 'bg-[#070709] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Hero Presentation Banner */}
      <section className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 lg:p-12 shadow-2xl transition-colors ${
        isCyberpunk
          ? 'bg-gradient-to-b from-[#061024] via-[#040916] to-[#030712] border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.08)]'
          : isDark
          ? 'bg-gradient-to-b from-[#121422] via-[#0D0E17] to-[#070709] border-white/[0.08]'
          : 'bg-gradient-to-b from-cyan-50/70 via-white to-slate-50 border-slate-200/80 shadow-slate-200'
      }`}>
        {/* Background subtle mesh gradient */}
        <div className={`absolute inset-0 pointer-events-none ${
          isCyberpunk
            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-emerald-500/5 to-transparent'
            : 'bg-gradient-to-tr from-cyan-500/5 via-transparent to-indigo-500/5'
        }`} />

        <div className="relative z-10 max-w-4xl space-y-5 sm:space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide ${
              isCyberpunk
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 font-mono shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                : isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-cyan-100/70 border-cyan-300 text-cyan-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCyberpunk ? '⚡ SYNAPSE HUD • 3D PHYSICS LAB' : 'Interactive 3D Physics Laboratory • JEE Main & Advanced'}</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-bold tracking-wide shadow-md transition hover:scale-105 ${
              isCyberpunk
                ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.3)] ring-1 ring-emerald-400/40'
                : isDark
                ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border-emerald-400/50 text-emerald-300 shadow-emerald-950/50 ring-1 ring-emerald-400/30'
                : 'bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 border-emerald-400 text-emerald-950 shadow-emerald-200/80 ring-1 ring-emerald-400/40'
            }`}>
              <Award className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              <span>Founded & Engineered by <strong className={`font-black underline decoration-emerald-400 decoration-2 underline-offset-2 ${isDark ? 'text-emerald-100' : 'text-emerald-950'}`}>Sanjay.J</strong></span>
            </div>
          </div>

          {/* Main Display Headline */}
          <div className="space-y-3">
            <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isCyberpunk ? 'text-white' : isDark ? 'text-white' : 'text-slate-950'
            }`}>
              See Physics in <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">3D Dimensions</span>. Interact, Calculate, Master.
            </h1>
            <p className={`text-xs sm:text-base lg:text-lg max-w-2xl leading-relaxed ${
              isCyberpunk ? 'text-zinc-300' : isDark ? 'text-zinc-300/90' : 'text-slate-600'
            }`}>
              Explore 360° orbital spatial mechanics, wave interference envelopes, vector fields, and high-frequency JEE coaching modules with 150+ live formulas, boundary limits, and instant doubt resolution.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={() => onSelectConcept(ALL_CONCEPTS[0])}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] ${
                isCyberpunk
                  ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-xl shadow-cyan-500/25'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch 3D Physics Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenSyllabusDirectory && (
              <button
                onClick={onOpenSyllabusDirectory}
                className={`px-4 py-3 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                  isCyberpunk
                    ? 'bg-fuchsia-950/50 hover:bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                    : isDark
                    ? 'bg-fuchsia-950/40 hover:bg-fuchsia-900/60 text-fuchsia-200 border-fuchsia-500/30'
                    : 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 shadow-xs'
                }`}
              >
                <Layers className="w-4 h-4 text-fuchsia-400" />
                <span>Syllabus & 3D Specs</span>
              </button>
            )}

            <button
              onClick={() => (onOpenPdfModal ? onOpenPdfModal() : onOpenFormulaHub())}
              className={`px-4 py-3 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                isCyberpunk
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : isDark
                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300 shadow-xs'
              }`}
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download PDF Formula Sheets</span>
            </button>

            <button
              onClick={onOpenFormulaHub}
              className={`px-4 py-3 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                isCyberpunk
                  ? 'bg-[#060B18] hover:bg-[#0A1224] text-cyan-300 border-cyan-500/30'
                  : isDark
                  ? 'bg-[#14141E] hover:bg-[#1C1C2A] text-cyan-300 border-cyan-500/30'
                  : 'bg-white hover:bg-cyan-50 text-cyan-700 border-cyan-200 shadow-xs'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>150+ Formulas & Special Cases</span>
            </button>

            <button
              onClick={onOpenAiTutor}
              className={`px-4 py-3 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                isCyberpunk
                  ? 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : isDark
                  ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border-indigo-500/30'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-xs'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Ask AI Physics Tutor</span>
            </button>

            <button
              onClick={onOpenTutorial}
              className={`px-3.5 py-3 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                isCyberpunk
                  ? 'bg-[#060B18] hover:bg-[#0A1224] text-zinc-300 border-cyan-500/20'
                  : isDark
                  ? 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-white/[0.08]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Tutorial</span>
            </button>

            {/* Prominent Theme Toggle in Hero */}
            <button
              onClick={cycleTheme}
              className={`px-3.5 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] shadow-xs active:scale-95 ${
                isCyberpunk
                  ? 'bg-gradient-to-r from-cyan-950/90 to-emerald-950/90 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-mono'
                  : isDark
                  ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-400/30'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
              }`}
              title="Toggle Theme (Cyberpunk Synapse, Dark, Light)"
            >
              {isCyberpunk ? <Zap className="w-4 h-4 text-cyan-400 fill-current" /> : isDark ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>Theme: {isCyberpunk ? 'Cyberpunk Synapse' : isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 border-t ${
            isCyberpunk ? 'border-cyan-500/20' : isDark ? 'border-white/[0.06]' : 'border-slate-200'
          }`}>
            <div className={`p-3 rounded-xl border ${isCyberpunk ? 'bg-[#060B18] border-cyan-500/20' : isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">15+</span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>JEE Chapters</p>
            </div>
            <div className={`p-3 rounded-xl border ${isCyberpunk ? 'bg-[#060B18] border-cyan-500/20' : isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">150+</span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Formulas & Laws</p>
            </div>
            <div className={`p-3 rounded-xl border ${isCyberpunk ? 'bg-[#060B18] border-cyan-500/20' : isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">360°</span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Orbital 3D Viewports</p>
            </div>
            <div className={`p-3 rounded-xl border ${isCyberpunk ? 'bg-[#060B18] border-cyan-500/20' : isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {completedConcepts.length} / {ALL_CONCEPTS.length}
              </span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Labs Mastered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flagship 3D Simulations */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Flame className="w-5 h-5 text-amber-500" />
              Flagship 3D Interactive Simulations
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              High-frequency JEE Advanced concepts with real-time vector projections and parameter controls.
            </p>
          </div>
          <button
            onClick={onOpenFormulaHub}
            className="text-xs font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 self-start sm:self-auto min-h-[32px]"
          >
            <span>View all in Formula Hub</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {featuredConcepts.map((item) => {
            const concept = ALL_CONCEPTS.find((c) => c.id === item.id) || ALL_CONCEPTS[0];
            const isFav = favorites.includes(concept.id);

            return (
              <div
                key={`featured-${item.id}`}
                className={`group relative rounded-2xl bg-gradient-to-b ${item.gradient} border p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl ${
                  isDark
                    ? 'border-white/[0.08] hover:border-cyan-500/40 hover:shadow-cyan-500/10'
                    : 'border-slate-200 hover:border-cyan-400 hover:shadow-slate-300'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(concept.id);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-amber-500 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                      title="Bookmark concept"
                    >
                      <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h3 className={`text-base font-bold transition group-hover:text-cyan-500 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {concept.title}
                  </h3>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    {concept.description}
                  </p>
                </div>

                {/* Primary Formula Preview */}
                {concept.formulas[0] && (
                  <div className={`p-2.5 rounded-xl border text-center overflow-x-auto no-scrollbar ${
                    isDark ? 'bg-[#0B0B10] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <span className="text-[10px] text-zinc-500 font-mono block mb-0.5">
                      {concept.formulas[0].name}
                    </span>
                    <div className={`text-xs ${isDark ? 'text-cyan-200' : 'text-cyan-800'}`}>
                      <Latex math={concept.formulas[0].latex} />
                    </div>
                  </div>
                )}

                {/* Action Launch */}
                <button
                  onClick={() => onSelectConcept(concept)}
                  className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] ${
                    isDark
                      ? 'bg-white/[0.06] hover:bg-cyan-500 text-zinc-200 hover:text-slate-950 border-white/[0.08] hover:border-cyan-400'
                      : 'bg-white hover:bg-cyan-500 text-slate-800 hover:text-slate-950 border-slate-200 hover:border-cyan-500'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch 3D Lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Physics Syllabus Chapters Roadmap */}
      <section className="space-y-5">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <BookOpen className="w-5 h-5 text-blue-500" />
              Complete JEE Physics Syllabus Modules
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Select any chapter module to enter its dedicated 3D laboratory, dynamic parameter controls, and coaching synopsis.
            </p>
          </div>

          {/* Branch filter tabs */}
          <div className={`flex flex-wrap gap-1.5 p-1 rounded-xl border self-start sm:self-auto ${
            isDark ? 'bg-[#101017] border-white/[0.08]' : 'bg-slate-200/80 border-slate-300'
          }`}>
            {[
              { id: 'all', label: 'All Chapters' },
              { id: 'mechanics', label: 'Mechanics' },
              { id: 'electrodynamics', label: 'Electrodynamics' },
              { id: 'optics', label: 'Optics' },
              { id: 'modern', label: 'Modern & Heat' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedBranch(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[32px] ${
                  selectedBranch === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChapters.map((chapter) => {
            const chapterConcepts = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id);
            if (chapterConcepts.length === 0) return null;

            return (
              <div
                key={chapter.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition shadow-lg ${
                  isDark
                    ? 'bg-[#0E0E14] border-white/[0.08] hover:border-white/[0.16]'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-200'
                }`}
              >
                {/* Category Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isDark ? 'bg-[#14141E] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{chapter.name}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'text-zinc-400 bg-black/40 border-white/[0.04]' : 'text-slate-600 bg-white border-slate-200'
                  }`}>
                    {chapterConcepts.length} Labs
                  </span>
                </div>

                {/* Concepts in this chapter */}
                <div className={`p-4 space-y-2.5 flex-1 divide-y ${
                  isDark ? 'divide-white/[0.04]' : 'divide-slate-100'
                }`}>
                  {chapterConcepts.map((concept) => {
                    const isDone = completedConcepts.includes(concept.id);
                    return (
                      <div
                        key={`ch-${chapter.id}-${concept.id}`}
                        onClick={() => onSelectConcept(concept)}
                        className={`pt-2.5 first:pt-0 group/item cursor-pointer flex items-start justify-between gap-3 -mx-2 px-2 py-2 rounded-xl transition min-h-[44px] ${
                          isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold group-hover/item:text-cyan-500 transition truncate ${
                              isDark ? 'text-zinc-200' : 'text-slate-800'
                            }`}>
                              {concept.title}
                            </span>
                            {isDone && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {concept.subtitle}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectConcept(concept);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition shrink-0 flex items-center gap-1 min-h-[32px] ${
                            isDark
                              ? 'bg-[#181824] group-hover/item:bg-cyan-500 group-hover/item:text-slate-950 text-cyan-300 border-cyan-500/20'
                              : 'bg-slate-100 group-hover/item:bg-cyan-500 group-hover/item:text-slate-950 text-cyan-800 border-cyan-200'
                          }`}
                        >
                          <span>Open 3D</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer */}
                <div className={`px-4 py-2.5 border-t text-[11px] flex items-center justify-between ${
                  isDark ? 'bg-black/30 border-white/[0.04] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <span>JEE Weightage: High Yield</span>
                  <button
                    onClick={() => onSelectConcept(chapterConcepts[0])}
                    className="text-cyan-500 hover:text-cyan-600 font-semibold flex items-center gap-1 min-h-[32px]"
                  >
                    <span>Explore Chapter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dedicated Downloadable PDF Formula Sheets Section */}
      <ChapterPdfSection
        onSelectConcept={onSelectConcept}
        onOpenPdfModal={onOpenPdfModal}
      />

      {/* About Founder & Architecture Mission Card (Enlarged & Highlighted) */}
      <section className={`rounded-3xl border-2 p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden transition-all shadow-2xl ${
        isDark
          ? 'bg-gradient-to-br from-[#101220] via-[#0C0D17] to-[#0A0B12] border-cyan-500/30 shadow-cyan-950/40 ring-1 ring-cyan-500/20'
          : 'bg-gradient-to-br from-cyan-50/90 via-white to-blue-50/80 border-cyan-300 shadow-xl shadow-cyan-100/80 ring-1 ring-cyan-400/30'
      }`}>
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative z-10">
          {/* Glowing Founder Avatar & Badge */}
          <div className="relative shrink-0">
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-2xl sm:text-3xl shadow-xl shadow-cyan-500/30 ring-4 ring-cyan-500/20">
              SJ
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl shadow-md flex items-center justify-center" title="Verified Creator & Physics Architect">
              <Award className="w-4 h-4 text-slate-950 fill-current" />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-100 text-cyan-800 border-cyan-300'
              }`}>
                About the Founder
              </span>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sanjay.J
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm' : 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm'
              }`}>
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Founder & Chief Physics Architect
              </span>
            </div>

            <p className={`text-sm sm:text-base max-w-3xl leading-relaxed font-normal ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Conceived, designed, and engineered by <strong className={isDark ? 'text-white' : 'text-slate-950'}>Sanjay.J</strong> to revolutionize JEE Main & Advanced preparation. Replaces static 2D textbook sketches with high-precision, 360° tactile 3D simulations, real-life mechanical apparatus dynamics, instant parametric solvers, and step-by-step coaching derivations.
            </p>

            {/* Architecture Highlights Pill Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isDark ? 'bg-white/[0.04] text-zinc-300 border-white/[0.08]' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                ⚡ 14 Real-Time 3D Apparatuses
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isDark ? 'bg-white/[0.04] text-zinc-300 border-white/[0.08]' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                📐 150+ Dynamic Formula Solvers
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isDark ? 'bg-white/[0.04] text-zinc-300 border-white/[0.08]' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                🎯 JEE Main & Advanced High-Yield Coaching
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => onSelectConcept(ALL_CONCEPTS[0])}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Launch 3D Laboratory</span>
          </button>
        </div>
      </section>
    </div>
  );
};
