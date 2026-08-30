import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsConcept, CategoryId, RealtimeQuantity } from '../../types';
import { CHAPTERS, CATEGORIES, ALL_CONCEPTS } from '../../data/allConcepts';
import { useTheme } from '../../context/ThemeContext';
import { ParameterControls } from './ParameterControls';
import { EquationPanel } from './EquationPanel';
import { LiveGraphPanel } from './LiveGraphPanel';
import { JeeInsightsPanel } from './JeeInsightsPanel';
import { QuestionArena } from './QuestionArena';
import { CoachingModulePanel } from './CoachingModulePanel';
import {
  Compass,
  Sliders,
  LineChart,
  BookOpen,
  Award,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Atom,
  Flame,
  Zap,
  Activity,
  Eye,
  Sun,
  Ruler,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Bot,
  Home,
  FileText,
  Star,
  CheckCircle2,
  Share2,
  Grid,
  TrendingUp,
} from 'lucide-react';

export type MobileLabTab = 'syllabus' | 'controls' | 'graphs' | 'equations' | 'jee' | 'questions';

interface MobileNavBottomSheetProps {
  currentView: 'home' | 'lab';
  onSetView: (view: 'home' | 'lab') => void;
  currentConcept: PhysicsConcept;
  onSelectConcept: (concept: PhysicsConcept) => void;
  favorites: string[];
  completedConcepts: string[];
  onToggleFavorite: (id: string) => void;
  // Simulation controls for Lab mode
  paramValues: Record<string, number>;
  onChangeParam: (id: string, val: number) => void;
  liveQuantities: RealtimeQuantity[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetSimulation: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  simTime: number;
  // Viewport Toggles
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
  // Modals & Navigation
  onOpenFormulaHub: () => void;
  onOpenPdfModal: (chapterId?: string) => void;
  onOpenSyllabusDirectory?: () => void;
  onOpenAiTutor: () => void;
  onOpenTutorial: () => void;
  onEnterFocusMode: () => void;
  onOpenShortcuts?: () => void;
}

const CATEGORY_ICON_MAP: Record<CategoryId, React.ReactNode> = {
  mechanics: <Atom className="w-3.5 h-3.5 text-cyan-400" />,
  thermal: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  electromagnetism: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  'waves-oscillations': <Activity className="w-3.5 h-3.5 text-emerald-400" />,
  optics: <Eye className="w-3.5 h-3.5 text-purple-400" />,
  modern: <Sun className="w-3.5 h-3.5 text-rose-400" />,
  experimental: <Ruler className="w-3.5 h-3.5 text-blue-400" />,
};

export const MobileNavBottomSheet: React.FC<MobileNavBottomSheetProps> = ({
  currentView,
  onSetView,
  currentConcept,
  onSelectConcept,
  favorites,
  completedConcepts,
  onToggleFavorite,
  paramValues,
  onChangeParam,
  liveQuantities,
  isPlaying,
  onTogglePlay,
  onResetSimulation,
  speed,
  onChangeSpeed,
  simTime,
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
  onOpenFormulaHub,
  onOpenPdfModal,
  onOpenSyllabusDirectory,
  onOpenAiTutor,
  onOpenTutorial,
  onEnterFocusMode,
  onOpenShortcuts,
}) => {
  const { isDark, isCyberpunk, theme, cycleTheme } = useTheme();

  // Bottom Sheet State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileLabTab>('controls');
  const [sheetSnapHeight, setSheetSnapHeight] = useState<'partial' | 'full'>('partial');

  // Search & Filter within Syllabus tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'completed'>('all');

  const sheetContentRef = useRef<HTMLDivElement>(null);

  // Filtered concepts for syllabus navigation
  const filteredConcepts = useMemo(() => {
    return ALL_CONCEPTS.filter((c) => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (activeFilter === 'favorites' && !favorites.includes(c.id)) return false;
      if (activeFilter === 'completed' && !completedConcepts.includes(c.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchTopic = c.topic.toLowerCase().includes(q);
        const matchSubtitle = c.subtitle.toLowerCase().includes(q);
        return matchTitle || matchTopic || matchSubtitle;
      }
      return true;
    });
  }, [selectedCategory, activeFilter, searchQuery, favorites, completedConcepts]);

  const handleOpenTab = (tab: MobileLabTab) => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const handleSelectConceptAndClose = (concept: PhysicsConcept) => {
    onSelectConcept(concept);
    if (currentView !== 'lab') {
      onSetView('lab');
    }
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* 1. Backdrop Overlay when Bottom Sheet is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* 2. Context-Aware Sliding Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t shadow-2xl flex flex-col transition-colors overflow-hidden ${
              sheetSnapHeight === 'full' ? 'h-[92vh]' : 'h-[75vh] max-h-[85vh]'
            } ${
              isCyberpunk
                ? 'bg-[#040816]/98 backdrop-blur-2xl border-cyan-500/40 text-zinc-100 shadow-[0_-10px_40px_rgba(0,240,255,0.2)]'
                : isDark
                ? 'bg-[#0E0E14]/98 backdrop-blur-2xl border-white/[0.12] text-zinc-100'
                : 'bg-white/98 backdrop-blur-2xl border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            {/* Sheet Handle & Title Bar */}
            <div className={`p-3 sm:p-4 border-b flex flex-col gap-2 shrink-0 ${
              isCyberpunk ? 'border-cyan-500/20 bg-[#060D20]/90' : isDark ? 'border-white/[0.08] bg-[#121218]/90' : 'border-slate-200 bg-slate-50/90'
            }`}>
              {/* Drag Pill */}
              <div className="flex justify-center -mt-1 cursor-pointer" onClick={() => setSheetSnapHeight(prev => prev === 'full' ? 'partial' : 'full')}>
                <div className={`w-12 h-1.5 rounded-full transition-all ${
                  isCyberpunk ? 'bg-cyan-400/60 hover:bg-cyan-300' : isDark ? 'bg-zinc-600 hover:bg-zinc-400' : 'bg-slate-300 hover:bg-slate-400'
                }`} />
              </div>

              {/* Sheet Header Row */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCyberpunk
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                      : isDark
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}>
                    {activeTab === 'syllabus' && <Compass className="w-4 h-4" />}
                    {activeTab === 'controls' && <Sliders className="w-4 h-4" />}
                    {activeTab === 'graphs' && <LineChart className="w-4 h-4" />}
                    {activeTab === 'equations' && <BookOpen className="w-4 h-4" />}
                    {activeTab === 'jee' && <Award className="w-4 h-4" />}
                    {activeTab === 'questions' && <HelpCircle className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black truncate tracking-tight">
                      {activeTab === 'syllabus' && 'JEE Physics Syllabus & Labs'}
                      {activeTab === 'controls' && 'Live 3D Parameters & Controls'}
                      {activeTab === 'graphs' && 'Real-time Metrics & Graphs'}
                      {activeTab === 'equations' && 'Formulas, Laws & Cases'}
                      {activeTab === 'jee' && 'JEE Advanced Solvers & Tricks'}
                      {activeTab === 'questions' && 'PYQ & MCQ Question Arena'}
                    </h3>
                    <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {currentConcept.title} • {currentConcept.topic}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSheetSnapHeight(prev => prev === 'full' ? 'partial' : 'full')}
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      isDark ? 'border-white/10 text-zinc-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title={sheetSnapHeight === 'full' ? 'Collapse height' : 'Expand full screen'}
                  >
                    {sheetSnapHeight === 'full' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition ${
                      isDark ? 'border-white/10 text-zinc-300 hover:bg-white/10' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    aria-label="Close bottom sheet"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lab Tabs Navigation Row inside Sheet */}
              <div className={`flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t pt-2 ${
                isDark ? 'border-white/[0.06]' : 'border-slate-200'
              }`}>
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${
                    activeTab === 'syllabus'
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'bg-cyan-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Syllabus ({ALL_CONCEPTS.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('controls')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${
                    activeTab === 'controls'
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'bg-cyan-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Controls</span>
                </button>

                <button
                  onClick={() => setActiveTab('graphs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${
                    activeTab === 'graphs'
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'bg-cyan-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Graphs</span>
                </button>

                <button
                  onClick={() => setActiveTab('equations')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${
                    activeTab === 'equations'
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'bg-cyan-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Equations</span>
                </button>

                <button
                  onClick={() => setActiveTab('jee')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${
                    activeTab === 'jee'
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'bg-cyan-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>JEE Insights</span>
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${
                    activeTab === 'questions'
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                        : 'bg-cyan-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Questions</span>
                </button>
              </div>
            </div>

            {/* Sheet Scrollable Body */}
            <div
              ref={sheetContentRef}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 pb-20 custom-scrollbar"
            >
              {/* TAB 1: SYLLABUS / CONCEPT SWITCHER */}
              {activeTab === 'syllabus' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-zinc-400' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 15+ JEE topics, formulas, chapters..."
                      className={`w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none transition ${
                        isCyberpunk
                          ? 'bg-[#060D20] border-cyan-500/30 focus:border-cyan-400 text-zinc-100 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : isDark
                          ? 'bg-white/5 border-white/10 focus:border-cyan-500 text-zinc-100'
                          : 'bg-white border-slate-200 focus:border-cyan-500 text-slate-900 shadow-xs'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                        selectedCategory === 'all'
                          ? isCyberpunk
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-cyan-500 text-white'
                          : isDark
                          ? 'bg-white/5 text-zinc-400 border border-white/5'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      All ({ALL_CONCEPTS.length})
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                          selectedCategory === cat.id
                            ? isCyberpunk
                              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                              : 'bg-cyan-500 text-white'
                            : isDark
                            ? 'bg-white/5 text-zinc-400 border border-white/5'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {CATEGORY_ICON_MAP[cat.id]}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Concept Cards List */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredConcepts.map((concept) => {
                      const isActive = concept.id === currentConcept.id;
                      const isFav = favorites.includes(concept.id);
                      const isDone = completedConcepts.includes(concept.id);

                      return (
                        <div
                          key={concept.id}
                          onClick={() => handleSelectConceptAndClose(concept)}
                          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] ${
                            isActive
                              ? isCyberpunk
                                ? 'bg-[#081530] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400/50'
                                : isDark
                                ? 'bg-cyan-500/20 border-cyan-500/60 ring-1 ring-cyan-500/40'
                                : 'bg-cyan-50/90 border-cyan-400 ring-1 ring-cyan-300'
                              : isCyberpunk
                              ? 'bg-[#060D20]/70 hover:bg-[#0A1635] border-cyan-500/20'
                              : isDark
                              ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-xs'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                isDark ? 'bg-white/5 border-white/10 text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-700'
                              }`}>
                                {concept.topic}
                              </span>
                              {concept.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                  isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {concept.badge}
                                </span>
                              )}
                              {isDone && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <h4 className={`text-xs sm:text-sm font-bold truncate ${
                              isActive ? 'text-cyan-400' : isDark ? 'text-zinc-100' : 'text-slate-900'
                            }`}>
                              {concept.title}
                            </h4>
                            <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                              isDark ? 'text-zinc-400' : 'text-slate-500'
                            }`}>
                              {concept.subtitle}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(concept.id);
                              }}
                              className={`p-2 rounded-xl border transition ${
                                isFav
                                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                                  : isDark
                                  ? 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleSelectConceptAndClose(concept)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                                isActive
                                  ? isCyberpunk
                                    ? 'bg-cyan-400 text-black shadow-md'
                                    : 'bg-cyan-500 text-white'
                                  : isDark
                                  ? 'bg-white/10 text-zinc-200 hover:bg-white/20'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isActive ? 'Active' : 'Load'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: PARAMETERS & SIMULATION CONTROLS */}
              {activeTab === 'controls' && (
                <div className="space-y-4">
                  {/* Quick Simulation Bar */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isCyberpunk
                      ? 'bg-[#060D20] border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      : isDark
                      ? 'bg-white/[0.04] border-white/[0.08]'
                      : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onTogglePlay}
                        className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 min-h-[44px] ${
                          isPlaying
                            ? isCyberpunk
                              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                              : 'bg-amber-500 text-slate-950'
                            : isCyberpunk
                            ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                            : 'bg-cyan-500 text-white'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>

                      <button
                        onClick={onResetSimulation}
                        className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 min-h-[44px] ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                        title="Reset simulation parameters and time"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-xs">Reset</span>
                      </button>
                    </div>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1">
                      {[0.5, 1.0, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => onChangeSpeed(s)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            speed === s
                              ? isCyberpunk
                                ? 'bg-cyan-400/30 text-cyan-200 border border-cyan-400'
                                : 'bg-cyan-500 text-white'
                              : isDark
                              ? 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Viewport Toggles Grid */}
                  <div className={`p-3 rounded-2xl border ${
                    isCyberpunk ? 'bg-[#060D20]/80 border-cyan-500/20' : isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-200'
                  }`}>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-2 ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      3D Viewport Overlays
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={onToggleVectors}
                        className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 min-h-[40px] ${
                          showVectors
                            ? isCyberpunk
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : isDark ? 'bg-white/5 text-zinc-500 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Vectors</span>
                      </button>

                      <button
                        onClick={onToggleGrid}
                        className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 min-h-[40px] ${
                          showGrid
                            ? isCyberpunk
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isDark ? 'bg-white/5 text-zinc-500 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span>Grid</span>
                      </button>

                      <button
                        onClick={onEnterFocusMode}
                        className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 min-h-[40px] ${
                          isCyberpunk
                            ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                            : isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Focus</span>
                      </button>
                    </div>
                  </div>

                  {/* Parameter Controls Component */}
                  <ParameterControls
                    parameters={currentConcept.parameters}
                    values={paramValues}
                    onChangeParam={onChangeParam}
                    isPlaying={isPlaying}
                    onTogglePlay={onTogglePlay}
                    onReset={onResetSimulation}
                    speed={speed}
                    onChangeSpeed={onChangeSpeed}
                    liveQuantities={liveQuantities}
                    specialCases={currentConcept.specialCases}
                    simulationType={currentConcept.simulationType}
                    onApplySpecialCase={(preset) => {
                      Object.entries(preset).forEach(([k, v]) => onChangeParam(k, v));
                    }}
                  />
                </div>
              )}

              {/* TAB 3: LIVE GRAPHS & QUANTITIES */}
              {activeTab === 'graphs' && (
                <div className="space-y-4">
                  <LiveGraphPanel
                    graphConfigs={currentConcept.graphConfigs}
                    params={paramValues}
                    simTime={simTime}
                  />
                </div>
              )}

              {/* TAB 4: EQUATIONS & THEORY */}
              {activeTab === 'equations' && (
                <div className="space-y-4">
                  <EquationPanel
                    formulas={currentConcept.formulas}
                    assumptions={currentConcept.assumptions}
                    parameters={currentConcept.parameters}
                    currentParams={paramValues}
                    liveQuantities={liveQuantities}
                    onParamChange={onChangeParam}
                    conceptId={currentConcept.id}
                    chapterId={currentConcept.chapterId}
                    conceptTitle={currentConcept.title}
                    coachingModule={currentConcept.coachingModule}
                  />
                  <CoachingModulePanel
                    concept={currentConcept}
                    onApplyPreset={(preset) => {
                      Object.entries(preset).forEach(([k, v]) => onChangeParam(k, v));
                    }}
                    onSwitchToSimulation={() => setActiveTab('controls')}
                  />
                </div>
              )}

              {/* TAB 5: JEE INSIGHTS */}
              {activeTab === 'jee' && (
                <div className="space-y-4">
                  <JeeInsightsPanel
                    jeeMain={currentConcept.jeeMain}
                    jeeAdvanced={currentConcept.jeeAdvanced}
                  />
                </div>
              )}

              {/* TAB 6: QUESTION ARENA */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  <QuestionArena
                    questions={currentConcept.questions}
                    currentParams={paramValues}
                    conceptTitle={currentConcept.title}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Sticky Bottom Navigation Bar (Context-Aware for Home vs Lab) */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-30 px-3 py-2 sm:py-2.5 border-t backdrop-blur-2xl transition-colors shadow-2xl ${
          isCyberpunk
            ? 'bg-[#030712]/95 border-cyan-500/40 shadow-[0_-5px_25px_rgba(0,240,255,0.15)]'
            : isDark
            ? 'bg-[#0C0C12]/95 border-white/[0.1] shadow-black/80'
            : 'bg-white/95 border-slate-200/90 shadow-slate-200/80'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        aria-label="Mobile Navigation Menu"
      >
        {currentView === 'home' ? (
          /* HOME MODE BOTTOM NAVIGATION BAR */
          <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
            {/* 1. Home button */}
            <button
              onClick={() => onSetView('home')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                currentView === 'home'
                  ? isCyberpunk
                    ? 'text-cyan-300 font-bold'
                    : isDark ? 'text-cyan-400 font-bold' : 'text-cyan-700 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                currentView === 'home' ? (isCyberpunk ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-cyan-500/15 text-cyan-400') : ''
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            {/* 2. Launch 3D Lab */}
            <button
              onClick={() => onSetView('lab')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isCyberpunk ? 'bg-emerald-500/15 text-emerald-300' : 'bg-indigo-500/15 text-indigo-400'
              }`}>
                <Play className="w-4 h-4 fill-current" />
              </div>
              <span className="text-[10px] mt-0.5">3D Lab</span>
            </button>

            {/* 3. Browse Syllabus Bottom-Sheet */}
            <button
              onClick={() => handleOpenTab('syllabus')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Syllabus</span>
            </button>

            {/* 4. Formulas & PDF */}
            <button
              onClick={() => onOpenPdfModal()}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">PDF Sheets</span>
            </button>

            {/* 5. AI Tutor */}
            <button
              onClick={onOpenAiTutor}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">AI Tutor</span>
            </button>
          </div>
        ) : (
          /* LAB MODE BOTTOM HUD ACTION BAR */
          <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
            {/* 1. Quick Syllabus Switcher */}
            <button
              onClick={() => handleOpenTab('syllabus')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isOpen && activeTab === 'syllabus'
                  ? isCyberpunk ? 'text-cyan-300 font-bold' : 'text-cyan-400 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isOpen && activeTab === 'syllabus'
                  ? (isCyberpunk ? 'bg-cyan-500/25 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-cyan-500/20 text-cyan-400')
                  : 'bg-white/5 text-cyan-400'
              }`}>
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Chapters</span>
            </button>

            {/* 2. Simulation Controls */}
            <button
              onClick={() => handleOpenTab('controls')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isOpen && activeTab === 'controls'
                  ? isCyberpunk ? 'text-cyan-300 font-bold' : 'text-cyan-400 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isOpen && activeTab === 'controls'
                  ? (isCyberpunk ? 'bg-cyan-500/25 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-cyan-500/20 text-cyan-400')
                  : 'bg-white/5 text-cyan-400'
              }`}>
                <Sliders className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Controls</span>
            </button>

            {/* 3. Realtime Graphs */}
            <button
              onClick={() => handleOpenTab('graphs')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isOpen && activeTab === 'graphs'
                  ? isCyberpunk ? 'text-cyan-300 font-bold' : 'text-cyan-400 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isOpen && activeTab === 'graphs'
                  ? (isCyberpunk ? 'bg-cyan-500/25 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-cyan-500/20 text-cyan-400')
                  : 'bg-white/5 text-emerald-400'
              }`}>
                <LineChart className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Graphs</span>
            </button>

            {/* 4. Equations & Theory */}
            <button
              onClick={() => handleOpenTab('equations')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isOpen && activeTab === 'equations'
                  ? isCyberpunk ? 'text-cyan-300 font-bold' : 'text-cyan-400 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isOpen && activeTab === 'equations'
                  ? (isCyberpunk ? 'bg-cyan-500/25 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-cyan-500/20 text-cyan-400')
                  : 'bg-white/5 text-indigo-400'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Formulas</span>
            </button>

            {/* 5. Return to Home */}
            <button
              onClick={() => onSetView('home')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] ${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="p-1 rounded-lg bg-white/5 text-zinc-400">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Home</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};
