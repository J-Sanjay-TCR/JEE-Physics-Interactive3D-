import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  BookOpen,
  Atom,
  Sliders,
  ChevronRight,
  Command,
  CornerDownLeft,
  Check,
  Flame,
  Radio,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { PhysicsConcept } from '../../types';
import {
  searchPhysicsConcepts,
  POPULAR_SEARCH_CHIPS,
  SearchMatchResult,
} from '../../utils/physicsSearchIndex';
import { Latex } from './Latex';
import { useTheme } from '../../context/ThemeContext';

interface SmartSearchToolbarProps {
  allConcepts: PhysicsConcept[];
  onSelectConcept: (concept: PhysicsConcept) => void;
  onSetView?: (view: 'home' | 'lab') => void;
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

export const SmartSearchToolbar: React.FC<SmartSearchToolbarProps> = ({
  allConcepts,
  onSelectConcept,
  onSetView,
  isMobileModal = false,
  onCloseMobileModal,
}) => {
  const { isDark, isCyberpunk } = useTheme();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'experiments' | 'formulas' | 'acronyms' | 'class11' | 'class12'
  >('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search Results
  const searchResults: SearchMatchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchPhysicsConcepts(query, allConcepts, categoryFilter);
  }, [query, allConcepts, categoryFilter]);

  // Reset selected index when query or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, categoryFilter]);

  // Global Keyboard Shortcuts (Ctrl+K, Cmd+K, '/')
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox');

