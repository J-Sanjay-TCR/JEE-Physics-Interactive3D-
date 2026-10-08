import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { JeeQuestion, MockExamResult } from '../../types/arena';
import { QuestionCard } from './QuestionCard';
import { Latex } from '../ui/Latex';

interface TimedMockExamViewProps {
  questions: JeeQuestion[];
  onAskAiTutor?: (questionText: string, context: string) => void;
  onExitMock?: () => void;
}

export const TimedMockExamView: React.FC<TimedMockExamViewProps> = ({
  questions,
  onAskAiTutor,
  onExitMock,
}) => {
  // Test Configuration State
  const [testStarted, setTestStarted] = useState(false);
  const [testLength, setTestLength] = useState<number>(5); // 5 or 10 questions
  const [durationMinutes, setDurationMinutes] = useState<number>(10);

  // Active Exam State
  const [activeQuestions, setActiveQuestions] = useState<JeeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Initialize Exam
  const handleStartExam = () => {
    // Shuffle and pick subset of questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(testLength, questions.length));
    setActiveQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setVisited({ [selected[0]?.id]: true });
    setTimeRemaining(durationMinutes * 60);
    setIsSubmitted(false);
    setTestStarted(true);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!testStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, isSubmitted]);

  // Track Visited Questions
  useEffect(() => {
    if (activeQuestions[currentIndex]) {
      setVisited((prev) => ({ ...prev, [activeQuestions[currentIndex].id]: true }));
    }
  }, [currentIndex, activeQuestions]);

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setShowConfirmSubmit(false);
  };

  const handleSelectAnswer = (ans: string | string[] | number) => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: ans }));
  };

  const handleClearAnswer = () => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleMarkReview = () => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  // Calculate Final Scorecard
  const examResult: MockExamResult = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;

    activeQuestions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns !== undefined && userAns !== '') {
        attempted++;
        if (userAns === q.correctAnswer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const unattempted = activeQuestions.length - attempted;
    const score = correct * 4 - incorrect * 1;
    const maxScore = activeQuestions.length * 4;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeSpentSeconds = durationMinutes * 60 - timeRemaining;

    return {
      totalQuestions: activeQuestions.length,
      attempted,
      correct,
      incorrect,
      unattempted,
      score,
      maxScore,
      percentage,
      accuracy,
      timeSpentSeconds,
    };
  }, [activeQuestions, answers, durationMinutes, timeRemaining]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Setup / Lobby Screen
  if (!testStarted) {
    return (
      <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-6 sm:p-10 shadow-2xl backdrop-blur-md max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">JEE Timed Mock Exam Simulator</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg mx-auto">
            Test yourself under real NTA JEE exam conditions with strict countdown, positive and negative marking (+4 / -1 / 0), and instant performance analysis.
          </p>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">Number of Questions</label>
            <div className="flex gap-2">
              {[5, 10].map((len) => (
                <button
                  key={len}
                  onClick={() => {
                    setTestLength(len);
                    setDurationMinutes(len === 5 ? 10 : 20);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    testLength === len
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'bg-white/[0.05] text-zinc-300 hover:text-white'
                  }`}
                >
                  {len} Qs
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">Duration</label>
            <div className="text-sm font-mono font-bold text-cyan-300 py-1.5">
              {durationMinutes} Minutes ({Math.round((durationMinutes * 60) / testLength)}s / question)
            </div>
          </div>
        </div>

        {/* Exam Rules Card */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-zinc-300 text-left font-mono space-y-1.5 max-w-md mx-auto">
          <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Marking Scheme:</span>
          </div>
          <div>• Correct Answer: <span className="text-emerald-400 font-bold">+4 Marks</span></div>
          <div>• Incorrect Answer: <span className="text-rose-400 font-bold">-1 Mark</span></div>
          <div>• Unattempted: <span className="text-zinc-400 font-bold">0 Marks</span></div>
        </div>

        <button
          onClick={handleStartExam}
          className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm tracking-wide transition shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
        >
          <span>Start Timed Exam Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2. Scorecard / Results View
  if (isSubmitted) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Scorecard Summary Banner */}
        <div className="bg-[#0b0e1d]/90 rounded-2xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                Exam Performance Analysis
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Mock Test Completed</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartExam}
                className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
              {onExitMock && (
                <button
                  onClick={onExitMock}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-mono transition cursor-pointer"
                >
                  Back to Topic Drill
                </button>
              )}
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] text-center">
              <span className="text-xs font-mono text-zinc-400">Total Score</span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 mt-1">
                {examResult.score} <span className="text-sm text-zinc-500 font-normal">/ {examResult.maxScore}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] text-center">
              <span className="text-xs font-mono text-zinc-400">Accuracy</span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 mt-1">
                {examResult.accuracy}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] text-center">
              <span className="text-xs font-mono text-zinc-400">Attempted</span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                {examResult.attempted} <span className="text-sm text-zinc-500 font-normal">/ {examResult.totalQuestions}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] text-center">
              <span className="text-xs font-mono text-zinc-400">Correct / Wrong</span>
              <div className="text-2xl sm:text-3xl font-mono font-black mt-1">
                <span className="text-emerald-400">{examResult.correct}</span>
                <span className="text-zinc-600 text-xl font-normal"> / </span>
                <span className="text-rose-400">{examResult.incorrect}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Solutions Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Full Step-by-Step Solutions Review</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {activeQuestions.length} Questions Evaluated
            </span>
          </div>

          {activeQuestions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const isSkipped = userAns === undefined || userAns === '';

            return (
              <div key={q.id} className="relative">
                <QuestionCard
                  question={q}
                  index={idx}
                  selectedAnswer={userAns}
                  onAskAiTutor={onAskAiTutor}
                  showSolutionImmediate={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Live Active Exam Interface
  const currentQ = activeQuestions[currentIndex];
  const isLastQuestion = currentIndex === activeQuestions.length - 1;
  const isTimeCritical = timeRemaining < 120; // less than 2 minutes

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left 3 Columns: Active Question Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Test Header & Timer */}
        <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-4 flex items-center justify-between shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">Question</span>
            <span className="text-white font-bold text-sm">{currentIndex + 1}</span>
            <span className="text-zinc-600">of</span>
            <span className="text-zinc-400">{activeQuestions.length}</span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm transition-colors ${
              isTimeCritical
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTimer(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            Submit Test
          </button>
        </div>

        {/* Active Question Render */}
        {currentQ && (
          <QuestionCard
            question={currentQ}
            index={currentIndex}
            isMockMode={true}
            selectedAnswer={answers[currentQ.id]}
            onSelectAnswer={handleSelectAnswer}
            showSolutionImmediate={false}
          />
        )}

        {/* Bottom Exam Navigation Toolbar */}
        <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleToggleMarkReview}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                markedForReview[currentQ?.id]
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-white/[0.04] text-zinc-300 border-white/[0.1] hover:bg-white/[0.08]'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-purple-400" />
              <span>{markedForReview[currentQ?.id] ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>

            <button
              onClick={handleClearAnswer}
              disabled={answers[currentQ?.id] === undefined}
              className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono transition cursor-pointer"
            >
              Clear Response
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isLastQuestion ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <span>Complete & Submit</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Question Grid Palette */}
      <div className="space-y-4">
        <div className="bg-[#0b0e1d]/90 rounded-2xl border border-white/[0.08] p-5 shadow-xl backdrop-blur-md space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Question Palette
          </h4>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-400" />
              <span>Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-white/40" />
              <span>Not Visited</span>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {activeQuestions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
              const isMarked = markedForReview[q.id];
              const isCurrent = idx === currentIndex;
              const hasVisited = visited[q.id];

              let bgClass = 'bg-zinc-800 text-zinc-400';
              if (isCurrent) {
                bgClass = 'ring-2 ring-cyan-400 text-white font-black scale-105';
              }
              if (isMarked) {
                bgClass += ' bg-purple-600 text-white';
              } else if (isAnswered) {
                bgClass += ' bg-emerald-500 text-black font-bold';
              } else if (hasVisited) {
                bgClass += ' bg-zinc-700 text-zinc-200';
              } else {
                bgClass += ' bg-black/40 border border-white/[0.1] text-zinc-500';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e1d] border border-cyan-500/30 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-center"
            >
              <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Submit Exam?</h3>
              <p className="text-xs text-zinc-400">
                You have answered <span className="text-cyan-300 font-bold">{Object.keys(answers).length}</span> out of{' '}
                <span className="text-white font-bold">{activeQuestions.length}</span> questions.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 text-xs font-mono transition cursor-pointer"
                >
                  Continue Test
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold transition shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  Yes, Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
