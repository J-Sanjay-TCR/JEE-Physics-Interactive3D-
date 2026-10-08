import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark,
  Trash2,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { JeeQuestion } from '../../types/arena';
import { QuestionCard } from './QuestionCard';
import {
  loadSavedQuestionIds,
  clearAllSavedQuestionIds,
} from '../../utils/arenaProgress';

interface SavedQuestionsViewProps {
  questions: JeeQuestion[];
  onAskAiTutor?: (questionText: string, context: string) => void;
  onSwitchToDrill: () => void;
  onLaunchMockWithQuestions?: (questions: JeeQuestion[]) => void;
}

export const SavedQuestionsView: React.FC<SavedQuestionsViewProps> = ({
  questions,
  onAskAiTutor,
  onSwitchToDrill,
  onLaunchMockWithQuestions,
}) => {
  const [savedIds, setSavedIds] = useState<string[]>(loadSavedQuestionIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const SAVED_PER_PAGE = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChapter, selectedDifficulty, searchQuery]);

  // Synchronize saved questions on update events
  useEffect(() => {
    const handleUpdate = () => {
      setSavedIds(loadSavedQuestionIds());
    };
    window.addEventListener('jee_arena_saved_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('jee_arena_saved_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter questions that are saved
  const savedQuestions = useMemo(() => {
    const idSet = new Set(savedIds);
    return questions.filter((q) => idSet.has(q.id));
  }, [questions, savedIds]);

  // Derived filter options based on the user's saved collection
  const availableChapters = useMemo(() => {
    const map = new Map<string, string>();
    savedQuestions.forEach((q) => {
      map.set(q.chapterId, q.chapterTitle);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [savedQuestions]);

  const difficultyCounts = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0, Advanced: 0 };
    savedQuestions.forEach((q) => {
      if (q.difficulty in counts) {
        counts[q.difficulty as keyof typeof counts]++;
      }
    });
    return counts;
  }, [savedQuestions]);

  // Filtered list based on search and filters
  const filteredSavedQuestions = useMemo(() => {
    return savedQuestions.filter((q) => {
      // Chapter filter
      if (selectedChapter !== 'all' && q.chapterId !== selectedChapter) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesChapter = q.chapterTitle.toLowerCase().includes(query);
        const matchesConcept = q.keyConcept.toLowerCase().includes(query);
        return matchesStatement || matchesTopic || matchesChapter || matchesConcept;
      }
      return true;
    });
  }, [savedQuestions, selectedChapter, selectedDifficulty, searchQuery]);

  const totalSavedPages = Math.max(1, Math.ceil(filteredSavedQuestions.length / SAVED_PER_PAGE));
  const validSavedPage = Math.min(currentPage, totalSavedPages);
  const paginatedSavedQuestions = useMemo(() => {
    const start = (validSavedPage - 1) * SAVED_PER_PAGE;
    return filteredSavedQuestions.slice(start, start + SAVED_PER_PAGE);
  }, [filteredSavedQuestions, validSavedPage]);

  const handleClearAll = () => {
    clearAllSavedQuestionIds();
    setSavedIds([]);
    setShowClearConfirm(false);
  };

  // 1. Empty State
  if (savedQuestions.length === 0) {
    return (
      <div className="w-full bg-[#0b0e1d]/90 rounded-3xl border border-white/[0.08] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Bookmark className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              No Saved Questions Yet
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              While solving problems in the <strong>Topic-Wise Drill</strong>, click the bookmark ribbon in the top right of any question card to save tricky problems for quick revision before exams.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSwitchToDrill}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Questions in Topic Drill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Populated Saved Collection View
  return (
    <div className="space-y-6">
      {/* Collection Overview Card */}
      <div className="bg-[#0b0e1d]/90 rounded-3xl border border-white/[0.08] p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Personal Revision Vault
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 font-mono text-[10px] font-bold">
                {savedQuestions.length} Questions Saved
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Saved Questions Collection
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Review and drill your curated set of high-priority JEE Main and Advanced questions. Re-evaluate solutions and study calculus steps at your own pace.
            </p>
          </div>

          {/* Quick Collection Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onLaunchMockWithQuestions && savedQuestions.length >= 3 && (
              <button
                onClick={() => onLaunchMockWithQuestions(savedQuestions)}
                className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-lg"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Practice in Timed Mock</span>
              </button>
            )}

            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Remove all saved questions"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Collection</span>
            </button>
          </div>
        </div>

        {/* Collection Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[11px] text-zinc-400 block mb-1">Easy Questions</span>
            <span className="text-base font-bold text-emerald-400">{difficultyCounts.Easy}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[11px] text-zinc-400 block mb-1">Medium Questions</span>
            <span className="text-base font-bold text-cyan-400">{difficultyCounts.Medium}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[11px] text-zinc-400 block mb-1">Hard Questions</span>
            <span className="text-base font-bold text-amber-400">{difficultyCounts.Hard}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[11px] text-zinc-400 block mb-1">Advanced Questions</span>
            <span className="text-base font-bold text-purple-300">{difficultyCounts.Advanced}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Collection */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0e1122] rounded-2xl border border-white/[0.1] p-6 max-w-sm w-full space-y-4 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear All Saved Questions?</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  This will remove all {savedQuestions.length} bookmarked questions from your revision vault. You can re-save questions at any time.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 font-mono text-xs cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-bold cursor-pointer transition shadow-lg shadow-rose-500/20"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in saved questions..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.1] focus:border-amber-400 text-xs text-white placeholder:text-zinc-500 outline-none transition"
            />
          </div>

          {(searchQuery || selectedChapter !== 'all' || selectedDifficulty !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedChapter('all');
                setSelectedDifficulty('all');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer flex items-center gap-1"
              title="Reset filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Chapter Filter */}
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-amber-400 text-xs"
          >
            <option value="all">All Chapters ({availableChapters.length})</option>
            {availableChapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#12162a] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none focus:border-amber-400 text-xs"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
          <span>
            Showing <strong className="text-amber-300">{filteredSavedQuestions.length}</strong> of {savedQuestions.length} saved questions
          </span>
          <button
            onClick={onSwitchToDrill}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Full Bank</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {filteredSavedQuestions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/40 border border-white/[0.08] text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-zinc-500 mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">
              No saved questions match your current search/filter criteria.
            </p>
          </div>
        ) : (
          <>
            {paginatedSavedQuestions.map((q, idx) => (
              <div key={q.id} className="relative">
                <QuestionCard
                  question={q}
                  index={(validSavedPage - 1) * SAVED_PER_PAGE + idx}
                  onAskAiTutor={onAskAiTutor}
                  showSolutionImmediate={true}
                />
              </div>
            ))}

            {/* Pagination Controls */}
            {totalSavedPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b0e1d]/85 border border-white/[0.08] font-mono text-xs shadow-xl backdrop-blur-md">
                <span className="text-zinc-400">
                  Showing{' '}
                  <strong className="text-white">
                    {(validSavedPage - 1) * SAVED_PER_PAGE + 1}
                  </strong>
                  –
                  <strong className="text-white">
                    {Math.min(validSavedPage * SAVED_PER_PAGE, filteredSavedQuestions.length)}
                  </strong>{' '}
                  of <strong className="text-amber-300">{filteredSavedQuestions.length}</strong> saved questions
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={validSavedPage === 1}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.1] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalSavedPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center ${
                        validSavedPage === p
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalSavedPages, prev + 1))}
                    disabled={validSavedPage === totalSavedPages}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.1] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
