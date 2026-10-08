import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Layers,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CircularProgressDonut } from './CircularProgressDonut';
import {
  loadArenaProgress,
  saveArenaProgress,
  formatTimeMMSS,
  UserArenaProgress,
} from '../../utils/arenaProgress';
import { CHAPTERS } from '../../data/allConcepts';

interface MiniProgressDashboardProps {
  totalQuestionsCount: number;
  onSelectChapterFilter?: (chapterId: string) => void;
  selectedChapterId?: string;
  className?: string;
}

export const MiniProgressDashboard: React.FC<MiniProgressDashboardProps> = React.memo(({
  totalQuestionsCount,
  onSelectChapterFilter,
  selectedChapterId = 'all',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState<UserArenaProgress>(loadArenaProgress);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Poll progress state from storage & broadcast events
  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(loadArenaProgress());
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom window event for instant in-tab updates
    window.addEventListener('jee_arena_progress_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jee_arena_progress_updated', handleStorageChange);
    };
  }, []);

  // Live Session Stopwatch
  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused]);

  // Overall statistics
  const totalSolved = progress.solvedQuestionIds.length;
  const totalAttempted = progress.attemptedQuestionIds.length;
  const accuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;
  const dailyGoal = progress.dailyGoal || 10;
  const todaySolved = progress.todaySolvedCount || 0;
  const goalProgressPercent = Math.min(100, Math.round((todaySolved / dailyGoal) * 100));

  // Chapter-wise breakdown aggregated from recorded attempts
  const chapterBreakdown = useMemo(() => {
    return CHAPTERS.map((ch) => {
      let chSolved = 0;
      let chAttempted = 0;

      Object.values(progress.records).forEach((rec) => {
        if (rec.chapterId === ch.id) {
          chAttempted++;
          if (rec.isCorrect) chSolved++;
        }
      });

      const chAccuracy = chAttempted > 0 ? Math.round((chSolved / chAttempted) * 100) : 0;
      return {
        id: ch.id,
        name: ch.name,
        solved: chSolved,
        attempted: chAttempted,
        accuracy: chAccuracy,
      };
    });
  }, [progress.records]);

  // Active chapters that have at least 1 attempt or solved
  const practicedChapters = useMemo(() => {
    return chapterBreakdown.filter((c) => c.attempted > 0);
  }, [chapterBreakdown]);

  const handleCelebrate = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#10B981', '#F59E0B', '#8B5CF6'],
    });
  };

  const handleResetSessionTimer = () => {
    setSessionSeconds(0);
  };

  return (
    <div className={`w-full bg-[#0b0e1d]/95 rounded-2xl border border-white/[0.08] shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 ${className}`}>
      {/* 1. At-A-Glance Collapsed Summary Ribbon */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06]">
        {/* Left: Quick Gamified Metric Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-bold">{progress.streakDays}-Day Streak</span>
          </div>

          {/* Overall Accuracy */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{accuracy}% Accuracy</span>
          </div>

          {/* Live Session Time */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tabular-nums font-bold">{formatTimeMMSS(sessionSeconds)}</span>
          </div>

          {/* Solved Count */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Solved: <strong className="text-white">{totalSolved}</strong> / {totalQuestionsCount}
            </span>
          </div>
        </div>

        {/* Right: Expand / Collapse Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] font-mono text-xs font-semibold transition cursor-pointer active:scale-95"
        >
          <span>{isExpanded ? 'Hide Analytics' : 'Progress Dashboard'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Expanded Dashboard Deck */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 border-t border-white/[0.04]"
          >
            {/* Column 1: Circular Donut Visualizer & Legend */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Overall Practice Donut
              </span>

              <CircularProgressDonut
                solved={totalSolved}
                attempted={totalAttempted}
                total={totalQuestionsCount}
                size={140}
                strokeWidth={13}
              />

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span>Solved ({totalSolved})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  <span>Incorrect ({Math.max(0, totalAttempted - totalSolved)})</span>
                </div>
              </div>
            </div>

            {/* Column 2: Chapter Breakdown Matrix */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chapter Mastery</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {practicedChapters.length} active chapters
                </span>
              </div>

              {practicedChapters.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 font-mono text-xs">
                  Attempt questions in the Topic Drill to unlock chapter breakdown metrics.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {practicedChapters.slice(0, 5).map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => onSelectChapterFilter?.(ch.id)}
                      className={`p-2 rounded-xl border text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                        selectedChapterId === ch.id
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-zinc-300 hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="truncate max-w-[140px] sm:max-w-[170px] font-medium">
                        {ch.name}
                      </div>
                      <div className="flex items-center gap-2 tabular-nums shrink-0">
                        <span className="text-emerald-400 font-bold">{ch.solved}</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-400">{ch.attempted}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-cyan-300">
                          {ch.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-zinc-500 font-mono text-right">
                Click any chapter to filter questions feed
              </div>
            </div>

            {/* Column 3: Daily Target Goal & Session Stopwatch */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 flex flex-col justify-between">
              {/* Daily Target Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daily Target Goal</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                    {todaySolved} / {dailyGoal} Qs
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgressPercent}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>{goalProgressPercent}% Completed</span>
                  {todaySolved >= dailyGoal && (
                    <button
                      onClick={handleCelebrate}
                      className="text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Claim Sparkles!</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stopwatch Controls */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block">Session Practice Timer</span>
                  <span className="text-lg font-mono font-black text-white tabular-nums">
                    {formatTimeMMSS(sessionSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition cursor-pointer"
                    title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                  >
                    {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleResetSessionTimer}
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Reset Session Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
