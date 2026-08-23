import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsConcept, CategoryId } from '../../types';
import { CHAPTERS, CATEGORIES, ALL_CONCEPTS } from '../../data/allConcepts';
import { useTheme } from '../../context/ThemeContext';
import { generateChapterPdf } from '../../utils/pdfGenerator';
import {
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Atom,
  Zap,
  Activity,
  Eye,
  Sun,
  Moon,
  Ruler,
  Star,
  Flame,
  Search,
  X,
  ChevronsUpDown,
  BookOpen,
  Filter,
  PanelLeftClose,
  Download,
} from 'lucide-react';

interface SidebarProps {
  currentConcept: PhysicsConcept;
  onSelectConcept: (concept: PhysicsConcept) => void;
  favorites: string[];
  completedConcepts: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
}

const CATEGORY_CONFIG: Record<
  CategoryId,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  mechanics: {
    label: 'Mechanics',
    icon: <Atom className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
  },
  thermal: {
    label: 'Thermodynamics',
    icon: <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
    color: 'text-orange-300',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
  },
  electromagnetism: {
    label: 'Electrodynamics',
    icon: <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
  },
  'waves-oscillations': {
    label: 'Waves & SHM',
    icon: <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
  },
  optics: {
    label: 'Optics',
    icon: <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
    color: 'text-purple-300',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
  },
  modern: {
    label: 'Modern Physics',
    icon: <Sun className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
    color: 'text-rose-300',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
  },
  experimental: {
    label: 'Experimental',
    icon: <Ruler className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
    color: 'text-blue-300',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentConcept,
  onSelectConcept,
  favorites,
  completedConcepts,
  isOpen,
  onToggleOpen,
}) => {
  const { isDark, isCyberpunk, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'completed'>('all');

  // Track expanded state for all chapters (default clean & collapsed for easy scanning)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CHAPTERS.forEach((ch) => {
      init[ch.id] = false;
    });
    return init;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = Object.values(expandedChapters).every(Boolean);
    const nextState: Record<string, boolean> = {};
    CHAPTERS.forEach((ch) => {
      nextState[ch.id] = !allExpanded;
    });
    setExpandedChapters(nextState);
  };

  // Keyboard shortcut listener: close mobile sidebar when Escape is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggleOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggleOpen]);

  // Filter concepts based on search, category branch, and status filters
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CHAPTERS.map((chapter) => {
      // Check branch match
      if (selectedCategory !== 'all' && chapter.category !== selectedCategory) {
        return null;
      }

      // Filter concepts in this chapter
      const chapterConcepts = ALL_CONCEPTS.filter((c) => {
        if (c.chapterId !== chapter.id) return false;

        // Status filters
        if (activeFilter === 'saved' && !favorites.includes(c.id)) return false;
        if (activeFilter === 'completed' && !completedConcepts.includes(c.id)) return false;

        // Search text matching
        if (query) {
          const matchTitle = c.title.toLowerCase().includes(query);
          const matchTopic = c.topic.toLowerCase().includes(query);
          const matchSubtitle = c.subtitle.toLowerCase().includes(query);
          const matchChapter = chapter.name.toLowerCase().includes(query);
          const matchFormula = c.formulas.some((f) => f.name.toLowerCase().includes(query));
          return matchTitle || matchTopic || matchSubtitle || matchChapter || matchFormula;
        }

        return true;
      });

      if (chapterConcepts.length === 0) return null;

      return {
        chapter,
        concepts: chapterConcepts,
      };
    }).filter(Boolean) as { chapter: (typeof CHAPTERS)[0]; concepts: PhysicsConcept[] }[];
  }, [searchQuery, selectedCategory, activeFilter, favorites, completedConcepts]);

  const totalMatchingConcepts = useMemo(() => {
    return filteredData.reduce((acc, item) => acc + item.concepts.length, 0);
  }, [filteredData]);

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Sidebar Top Header Bar */}
      <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
        isDark ? 'border-white/[0.08] bg-[#0E0E16]' : 'border-slate-200 bg-slate-100'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-xs sm:text-sm font-bold truncate tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-slate-900'
              }`}>
                Syllabus Navigator
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
                {ALL_CONCEPTS.length}
              </span>
            </div>
            <p className={`text-[10.5px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              JEE Main & Advanced 3D Modules
            </p>
          </div>
        </div>

        {/* Close Button for Drawer & Desktop Collapse */}
        <button
          onClick={onToggleOpen}
          title={isMobile ? "Close Syllabus Drawer" : "Collapse Syllabus Navigation"}
          aria-label="Collapse Navigation"
          className={`p-2 rounded-xl border transition shadow shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center ${
            isDark
              ? 'bg-[#1A1A24] hover:bg-[#242432] text-zinc-400 hover:text-zinc-100 border-white/[0.08]'
              : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
          }`}
        >
          {isMobile ? <X className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. In-Sidebar Search Input Bar */}
      <div className={`p-3 border-b shrink-0 flex flex-col gap-2 ${
        isDark ? 'border-white/[0.06] bg-[#0B0B10]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syllabus, equations..."
            className={`w-full pl-8 pr-7 py-2 rounded-xl border text-xs transition focus:outline-none focus:ring-1 ${
              isDark
                ? 'bg-[#14141E] border-white/[0.08] text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:ring-cyan-500/30'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/30'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Tabs (All, Saved, Done) */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[34px] ${
              activeFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'bg-[#14141E] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'all'
                  ? 'bg-slate-950/25 text-slate-900'
                  : isDark
                  ? 'bg-white/[0.08] text-zinc-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {ALL_CONCEPTS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('saved')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[34px] ${
              activeFilter === 'saved'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'bg-[#14141E] text-zinc-400 hover:text-amber-300 border border-white/[0.05]'
                : 'bg-white text-slate-600 hover:text-amber-600 border border-slate-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current shrink-0 text-amber-500" />
            <span>Saved</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'saved'
                  ? 'bg-slate-950/25 text-slate-900'
                  : isDark
                  ? 'bg-white/[0.08] text-zinc-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[34px] ${
              activeFilter === 'completed'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'bg-[#14141E] text-zinc-400 hover:text-emerald-300 border border-white/[0.05]'
                : 'bg-white text-slate-600 hover:text-emerald-600 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-500" />
            <span>Done</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'completed'
                  ? 'bg-slate-950/25 text-slate-900'
                  : isDark
                  ? 'bg-white/[0.08] text-zinc-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {completedConcepts.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Category / Physics Branch Horizontal Selector */}
      <div className={`px-3 py-2 border-b shrink-0 ${
        isDark ? 'border-white/[0.06] bg-[#0A0A0E]' : 'border-slate-200 bg-slate-50/50'
      }`}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition whitespace-nowrap min-h-[30px] ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200 bg-[#14141E] border border-white/[0.05]'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            All Branches
          </button>
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat.id];
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition flex items-center gap-1.5 whitespace-nowrap min-h-[30px] ${
                  isSelected
                    ? `${config.bg} ${config.color} ${config.border} border shadow-sm font-bold`
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 bg-[#14141E] border border-white/[0.05]'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                {config.icon}
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Action Summary Bar (Count & Expand All Toggle) */}
      <div className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] shrink-0 ${
        isDark ? 'bg-[#09090D] border-white/[0.04] text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Showing {totalMatchingConcepts} {totalMatchingConcepts === 1 ? 'Topic' : 'Topics'}
        </span>
        <button
          onClick={toggleExpandAll}
          className="text-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-300 font-semibold transition flex items-center gap-1 hover:underline min-h-[28px]"
        >
          <ChevronsUpDown className="w-3 h-3" />
          <span>Toggle All</span>
        </button>
      </div>

      {/* 5. Chapters & Concepts Tree List (Scrollable Area) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 flex flex-col gap-2.5 custom-scrollbar">
        {filteredData.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
              isDark ? 'bg-[#14141E] border-white/[0.08] text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>No matching topics found</p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Try searching for another keyword or reset branch filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredData.map(({ chapter, concepts }) => {
            const isExpanded = expandedChapters[chapter.id] ?? false;
            const categoryConfig = CATEGORY_CONFIG[chapter.category];
            const hasCurrentConcept = concepts.some((c) => c.id === currentConcept.id);

            return (
              <div
                key={chapter.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden shrink-0 ${
                  hasCurrentConcept
                    ? isDark
                      ? 'bg-[#12121A] border-cyan-500/40 shadow-md shadow-cyan-950/20'
                      : 'bg-cyan-50/50 border-cyan-400 shadow-sm'
                    : isDark
                    ? 'bg-[#121218] border-white/[0.07] hover:border-white/[0.14]'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Chapter Accordion Header Container */}
                <div
                  className={`w-full p-2.5 sm:p-3 text-left flex items-center justify-between gap-2.5 transition min-h-[44px] shrink-0 ${
                    isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left group"
                    aria-expanded={isExpanded}
                  >
                    {/* Chapter Icon Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                        categoryConfig ? `${categoryConfig.bg} ${categoryConfig.border}` : isDark ? 'bg-[#1A1A26] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {categoryConfig?.icon || <BookOpen className="w-3.5 h-3.5 text-cyan-500" />}
                    </div>

                    {/* Chapter Name & Category */}
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold group-hover:text-cyan-500 transition truncate leading-snug ${
                        isDark ? 'text-zinc-100' : 'text-slate-900'
                      }`}>
                        {chapter.name}
                      </h4>
                      <p className={`text-[10px] truncate leading-none mt-0.5 ${
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        {categoryConfig?.label || 'Physics'}
                      </p>
                    </div>
                  </button>

                  {/* Chapter Right Indicator & Count */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateChapterPdf(chapter.id);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                      title={`Download ${chapter.name} PDF Formula Sheet to Downloads folder`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isDark
                        ? 'bg-[#1A1A24] text-zinc-300 border-white/[0.06]'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {concepts.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      aria-label={`Toggle ${chapter.name}`}
                      className={`p-1 rounded-md transition ${isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Concepts List inside Chapter */}
                {isExpanded && (
                  <div className={`p-2 pt-1 flex flex-col gap-1.5 border-t ${
                    isDark ? 'bg-[#09090E]/90 border-white/[0.05]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    {concepts.map((concept) => {
                      const isSelected = concept.id === currentConcept.id;
                      const isFav = favorites.includes(concept.id);
                      const isDone = completedConcepts.includes(concept.id);

                      return (
                        <button
                          key={`side-${chapter.id}-${concept.id}`}
                          onClick={() => {
                            onSelectConcept(concept);
                            if (isMobile) {
                              onToggleOpen();
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2.5 min-h-[44px] shrink-0 ${
                            isSelected
                              ? isDark
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/15 border border-cyan-500/50 text-cyan-100 shadow-md font-semibold'
                                : 'bg-cyan-100 border border-cyan-400 text-cyan-950 font-semibold shadow-xs'
                              : isDark
                              ? 'bg-[#15151F]/70 hover:bg-[#1C1C28] border border-white/[0.04] hover:border-white/[0.12] text-zinc-300 hover:text-white'
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 shadow-xs'
                          }`}
                        >
                          {/* Left Selection Dot / Indicator */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="shrink-0 flex items-center justify-center">
                              {isSelected ? (
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse shrink-0" />
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-zinc-600' : 'bg-slate-300'}`} />
                              )}
                            </div>

                            {/* Concept Title & Topic */}
                            <div className="min-w-0 flex-1">
                              <span
                                className={`block truncate leading-snug text-xs ${
                                  isSelected
                                    ? isDark ? 'font-bold text-cyan-200' : 'font-bold text-cyan-900'
                                    : isDark ? 'font-medium text-zinc-200' : 'font-medium text-slate-800'
                                }`}
                              >
                                {concept.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                <span className={`text-[10px] truncate max-w-[120px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                  {concept.topic}
                                </span>
                                {concept.badge && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 truncate max-w-[90px] ${
                                    isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
                                  }`}>
                                    {concept.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Status Indicators */}
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {isFav && (
                              <div title="Bookmarked" className="p-0.5">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                              </div>
                            )}
                            {isDone && (
                              <div title="Explored & Completed" className="p-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              </div>
                            )}
                            {isSelected && (
                              <ChevronRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Sidebar Bottom Footer with Theme Toggle */}
      <div className={`p-3 border-t shrink-0 flex flex-col gap-2.5 ${
        isDark ? 'border-white/[0.08] bg-[#0A0A0E] text-zinc-400' : 'border-slate-200 bg-slate-100 text-slate-500'
      }`}>
        {/* Dedicated Theme Toggle Control in Sidebar */}
        <button
          onClick={toggleTheme}
          type="button"
          className={`w-full px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-between shadow-xs ${
            isDark
              ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-400/30'
              : 'bg-white hover:bg-slate-50 text-indigo-900 border-slate-300'
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="flex items-center gap-2">
            {isDark ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span>App Theme: <strong>{isDark ? 'Dark Mode' : 'Light Mode'}</strong></span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
            isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
          }`}>
            Toggle
          </span>
        </button>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span>JEE 3D Physics Lab</span>
          </div>
          <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            Founder: <strong className="text-cyan-600 dark:text-cyan-400">Sanjay.J</strong>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (Visible on screens < lg when isOpen) */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onToggleOpen}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />
            {/* Slide-in Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className={`relative z-10 w-80 max-w-[85vw] h-full flex flex-col backdrop-blur-2xl border-r shadow-2xl select-none ${
                isCyberpunk
                  ? 'bg-[#060D20]/98 border-cyan-500/30 text-zinc-100'
                  : isDark
                  ? 'bg-[#0A0A10]/98 border-white/[0.1] text-zinc-100'
                  : 'bg-slate-50/98 border-slate-200 text-slate-900'
              }`}
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Docked Sidebar */}
      <aside
        className={`hidden lg:flex relative inset-y-0 left-0 z-10 h-full max-h-none flex-col backdrop-blur-2xl border-r transition-all duration-300 ease-in-out shrink-0 select-none ${
          isCyberpunk
            ? 'bg-[#060D20]/95 border-cyan-500/20 text-zinc-100'
            : isDark
            ? 'bg-[#0A0A10]/95 border-white/[0.08] text-zinc-100'
            : 'bg-slate-50/95 border-slate-200 text-slate-900'
        } ${
          isOpen
            ? 'w-80 translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-0 w-0 max-w-0 opacity-0 overflow-hidden pointer-events-none border-r-0'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>
    </>
  );
};
