import React, { useState, useMemo } from 'react';
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
  Eye,
  Ruler,
  Quote,
  Cpu,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Code,
  Terminal,
} from 'lucide-react';

interface HomePageProps {
  onSelectConcept: (concept: PhysicsConcept, preset?: Record<string, number>) => void;
  onOpenFormulaHub: () => void;
  onOpenPdfModal?: (chapterId?: string) => void;
  onOpenSyllabusDirectory?: () => void;
  onOpenAiTutor: () => void;
  onOpenTutorial: () => void;
  onOpenAnalytics: () => void;
  completedConcepts: string[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const CLASS_11_CHAPTER_IDS = new Set([
  'units-dimensions',
  'vectors-math',
  'kinematics',
  'laws-of-motion',
  'work-energy-power',
  'com-momentum',
  'rotational-motion',
  'gravitation',
  'properties-matter',
  'fluid-mechanics',
  'thermodynamics',
  'heat-transfer',
  'oscillations',
  'waves',
]);

const CLASS_12_CHAPTER_IDS = new Set([
  'electrostatics',
  'magnetism',
  'emi-ac',
  'ray-optics',
  'wave-optics',
  'modern-physics',
  'nuclear-physics',
]);

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  mechanics: {
    label: 'Mechanics & Fluids',
    icon: <Atom className="w-3.5 h-3.5" />,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  electromagnetism: {
    label: 'Electrodynamics',
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  thermal: {
    label: 'Thermal & Heat',
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  'waves-oscillations': {
    label: 'Waves & SHM',
    icon: <Activity className="w-3.5 h-3.5" />,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  optics: {
    label: 'Ray & Wave Optics',
    icon: <Eye className="w-3.5 h-3.5" />,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  modern: {
    label: 'Modern Physics',
    icon: <Sun className="w-3.5 h-3.5" />,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  experimental: {
    label: 'Experimental',
    icon: <Ruler className="w-3.5 h-3.5" />,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
};

export const HomePage: React.FC<HomePageProps> = ({
  onSelectConcept,
  onOpenFormulaHub,
  onOpenPdfModal,
  onOpenSyllabusDirectory,
  onOpenAiTutor,
  onOpenTutorial,
  onOpenAnalytics,
  completedConcepts,
  favorites,
  onToggleFavorite,
}) => {
  const { isDark, isCyberpunk, theme, cycleTheme } = useTheme();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<'all' | 'class-11' | 'class-12'>('all');
  const [showFounderManifesto, setShowFounderManifesto] = useState<boolean>(false);
  const [copiedManifesto, setCopiedManifesto] = useState<boolean>(false);

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

  const filteredChapters = useMemo(() => {
    return CHAPTERS.filter((ch) => {
      let matchesCategory = true;
      if (selectedBranch !== 'all') {
        matchesCategory = ch.category === selectedBranch;
      }

      let matchesClass = true;
      if (selectedClass === 'class-11') {
        matchesClass = CLASS_11_CHAPTER_IDS.has(ch.id);
      } else if (selectedClass === 'class-12') {
        matchesClass = CLASS_12_CHAPTER_IDS.has(ch.id);
      }

      return matchesCategory && matchesClass;
    });
  }, [selectedBranch, selectedClass]);

  const totalCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CHAPTERS.length };
    CHAPTERS.forEach((ch) => {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleToggleCategory = (catId: string) => {
    if (selectedBranch === catId) {
      setSelectedBranch('all');
    } else {
      setSelectedBranch(catId);
      if (selectedClass !== 'all' && catId !== 'all') {
        const hasChaptersInClass = CHAPTERS.some((ch) => {
          if (ch.category !== catId) return false;
          return selectedClass === 'class-11'
            ? CLASS_11_CHAPTER_IDS.has(ch.id)
            : CLASS_12_CHAPTER_IDS.has(ch.id);
        });
        if (!hasChaptersInClass) {
          const inC11 = CHAPTERS.some((ch) => ch.category === catId && CLASS_11_CHAPTER_IDS.has(ch.id));
          const inC12 = CHAPTERS.some((ch) => ch.category === catId && CLASS_12_CHAPTER_IDS.has(ch.id));
          if (inC11 && !inC12) {
            setSelectedClass('class-11');
          } else if (inC12 && !inC11) {
            setSelectedClass('class-12');
          } else {
            setSelectedClass('all');
          }
        }
      }
    }
  };

  const handleToggleClass = (classId: 'all' | 'class-11' | 'class-12') => {
    const nextClass = selectedClass === classId && classId !== 'all' ? 'all' : classId;
    setSelectedClass(nextClass);
    if (selectedBranch !== 'all' && nextClass !== 'all') {
      const hasChaptersInCategory = CHAPTERS.some((ch) => {
        if (ch.category !== selectedBranch) return false;
        return nextClass === 'class-11'
          ? CLASS_11_CHAPTER_IDS.has(ch.id)
          : CLASS_12_CHAPTER_IDS.has(ch.id);
      });
      if (!hasChaptersInCategory) {
        setSelectedBranch('all');
      }
    }
  };

  const classCounts = useMemo(() => {
    let c11 = 0;
    let c12 = 0;
    CHAPTERS.forEach((ch) => {
      const matchesCategory = selectedBranch === 'all' || ch.category === selectedBranch;
      if (matchesCategory) {
        if (CLASS_11_CHAPTER_IDS.has(ch.id)) c11++;
        if (CLASS_12_CHAPTER_IDS.has(ch.id)) c12++;
      }
    });
    return {
      all: selectedBranch === 'all' ? CHAPTERS.length : CHAPTERS.filter((c) => c.category === selectedBranch).length,
      class11: c11,
      class12: c12,
    };
  }, [selectedBranch]);

  return (
    <div className={`w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 pb-28 lg:pb-10 space-y-8 sm:space-y-10 transition-colors ${
      isCyberpunk
        ? 'text-zinc-100'
        : isDark ? 'text-zinc-100' : 'text-slate-900'
    }`}>
      {/* Hero Presentation Banner */}
      <section
        id="home-hero-section"
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 lg:p-12 shadow-2xl transition-colors scroll-mt-20 ${
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
              onClick={onOpenAnalytics}
              className={`px-4 py-3 rounded-2xl border font-black text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] ${
                isCyberpunk
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : isDark
                  ? 'bg-gradient-to-r from-emerald-950/50 to-teal-950/40 hover:from-emerald-900/60 hover:to-teal-900/50 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>JEE Weightage & Analytics Hub</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                2026 Ready
              </span>
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
      <section id="home-flagship-section" className="space-y-4 scroll-mt-20">
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
      <section id="home-chapters-grid" className="space-y-5 scroll-mt-20">
        <div className={`flex flex-col gap-3.5 border-b pb-4 ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <BookOpen className="w-5 h-5 text-blue-500" />
                Complete JEE Physics Syllabus Modules
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Filter by syllabus category portion or class level to enter dedicated 3D apparatuses, real-time vector solvers, and coaching synopsis.
              </p>
            </div>

            {/* Class Portion Toggle */}
            <div className={`inline-flex items-center p-1 rounded-xl border self-start sm:self-auto shrink-0 ${
              isDark ? 'bg-[#101017] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
            }`}>
              {[
                { id: 'all', label: 'All Classes', count: classCounts.all },
                { id: 'class-11', label: 'Class 11', count: classCounts.class11 },
                { id: 'class-12', label: 'Class 12', count: classCounts.class12 },
              ].map((cTab) => (
                <button
                  key={cTab.id}
                  onClick={() => handleToggleClass(cTab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 min-h-[32px] ${
                    selectedClass === cTab.id
                      ? isDark
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-blue-600 text-white shadow-sm'
                      : isDark
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <span>{cTab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedClass === cTab.id
                      ? 'bg-white/20 text-white'
                      : isDark
                      ? 'bg-white/[0.06] text-zinc-400'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cTab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Portion Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Categories', count: totalCategoryCounts.all || 0, icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'mechanics', label: 'Mechanics & Fluids', count: totalCategoryCounts.mechanics || 0, icon: <Atom className="w-3.5 h-3.5" /> },
              { id: 'electromagnetism', label: 'Electrodynamics', count: totalCategoryCounts.electromagnetism || 0, icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'thermal', label: 'Thermal & Heat', count: totalCategoryCounts.thermal || 0, icon: <Flame className="w-3.5 h-3.5" /> },
              { id: 'waves-oscillations', label: 'Waves & SHM', count: totalCategoryCounts['waves-oscillations'] || 0, icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'optics', label: 'Ray & Wave Optics', count: totalCategoryCounts.optics || 0, icon: <Eye className="w-3.5 h-3.5" /> },
              { id: 'modern', label: 'Modern Physics', count: totalCategoryCounts.modern || 0, icon: <Sun className="w-3.5 h-3.5" /> },
              { id: 'experimental', label: 'Experimental', count: totalCategoryCounts.experimental || 0, icon: <Ruler className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = selectedBranch === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleToggleCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 border min-h-[36px] ${
                    isActive
                      ? isCyberpunk
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-bold'
                        : isDark
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-xs font-bold'
                        : 'bg-cyan-50 text-cyan-900 border-cyan-400 shadow-xs font-bold'
                      : isDark
                      ? 'bg-[#101017] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-zinc-400'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/30 text-cyan-200'
                        : 'bg-cyan-200 text-cyan-900'
                      : isDark
                      ? 'bg-white/[0.06] text-zinc-500'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category Filter Status Bar */}
          {selectedBranch !== 'all' && (
            <div className={`px-4 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs flex-wrap ${
              isDark ? 'bg-[#101018] border-cyan-500/30 text-zinc-300' : 'bg-cyan-50/80 border-cyan-200 text-cyan-950'
            }`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 font-medium">Category Filter Active:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-xs flex items-center gap-1.5 border ${
                  CATEGORY_META[selectedBranch]?.badge || 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                }`}>
                  {CATEGORY_META[selectedBranch]?.icon}
                  {CATEGORY_META[selectedBranch]?.label || selectedBranch}
                </span>
                <span className="text-zinc-500">&bull;</span>
                <span className="font-semibold text-cyan-400">{filteredChapters.length} Chapters in this category</span>
              </div>
              <button
                onClick={() => setSelectedBranch('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border shrink-0 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-zinc-200 border-white/10'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span>Clear Category</span>
                <span className="text-xs">&times;</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty state if no chapters match */}
        {filteredChapters.length === 0 ? (
          <div className={`p-10 rounded-2xl border text-center space-y-3 ${
            isDark ? 'bg-[#0E0E14] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              No chapters match the selected category &amp; class filter combination.
            </p>
            <button
              onClick={() => {
                setSelectedBranch('all');
                setSelectedClass('all');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Chapters Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChapters.map((chapter) => {
              const chapterConcepts = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id);
              if (chapterConcepts.length === 0) return null;
              const isC11 = CLASS_11_CHAPTER_IDS.has(chapter.id);
              const catMeta = CATEGORY_META[chapter.category];

              return (
                <div
                  key={chapter.id}
                  id={`chapter-section-${chapter.id}`}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition shadow-lg scroll-mt-20 ${
                    isDark
                      ? 'bg-[#0E0E14] border-white/[0.08] hover:border-white/[0.16]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-200'
                  }`}
                >
                  {/* Category Header */}
                  <div className={`p-4 border-b flex flex-col gap-2 ${
                    isDark ? 'bg-[#14141E] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Particular Category of Chapter Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                          catMeta?.badge || (isDark ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : 'bg-cyan-50 text-cyan-800 border-cyan-200')
                        }`}>
                          {catMeta?.icon}
                          <span>{catMeta?.label || chapter.category}</span>
                        </span>

                        {/* Class Badge */}
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                          isC11
                            ? isDark
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                            : isDark
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {isC11 ? 'Class 11' : 'Class 12'}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                        isDark ? 'text-zinc-400 bg-black/40 border-white/[0.04]' : 'text-slate-600 bg-white border-slate-200'
                      }`}>
                        {chapterConcepts.length} {chapterConcepts.length === 1 ? 'Lab' : 'Labs'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isC11 ? 'bg-blue-400 shadow-[0_0_6px_#60a5fa]' : 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                      }`} />
                      <h3 className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {chapter.name}
                      </h3>
                    </div>
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
                          id={`concept-${concept.id}`}
                          onClick={() => onSelectConcept(concept)}
                          className={`pt-2.5 first:pt-0 group/item cursor-pointer flex items-start justify-between gap-3 -mx-2 px-2 py-2 rounded-xl transition min-h-[44px] scroll-mt-20 ${
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
        )}
      </section>

      {/* Dedicated Downloadable PDF Formula Sheets Section */}
      <ChapterPdfSection
        onSelectConcept={onSelectConcept}
        onOpenPdfModal={onOpenPdfModal}
      />

      {/* ================= ULTRA-ELEVATED FOUNDED BY SANJAY PANEL ================= */}
      <section
        id="home-founder-section"
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 transition-all shadow-2xl scroll-mt-20 ${
          isCyberpunk
            ? 'bg-gradient-to-br from-[#030714] via-[#06142e] to-[#02050f] border-cyan-400/40 shadow-[0_0_50px_rgba(0,240,255,0.18)]'
            : isDark
            ? 'bg-gradient-to-br from-[#0d1224] via-[#090d1a] to-[#05070e] border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.7)]'
            : 'bg-gradient-to-br from-cyan-50/95 via-sky-50/70 to-indigo-50/90 border-cyan-300/80 shadow-2xl shadow-cyan-100'
        }`}
      >
        {/* Glow ambient background mesh & Cyber scanlines */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

        <div className="relative z-10 space-y-8">
          {/* Header & Founder Monogram */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-cyan-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              {/* Orbital Ring Avatar */}
              <div className="relative shrink-0 group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-2xl sm:text-3xl shadow-xl shadow-cyan-500/40 ring-4 ring-cyan-400/30 group-hover:ring-cyan-300 transition-all duration-300 relative">
                  SJ
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl shadow-md flex items-center justify-center ring-2 ring-slate-950" title="Verified Creator & Physics Architect">
                  <ShieldCheck className="w-4 h-4 text-slate-950 fill-current" />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                    isCyberpunk
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-xs'
                  }`}>
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                    Founded by Sanjay
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Sanjay.J
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs' : 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Chief Physics Architect &amp; Simulation Engineer
                  </span>
                </div>

                <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-cyan-200/90' : 'text-cyan-900'}`}>
                  JEE Main &amp; Advanced 3D Spatial Interactive Framework • Conceived &amp; Engineered by Sanjay.J
                </p>

                {/* Micro Tech Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {[
                    { label: 'Three.js WebGL', icon: '🌐' },
                    { label: 'Rapier Physics WASM', icon: '⚡' },
                    { label: 'KaTeX MathML Engine', icon: '📐' },
                    { label: '60 FPS Vector Resolvers', icon: '🎯' },
                    { label: '2014-2026 PYQ Shift Intelligence', icon: '📊' },
                  ].map((tech) => (
                    <span
                      key={tech.label}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all hover:scale-105 ${
                        isCyberpunk
                          ? 'bg-[#061026] text-zinc-300 border-cyan-500/25 hover:border-cyan-400 hover:text-cyan-300'
                          : isDark
                          ? 'bg-[#121422] text-zinc-300 border-white/10 hover:border-white/20'
                          : 'bg-white text-slate-700 border-slate-200 shadow-2xs hover:border-cyan-400'
                      }`}
                    >
                      <span>{tech.icon}</span>
                      <span>{tech.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => onSelectConcept(ALL_CONCEPTS[0])}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] min-h-[42px]"
              >
                <Compass className="w-4 h-4" />
                <span>Launch 3D Lab</span>
              </button>

              <button
                onClick={onOpenAnalytics}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 min-h-[42px] ${
                  isDark
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Weightage Hub</span>
              </button>

              <button
                onClick={() => (onOpenPdfModal ? onOpenPdfModal() : onOpenFormulaHub())}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 min-h-[42px] ${
                  isDark
                    ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border-white/[0.1]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                }`}
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>PDF Sheets</span>
              </button>

              <button
                onClick={() => setShowFounderManifesto(!showFounderManifesto)}
                className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                  showFounderManifesto
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : isDark
                    ? 'bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 border-cyan-500/30'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                }`}
                title="View Sanjay's Architectural Blueprint & Physics Thesis"
              >
                <Code className="w-4 h-4" />
                <span>{showFounderManifesto ? 'Hide Blueprint' : 'Architect Manifesto'}</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Strip (4 Live Highlights) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Interactive 3D Syllabus', val: '21 / 21 Modules', sub: '100% Complete Coverage', color: 'text-cyan-400' },
              { label: 'Client Physics Simulation', val: '60 FPS WASM', sub: 'Zero Lag Euler Integrators', color: 'text-emerald-400' },
              { label: 'Parametric Solvers', val: '150+ Calculators', sub: 'Live KaTeX LaTeX Evaluation', color: 'text-purple-400' },
              { label: 'Historical Exam Depth', val: '12-Year PYQs', sub: '2014-2026 NTA Shift Matrix', color: 'text-amber-400' },
            ].map((m) => (
              <div
                key={m.label}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isCyberpunk
                    ? 'bg-[#050c1e]/90 border-cyan-500/25 shadow-xs'
                    : isDark
                    ? 'bg-[#101322]/80 border-white/[0.08]'
                    : 'bg-white/90 border-cyan-200/80 shadow-xs'
                }`}
              >
                <div className={`text-base sm:text-lg font-black tracking-tight ${m.color}`}>
                  {m.val}
                </div>
                <div className={`text-xs font-bold mt-0.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  {m.label}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Vision Quote Block */}
          <div className={`p-4 sm:p-5 rounded-2xl border relative ${
            isDark ? 'bg-black/50 border-white/[0.08]' : 'bg-white/90 border-cyan-200/80 shadow-xs'
          }`}>
            <Quote className="w-8 h-8 text-cyan-400/30 absolute top-3 right-3 pointer-events-none" />
            <p className={`text-sm sm:text-base leading-relaxed italic ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              &ldquo;When you can visualize vectors rotating in 3D space, feel momentum transfers through real-time collisions, and inspect the phase lag in an AC circuit dynamically, physics transforms from an intimidating test into pure intuition.&rdquo;
            </p>
            <div className="mt-2.5 text-xs font-black text-cyan-400 flex items-center gap-2">
              <span>— Sanjay.J, Founder &amp; Chief Physics Architect</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Expandable Architect Manifesto / Pedagogical Blueprint */}
          {showFounderManifesto && (
            <div
              className={`p-5 sm:p-6 rounded-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                isCyberpunk
                  ? 'bg-[#040a1c] border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.15)]'
                  : isDark
                  ? 'bg-[#0e111e] border-cyan-500/30 shadow-xl'
                  : 'bg-white border-cyan-300 shadow-xl'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      Sanjay's Engineering Blueprint &amp; Pedagogical Thesis
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Foundational design patterns behind the 3D WebGL physics engine and JEE coaching syllabus
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const manifestoText = `JEE Main & Advanced 3D Interactive Lab Directory
Founded and Engineered by Sanjay.J
Architectural Principles:
1. Spatial 3D Calculus: Transforming 2D static diagrams into tactile 360° orbital manifolds.
2. Numerical Precision: Client-side Verlet & Euler solvers executing at 60 FPS without server latency.
3. Parametric LaTeX Grounding: Real-time LaTeX re-rendering with dynamic boundary conditions.
4. PYQ Intelligence: Grounded on 12-year shift trends (2014-2026).`;
                    navigator.clipboard.writeText(manifestoText);
                    setCopiedManifesto(true);
                    setTimeout(() => setCopiedManifesto(false), 2500);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto ${
                    copiedManifesto
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/15 text-zinc-200 border-white/10'
                  }`}
                >
                  {copiedManifesto ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManifesto ? 'Copied Specs!' : 'Copy Architecture Specs'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <span>1. Why 2D Chalkboards Fail</span>
                  </h5>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    JEE Advanced problems rarely live in 1D. Concepts like rolling with slipping, angular momentum conservation about moving axes, and 3D electromagnetic induction demand dynamic visualization of coordinate frames and non-orthogonal vector projections.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <span>2. 60 FPS Numerical Integration</span>
                  </h5>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    Rather than relying on static formulas, every simulation runs numerical integration (Euler/Verlet algorithms). Dragging a friction slider dynamically adjusts contact impulses, normal reaction dissipation, and damping curves in real-time.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="font-bold text-purple-400 mb-1.5 flex items-center gap-1.5">
                    <span>3. PYQ Shift Alignment</span>
                  </h5>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    Every apparatus is matched against high-yield questions from the past 12 years of NTA Main and IIT Advanced papers, highlighting trap answers, boundary pitfalls, and quick dimensional verification techniques.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4 Architectural Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
              isCyberpunk
                ? 'bg-[#050e22] border-cyan-500/25 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                : isDark
                ? 'bg-[#111320] border-cyan-500/20 hover:border-cyan-500/40'
                : 'bg-white border-cyan-200/80 shadow-xs hover:border-cyan-400'
            }`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shadow-xs">
                  🌐
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Tactile 3D Calculus
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                360° orbital control, vector resolution (v&#8407;&#7522;, v&#8407;&#7523;, a&#8407;&#8345;, a&#8407;&#7524;), curvature radius &rho;, and dynamic force vectors.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
              isCyberpunk
                ? 'bg-[#050e22] border-emerald-500/25 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : isDark
                ? 'bg-[#111320] border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-white border-emerald-200/80 shadow-xs hover:border-emerald-400'
            }`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xs">
                  ⚡
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapier WASM Engine
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                True 60 FPS numerical physics with ragdoll kinematics, impulse collision dynamics, and kinetic friction dissipation.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
              isCyberpunk
                ? 'bg-[#050e22] border-indigo-500/25 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                : isDark
                ? 'bg-[#111320] border-indigo-500/20 hover:border-indigo-500/40'
                : 'bg-white border-indigo-200/80 shadow-xs hover:border-indigo-400'
            }`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-xs">
                  📐
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  150+ Parametric Solvers
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Live parametric formula solvers with dynamic LaTeX rendering, unit dimensional verification, and negative-marking trap alerts.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
              isCyberpunk
                ? 'bg-[#050e22] border-amber-500/25 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : isDark
                ? 'bg-[#111320] border-amber-500/20 hover:border-amber-500/40'
                : 'bg-white border-amber-200/80 shadow-xs hover:border-amber-400'
            }`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs">
                  🎯
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  12-Yr PYQ Intelligence
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                12-year PYQ frequency heatmaps, priority scoring tiers (Tiers 1-3), and personalized target score planners.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
