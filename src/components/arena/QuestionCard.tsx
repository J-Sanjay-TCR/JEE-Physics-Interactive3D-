import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  Bookmark,
  Calendar,
  Layers,
  Eye,
} from 'lucide-react';
import { JeeQuestion } from '../../types/arena';
import { Latex } from '../ui/Latex';
import {
  recordQuestionAttempt,
  isQuestionSaved,
  toggleSavedQuestionId,
} from '../../utils/arenaProgress';

interface QuestionCardProps {
  question: JeeQuestion;
  index?: number;
  onAskAiTutor?: (questionText: string, context: string) => void;
  isMockMode?: boolean;
  selectedAnswer?: string | string[] | number;
  onSelectAnswer?: (ans: string | string[] | number) => void;
  showSolutionImmediate?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onAskAiTutor,
  isMockMode = false,
  selectedAnswer: controlledAnswer,
  onSelectAnswer,
  showSolutionImmediate = true,
}) => {
  const [localAnswer, setLocalAnswer] = useState<string | number>('');
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showDerivation, setShowDerivation] = useState(false);
  const [isSaved, setIsSaved] = useState(() => isQuestionSaved(question.id));

  // Sync bookmark state across components & storage
  useEffect(() => {
    setIsSaved(isQuestionSaved(question.id));

    const handleSavedUpdated = () => {
      setIsSaved(isQuestionSaved(question.id));
    };

    window.addEventListener('jee_arena_saved_updated', handleSavedUpdated);
    window.addEventListener('storage', handleSavedUpdated);

    return () => {
      window.removeEventListener('jee_arena_saved_updated', handleSavedUpdated);
      window.removeEventListener('storage', handleSavedUpdated);
    };
  }, [question.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleSavedQuestionId(question.id);
    setIsSaved(result.isSaved);
  };

  const activeAnswer = controlledAnswer !== undefined ? controlledAnswer : localAnswer;

  const handleOptionClick = (optionId: string) => {
    if (isMockMode) {
      onSelectAnswer?.(optionId);
      return;
    }
    if (isChecked) return; // locked once checked in drill mode
    setLocalAnswer(optionId);
    onSelectAnswer?.(optionId);
  };

  const handleCheckAnswer = () => {
    if (!activeAnswer) return;
    setIsChecked(true);
    setShowDerivation(true);
    const correct = activeAnswer === question.correctAnswer;
    try {
      recordQuestionAttempt(question.id, question.chapterId, correct);
      window.dispatchEvent(new Event('jee_arena_progress_updated'));
    } catch {}
  };

  const handleReset = () => {
    setLocalAnswer('');
    setIsChecked(false);
    setShowDerivation(false);
    setShowHint(false);
  };

  const isCorrect = isChecked && activeAnswer === question.correctAnswer;
  const isIncorrect = isChecked && activeAnswer !== question.correctAnswer;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Hard':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Advanced':
        return 'text-purple-300 bg-purple-500/15 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="w-full bg-[#0b0e1d]/85 rounded-2xl border border-white/[0.08] hover:border-cyan-500/30 transition-all p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Question Header & Exam Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-4 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          {index !== undefined && (
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold flex items-center justify-center">
              {index + 1}
            </span>
          )}

          {/* Official Exam & Year Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.1] text-xs font-mono font-bold text-zinc-200">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{question.exam} {question.year}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-cyan-300">{question.sessionOrPaper}</span>
          </div>

          {/* Difficulty Tag */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty.toUpperCase()}
          </span>
        </div>

        {/* Chapter / Topic Info & Bookmark Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-300 font-semibold">{question.chapterTitle}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 truncate max-w-[130px] sm:max-w-[200px]">{question.topic}</span>
          </div>

          <button
            onClick={handleToggleSave}
            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center shrink-0 ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-amber-300 hover:bg-white/[0.08]'
            }`}
            title={isSaved ? 'Remove from Saved Questions' : 'Save Question for Later Review'}
            aria-label={isSaved ? 'Saved question' : 'Save question'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Question Problem Statement with KaTeX */}
      <div className="text-slate-100 text-[15px] sm:text-base leading-relaxed mb-6 font-sans">
        <Latex>{question.statement}</Latex>
      </div>

      {/* Multiple Choice Options or Numerical Input */}
      {question.questionType === 'numerical' ? (
        <div className="my-4 p-4 rounded-xl bg-black/40 border border-white/[0.08] max-w-xs">
          <label className="block text-xs font-mono text-zinc-400 mb-2">
            Enter Numerical Value {question.numericalUnit ? `(${question.numericalUnit})` : ''}:
          </label>
          <input
            type="number"
            step="any"
            disabled={isChecked && !isMockMode}
            value={activeAnswer as any}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setLocalAnswer(isNaN(val) ? '' : val);
              onSelectAnswer?.(isNaN(val) ? '' : val);
            }}
            placeholder="e.g. 2.5"
            className="w-full bg-[#121629] border border-white/[0.15] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-base outline-none transition"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {question.options?.map((opt) => {
            const isSelected = activeAnswer === opt.id;
            const isThisCorrect = isChecked && opt.id === question.correctAnswer;
            const isThisWrong = isChecked && isSelected && opt.id !== question.correctAnswer;

            let borderBg = 'bg-white/[0.03] border-white/[0.08] hover:border-cyan-500/40 hover:bg-white/[0.06] text-zinc-200';
            if (isSelected && !isChecked) {
              borderBg = 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]';
            } else if (isThisCorrect) {
              borderBg = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
            } else if (isThisWrong) {
              borderBg = 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleOptionClick(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${borderBg}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                    isThisCorrect
                      ? 'bg-emerald-400 text-black'
                      : isThisWrong
                      ? 'bg-rose-400 text-white'
                      : isSelected
                      ? 'bg-cyan-400 text-black'
                      : 'bg-white/10 text-zinc-300'
                  }`}
                >
                  {opt.id}
                </div>
                <div className="text-sm font-sans flex-1 min-w-0 pt-0.5">
                  <Latex>{opt.text}</Latex>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Action Controls for Drill Mode */}
      {!isMockMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            {!isChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!activeAnswer}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-95 cursor-pointer"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 font-mono text-xs transition cursor-pointer"
              >
                Retry Question
              </button>
            )}

            {/* Hint Trigger */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-amber-500/20 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Ask AI Tutor Bridge */}
            {onAskAiTutor && (
              <button
                onClick={() =>
                  onAskAiTutor(
                    `I need help with this ${question.exam} ${question.year} question on ${question.chapterTitle} (${question.topic}):\n\n"${question.statement}"\n\nCould you give me a deep, step-by-step calculus derivation and explain the physical intuition?`,
                    `Chapter: ${question.chapterTitle}, Topic: ${question.topic}, Exam: ${question.exam} ${question.year}`
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask AI Tutor Deep Dive</span>
              </button>
            )}

            {/* Show Solution / Step-by-Step Toggle */}
            <button
              onClick={() => setShowDerivation(!showDerivation)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                showDerivation
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showDerivation ? 'Hide Solution' : 'Show Solution'}</span>
              {showDerivation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Hint Box */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-sans leading-relaxed"
          >
            <div className="flex items-center gap-2 font-mono font-bold text-amber-400 mb-1">
              <Lightbulb className="w-4 h-4" />
              <span>High-Yield JEE Hint:</span>
            </div>
            <Latex>{question.hint}</Latex>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-Step Calculus Derivation & Exam Traps Drawer with Subtle Reveal Animation */}
      <AnimatePresence>
        {(showDerivation || (showSolutionImmediate && isChecked)) && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#070914] border border-cyan-500/30 space-y-4 shadow-[0_4px_30px_rgba(0,240,255,0.08)] relative overflow-hidden"
          >
            {/* Ambient top reveal shimmer beam */}
            <motion.div
              initial={{ x: '-100%', opacity: 0.9 }}
              animate={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none"
            />

            {/* Status Header */}
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 flex-wrap gap-2"
            >
              <div className="flex items-center gap-2">
                {isChecked ? (
                  isCorrect ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct! (+4 Marks)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-300 font-mono font-bold text-xs">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Incorrect (-1 Mark) • Correct Answer is: Option {String(question.correctAnswer)}</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-xs">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Solution Walkthrough</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Official Answer Key: Option {String(question.correctAnswer)}
              </span>
            </motion.div>

            {/* Step-by-Step Calculus Walkthrough with Staggered Reveal Animation */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Step-by-Step Calculus & Theoretical Derivation:</span>
              </div>
              <div className="space-y-2.5 text-xs text-zinc-300 font-sans leading-relaxed">
                {question.stepByStepSolution.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8, y: 3 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.05 + idx * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/25 transition-colors border-l-2 border-l-cyan-400/70"
                  >
                    <Latex>{step}</Latex>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Concept & Common Traps with Soft Fade In */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: 0.08 + question.stepByStepSolution.length * 0.06,
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1"
            >
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/25 text-xs">
                <div className="font-mono font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Key Physics Principle:</span>
                </div>
                <div className="text-zinc-300 font-sans">
                  <Latex>{question.keyConcept}</Latex>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs">
                <div className="font-mono font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Common Exam Trap to Avoid:</span>
                </div>
                <div className="text-zinc-300 font-sans">
                  <Latex>{question.examTrap}</Latex>
                </div>
              </div>
            </motion.div>

            {question.shortcutTrick && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.15 + question.stepByStepSolution.length * 0.06,
                }}
                className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-xs text-emerald-200 font-mono shadow-xs"
              >
                <span className="font-bold text-emerald-400">⚡ 30-Second Exam Shortcut: </span>
                <Latex>{question.shortcutTrick}</Latex>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
