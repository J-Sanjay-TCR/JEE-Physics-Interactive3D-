import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Atom,
  CheckCircle2,
  Calendar,
  Bookmark,
} from 'lucide-react';
import { JeeQuestion } from '../../types/arena';
import { JEE_QUESTIONS_BANK } from '../../data/jeeQuestionsBank';
import { TopicDrillView } from './TopicDrillView';
import { TimedMockExamView } from './TimedMockExamView';
import { SavedQuestionsView } from './SavedQuestionsView';
import { MiniProgressDashboard } from './MiniProgressDashboard';
import { loadSavedQuestionIds } from '../../utils/arenaProgress';

interface JeeQuestionsArenaProps {
  onAskAiTutor?: (questionText: string, context: string) => void;
  onSwitchToLab?: () => void;
  isEmbedded?: boolean;
  onOpenFullScreen?: () => void;
}

export const JeeQuestionsArena: React.FC<JeeQuestionsArenaProps> = ({
  onAskAiTutor,
  onSwitchToLab,
  isEmbedded = false,
  onOpenFullScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'drill' | 'mock' | 'saved'>('drill');
  const [questions, setQuestions] = useState<JeeQuestion[]>(JEE_QUESTIONS_BANK);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [savedCount, setSavedCount] = useState<number>(() => loadSavedQuestionIds().length);

  // Keep saved questions counter synchronized in real time
  useEffect(() => {
    const updateSavedCount = () => {
      setSavedCount(loadSavedQuestionIds().length);
    };
    window.addEventListener('jee_arena_saved_updated', updateSavedCount);
    window.addEventListener('storage', updateSavedCount);
    return () => {
      window.removeEventListener('jee_arena_saved_updated', updateSavedCount);
      window.removeEventListener('storage', updateSavedCount);
    };
  }, []);

  const handleAddQuestions = (newQs: JeeQuestion[]) => {
    setQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const filtered = newQs.filter((q) => !existingIds.has(q.id));
      return [...filtered, ...prev];
    });
  };

  return (
    <div className={`w-full text-zinc-100 ${isEmbedded ? 'p-2 sm:p-4' : 'h-full overflow-y-auto bg-[#030611] p-4 sm:p-6 lg:p-8'} space-y-6`}>
      {/* Top Arena Header & Statistics Ribbon */}
      <div className="bg-[#0b0e1d]/90 rounded-3xl border border-white/[0.08] p-5 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                JEE Main & Advanced 2015–2026 Archive
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-mono text-[10px] font-bold">
                ★ 2026 High-Yield Predicted
              </span>
              {isEmbedded && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  Interactive Practice Hub
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              JEE Physics Questions Arena
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Master official past examination problems from 2015 through 2026 across all complete JEE Physics syllabus chapters. Practice self-paced with step-by-step calculus derivations or simulate real exam pressure in Timed Mock Mode.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenFullScreen && (
              <button
                onClick={onOpenFullScreen}
                className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 shadow-lg"
              >
                <span>Full Arena Mode</span>
              </button>
            )}

            {/* Quick Switch to 3D Simulation Lab */}
            {onSwitchToLab && (
              <button
                onClick={onSwitchToLab}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-zinc-200 text-xs font-mono font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 shadow-lg"
              >
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>Open 3D Lab</span>
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector Tabs (Topic-Wise Drill vs Timed Mock Exam vs Saved Questions) */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/[0.06] flex-wrap">
          <button
            onClick={() => setActiveTab('drill')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'drill'
                ? 'bg-cyan-500 text-black shadow-[0_0_16px_rgba(0,240,255,0.4)]'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Topic-Wise PYQ Drill (2015–2026)</span>
          </button>

          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mock'
                ? 'bg-cyan-500 text-black shadow-[0_0_16px_rgba(0,240,255,0.4)]'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timed Mock Exam Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.4)]'
                : 'bg-white/[0.04] text-zinc-400 hover:text-amber-300 hover:bg-white/[0.08]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'fill-slate-950' : 'fill-amber-400/40 text-amber-400'}`} />
            <span>Saved Questions</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'saved'
                  ? 'bg-black/25 text-slate-950'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {savedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mini Progress Dashboard (Circular Donut Chart, Chapter Solved vs Attempted & Streak) */}
      <MiniProgressDashboard
        totalQuestionsCount={questions.length}
        selectedChapterId={selectedChapter}
        onSelectChapterFilter={(ch) => {
          setSelectedChapter(ch);
          setActiveTab('drill');
        }}
      />

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'drill' ? (
          <motion.div
            key="drill-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TopicDrillView
              questions={questions}
              onAskAiTutor={onAskAiTutor}
              onAddQuestions={handleAddQuestions}
              selectedChapter={selectedChapter}
              onSelectChapter={setSelectedChapter}
            />
          </motion.div>
        ) : activeTab === 'saved' ? (
          <motion.div
            key="saved-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SavedQuestionsView
              questions={questions}
              onAskAiTutor={onAskAiTutor}
              onSwitchToDrill={() => setActiveTab('drill')}
              onLaunchMockWithQuestions={() => setActiveTab('mock')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="mock-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TimedMockExamView
              questions={questions}
              onAskAiTutor={onAskAiTutor}
              onExitMock={() => setActiveTab('drill')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
