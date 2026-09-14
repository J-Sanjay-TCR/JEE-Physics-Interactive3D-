import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, PieChart as PieChartIcon, BarChart2, TrendingUp, BookOpen, Layers, 
  Target, AlertCircle, Award, CheckCircle2, Search, Filter, Sparkles, 
  HelpCircle, Compass, Zap, Flame, ArrowRight, Sliders, Brain, Activity, 
  ChevronRight, BarChart3, Clock, Bookmark, Grid, Info, ShieldCheck
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import { 
  UNIT_WEIGHTAGE_DATA, 
  CHAPTER_WEIGHTAGE_DATA, 
  QUESTION_TYPES_DATA, 
  DIFFICULTY_SPECTRUM_DATA,
  UnitWeightageItem,
  ChapterWeightageItem 
} from '../../utils/jeeWeightageApi';

interface JeeWeightageAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConceptTitle?: (title: string) => void;
}

type AnalyticsTab = 'overview' | 'chapters' | 'questions' | 'heatmap' | 'strategy' | 'planner';

export const JeeWeightageAnalyticsModal: React.FC<JeeWeightageAnalyticsModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [examType, setExamType] = useState<'MAIN' | 'ADVANCED'>('MAIN');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  
  // Interactive slice filter in Overview
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  // Chapter Matrix filters
  const [chapterSearch, setChapterSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<'ALL' | 'Class 11' | 'Class 12'>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'weightage' | 'roi' | 'difficulty'>('weightage');

  // Unit Options & Category Counts
  const UNIT_OPTIONS = [
    { id: 'ALL', label: 'All Units' },
    { id: 'Mechanics & Fluids', label: 'Mechanics & Fluids' },
    { id: 'Electrodynamics & Magnetism', label: 'Electrodynamics' },
    { id: 'Modern & Nuclear Physics', label: 'Modern Physics' },
    { id: 'Thermal Physics & Radiation', label: 'Thermal & Heat' },
    { id: 'Optics & Wave Phenomena', label: 'Optics' },
    { id: 'Oscillations & Waves', label: 'Waves & SHM' },
    { id: 'Experimental Physics & Errors', label: 'Experimental' },
  ];

  const unitCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: CHAPTER_WEIGHTAGE_DATA.length };
    CHAPTER_WEIGHTAGE_DATA.forEach(c => {
      counts[c.unit] = (counts[c.unit] || 0) + 1;
    });
    return counts;
  }, []);

  // Target Score Planner State
  const [targetScore, setTargetScore] = useState<number>(75);

  // Heatmap interactive cell state
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ chapter: string; year: number; val: number; unit: string; classLevel: string; roiIndex: number; difficulty: string } | null>(null);
  
  // Heatmap Sort & ROI Hover Tooltip State
  const [heatmapSort, setHeatmapSort] = useState<'weightage' | 'roi'>('roi');
  const [hoveredRoiData, setHoveredRoiData] = useState<{
    chapter: ChapterWeightageItem;
    year?: number;
    val?: number;
    x: number;
    y: number;
  } | null>(null);

  // Helper calculation for Return on Investment (ROI) derived from paper frequency and difficulty
  const getChapterRoiMetrics = (
    ch: ChapterWeightageItem,
    exam: 'MAIN' | 'ADVANCED',
    year?: number,
    cellVal?: number
  ) => {
    const avgQs = exam === 'MAIN' ? ch.avgMainQs : ch.avgAdvQs;
    const overallWeight = exam === 'MAIN' ? ch.mainPct : ch.advPct;
    const expectedMarks = Math.round(avgQs * 4 * 10) / 10;
    
    // Historical frequency spread from 2014-2026 data
    const yearVals = Object.values(ch.yearWiseData).map(d => exam === 'MAIN' ? d.main : d.adv);
    const minHistorical = Math.min(...yearVals);
    const maxHistorical = Math.max(...yearVals);
    
    // Estimated prep effort in hours based on chapter difficulty & syllabus length
    const prepHoursMap: Record<string, number> = {
      'Low': 12,
      'Medium': 20,
      'High': 32,
      'Very High': 45,
    };
    const prepHours = prepHoursMap[ch.difficulty] || 22;
    const marksPerHour = Math.round((expectedMarks / prepHours) * 100) / 100;
    
    // Occurrence frequency across shifts (all 2014-2026 papers)
    const occurrenceRate = avgQs >= 1.0 ? 100 : Math.round((avgQs / 1.0) * 100);

    let tierLabel = 'Tier 1 • High-Yield Goldmine';
    let tierColor = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/20';
    let progressBarColor = 'from-emerald-500 to-teal-400';
    let badgeBorder = 'border-emerald-500/30';
    let strategyTip = 'Direct formula application with high test frequency. Master standard archetypes for rapid, guaranteed marks.';

    if (ch.roiIndex < 7.5) {
      tierLabel = 'Tier 3 • High Effort / Low Return';
      tierColor = 'text-rose-300 border-rose-500/40 bg-rose-500/20';
      progressBarColor = 'from-rose-500 to-orange-400';
      badgeBorder = 'border-rose-500/30';
      strategyTip = 'Concept-heavy with multi-topic calculus mixing. Cover selectively after securing high-ROI chapters.';
    } else if (ch.roiIndex < 8.8) {
      tierLabel = 'Tier 2 • Solid Core Yield';
      tierColor = 'text-amber-300 border-amber-500/40 bg-amber-500/20';
      progressBarColor = 'from-amber-500 to-yellow-400';
      badgeBorder = 'border-amber-500/30';
      strategyTip = 'Guaranteed 1-2 questions with moderate complexity. Regular PYQ practice yields solid scoring return.';
    }

    const currentYearVal = cellVal ?? (year && ch.yearWiseData[year] ? (exam === 'MAIN' ? ch.yearWiseData[year].main : ch.yearWiseData[year].adv) : null);
    const yearDiff = currentYearVal !== null ? Math.round((currentYearVal - overallWeight) * 10) / 10 : null;

    return {
      avgQs,
      overallWeight,
      expectedMarks,
      minHistorical,
      maxHistorical,
      prepHours,
      marksPerHour,
      occurrenceRate,
      tierLabel,
      tierColor,
      progressBarColor,
      badgeBorder,
      strategyTip,
      currentYearVal,
      yearDiff,
    };
  };

  // Pie chart dataset with dynamic active values based on examType
  const pieData = useMemo(() => {
    return UNIT_WEIGHTAGE_DATA.map(u => ({
      ...u,
      value: examType === 'MAIN' ? u.mainPct : u.advPct,
      avgQs: examType === 'MAIN' ? u.avgQuestionsMain : u.avgQuestionsAdv,
    }));
  }, [examType]);

  // Selected Unit details for active drill-down
  const activeUnit = useMemo(() => {
    if (!selectedUnitId) return pieData[0];
    return pieData.find(u => u.id === selectedUnitId) || pieData[0];
  }, [selectedUnitId, pieData]);

  // Class 11 vs 12 Syllabus Split calculation
  const classSplit = useMemo(() => {
    let c11 = 0;
    let c12 = 0;
    UNIT_WEIGHTAGE_DATA.forEach(u => {
      const val = examType === 'MAIN' ? u.mainPct : u.advPct;
      if (u.classLevel === 'Class 11') c11 += val;
      else if (u.classLevel === 'Class 12') c12 += val;
      else {
        c11 += val * 0.5;
        c12 += val * 0.5;
      }
    });
    return {
      class11: Math.round(c11 * 10) / 10,
      class12: Math.round(c12 * 10) / 10
    };
  }, [examType]);

  // Filtered & Sorted Chapter List
  const filteredChapters = useMemo(() => {
    return CHAPTER_WEIGHTAGE_DATA.filter(c => {
      const matchesSearch = c.chapter.toLowerCase().includes(chapterSearch.toLowerCase()) ||
                            c.unit.toLowerCase().includes(chapterSearch.toLowerCase()) ||
                            c.questionArchetypes.some(q => q.toLowerCase().includes(chapterSearch.toLowerCase()));
      const matchesClass = selectedClassFilter === 'ALL' || c.classLevel === selectedClassFilter;
      const matchesPriority = selectedPriorityFilter === 'ALL' || c.priorityTier === selectedPriorityFilter;
      const matchesUnit = selectedUnitFilter === 'ALL' || c.unit === selectedUnitFilter;
      return matchesSearch && matchesClass && matchesPriority && matchesUnit;
    }).sort((a, b) => {
      if (sortBy === 'weightage') {
        const valA = examType === 'MAIN' ? a.mainPct : a.advPct;
        const valB = examType === 'MAIN' ? b.mainPct : b.advPct;
        return valB - valA;
      }
      if (sortBy === 'roi') {
        return b.roiIndex - a.roiIndex;
      }
      if (sortBy === 'difficulty') {
        const diffMap = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return diffMap[b.difficulty] - diffMap[a.difficulty];
      }
      return 0;
    });
  }, [chapterSearch, selectedClassFilter, selectedPriorityFilter, selectedUnitFilter, sortBy, examType]);

  // Heatmap Chapters Filtered by Unit and Class
  const heatmapChapters = useMemo(() => {
    return CHAPTER_WEIGHTAGE_DATA.filter(c => {
      const matchesUnit = selectedUnitFilter === 'ALL' || c.unit === selectedUnitFilter;
      const matchesClass = selectedClassFilter === 'ALL' || c.classLevel === selectedClassFilter;
      return matchesUnit && matchesClass;
    }).sort((a, b) => {
      if (heatmapSort === 'roi') {
        return b.roiIndex - a.roiIndex;
      }
      const valA = examType === 'MAIN' ? a.mainPct : a.advPct;
      const valB = examType === 'MAIN' ? b.mainPct : b.advPct;
      return valB - valA;
    });
  }, [selectedUnitFilter, selectedClassFilter, heatmapSort, examType]);

  // Target Score Planner Recommendation Engine
  const plannerRecommendations = useMemo(() => {
    // Sort chapters by ROI index descending to maximize score in least time
    const sortedByROI = [...CHAPTER_WEIGHTAGE_DATA].sort((a, b) => b.roiIndex - a.roiIndex);
    
    let accumulatedScore = 0;
    const selectedChapters: ChapterWeightageItem[] = [];
    
    // Scale target score to 100 marks total in Main or 120 in Adv
    const totalMax = examType === 'MAIN' ? 100 : 120;
    const targetScaled = Math.min(targetScore, totalMax);

    for (const chap of sortedByROI) {
      const chapMarks = (examType === 'MAIN' ? chap.mainPct : chap.advPct) * (totalMax / 100);
      selectedChapters.push(chap);
      accumulatedScore += chapMarks;
      if (accumulatedScore >= targetScaled) break;
    }

    let estimatedPercentile = '90 - 93 %ile';
    let rankRange = 'Top 70,000';
    if (targetScore >= 90) {
      estimatedPercentile = '99.7+ %ile';
      rankRange = 'Top 1,500 (IIT Bombay / Top NIT CSE)';
    } else if (targetScore >= 80) {
      estimatedPercentile = '99.0+ %ile';
      rankRange = 'Top 8,000 (Top NITs / IITs Qualification)';
    } else if (targetScore >= 65) {
      estimatedPercentile = '97.5+ %ile';
      rankRange = 'Top 25,000';
    } else if (targetScore >= 50) {
      estimatedPercentile = '94.0+ %ile';
      rankRange = 'Top 50,000';
    }

    return {
      chapters: selectedChapters,
      totalChapters: selectedChapters.length,
      estimatedMarks: Math.round(accumulatedScore),
      estimatedPercentile,
      rankRange
    };
  }, [targetScore, examType]);

  if (!isOpen) return null;

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as UnitWeightageItem;
      return (
        <div className="bg-[#0e0e14] border border-cyan-500/30 p-3.5 rounded-xl shadow-2xl backdrop-blur-md z-50 text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-white text-sm">{data.name}</span>
          </div>
          <div className="space-y-1 text-zinc-300">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Weightage:</span>
              <span className="font-bold text-cyan-300">{examType === 'MAIN' ? data.mainPct : data.advPct}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Avg. Questions:</span>
              <span className="font-bold text-emerald-400">~{examType === 'MAIN' ? data.avgQuestionsMain : data.avgQuestionsAdv} Qs / paper</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">ROI Rating:</span>
              <span className="font-bold text-amber-300">{data.roiScore} / 10</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Class Level:</span>
              <span className="font-semibold text-purple-300">{data.classLevel}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-zinc-400 italic">
            Click slice to pin & view deep topic breakdown
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0e0e14] border border-white/20 p-3 rounded-xl shadow-2xl z-50 text-xs">
          <p className="font-bold text-white mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs py-0.5">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}% weightage</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ y: 30, scale: 0.96, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-w-6xl h-[94vh] max-h-[900px] bg-[#060812] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_70px_rgba(0,240,255,0.16)] overflow-hidden flex flex-col relative"
        >
          {/* Subtle Cyber scanline background texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-50" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Bar */}
          <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#0C0F1D] via-[#070913] to-[#0C0F1D] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-indigo-600/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400/20">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                    JEE Physics Exam Intelligence &amp; Weightage Hub
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    2014 - 2026 Live Grounding
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Precision statistics, chapter high-yield tiers, historical trends &amp; score planners
                </p>
              </div>
            </div>

            {/* Exam Toggle & Close Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="inline-flex bg-[#101322] p-1 rounded-xl border border-white/[0.1] shadow-inner">
                <button
                  onClick={() => setExamType('MAIN')}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    examType === 'MAIN' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.5)] ring-1 ring-cyan-400/50' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  JEE MAIN (NTA)
                </button>
                <button
                  onClick={() => setExamType('ADVANCED')}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    examType === 'ADVANCED' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_16px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/50' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  JEE ADVANCED (IITs)
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
                title="Close Analytics Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="relative z-10 px-4 sm:px-6 py-2 bg-[#090C16] border-b border-white/[0.08] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-200 border-cyan-400/50 shadow-[0_0_14px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>Unit Breakdown &amp; Competency</span>
                {activeTab === 'overview' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  activeTab === 'chapters'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-200 border-cyan-400/50 shadow-[0_0_14px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Chapter Weightage Matrix</span>
                {activeTab === 'chapters' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('heatmap')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  activeTab === 'heatmap'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-200 border-emerald-400/50 shadow-[0_0_14px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>High-Yield Heatmap</span>
                {activeTab === 'heatmap' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  activeTab === 'questions'
                    ? 'bg-gradient-to-r from-purple-500/25 to-indigo-500/25 text-purple-200 border-purple-400/50 shadow-[0_0_14px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Question Formats &amp; Rigor</span>
                {activeTab === 'questions' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('strategy')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  activeTab === 'strategy'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-cyan-200 border-cyan-400/50 shadow-[0_0_14px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>4-Quadrant Strategy</span>
                {activeTab === 'strategy' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('planner')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  activeTab === 'planner'
                    ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-200 border-amber-400/50 shadow-[0_0_14px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Score Planner</span>
                {activeTab === 'planner' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]"></span>
                <span>Class 11: <strong>{classSplit.class11}%</strong></span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]"></span>
                <span>Class 12: <strong>{classSplit.class12}%</strong></span>
              </span>
            </div>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#0A0A0E]">
            
            {/* ================= TAB 1: OVERVIEW & UNITS ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Top Summary KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#101830] via-[#0B1024] to-[#070914] p-4 rounded-2xl border border-blue-500/30 hover:border-blue-400/60 shadow-[0_4px_24px_rgba(59,130,246,0.12)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.25)] transition-all duration-300 flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                        Exam Questions
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                        {examType === 'MAIN' ? '30 Qs' : '36 Qs'}
                      </div>
                      <span className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1 mt-0.5">
                        {examType === 'MAIN' ? '100 Marks Total' : '~120 Marks Avg'}
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#0F2620] via-[#0A1A17] to-[#06110F] p-4 rounded-2xl border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_4px_24px_rgba(16,185,129,0.12)] hover:shadow-[0_4px_32px_rgba(16,185,129,0.25)] transition-all duration-300 flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        Top Scoring Unit
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 tracking-tight">
                        Modern Physics
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        9.8 / 10 ROI Yield
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#102038] via-[#0A1526] to-[#060D17] p-4 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_24px_rgba(6,182,212,0.12)] hover:shadow-[0_4px_32px_rgba(6,182,212,0.25)] transition-all duration-300 flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                        Heavyweight Domain
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-cyan-200 mt-1 tracking-tight">
                        Mechanics &amp; Fluids
                      </div>
                      <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 mt-0.5">
                        {examType === 'MAIN' ? '31.5% Weightage' : '35.0% Weightage'}
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#2D2012] via-[#1C140C] to-[#100B06] p-4 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_24px_rgba(245,158,11,0.12)] hover:shadow-[0_4px_32px_rgba(245,158,11,0.25)] transition-all duration-300 flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                        99 %ile Target
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 tracking-tight">
                        {examType === 'MAIN' ? '78+ Marks' : '62+ Marks'}
                      </div>
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                        {examType === 'MAIN' ? 'Top 1% in Country' : 'Under 2,500 AIR'}
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Interactive Donut & Unit Intelligence Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Donut Pie Chart (5 Cols) */}
                  <div className="lg:col-span-5 bg-[#090C18] p-5 rounded-2xl border border-cyan-500/20 shadow-[0_4px_25px_rgba(0,240,255,0.06)] flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-cyan-400" />
                        Interactive Unit-Wise Share
                      </h3>
                      <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                        Click slice to pin
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2">
                      Click any slice below to inspect high-yield subtopics and chapter breakdowns
                    </p>

                    <div className="h-[260px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            onClick={(entry: any) => {
                              const id = entry?.id || entry?.payload?.id;
                              if (id) setSelectedUnitId(id);
                            }}
                            cursor="pointer"
                          >
                            {pieData.map((entry) => (
                              <Cell 
                                key={`cell-${entry.id}`} 
                                fill={entry.color} 
                                opacity={selectedUnitId === null || selectedUnitId === entry.id ? 1 : 0.4}
                                stroke={selectedUnitId === entry.id ? '#ffffff' : 'none'}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Center Badge */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-black text-white">{activeUnit.value}%</div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-[100px] truncate">
                            {activeUnit.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Legend Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/[0.06]">
                      {pieData.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUnitId(u.id)}
                          className={`flex items-center gap-2 text-xs p-1.5 rounded-lg text-left transition-all ${
                            activeUnit.id === u.id 
                              ? 'bg-white/10 ring-1 ring-white/20' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
                          <span className="text-zinc-300 truncate text-[11px] font-medium flex-1">{u.name}</span>
                          <span className="text-white font-black text-xs">{u.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Unit Deep Dive Inspector (7 Cols) */}
                  <div className="lg:col-span-7 bg-[#111116] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeUnit.color }} />
                          <h4 className="text-base font-black text-white">{activeUnit.name} Deep Intelligence</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-zinc-300 border border-white/10">
                          {activeUnit.classLevel}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                        {activeUnit.description}
                      </p>

                      {/* Stat Metrics Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-[#171720] p-3 rounded-xl border border-white/[0.05]">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Frequency</span>
                          <div className="text-base font-black text-cyan-300 mt-0.5">
                            ~{activeUnit.avgQs} Qs / Paper
                          </div>
                          <span className="text-[10px] text-zinc-500">{examType === 'MAIN' ? '4 Marks each' : 'Variable Marking'}</span>
                        </div>

                        <div className="bg-[#171720] p-3 rounded-xl border border-white/[0.05]">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Preparation ROI</span>
                          <div className="text-base font-black text-emerald-400 mt-0.5">
                            {activeUnit.roiScore} / 10
                          </div>
                          <span className="text-[10px] text-zinc-500">Yield per prep hour</span>
                        </div>

                        <div className="bg-[#171720] p-3 rounded-xl border border-white/[0.05]">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rigor Level</span>
                          <div className="text-base font-black text-purple-300 mt-0.5">
                            {activeUnit.difficulty}
                          </div>
                          <span className="text-[10px] text-zinc-500">Conceptual Depth</span>
                        </div>
                      </div>

                      {/* Top Chapters & Key Tested Topics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#151620] p-3.5 rounded-xl border border-white/[0.05]">
                          <div className="text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            Key Chapters in this Unit
                          </div>
                          <div className="space-y-1.5">
                            {activeUnit.topChapters.map((ch, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                <span>{ch}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#151620] p-3.5 rounded-xl border border-white/[0.05]">
                          <div className="text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            High-Frequency Tested Topics
                          </div>
                          <div className="space-y-1.5">
                            {activeUnit.keyTopics.map((tp, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-amber-200/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>{tp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Want full chapter comparisons?</span>
                      <button
                        onClick={() => setActiveTab('chapters')}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                      >
                        <span>View Chapter Matrix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radar Competency Mapping Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 bg-[#111116] p-5 rounded-2xl border border-white/[0.06] flex flex-col">
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      Multi-Dimensional Unit Competency Map
                    </h3>
                    <p className="text-[11px] text-zinc-400 mb-4">
                      Relative weightage comparison across all major domains in {examType === 'MAIN' ? 'JEE Main' : 'JEE Advanced'}
                    </p>

                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={pieData}>
                          <PolarGrid stroke="rgba(255,255,255,0.08)" />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                          <Radar
                            name={examType === 'MAIN' ? 'JEE Main (%)' : 'JEE Advanced (%)'}
                            dataKey="value"
                            stroke={examType === 'MAIN' ? '#3b82f6' : '#10b981'}
                            fill={examType === 'MAIN' ? '#3b82f6' : '#10b981'}
                            fillOpacity={0.4}
                          />
                          <Tooltip content={<CustomPieTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="lg:col-span-6 bg-[#111116] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        Class 11 vs Class 12 Syllabus Weightage Ratio
                      </h3>
                      <p className="text-[11px] text-zinc-400 mb-4">
                        Historical syllabus division in {examType === 'MAIN' ? 'JEE Main Papers' : 'JEE Advanced Papers'}
                      </p>

                      {/* Visual Dual Progress Bar */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-blue-300">Class 11 (Mechanics, Thermal, Waves)</span>
                            <span className="text-white">{classSplit.class11}%</span>
                          </div>
                          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${classSplit.class11}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-purple-300">Class 12 (Electrodynamics, Optics, Modern)</span>
                            <span className="text-white">{classSplit.class12}%</span>
                          </div>
                          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                              style={{ width: `${classSplit.class12}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Strategic Takeaway Note */}
                      <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/30 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          Key Examination Takeaway
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {examType === 'MAIN'
                            ? 'Class 12 accounts for over 56% of total marks in JEE Main. Prioritizing Modern Physics and Current Electricity first yields rapid score growth with minimal calculus.'
                            : 'In JEE Advanced, Class 11 Mechanics and Class 12 Electrodynamics frequently blend in single questions (e.g. rotating coils, charged projectile trajectories).'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Looking for high-scoring strategy?</span>
                      <button
                        onClick={() => setActiveTab('strategy')}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                      >
                        <span>Explore 4-Quadrant Strategy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: CHAPTER MATRIX ================= */}
            {activeTab === 'chapters' && (
              <div className="space-y-6">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111116] p-3.5 rounded-2xl border border-white/[0.06]">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                      placeholder="Search chapters, units, or question archetypes..."
                      className="w-full bg-[#171720] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Filter Selectors */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value as any)}
                      className="bg-[#171720] border border-white/[0.08] text-xs text-zinc-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All Classes (11 & 12)</option>
                      <option value="Class 11">Class 11 Only</option>
                      <option value="Class 12">Class 12 Only</option>
                    </select>

                    <select
                      value={selectedPriorityFilter}
                      onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                      className="bg-[#171720] border border-white/[0.08] text-xs text-zinc-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All Priority Tiers</option>
                      <option value="Do or Die (Tier 1)">Do or Die (Tier 1)</option>
                      <option value="High Yield (Tier 2)">High Yield (Tier 2)</option>
                      <option value="Standard (Tier 3)">Standard (Tier 3)</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#171720] border border-white/[0.08] text-xs text-zinc-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
                    >
                      <option value="weightage">Sort: Weightage (Highest)</option>
                      <option value="roi">Sort: Preparation ROI (Highest)</option>
                      <option value="difficulty">Sort: Difficulty Level</option>
                    </select>
                  </div>
                </div>

                {/* Category & Unit Portion Filter Toggles */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {UNIT_OPTIONS.map((uTab) => {
                    const isActive = selectedUnitFilter === uTab.id;
                    const count = unitCounts[uTab.id] ?? 0;
                    return (
                      <button
                        key={uTab.id}
                        onClick={() => setSelectedUnitFilter(uTab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 border min-h-[32px] ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-bold'
                            : 'bg-[#15151F] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
                        }`}
                      >
                        <span>{uTab.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/[0.06] text-zinc-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Chapter Comparison Bar Chart */}
                <div className="bg-[#111116] p-5 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-cyan-400" />
                        Chapter-by-Chapter Weightage Comparison (%)
                      </h3>
                      <p className="text-[11px] text-zinc-400">Comparing relative share across JEE Main vs JEE Advanced</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                        <span className="text-zinc-300">JEE Main (%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                        <span className="text-zinc-300">JEE Advanced (%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredChapters}
                        margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="chapter" 
                          tick={{ fill: '#9ca3af', fontSize: 9 }} 
                          angle={-35} 
                          textAnchor="end"
                          interval={0}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="mainPct" name="JEE Main" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="advPct" name="JEE Advanced" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chapter Deep Data Table */}
                <div className="bg-[#111116] rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#161722] text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                        <tr>
                          <th className="py-3 px-4">Chapter Name</th>
                          <th className="py-3 px-4">Class</th>
                          <th className="py-3 px-4">JEE Main</th>
                          <th className="py-3 px-4">JEE Advanced</th>
                          <th className="py-3 px-4">ROI Index</th>
                          <th className="py-3 px-4">Rigor</th>
                          <th className="py-3 px-4">Priority Tier</th>
                          <th className="py-3 px-4">Key Archetypes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredChapters.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-bold text-white">
                              {c.chapter}
                              <span className="block text-[10px] font-normal text-zinc-400">{c.unit}</span>
                            </td>
                            <td className="py-3 px-4 text-zinc-300">{c.classLevel}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-blue-400">{c.mainPct}%</span>
                              <span className="text-[10px] text-zinc-500 block">~{c.avgMainQs} Qs</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-emerald-400">{c.advPct}%</span>
                              <span className="text-[10px] text-zinc-500 block">~{c.avgAdvQs} Qs</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded font-black text-xs ${
                                c.roiIndex >= 9 ? 'bg-emerald-500/20 text-emerald-300' :
                                c.roiIndex >= 7.5 ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {c.roiIndex}/10
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[11px] font-semibold ${
                                c.difficulty === 'Very High' ? 'text-rose-400' :
                                c.difficulty === 'High' ? 'text-amber-400' :
                                c.difficulty === 'Medium' ? 'text-blue-300' : 'text-emerald-400'
                              }`}>
                                {c.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.priorityTier.includes('Tier 1') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                c.priorityTier.includes('Tier 2') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-zinc-800 text-zinc-400'
                              }`}>
                                {c.priorityTier.split(' ')[0]} {c.priorityTier.split(' ')[1]}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-zinc-400 max-w-xs truncate text-[11px]">
                              {c.questionArchetypes.join(', ')}
                            </td>
                          </tr>
                        ))}
                        {filteredChapters.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-12 text-center">
                              <p className="text-zinc-400 text-sm font-semibold mb-2">No chapters found matching your filter criteria</p>
                              <button
                                onClick={() => {
                                  setChapterSearch('');
                                  setSelectedClassFilter('ALL');
                                  setSelectedPriorityFilter('ALL');
                                  setSelectedUnitFilter('ALL');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
                              >
                                Reset All Chapter Filters
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3 (NEW): HIGH-YIELD HEATMAP ================= */}
            {activeTab === 'heatmap' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[#111116] p-4 sm:p-5 rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col h-full min-h-[500px]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Grid className="w-4 h-4 text-emerald-400" />
                          Historical Weightage & ROI Intelligence Heatmap (2014-2026)
                        </h3>
                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Live ROI Engine
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Track yearly shifts in weightage and hover over any cell to calculate Return on Effort based on question frequency in {examType === 'MAIN' ? 'JEE Main' : 'JEE Advanced'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Class Filter for Heatmap */}
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold pl-1">Class:</span>
                        {(['ALL', 'Class 11', 'Class 12'] as const).map((cls) => (
                          <button
                            key={cls}
                            onClick={() => setSelectedClassFilter(cls)}
                            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all ${
                              selectedClassFilter === cls
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {cls === 'ALL' ? 'All' : cls.replace('Class ', 'C')}
                          </button>
                        ))}
                      </div>

                      {/* Sort Switch */}
                      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold pl-1">Sort:</span>
                        <button
                          onClick={() => setHeatmapSort('roi')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 ${
                            heatmapSort === 'roi'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          ROI Score
                        </button>
                        <button
                          onClick={() => setHeatmapSort('weightage')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 ${
                            heatmapSort === 'weightage'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3 text-cyan-400" />
                          Exam Weightage
                        </button>
                      </div>

                      {/* Heatmap Legend */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap bg-white/[0.02] px-2.5 py-1 rounded-xl border border-white/[0.05]">
                        <span className="text-zinc-500">Weight:</span>
                        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-zinc-800/80"></span> <span className="text-zinc-400">&lt;3%</span></div>
                        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-900/60 border border-cyan-700/30"></span> <span className="text-cyan-400">3-6%</span></div>
                        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-700/60 border border-emerald-500/30"></span> <span className="text-emerald-400">6-8%</span></div>
                        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-600/60 border border-amber-500/30"></span> <span className="text-amber-400">8-10%</span></div>
                        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-600/70 border border-rose-500/50 shadow-[0_0_8px_rgba(225,29,72,0.6)]"></span> <span className="text-rose-400">&gt;10%</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Heatmap Category/Unit Portion Toggles */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0 border-b border-white/[0.06]">
                    {UNIT_OPTIONS.map((uTab) => {
                      const isActive = selectedUnitFilter === uTab.id;
                      const count = unitCounts[uTab.id] ?? 0;
                      return (
                        <button
                          key={`hm-${uTab.id}`}
                          onClick={() => setSelectedUnitFilter(uTab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 flex items-center gap-1.5 border min-h-[30px] ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.25)] font-bold'
                              : 'bg-[#15151F] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
                          }`}
                        >
                          <span>{uTab.label}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/[0.06] text-zinc-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div 
                    className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/[0.1] pr-2 pb-2"
                    onScroll={() => setHoveredRoiData(null)}
                  >
                    <div className="min-w-[900px]">
                      {/* Grid Header (Years & ROI) */}
                      <div className="flex items-center mb-2 px-1">
                        <div className="w-[200px] sm:w-[220px] shrink-0 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between pr-3">
                          <span>Chapter Name</span>
                          <span className="flex items-center gap-1 text-amber-400 font-mono">
                            <Zap className="w-3 h-3" />
                            ROI
                          </span>
                        </div>
                        <div className="flex items-center flex-1">
                          {[2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(yr => (
                            <div key={yr} className="flex-1 text-center text-[10px] font-bold text-zinc-500 shrink-0 min-w-[36px]">
                              {yr === 2026 ? '26*' : yr.toString().slice(-2)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Heatmap Rows or Empty State */}
                      {heatmapChapters.length === 0 ? (
                        <div className="p-8 text-center bg-black/30 rounded-xl border border-white/[0.06] space-y-2 my-4">
                          <p className="text-xs text-zinc-400">No chapters match the selected unit or class portion filter.</p>
                          <button
                            onClick={() => {
                              setSelectedUnitFilter('ALL');
                              setSelectedClassFilter('ALL');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                          >
                            Reset Heatmap Filters
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {heatmapChapters.map((ch) => {
                          const roiBadgeColor = ch.roiIndex >= 9.0 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : ch.roiIndex >= 8.0 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700/40';

                          return (
                            <div key={ch.id} className="flex items-center gap-2 group hover:bg-white/[0.04] p-1 rounded-lg transition-colors">
                              {/* Chapter Name & Interactive ROI Badge */}
                              <div 
                                className="w-[200px] sm:w-[220px] shrink-0 flex items-center justify-between gap-1.5 pr-2 cursor-pointer"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredRoiData({
                                    chapter: ch,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top,
                                  });
                                }}
                                onMouseLeave={() => setHoveredRoiData(null)}
                                onClick={() => {
                                  const yr = 2026;
                                  const val = ch.yearWiseData[yr] ? (examType === 'MAIN' ? ch.yearWiseData[yr].main : ch.yearWiseData[yr].adv) : 0;
                                  setSelectedHeatmapCell({ chapter: ch.chapter, year: yr, val, unit: ch.unit, classLevel: ch.classLevel, roiIndex: ch.roiIndex, difficulty: ch.difficulty });
                                }}
                              >
                                <div className="truncate">
                                  <span className="truncate text-[11px] font-semibold text-zinc-300 group-hover:text-white block">
                                    {ch.chapter}
                                  </span>
                                  <span className="text-[9px] text-zinc-500 truncate block">
                                    {ch.unit.split(' ')[0]} • {ch.classLevel}
                                  </span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border transition-all group-hover:scale-105 shadow-sm ${roiBadgeColor}`}>
                                  {ch.roiIndex}
                                </span>
                              </div>

                              {/* Year Cells */}
                              <div className="flex items-center flex-1">
                                {[2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(yr => {
                                  const val = ch.yearWiseData[yr] ? (examType === 'MAIN' ? ch.yearWiseData[yr].main : ch.yearWiseData[yr].adv) : 0;
                                  
                                  let bgColor = 'bg-zinc-800/80';
                                  if (val >= 10) bgColor = 'bg-rose-600/70 border-rose-500/50 shadow-[0_0_8px_rgba(225,29,72,0.4)] text-white';
                                  else if (val >= 8) bgColor = 'bg-amber-600/60 border-amber-500/30 text-amber-100';
                                  else if (val >= 6) bgColor = 'bg-emerald-700/60 border-emerald-500/30 text-emerald-100';
                                  else if (val >= 3) bgColor = 'bg-cyan-900/60 border-cyan-700/30 text-cyan-100';
                                  else bgColor = 'bg-zinc-800/80 text-zinc-500';

                                  return (
                                    <div 
                                      key={yr} 
                                      className="flex-1 px-[1px] flex justify-center shrink-0 min-w-[36px] group/cell relative"
                                    >
                                      <button 
                                        onMouseEnter={(e) => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setHoveredRoiData({
                                            chapter: ch,
                                            year: yr,
                                            val,
                                            x: rect.left + rect.width / 2,
                                            y: rect.top,
                                          });
                                        }}
                                        onMouseLeave={() => setHoveredRoiData(null)}
                                        onClick={() => setSelectedHeatmapCell({ chapter: ch.chapter, year: yr, val, unit: ch.unit, classLevel: ch.classLevel, roiIndex: ch.roiIndex, difficulty: ch.difficulty })}
                                        className={`w-full aspect-[4/3] max-h-[32px] rounded flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-transparent transition-all duration-200 hover:scale-[1.35] hover:z-20 hover:shadow-2xl hover:border-white/50 cursor-zoom-in ${bgColor}`}
                                      >
                                        <span className="opacity-0 group-hover/cell:opacity-100 drop-shadow-md transition-opacity duration-150">
                                          {val.toFixed(1)}
                                        </span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    </div>
                  </div>
                </div>

                {/* Dynamic Floating ROI Score Tooltip on Hover */}
                {hoveredRoiData && (() => {
                  const m = getChapterRoiMetrics(
                    hoveredRoiData.chapter,
                    examType,
                    hoveredRoiData.year,
                    hoveredRoiData.val
                  );
                  
                  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
                  const leftPos = Math.min(Math.max(hoveredRoiData.x, 195), viewportWidth - 195);
                  const showBelow = hoveredRoiData.y < 350;

                  return (
                    <div
                      className="fixed z-[100] pointer-events-none transition-all duration-75 ease-out"
                      style={{
                        left: leftPos,
                        top: showBelow ? hoveredRoiData.y + 36 : hoveredRoiData.y - 12,
                        transform: showBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                      }}
                    >
                      <div className="w-[330px] sm:w-[370px] bg-[#0c0e18]/95 border border-emerald-500/40 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.25)] backdrop-blur-xl p-3.5 sm:p-4 text-xs text-zinc-200 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header with Title & Year Context */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/[0.08]">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.tierColor}`}>
                                {m.tierLabel}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-zinc-300">
                                {hoveredRoiData.chapter.classLevel}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-white leading-snug truncate">
                              {hoveredRoiData.chapter.chapter}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">
                              {hoveredRoiData.chapter.unit}
                            </p>
                          </div>

                          {hoveredRoiData.year && (
                            <div className="text-right shrink-0 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.08]">
                              <span className="text-[10px] font-mono font-bold text-cyan-300 block">
                                {hoveredRoiData.year} Paper
                              </span>
                              <span className="text-xs font-black text-white block">
                                {m.currentYearVal?.toFixed(1)}%
                              </span>
                              {m.yearDiff !== null && (
                                <span className={`text-[9px] font-mono block ${m.yearDiff >= 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                  {m.yearDiff >= 0 ? `+${m.yearDiff}%` : `${m.yearDiff}%`} vs Avg
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Calculated ROI Score Highlight Banner */}
                        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/10 p-3 rounded-xl border border-emerald-500/30 mb-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
                              Calculated ROI Score
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-white font-mono">
                                {hoveredRoiData.chapter.roiIndex}
                              </span>
                              <span className="text-[11px] text-zinc-400 font-mono">/ 10</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${m.progressBarColor} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}
                              style={{ width: `${hoveredRoiData.chapter.roiIndex * 10}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1.5">
                            <span>Low Yield (0.0)</span>
                            <span className="text-emerald-300 font-semibold font-mono">
                              ⚡ {m.marksPerHour} Marks / Study Hour
                            </span>
                            <span>Goldmine (10.0)</span>
                          </div>
                        </div>

                        {/* Paper Frequency & Payoff Analysis Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-2.5">
                          <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                              Exam Frequency
                            </span>
                            <div className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-baseline gap-1">
                              <span>~{m.avgQs} Qs</span>
                              <span className="text-[10px] text-zinc-400">/ paper</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
                              {m.occurrenceRate}% Appearance Rate
                            </span>
                          </div>

                          <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                              Marks Payoff vs Effort
                            </span>
                            <div className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 flex items-baseline gap-1">
                              <span>~{m.expectedMarks} Marks</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              ~{m.prepHours} hrs preparation
                            </span>
                          </div>
                        </div>

                        {/* Mathematical Derivation Box */}
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] mb-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                            <span className="font-mono text-cyan-300 font-semibold">
                              ROI = (Paper Frequency × Marks) / (Complexity × Prep Hours)
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-300 leading-snug">
                            {m.strategyTip}
                          </p>
                        </div>

                        {/* Footer info / click prompt */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-white/[0.06]">
                          <span>13-Yr Spread: {m.minHistorical}% – {m.maxHistorical}%</span>
                          <span className="text-cyan-400 font-semibold">Click cell for full breakdown ↗</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Heatmap Drill-Down Modal Overlay */}
                {selectedHeatmapCell && (() => {
                  const chObj = CHAPTER_WEIGHTAGE_DATA.find(c => c.chapter === selectedHeatmapCell.chapter);
                  const m = chObj ? getChapterRoiMetrics(chObj, examType, selectedHeatmapCell.year, selectedHeatmapCell.val) : null;

                  return (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200" onClick={() => setSelectedHeatmapCell(null)}>
                      <div 
                        className="bg-[#0e0e14] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" 
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-zinc-300">
                                Year {selectedHeatmapCell.year}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                {selectedHeatmapCell.classLevel}
                              </span>
                              {m && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.tierColor}`}>
                                  {m.tierLabel}
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-black text-white">{selectedHeatmapCell.chapter}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">{selectedHeatmapCell.unit}</p>
                          </div>
                          <button onClick={() => setSelectedHeatmapCell(null)} className="p-1 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Exam Weightage</div>
                            <div className="text-xl font-black text-white">{selectedHeatmapCell.val.toFixed(1)}%</div>
                            <div className="text-[10px] text-zinc-400 mt-1">
                              ~{Math.round((selectedHeatmapCell.val / 100) * (examType === 'MAIN' ? 30 : 36))} Qs in Paper
                            </div>
                          </div>
                          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400" />
                              ROI Index
                            </div>
                            <div className="text-xl font-black text-amber-400">{selectedHeatmapCell.roiIndex}<span className="text-sm text-zinc-500">/10</span></div>
                            <div className="text-[10px] text-zinc-400 mt-1">
                              {m ? `${m.marksPerHour} Marks / Study Hr` : 'Return on time invested'}
                            </div>
                          </div>
                        </div>

                        {/* Detailed ROI & Frequency Breakdown */}
                        {m && (
                          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] mb-4 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-zinc-300">
                              <span className="text-zinc-400">Historical Paper Frequency:</span>
                              <span className="font-bold text-cyan-300">~{m.avgQs} Qs / paper ({m.occurrenceRate}% papers)</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-300">
                              <span className="text-zinc-400">Estimated Marks Payoff:</span>
                              <span className="font-bold text-amber-300">~{m.expectedMarks} Marks</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-300">
                              <span className="text-zinc-400">Mastery Prep Time:</span>
                              <span className="font-bold text-zinc-200">~{m.prepHours} Study Hours</span>
                            </div>
                            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400">
                              <span className="text-emerald-400 font-semibold">Strategic Guidance: </span>
                              {m.strategyTip}
                            </div>
                          </div>
                        )}

                        {chObj && chObj.questionArchetypes && (
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                              High Frequency Question Archetypes
                            </span>
                            <div className="space-y-1">
                              {chObj.questionArchetypes.map((archetype, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300 bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.04]">
                                  <span className="text-cyan-400 font-mono font-bold">#{idx + 1}</span>
                                  <span>{archetype}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 text-sm pt-2 border-t border-white/[0.06]">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-xs">Difficulty Curve</span>
                            <span className={`text-xs font-semibold ${selectedHeatmapCell.difficulty === 'High' || selectedHeatmapCell.difficulty === 'Very High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {selectedHeatmapCell.difficulty}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-xs">Exam Type</span>
                            <span className="text-xs font-semibold text-cyan-300">
                              JEE {examType === 'MAIN' ? 'Main' : 'Advanced'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ================= TAB 4: QUESTION FORMATS & RIGOR ================= */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Question Archetype Donut Pie */}
                  <div className="bg-[#111116] p-5 rounded-2xl border border-white/[0.06] flex flex-col">
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Question Format Distribution ({examType === 'MAIN' ? 'JEE Main' : 'JEE Advanced'})
                    </h3>
                    <p className="text-[11px] text-zinc-400 mb-4">
                      Breakdown of question types and their strategic time allocation
                    </p>

                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={QUESTION_TYPES_DATA.filter(q => (examType === 'MAIN' ? q.mainPct : q.advPct) > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey={examType === 'MAIN' ? 'mainPct' : 'advPct'}
                            nameKey="type"
                            stroke="none"
                          >
                            {QUESTION_TYPES_DATA.map((_, index) => (
                              <Cell 
                                key={`qcell-${index}`} 
                                fill={['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][index % 4]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-white/[0.06]">
                      {QUESTION_TYPES_DATA.filter(q => (examType === 'MAIN' ? q.mainPct : q.advPct) > 0).map((q, idx) => (
                        <div key={idx} className="p-2.5 bg-[#171720] rounded-xl border border-white/[0.04]">
                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span className="text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][idx % 4] }} />
                              {q.type}
                            </span>
                            <span className="text-cyan-300 font-black">
                              {examType === 'MAIN' ? q.mainPct : q.advPct}%
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{q.description}</p>
                          <div className="text-[10px] text-amber-300/90 font-medium mt-1">
                            💡 Strategy: {q.strategy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Spectrum & Negative Marking Analysis */}
                  <div className="bg-[#111116] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-400" />
                        Difficulty Level Spectrum & Scoring Tiers
                      </h3>
                      <p className="text-[11px] text-zinc-400 mb-4">
                        Question complexity breakdown in {examType === 'MAIN' ? 'JEE Main Shifts' : 'JEE Advanced'}
                      </p>

                      <div className="space-y-4 mb-6">
                        {DIFFICULTY_SPECTRUM_DATA.map((d, idx) => {
                          const val = examType === 'MAIN' ? d.mainPct : d.advPct;
                          return (
                            <div key={idx} className="p-3 bg-[#171720] rounded-xl border border-white/[0.04]">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-white flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                  {d.level}
                                </span>
                                <span className="text-white font-black">{val}%</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${val}%`, backgroundColor: d.color }}
                                />
                              </div>
                              <p className="text-[11px] text-zinc-400">{d.description}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Negative Marking Defense Guide */}
                      <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          Negative Marking Defense System (-1 / -2 Risk)
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {examType === 'MAIN'
                            ? 'Over 40% of negative marks in JEE Main come from speed calculation errors in Section B (NVQs) and forgetting SI unit conversions (cm to m, grams to kg).'
                            : 'In JEE Advanced Multi-Correct questions, partial marking (+1 per correct option) rewards conservative marking. Never guess the 4th option unless 100% mathematically verified.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Ready to plan your preparation?</span>
                      <button
                        onClick={() => setActiveTab('planner')}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                      >
                        <span>Calculate Target Score Clusters</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: 4-QUADRANT STRATEGY ================= */}
            {activeTab === 'strategy' && (
              <div className="space-y-6">
                <div className="bg-[#111116] p-4 rounded-2xl border border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Physics 4-Quadrant High-Yield Preparation Matrix
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Chapters categorized by time investment effort vs marks yield
                  </p>
                </div>

                {/* Founder's Tactical Edge & Score Acceleration Protocol */}
                <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0D1224] via-[#0B0F1C] to-[#070913] p-5 shadow-[0_0_25px_rgba(6,182,212,0.12)]">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 shrink-0">
                          <ShieldCheck className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Founder's Tactical Edge</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Verified Protocol
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-white">Curated by Sanjay.J • Physics Intuition Architecture</h4>
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-400 sm:text-right">
                        <span>Target: </span>
                        <strong className="text-amber-400">99.5+ Percentile in Physics</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs">
                          <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Rule 1: Spatial Triage First</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Spend the first 35 seconds visualizing rotation vectors or field lines in 3D before applying formulas. 80% of algebraic dead-ends are prevented by correct initial vector orientation.
                        </p>
                      </div>

                      <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center gap-2 mb-2 text-emerald-300 font-bold text-xs">
                          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Rule 2: Modern Physics Blitz</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Secure 100% of Modern Physics + Current Electricity in the opening 25 minutes. These 24-28 marks require zero heavy integration and generate unstoppable early confidence.
                        </p>
                      </div>

                      <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl hover:border-amber-500/40 transition-colors">
                        <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Rule 3: Partial Mark Discipline</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          In JEE Advanced Multi-Correct questions, locking in two verified options guarantees +2 marks without risk. Never hazard a blind guess on the 3rd or 4th option.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quadrant 1: Golden Chapters */}
                  <div className="bg-gradient-to-br from-emerald-950/30 to-[#111116] p-5 rounded-2xl border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Quadrant 1 • Gold Mine
                      </span>
                      <span className="text-xs font-bold text-emerald-400">High Yield • Low-to-Med Effort</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-2">Do or Die Fast Points</h4>
                    <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                      Must complete first. These chapters take under 30 hours of prep but guarantee 35-40% of the entire physics paper.
                    </p>
                    <div className="space-y-2">
                      {['Modern Physics (Dual Nature, Atoms, Nuclei)', 'Thermodynamics & KTG', 'Current Electricity', 'Units, Dimensions & Errors', 'Gravitation'].map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-emerald-200 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant 2: Crucial Heavyweights */}
                  <div className="bg-gradient-to-br from-blue-950/30 to-[#111116] p-5 rounded-2xl border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        Quadrant 2 • Heavyweights
                      </span>
                      <span className="text-xs font-bold text-blue-400">High Yield • High Effort</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-2">The Rank Deciders</h4>
                    <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                      High conceptual depth requiring continuous multi-step problem solving practice. Crucial for sub-5000 AIR.
                    </p>
                    <div className="space-y-2">
                      {['Rotational Dynamics & Pure Rolling', 'Electrostatics & Gauss Law', 'Magnetic Effects of Current & EMI', 'Ray & Wave Optics'].map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-blue-200 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/30">
                          <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant 3: Quick Pickups */}
                  <div className="bg-gradient-to-br from-amber-950/30 to-[#111116] p-5 rounded-2xl border border-amber-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Quadrant 3 • Quick Boosts
                      </span>
                      <span className="text-xs font-bold text-amber-400">Med Yield • Low Effort</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-2">Shortcut Scoring</h4>
                    <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                      Can be mastered over a single weekend with NCERT & standard formula sheets.
                    </p>
                    <div className="space-y-2">
                      {['Semiconductors & Logic Gates', 'Capacitors & Dielectrics', 'Work, Power & Energy Formulas', 'Vernier Calipers & Screw Gauge'].map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-amber-200 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/30">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant 4: High Rigor Specialization */}
                  <div className="bg-gradient-to-br from-purple-950/30 to-[#111116] p-5 rounded-2xl border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Quadrant 4 • Deep Specialization
                      </span>
                      <span className="text-xs font-bold text-purple-400">Med Yield • High Effort</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-2">Advanced Perfectionists</h4>
                    <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                      Deep mathematical calculus models. Recommended after mastering Quadrants 1 & 2.
                    </p>
                    <div className="space-y-2">
                      {['SHM & Torsional Oscillations', 'Fluid Dynamics & Viscosity', 'Relative Motion & Rain-Man Trajectories', 'AC Circuits & Resonance'].map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-purple-200 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-800/30">
                          <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 5: TARGET SCORE PLANNER ================= */}
            {activeTab === 'planner' && (
              <div className="space-y-6">
                <div className="bg-[#111116] p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Target Physics Score in {examType === 'MAIN' ? 'JEE Main (out of 100)' : 'JEE Advanced (out of 120)'}
                      </span>
                      <span className="text-2xl font-black text-amber-400">{targetScore} Marks</span>
                    </div>

                    <input
                      type="range"
                      min="30"
                      max={examType === 'MAIN' ? 100 : 120}
                      step="5"
                      value={targetScore}
                      onChange={(e) => setTargetScore(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    <div className="flex justify-between text-[11px] text-zinc-400 font-semibold">
                      <span>30 (Qualifying)</span>
                      <span>60 (Good NIT)</span>
                      <span>80 (99 %ile)</span>
                      <span>{examType === 'MAIN' ? '100 (Centum)' : '120 (Rank 1 AIR)'}</span>
                    </div>
                  </div>

                  <div className="bg-[#181924] p-4 rounded-xl border border-white/[0.08] flex items-center gap-6 shrink-0 w-full md:w-auto justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Est. Percentile</span>
                      <div className="text-lg font-black text-emerald-400">{plannerRecommendations.estimatedPercentile}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rank Expectation</span>
                      <div className="text-sm font-black text-white">{plannerRecommendations.rankRange}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Required Chapters</span>
                      <div className="text-lg font-black text-cyan-400">{plannerRecommendations.totalChapters} / 14</div>
                    </div>
                  </div>
                </div>

                {/* Recommended Chapter Package */}
                <div className="bg-[#111116] p-5 rounded-2xl border border-white/[0.06]">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Optimal Minimum Chapter Package to Hit {targetScore} Marks
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {plannerRecommendations.chapters.map((ch, idx) => (
                      <div key={ch.id} className="p-3.5 bg-[#171720] rounded-xl border border-white/[0.06] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-white">{idx + 1}. {ch.chapter}</span>
                            <span className="font-black text-emerald-400">+{Math.round((examType === 'MAIN' ? ch.mainPct : ch.advPct) * (examType === 'MAIN' ? 1 : 1.2))} M</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 block mb-2">{ch.unit}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/[0.04]">
                          <span className="text-zinc-400">{ch.classLevel}</span>
                          <span className="text-amber-300 font-semibold">ROI: {ch.roiIndex}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
