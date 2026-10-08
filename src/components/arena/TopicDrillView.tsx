import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Filter,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Search,
  RefreshCw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { JeeQuestion, JeeEra } from '../../types/arena';
import { QuestionCard } from './QuestionCard';
import { CHAPTERS } from '../../data/allConcepts';
import { loadSavedQuestionIds } from '../../utils/arenaProgress';

interface TopicDrillViewProps {
  questions: JeeQuestion[];
  onAskAiTutor?: (questionText: string, context: string) => void;
  onAddQuestions?: (newQuestions: JeeQuestion[]) => void;
  selectedChapter?: string;
  onSelectChapter?: (ch: string) => void;
}

export const TopicDrillView: React.FC<TopicDrillViewProps> = ({
  questions,
  onAskAiTutor,
  onAddQuestions,
  selectedChapter: propSelectedChapter,
  onSelectChapter: propOnSelectChapter,
}) => {
  const [selectedEra, setSelectedEra] = useState<JeeEra>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [internalChapter, setInternalChapter] = useState<string>('all');
  const selectedChapter = propSelectedChapter !== undefined ? propSelectedChapter : internalChapter;
  const setSelectedChapter = (ch: string) => {
    setInternalChapter(ch);
    propOnSelectChapter?.(ch);
  };
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => loadSavedQuestionIds());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Pagination for lightweight mobile rendering
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 6;

  // Reset to first page on any filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedEra,
    selectedYear,
    selectedShift,
    selectedChapter,
    selectedExam,
    selectedDifficulty,
    searchQuery,
    showOnlySaved,
  ]);

  // Sync saved question bookmarks
  useEffect(() => {
    const handleSavedUpdated = () => {
      setSavedIds(loadSavedQuestionIds());
    };
    window.addEventListener('jee_arena_saved_updated', handleSavedUpdated);
    window.addEventListener('storage', handleSavedUpdated);
    return () => {
      window.removeEventListener('jee_arena_saved_updated', handleSavedUpdated);
      window.removeEventListener('storage', handleSavedUpdated);
    };
  }, []);

  // Compute available shifts for selected year
  const availableShifts = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (selectedYear === 'all' || String(q.year) === selectedYear) {
        if (q.sessionOrPaper) set.add(q.sessionOrPaper);
      }
    });
    return Array.from(set).sort();
  }, [questions, selectedYear]);

  // Available Years
  const availableYears = [
    '2026',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
    '2015',
  ];

  // Filtering Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Era filter
      if (selectedEra === 'recent' && q.year < 2022) return false;
      if (selectedEra === 'classic' && (q.year < 2015 || q.year > 2021)) return false;

      // Year filter
      if (selectedYear !== 'all' && q.year !== parseInt(selectedYear, 10)) return false;

      // Chapter filter
      if (selectedChapter !== 'all' && q.chapterId !== selectedChapter) return false;

      // Exam filter
      if (selectedExam !== 'all' && q.exam !== selectedExam) return false;

      // Shift / Session filter
      if (selectedShift !== 'all' && q.sessionOrPaper !== selectedShift) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;

      // Saved / Bookmarked filter
      if (showOnlySaved && !savedIds.includes(q.id)) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesChapter = q.chapterTitle.toLowerCase().includes(query);
        const matchesYear = String(q.year).includes(query);
        const matchesShift = (q.sessionOrPaper || '').toLowerCase().includes(query);
        if (!matchesStatement && !matchesTopic && !matchesChapter && !matchesYear && !matchesShift) return false;
      }

      return true;
    });
  }, [
    questions,
    selectedEra,
    selectedYear,
    selectedShift,
    selectedChapter,
    selectedExam,
    selectedDifficulty,
    searchQuery,
    showOnlySaved,
    savedIds,
  ]);

  // Derived pagination variables
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const start = (validCurrentPage - 1) * QUESTIONS_PER_PAGE;
    return filteredQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [filteredQuestions, validCurrentPage]);

  // Dynamic Generator via Server Gemini 3.8
  const handleGenerateAiQuestions = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const activeChapterObj = CHAPTERS.find((c) => c.id === selectedChapter);
      const res = await fetch('/api/jee/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: activeChapterObj ? activeChapterObj.name : 'Mechanics & Rotational Dynamics',
          chapterId: selectedChapter !== 'all' ? selectedChapter : 'rotational-motion',
          exam: selectedExam !== 'all' ? selectedExam : 'JEE Advanced',
          year: selectedYear !== 'all' ? selectedYear : '2025',
          era: selectedEra,
          count: 3,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch from generator endpoint');
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        onAddQuestions?.(data.questions);
      } else {
        setGenerateError('All official bank questions loaded for this filter.');
      }
    } catch (err: any) {
      console.warn('AI question generator error:', err);
      setGenerateError('Could not reach remote question generator; showing verified local database.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering Control Bar */}
      <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
        {/* Era Segmented Selector (Recent 2022-2026 vs Classic 2015-2021) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            <button
              onClick={() => {
                setSelectedEra('all');
                setSelectedYear('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedEra === 'all'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Eras (2015–2026)
            </button>
            <button
              onClick={() => {
                setSelectedEra('recent');
                if (selectedYear !== 'all' && parseInt(selectedYear, 10) < 2022) {
                  setSelectedYear('all');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedEra === 'recent'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚡ Recent Era (2022–2026)
            </button>
            <button
              onClick={() => {
                setSelectedEra('classic');
                if (selectedYear !== 'all' && parseInt(selectedYear, 10) >= 2022) {
                  setSelectedYear('all');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedEra === 'classic'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🏛️ Classic Era (2015–2021)
            </button>

            {/* Bookmarked / Saved Only Filter Toggle */}
            <button
              onClick={() => setShowOnlySaved(!showOnlySaved)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showOnlySaved
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
              title="Filter to show only your saved/bookmarked questions"
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-slate-950' : 'fill-amber-400/30 text-amber-400'}`} />
              <span>Saved Only {savedIds.length > 0 ? `(${savedIds.length})` : ''}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic, formula, or concept..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.1] focus:border-cyan-400 text-xs text-white placeholder:text-zinc-500 outline-none transition"
            />
          </div>
        </div>

        {/* Detailed Secondary Filters: Chapter, Specific Year, Shift, Exam, Difficulty */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Chapter Selector */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Chapter</span>
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-cyan-400 font-mono text-xs"
            >
              <option value="all">All {CHAPTERS.length} Chapters</option>
              {CHAPTERS.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Year Selector (2015 - 2026) */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>Specific Year</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedShift('all');
              }}
              className="w-full bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-cyan-400 font-mono text-xs"
            >
              <option value="all">All Years (2015–2026)</option>
              {availableYears
                .filter((yr) => {
                  const yNum = parseInt(yr, 10);
                  if (selectedEra === 'recent') return yNum >= 2022;
                  if (selectedEra === 'classic') return yNum <= 2021;
                  return true;
                })
                .map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
            </select>
          </div>

          {/* Specific Shift / Session Selector */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Shift / Paper</span>
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-cyan-400 font-mono text-xs"
            >
              <option value="all">All Shifts ({availableShifts.length})</option>
              {availableShifts.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Level Filter */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Exam Level</span>
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-cyan-400 font-mono text-xs"
            >
              <option value="all">All Exams (Main & Adv)</option>
              <option value="JEE Main">JEE Main</option>
              <option value="JEE Advanced">JEE Advanced</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>Difficulty</span>
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-cyan-400 font-mono text-xs"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Advanced">Advanced (Multi-Concept)</option>
            </select>
          </div>
        </div>

        {/* Results Counter & AI Dynamic Generator Button */}
        <div className="flex items-center justify-between pt-2 text-xs font-mono text-zinc-400">
          <div>
            Showing <span className="text-cyan-300 font-bold">{filteredQuestions.length}</span> authentic questions
            {selectedYear !== 'all' ? ` for year ${selectedYear}` : ''}
            {selectedEra !== 'all' ? ` (${selectedEra === 'recent' ? '2022–2026' : '2015–2021'})` : ''}
          </div>

          <button
            onClick={handleGenerateAiQuestions}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-semibold text-xs transition cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.15)] disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Shifts...' : 'Fetch More Shifts with AI'}</span>
          </button>
        </div>

        {generateError && (
          <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
            {generateError}
          </div>
        )}
      </div>

      {/* Question Cards Feed */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-12 text-center text-zinc-400 font-mono space-y-3">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-200">No Questions Found Matching Filter</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Try resetting the Era, Year, or Chapter filter, or click "Fetch More Shifts with AI" to generate fresh verified problems.
          </p>
          <button
            onClick={() => {
              setSelectedEra('all');
              setSelectedYear('all');
              setSelectedChapter('all');
              setSelectedExam('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-bold hover:bg-cyan-500/25 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div id="drill-feed-top" />
          {paginatedQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={(validCurrentPage - 1) * QUESTIONS_PER_PAGE + idx}
              onAskAiTutor={onAskAiTutor}
              showSolutionImmediate={true}
            />
          ))}

          {/* Responsive Mobile-Friendly Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b0e1d]/85 border border-white/[0.08] font-mono text-xs shadow-xl backdrop-blur-md">
              <span className="text-zinc-400">
                Showing{' '}
                <strong className="text-white">
                  {(validCurrentPage - 1) * QUESTIONS_PER_PAGE + 1}
                </strong>
                –
                <strong className="text-white">
                  {Math.min(validCurrentPage * QUESTIONS_PER_PAGE, filteredQuestions.length)}
                </strong>{' '}
                of <strong className="text-cyan-300">{filteredQuestions.length}</strong> questions
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    const feedEl = document.getElementById('drill-feed-top');
                    if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={validCurrentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.1] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - validCurrentPage) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-zinc-600">...</span>}
                        <button
                          onClick={() => {
                            setCurrentPage(p);
                            const feedEl = document.getElementById('drill-feed-top');
                            if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center ${
                            validCurrentPage === p
                              ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                              : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    const feedEl = document.getElementById('drill-feed-top');
                    if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={validCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.1] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
