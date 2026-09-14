import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsConcept, CategoryId } from '../../types';
import { CHAPTERS, CATEGORIES, ALL_CONCEPTS, isClass11Chapter, isClass12Chapter } from '../../data/allConcepts';
import { getHomePageSections, getLabPageSections, PageSectionItem } from '../../data/navigationRegistry';
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
  FileText,
  Sliders,
  Box,
  Layers,
  ArrowRight,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentConcept: PhysicsConcept;
  onSelectConcept: (concept: PhysicsConcept) => void;
  favorites: string[];
  completedConcepts: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenAnalytics?: () => void;
  currentView?: 'home' | 'lab';
  onSetView?: (view: 'home' | 'lab') => void;
  activeTab?: string;
  onSetActiveTab?: (tab: 'controls' | 'coaching' | 'graphs' | 'equations' | 'jee' | 'questions') => void;
  activeSectionId?: string;
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
  onOpenAnalytics,
  currentView = 'lab',
  onSetView,
  activeTab = 'controls',
  onSetActiveTab,
  activeSectionId = '',
}) => {
  const { isDark, isCyberpunk, toggleTheme } = useTheme();
  const [navMode, setNavMode] = useState<'sections' | 'syllabus'>('syllabus');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<'all' | 'class-11' | 'class-12'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'completed'>('all');

  const totalCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CHAPTERS.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = CHAPTERS.filter((ch) => ch.category === cat.id).length;
    });
    return counts;
  }, []);

  const handleToggleCategory = (catId: CategoryId | 'all') => {
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catId);
      if (catId !== 'all') {
        setExpandedChapters((prev) => {
          const next = { ...prev };
          CHAPTERS.forEach((ch) => {
            if (ch.category === catId) {
              next[ch.id] = true;
            }
          });
          return next;
        });

        if (selectedClass !== 'all') {
          const chaptersInClass = CHAPTERS.filter((ch) => {
            if (ch.category !== catId) return false;
            return selectedClass === 'class-11' ? isClass11Chapter(ch.id) : isClass12Chapter(ch.id);
          });
          if (chaptersInClass.length === 0) {
            setSelectedClass('all');
          }
        }
      }
    }
  };

  const handleToggleClass = (classId: 'all' | 'class-11' | 'class-12') => {
    const nextClass = selectedClass === classId && classId !== 'all' ? 'all' : classId;
    setSelectedClass(nextClass);
    if (selectedCategory !== 'all' && nextClass !== 'all') {
      const chaptersInCat = CHAPTERS.filter((ch) => {
        if (ch.category !== selectedCategory) return false;
        return nextClass === 'class-11' ? isClass11Chapter(ch.id) : isClass12Chapter(ch.id);
      });
      if (chaptersInCat.length === 0) {
        setSelectedCategory('all');
      }
    }
  };

  // Track expanded state for all chapters
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CHAPTERS.forEach((ch) => {
      init[ch.id] = false;
    });
    // Default expand active concept's chapter
    if (currentConcept && currentConcept.chapterId) {
      init[currentConcept.chapterId] = true;
    }
    return init;
  });

  // Ensure active concept's chapter is expanded when concept changes
  useEffect(() => {
    if (currentConcept && currentConcept.chapterId) {
      setExpandedChapters((prev) => ({
        ...prev,
        [currentConcept.chapterId]: true,
      }));
    }
  }, [currentConcept]);

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

  // Dynamically compute sections for the current page
  const currentSections: PageSectionItem[] = useMemo(() => {
    if (currentView === 'home') {
      return getHomePageSections();
    }
    return getLabPageSections(currentConcept);
  }, [currentView, currentConcept]);

  // Filter concepts based on search, category branch, and status filters
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CHAPTERS.map((chapter) => {
      // Check branch match
      if (selectedCategory !== 'all' && chapter.category !== selectedCategory) {
        return null;
      }

      // Check class portion match
      if (selectedClass === 'class-11' && !isClass11Chapter(chapter.id)) {
        return null;
      }
      if (selectedClass === 'class-12' && !isClass12Chapter(chapter.id)) {
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
          const matchSubtitle = (c.subtitle || '').toLowerCase().includes(query);
          const matchChapter = chapter.name.toLowerCase().includes(query);
          const matchFormula = (c.formulas || []).some((f) => f.name.toLowerCase().includes(query));
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
  }, [searchQuery, selectedCategory, selectedClass, activeFilter, favorites, completedConcepts]);

  const totalMatchingConcepts = useMemo(() => {
    return filteredData.reduce((acc, item) => acc + item.concepts.length, 0);
  }, [filteredData]);

  // Smooth scroll helper
  const scrollToSection = (sectionId: string, tabKey?: string, isMobile = false) => {
    if (tabKey && onSetActiveTab) {
      onSetActiveTab(tabKey as any);
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);

    if (isMobile) {
      onToggleOpen();
    }
  };

  const renderSectionIcon = (iconType: PageSectionItem['iconType']) => {
    switch (iconType) {
      case 'hero':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      case 'flagship':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'chapter':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'founder':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'header':
        return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
      case 'viewport':
        return <Atom className="w-3.5 h-3.5 text-teal-400" />;
      case 'controls':
        return <Sliders className="w-3.5 h-3.5 text-cyan-400" />;
      case 'coaching':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'graphs':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'equations':
        return <Ruler className="w-3.5 h-3.5 text-amber-400" />;
      case 'jee':
        return <Star className="w-3.5 h-3.5 text-rose-400" />;
      case 'questions':
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'roadmap':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Atom className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Sidebar Top Header Bar */}
      <div
        className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'border-white/[0.08] bg-[#0E0E16]' : 'border-slate-200 bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`text-xs sm:text-sm font-bold truncate tracking-tight ${
                  isDark ? 'text-zinc-100' : 'text-slate-900'
                }`}
              >
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
          title={isMobile ? 'Close Syllabus Drawer' : 'Collapse Syllabus Navigation'}
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

      {/* 2. Mode Switcher: Page Sections vs Full Syllabus Tree */}
      <div
        className={`p-2 border-b shrink-0 flex items-center gap-1.5 ${
          isDark ? 'bg-[#0A0A10] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <button
          onClick={() => setNavMode('sections')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[38px] ${
            navMode === 'sections'
              ? isCyberpunk
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : isDark
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'bg-white text-cyan-900 border border-cyan-300 shadow-sm'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Page Sections</span>
          {activeSectionId && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          )}
        </button>

        <button
          onClick={() => setNavMode('syllabus')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[38px] ${
            navMode === 'syllabus'
              ? isCyberpunk
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : isDark
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'bg-white text-cyan-900 border border-cyan-300 shadow-sm'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">All Chapters</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              isDark ? 'bg-white/[0.08] text-zinc-300' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {ALL_CONCEPTS.length}
          </span>
        </button>
      </div>

      {/* 3. Conditional Content based on Nav Mode */}
      {navMode === 'sections' ? (
        /* Dynamic Page Sections List (Synchronized with active content) */
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 flex flex-col gap-2 custom-scrollbar">
          <div
            className={`px-2 py-1 text-[11px] font-semibold flex items-center justify-between shrink-0 ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            <span className="truncate">
              {currentView === 'home' ? 'Home Page Structure' : `Lab: ${currentConcept.title}`}
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-500 shrink-0">
              {currentSections.length} Sections
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {currentSections.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id, section.tabKey, isMobile)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 min-h-[44px] group shrink-0 ${
                    isActive
                      ? isCyberpunk
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] text-cyan-100'
                        : isDark
                        ? 'bg-cyan-500/15 border border-cyan-500/40 shadow-sm text-cyan-100'
                        : 'bg-cyan-100 border border-cyan-400 text-cyan-950 shadow-xs'
                      : isDark
                      ? 'bg-[#12121A] hover:bg-[#1A1A24] border border-white/[0.05] text-zinc-300 hover:text-white'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isActive
                          ? isDark
                            ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-300'
                            : 'bg-cyan-200 border-cyan-400 text-cyan-900'
                          : isDark
                          ? 'bg-white/[0.04] border-white/[0.06] text-zinc-400 group-hover:text-cyan-400'
                          : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:text-cyan-700'
                      }`}
                    >
                      {renderSectionIcon(section.iconType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`block text-xs font-bold truncate ${
                          isActive
                            ? isDark
                              ? 'text-cyan-200'
                              : 'text-cyan-950'
                            : isDark
                            ? 'text-zinc-200'
                            : 'text-slate-800'
                        }`}
                      >
                        {section.title}
                      </span>
                      {section.subtitle && (
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isDark ? 'text-zinc-400' : 'text-slate-500'
                          }`}
                        >
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {section.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                          isActive
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                              : 'bg-cyan-200 text-cyan-900 border-cyan-300'
                            : isDark
                            ? 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {section.badge}
                      </span>
                    )}
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full Syllabus Chapters & Concepts Tree Hierarchy */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search Input Bar */}
          <div
            className={`p-3 border-b shrink-0 flex flex-col gap-2 ${
              isDark ? 'border-white/[0.06] bg-[#0B0B10]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, ragdoll, laws..."
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

            {/* Class Portion Toggle Buttons (All / Class 11 / Class 12) */}
            <div className="flex items-center gap-1 pt-2">
              <button
                onClick={() => handleToggleClass('all')}
                className={`flex-1 py-1 px-1 rounded-md text-[10px] font-bold transition text-center min-h-[26px] ${
                  selectedClass === 'all'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-xs'
                    : isDark
                    ? 'bg-[#14141E] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                All (21)
              </button>
              <button
                onClick={() => handleToggleClass('class-11')}
                className={`flex-1 py-1 px-1 rounded-md text-[10px] font-bold transition text-center min-h-[26px] ${
                  selectedClass === 'class-11'
                    ? 'bg-blue-500/25 text-blue-400 border border-blue-400/50 shadow-xs'
                    : isDark
                    ? 'bg-[#14141E] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Class 11 (14)
              </button>
              <button
                onClick={() => handleToggleClass('class-12')}
                className={`flex-1 py-1 px-1 rounded-md text-[10px] font-bold transition text-center min-h-[26px] ${
                  selectedClass === 'class-12'
                    ? 'bg-purple-500/25 text-purple-400 border border-purple-400/50 shadow-xs'
                    : isDark
                    ? 'bg-[#14141E] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Class 12 (7)
              </button>
            </div>
          </div>

          {/* Category / Physics Branch Horizontal Selector */}
          <div
            className={`px-3 py-2 border-b shrink-0 ${
              isDark ? 'border-white/[0.06] bg-[#0A0A0E]' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => handleToggleCategory('all')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition whitespace-nowrap min-h-[30px] flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 bg-[#14141E] border border-white/[0.05]'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                <span>All Branches</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500/30 text-cyan-200'
                    : isDark
                    ? 'bg-white/10 text-zinc-400'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {CHAPTERS.length}
                </span>
              </button>
              {CATEGORIES.map((cat) => {
                const config = CATEGORY_CONFIG[cat.id];
                if (!config) return null;
                const isSelected = selectedCategory === cat.id;
                const count = totalCategoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
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
                    <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/20 text-current'
                        : isDark
                        ? 'bg-white/10 text-zinc-400'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Summary Bar (Count & Expand All Toggle) */}
          <div
            className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] shrink-0 ${
              isDark ? 'bg-[#09090D] border-white/[0.04] text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
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

          {/* Chapters & Concepts Tree List (Scrollable Area) */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 flex flex-col gap-2.5 custom-scrollbar">
            {filteredData.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                    isDark ? 'bg-[#14141E] border-white/[0.08] text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <Filter className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                    No matching topics found
                  </p>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Try searching for another keyword or reset branch filters.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedClass('all');
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
                        onClick={() => {
                          if (currentView === 'home') {
                            const el = document.getElementById(`chapter-section-${chapter.id}`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              if (isMobile) onToggleOpen();
                              return;
                            }
                          }
                          toggleChapter(chapter.id);
                        }}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left group"
                        aria-expanded={isExpanded}
                      >
                        <div className="shrink-0">{categoryConfig?.icon}</div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-xs font-bold group-hover:text-cyan-500 transition ${
                              isDark ? 'text-zinc-100' : 'text-slate-900'
                            }`}
                          >
                            {chapter.name}
                          </span>
                          <span className={`text-[10.5px] block truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {categoryConfig?.label} • {concepts.length} {concepts.length === 1 ? 'Topic' : 'Topics'}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick PDF button for this chapter */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            try {
                              generateChapterPdf(chapter.id);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className={`p-1.5 rounded-lg border transition ${
                            isDark
                              ? 'bg-white/[0.04] hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border-white/[0.06]'
                              : 'bg-slate-100 hover:bg-cyan-100 text-slate-500 hover:text-cyan-800 border-slate-200'
                          }`}
                          title={`Download ${chapter.name} PDF formula cheatsheet`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChapter(chapter.id)}
                          className={`p-1 rounded-md transition ${
                            isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Concepts List inside Chapter */}
                    {isExpanded && (
                      <div
                        className={`p-2 pt-1 flex flex-col gap-1.5 border-t ${
                          isDark ? 'bg-[#09090E]/90 border-white/[0.05]' : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        {concepts.map((concept) => {
                          const isSelected = concept.id === currentConcept.id;
                          const isFav = favorites.includes(concept.id);
                          const isDone = completedConcepts.includes(concept.id);

                          return (
                            <button
                              key={`side-${chapter.id}-${concept.id}`}
                              onClick={() => {
                                onSelectConcept(concept);
                                if (currentView !== 'lab') {
                                  onSetView?.('lab');
                                }
                                setTimeout(() => {
                                  const el = document.getElementById('section-top');
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 50);
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
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        isDark ? 'bg-zinc-600' : 'bg-slate-300'
                                      }`}
                                    />
                                  )}
                                </div>

                                {/* Concept Title & Topic */}
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={`block truncate leading-snug text-xs ${
                                      isSelected
                                        ? isDark
                                          ? 'font-bold text-cyan-200'
                                          : 'font-bold text-cyan-900'
                                        : isDark
                                        ? 'font-medium text-zinc-200'
                                        : 'font-medium text-slate-800'
                                    }`}
                                  >
                                    {concept.title}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                    <span
                                      className={`text-[10px] truncate max-w-[120px] ${
                                        isDark ? 'text-zinc-400' : 'text-slate-500'
                                      }`}
                                    >
                                      {concept.topic}
                                    </span>
                                    {concept.badge && (
                                      <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 truncate max-w-[90px] ${
                                          isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
                                        }`}
                                      >
                                        {concept.badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badges */}
                              <div className="flex items-center gap-1 shrink-0">
                                {isFav && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                                {isDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
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
        </div>
      )}

      {/* 4. Sidebar Bottom Sticky Footer Bar */}
      <div
        className={`p-3 sm:p-3.5 border-t shrink-0 flex flex-col gap-2.5 ${
          isDark ? 'border-white/[0.08] bg-[#0E0E14]' : 'border-slate-200 bg-slate-100'
        }`}
      >
        {/* Switch to Home / Lab Quick Action */}
        {currentView === 'lab' ? (
          <button
            onClick={() => {
              onSetView?.('home');
              if (isMobile) onToggleOpen();
            }}
            className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-2 min-h-[38px]"
          >
            <Compass className="w-4 h-4 text-cyan-500" />
            <span>Return to Home Dashboard</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onSetView?.('lab');
              if (isMobile) onToggleOpen();
            }}
            className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-2 min-h-[38px]"
          >
            <Atom className="w-4 h-4 text-cyan-500" />
            <span>Launch 3D Lab Studio</span>
          </button>
        )}

        {/* Global Dark/Light/Cyberpunk Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[38px] ${
            isCyberpunk
              ? 'bg-[#060D20] text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : isDark
              ? 'bg-[#15151F] hover:bg-[#1E1E2C] text-zinc-300 border-white/[0.06]'
              : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCyberpunk ? (
              <Zap className="w-4 h-4 text-cyan-400" />
            ) : isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
            <span>
              Theme: <strong>{isCyberpunk ? 'Cyberpunk' : isDark ? 'Dark Mode' : 'Light Mode'}</strong>
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              isDark
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}
          >
            Toggle
          </span>
        </button>

        {/* Elevated Founded by Sanjay Cyber Badge */}
        <div
          onClick={() => {
            if (currentView !== 'home' && onSetView) {
              onSetView('home');
            }
            setTimeout(() => {
              const el = document.getElementById('home-founder-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            if (isMobile) {
              onToggleOpen();
            }
          }}
          className={`relative overflow-hidden p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer group select-none ${
            isCyberpunk
              ? 'bg-gradient-to-r from-cyan-950/50 via-[#071126] to-indigo-950/50 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.18)] hover:shadow-[0_0_24px_rgba(0,240,255,0.35)]'
              : isDark
              ? 'bg-gradient-to-r from-cyan-950/40 via-[#0D101A] to-indigo-950/40 border-cyan-500/25 hover:border-cyan-400/50 shadow-md hover:shadow-cyan-900/20'
              : 'bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-cyan-200 hover:border-cyan-400 shadow-xs'
          }`}
          title="Click to view Founder's Mission & Architecture"
        >
          {/* Subtle Cyber scanline sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          <div className="relative flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/30 group-hover:ring-cyan-300 transition-all">
                  SJ
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black truncate transition-colors ${
                    isCyberpunk
                      ? 'text-cyan-200 group-hover:text-cyan-300'
                      : isDark
                      ? 'text-white group-hover:text-cyan-300'
                      : 'text-slate-900 group-hover:text-cyan-700'
                  }`}>
                    Sanjay.J
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Founder
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span>Chief Physics Architect</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border flex items-center gap-1 transition-all ${
                isCyberpunk
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 group-hover:bg-cyan-400 group-hover:text-slate-950 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : isDark
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950'
                  : 'bg-cyan-100 text-cyan-800 border-cyan-300 group-hover:bg-cyan-600 group-hover:text-white'
              }`}>
                <span>Hub</span>
                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
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