      // 'Ctrl+K' or 'Cmd+K' or '/' to focus search
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    if (isMobileModal) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileModal]);

  // Handle Keyboard Navigation (Up/Down arrows, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
      onCloseMobileModal?.();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        scrollSelectedIntoView((selectedIndex + 1) % searchResults.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        scrollSelectedIntoView((selectedIndex - 1 + searchResults.length) % searchResults.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleChooseConcept(searchResults[selectedIndex].concept);
      }
      return;
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-search-item]');
    const targetItem = items[index] as HTMLElement | undefined;
    if (targetItem) {
      targetItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const handleChooseConcept = (concept: PhysicsConcept) => {
    onSelectConcept(concept);
    onSetView?.('lab');
    setIsOpen(false);
    setQuery('');
    onCloseMobileModal?.();
  };

  const handleChipClick = (conceptId: string) => {
    const found = allConcepts.find((c) => c.id === conceptId);
    if (found) {
      handleChooseConcept(found);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isMobileModal ? 'max-w-none' : 'max-w-md xl:max-w-lg'}`}
    >
      {/* Search Input Container */}
      <div
        className={`relative flex items-center transition-all duration-200 rounded-2xl group ${
          isOpen
            ? isCyberpunk
              ? 'ring-2 ring-cyan-400/50 shadow-[0_0_24px_rgba(0,240,255,0.3)] bg-[#040817]'
              : isDark
              ? 'ring-2 ring-cyan-500/40 shadow-lg bg-[#14141E]'
              : 'ring-2 ring-cyan-500/30 shadow-lg bg-white'
            : isCyberpunk
            ? 'bg-[#060B18]/90 border border-cyan-500/25 hover:border-cyan-400/40 shadow-inner'
            : isDark
            ? 'bg-[#121218]/90 border border-white/[0.08] hover:border-white/[0.16]'
            : 'bg-slate-100/90 border border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Glowing Indicator Pulse */}
        <div className="absolute left-3.5 flex items-center justify-center pointer-events-none">
          <Search
            className={`w-4 h-4 transition-colors ${
              isOpen
                ? isCyberpunk
                  ? 'text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]'
                  : 'text-cyan-400'
                : isCyberpunk
                ? 'text-cyan-400/70'
                : isDark
                ? 'text-zinc-400'
                : 'text-slate-400'
            }`}
          />
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search acronyms (YDSE, SHM, LCR), formulas, laws..."
          className={`w-full pl-10 pr-24 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition focus:outline-none bg-transparent ${
            isCyberpunk
              ? 'text-cyan-100 placeholder-zinc-500 font-mono'
              : isDark
              ? 'text-zinc-100 placeholder-zinc-500'
              : 'text-slate-900 placeholder-slate-400'
          }`}
          aria-label="Search physics formulas, experiments, and acronyms"
        />

        {/* Right Action Toolbar inside input */}
        <div className="absolute right-2.5 flex items-center gap-1.5 shrink-0">
          {hasQuery && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.1] transition cursor-pointer"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Keycap Badge */}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-zinc-400 font-semibold select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Floating Results & Acronym Suggestions Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute top-full mt-2.5 left-0 right-0 rounded-2xl border shadow-2xl backdrop-blur-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[540px] ${
              isCyberpunk
                ? 'bg-[#040816]/98 border-cyan-500/40 shadow-[0_12px_45px_rgba(0,0,0,0.85)]'
                : isDark
                ? 'bg-[#0F1017]/98 border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
                : 'bg-white/98 border-slate-200 shadow-2xl'
            }`}
          >
            {/* Top Scanning Line Header Effect */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

            {/* Category Filter Pills */}
            <div className="p-2 sm:px-3 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0 select-none no-scrollbar">
              {[
                { id: 'all', label: 'All Experiments' },
                { id: 'acronyms', label: '⚡ Acronyms' },
                { id: 'formulas', label: '📐 Formulas' },
                { id: 'experiments', label: '🔬 Apparatus' },
                { id: 'class11', label: 'Class 11' },
                { id: 'class12', label: 'Class 12' },
              ].map((cat) => {
                const isActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer font-bold ${
                      isActive
                        ? isCyberpunk
                          ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                          : isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area: Either Zero-State Popular Acronyms or Ranked Search Results */}
            <div ref={listRef} className="overflow-y-auto divide-y divide-white/[0.05] flex-1 p-1.5">
              {!hasQuery ? (
                /* Zero State: Popular JEE Acronym Quick Jumps */
                <div className="p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      Popular JEE Experiment Acronyms & Fast Jumps
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">1-Click Launch</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_SEARCH_CHIPS.map((chip) => {
                      return (
                        <button
                          key={chip.acronym}
                          onClick={() => handleChipClick(chip.conceptId)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between group cursor-pointer ${
                            isCyberpunk
                              ? 'bg-[#060C1D] border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-500/10 shadow-xs'
                              : isDark
                              ? 'bg-[#151622] border-white/[0.06] hover:border-cyan-500/40 hover:bg-cyan-500/10'
                              : 'bg-slate-50 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-black text-cyan-300 group-hover:text-cyan-200 flex items-center gap-1">
                              <span>⚡</span>
                              <span>{chip.acronym}</span>
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 font-mono">
                              {chip.categoryTag}
                            </span>
                          </div>
                          <span className={`text-[11px] truncate font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            {chip.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-2 text-xs text-zinc-400">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      Type any formula symbol like <code className="text-cyan-300 font-mono">lambda</code>, equation like <code className="text-cyan-300 font-mono">v=u+at</code>, or chapter like <code className="text-cyan-300 font-mono">optics</code>.
                    </span>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                /* No Results Empty State */
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-200">
                    No physics experiments found for "{query}"
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Try typing acronyms like <strong className="text-cyan-300 font-mono">YDSE</strong>, <strong className="text-cyan-300 font-mono">SHM</strong>, <strong className="text-cyan-300 font-mono">LCR</strong>, or search by formula like <strong className="text-cyan-300 font-mono">E=mc^2</strong>.
                  </p>
                </div>
              ) : (
                /* Ranked Search Results List */
                searchResults.map((result, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={result.concept.id}
                      data-search-item
                      onClick={() => handleChooseConcept(result.concept)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? isCyberpunk
                            ? 'bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-transparent border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : isDark
                            ? 'bg-cyan-500/15 border border-cyan-500/30'
                            : 'bg-cyan-50 border border-cyan-200'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      {/* Left Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Title */}
                          <span
                            className={`text-xs sm:text-sm font-bold transition truncate ${
                              isSelected
                                ? 'text-white'
                                : isDark
                                ? 'text-zinc-100'
                                : 'text-slate-900'
                            }`}
                          >
                            {result.concept.title}
                          </span>

                          {/* Acronym Badge */}
                          {result.matchedAcronym && (
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                              ⚡ {result.matchedAcronym}
                            </span>
                          )}

                          {/* Class / Topic Badge */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                            {result.concept.topic}
                          </span>
                        </div>

                        {/* Match Reasons Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono mb-1.5">
                          {result.matchReasons.slice(0, 2).map((reason, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>

                        {/* KaTeX Formula Preview */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-cyan-200 font-serif">
                          <Latex math={result.primaryFormulaLatex} />
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl border transition ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-black border-cyan-300 shadow-[0_0_12px_#00f0ff]'
                              : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] group-hover:text-cyan-300 group-hover:border-cyan-400/40'
                          }`}
                        >
                          <span>Enter 3D Lab</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard Hint Footer */}
            <div className="px-3 sm:px-4 py-2 border-t border-white/[0.06] bg-[#02050E]/80 flex items-center justify-between text-[10px] font-mono text-zinc-400 select-none shrink-0">
              <div className="flex items-center gap-2">
                <span>
                  Matches: <strong className="text-cyan-300">{searchResults.length}</strong> experiments
                </span>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <span className="hidden sm:inline">31 Full 3D Labs</span>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 rounded bg-white/[0.08] text-zinc-300">↑</kbd>
                  <kbd className="px-1 py-0.2 rounded bg-white/[0.08] text-zinc-300">↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 rounded bg-white/[0.08] text-zinc-300">↵</kbd> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 rounded bg-white/[0.08] text-zinc-300">esc</kbd> close
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
