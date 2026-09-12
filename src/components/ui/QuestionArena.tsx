import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Lightbulb,
  Zap,
  Sparkles,
  Bot,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { Latex } from './Latex';
import confetti from 'canvas-confetti';

interface QuestionArenaProps {
  questions: Question[];
  currentParams: Record<string, number>;
  conceptTitle?: string;
}

export const QuestionArena: React.FC<QuestionArenaProps> = ({
  questions,
  currentParams,
  conceptTitle,
}) => {
  const [arenaQuestions, setArenaQuestions] = useState<Question[]>(questions || []);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficultyMode, setDifficultyMode] = useState<'JEE Main' | 'JEE Advanced'>('JEE Main');
  const [statusFeedback, setStatusFeedback] = useState<{ text: string; isSuccess?: boolean } | null>(null);

  // Sync questions when the active concept changes
  useEffect(() => {
    setArenaQuestions(questions || []);
    setActiveQIndex(0);
    setSelectedOption(null);
    setNumericalInput('');
    setIsSubmitted(false);
    setAiHint(null);
    setStatusFeedback(null);
  }, [questions, conceptTitle]);

  const q = arenaQuestions[activeQIndex] || arenaQuestions[0];

  // Format active parameter tags for user visibility
  const paramEntries = Object.entries(currentParams || {});
  const paramSummary = paramEntries.length > 0
    ? paramEntries.slice(0, 4).map(([k, v]) => `${k} = ${v}`).join(' • ')
    : '';

  const handleGenerateCustomQuestion = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setStatusFeedback({
      text: 'AI Tutor is calculating physical constraints and drafting custom problem...',
      isSuccess: true,
    });

    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptTitle: conceptTitle || 'Physics Concept',
          currentParams: currentParams || {},
          difficulty: difficultyMode,
        }),
      });

      const data = await res.json();
      if (data && data.question) {
        const newQuestion: Question = {
          ...data.question,
          id: data.question.id || `ai-custom-${Date.now()}`,
          isDynamic: true,
        };

        setArenaQuestions((prev) => {
          const updated = [...prev, newQuestion];
          setActiveQIndex(updated.length - 1);
          return updated;
        });

        setSelectedOption(null);
        setNumericalInput('');
        setIsSubmitted(false);
        setAiHint(null);
        setStatusFeedback({
          text: `✨ Generated new ${difficultyMode} problem derived from active simulation values!`,
          isSuccess: true,
        });
        setTimeout(() => setStatusFeedback(null), 5000);
      } else {
        setStatusFeedback({ text: 'Could not generate question. Please try again.', isSuccess: false });
        setTimeout(() => setStatusFeedback(null), 4000);
      }
    } catch (err) {
      console.error('Failed to generate custom question:', err);
      setStatusFeedback({ text: 'Error connecting to AI Tutor. Please check network.', isSuccess: false });
      setTimeout(() => setStatusFeedback(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchAiHint = async () => {
    if (loadingHint || !q) return;
    setLoadingHint(true);
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.question,
          options: q.options || [],
          conceptTitle: conceptTitle || '',
        }),
      });
      const data = await res.json();
      setAiHint(data.hint || 'Think carefully about the active force directions and conservation principles.');
    } catch {
      setAiHint('Focus on balancing the normal, gravitational, and frictional force components.');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted || !q) return;
    setIsSubmitted(true);

    let isCorrect = false;
    if (q.type === 'mcq' && selectedOption === q.correctAnswer) {
      isCorrect = true;
    } else if (q.type === 'integer' || q.type === 'numerical') {
      const userVal = parseFloat(numericalInput);
      const targetVal = q.numericalAnswer ?? 0;
      const tol = q.tolerance ?? 0.1;
      if (!isNaN(userVal) && Math.abs(userVal - targetVal) <= tol) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleNext = () => {
    if (arenaQuestions.length <= 1) return;
    setSelectedOption(null);
    setNumericalInput('');
    setIsSubmitted(false);
    setAiHint(null);
    setActiveQIndex((prev) => (prev + 1) % arenaQuestions.length);
  };

  const handlePrev = () => {
    if (arenaQuestions.length <= 1) return;
    setSelectedOption(null);
    setNumericalInput('');
    setIsSubmitted(false);
    setAiHint(null);
    setActiveQIndex((prev) => (prev - 1 + arenaQuestions.length) % arenaQuestions.length);
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setNumericalInput('');
    setIsSubmitted(false);
    setAiHint(null);
    setActiveQIndex(0);
    setScore(0);
  };

  if (!q) {
    return (
      <div className="bg-[#111114]/90 rounded-2xl p-6 border border-white/[0.08] text-center text-zinc-400 text-sm flex flex-col items-center gap-3">
        <p>No practice questions currently loaded for this topic.</p>
        <button
          onClick={handleGenerateCustomQuestion}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-2 transition"
        >
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate Custom Question with AI Tutor
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#111114]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl flex flex-col gap-4">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-pink-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            JEE Practice Arena & Concept Solver
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Question Navigator */}
          <div className="flex items-center gap-1 bg-[#181822] px-2 py-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={handlePrev}
              disabled={arenaQuestions.length <= 1}
              className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition p-0.5"
              title="Previous Question"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-zinc-300 font-mono text-[11px] px-1">
              Q {activeQIndex + 1} / {arenaQuestions.length}
            </span>
            <button
              onClick={handleNext}
              disabled={arenaQuestions.length <= 1}
              className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition p-0.5"
              title="Next Question"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {q.isDynamic && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              AI Custom
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 text-[11px]">
            {q.difficulty}
          </span>
        </div>
      </div>

      {/* AI Custom Practice Question Generator Bar */}
      <div className="bg-[#15151F]/90 p-3 rounded-xl border border-cyan-500/20 flex flex-col gap-2.5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <span>AI Tutor Custom Problem Generator</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 font-normal">
                  Live Parameters
                </span>
              </div>
              {paramSummary && (
                <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono mt-0.5">
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{paramSummary}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Difficulty Toggle */}
            <div className="flex items-center bg-[#1D1D28] rounded-lg p-0.5 border border-white/[0.08] text-[11px]">
              <button
                type="button"
                onClick={() => setDifficultyMode('JEE Main')}
                className={`px-2 py-1 rounded-md transition font-medium ${
                  difficultyMode === 'JEE Main'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Main
              </button>
              <button
                type="button"
                onClick={() => setDifficultyMode('JEE Advanced')}
                className={`px-2 py-1 rounded-md transition font-medium ${
                  difficultyMode === 'JEE Advanced'
                    ? 'bg-pink-500/20 text-pink-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Advanced
              </button>
            </div>

            {/* Generate Question Button */}
            <button
              type="button"
              onClick={handleGenerateCustomQuestion}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition shadow-sm active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Generate Custom Question</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status / Feedback banner */}
        {statusFeedback && (
          <div
            className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 animate-fadeIn ${
              statusFeedback.isSuccess
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
            }`}
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
            )}
            <span>{statusFeedback.text}</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-[#0E0E12] p-4 rounded-xl border border-white/[0.08]">
        {q.isDynamic && (
          <div className="mb-2.5 px-2.5 py-1 rounded-md bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Problem derived from current simulation parameter values</span>
          </div>
        )}

        <div className="text-sm font-medium text-zinc-200 leading-relaxed">
          <Latex>{q.question}</Latex>
        </div>

        {/* MCQ Options */}
        {q.options && q.options.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isAnswer = isSubmitted && q.correctAnswer === idx;
              const isWrongChoice = isSubmitted && isSelected && q.correctAnswer !== idx;

              let optionStyle =
                'bg-[#16161E] border-white/[0.06] text-zinc-300 hover:border-white/[0.15]';
              if (isSelected && !isSubmitted) {
                optionStyle = 'bg-cyan-950/40 border-cyan-500 text-cyan-200';
              } else if (isAnswer) {
                optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold';
              } else if (isWrongChoice) {
                optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isSubmitted && setSelectedOption(idx)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${optionStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-[#22222C] flex items-center justify-center font-mono font-bold text-[11px] text-zinc-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>
                      <Latex>{opt}</Latex>
                    </span>
                  </div>
                  {isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isWrongChoice && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Numerical Input Type */}
        {(q.type === 'integer' || q.type === 'numerical') && (
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              step="any"
              placeholder="Enter numerical answer..."
              value={numericalInput}
              disabled={isSubmitted}
              onChange={(e) => setNumericalInput(e.target.value)}
              className="flex-1 bg-[#14141A] border border-white/[0.1] px-3.5 py-2 rounded-xl text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 mono-num"
            />
          </div>
        )}
      </div>

      {/* AI Hint Section */}
      {aiHint && (
        <div className="bg-[#121218] p-3.5 rounded-xl border border-cyan-500/30 flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              AI Conceptual Hint (Gemini 3.7 Flash)
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{aiHint}</p>
        </div>
      )}

      {/* Action Submit & Next Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetQuiz}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {!isSubmitted && (
            <button
              onClick={handleFetchAiHint}
              disabled={loadingHint}
              className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition font-medium"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              {loadingHint ? 'Generating Hint...' : 'Get AI Hint'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null && numericalInput === ''}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-pink-500/20 active:scale-[0.98]"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-[#1C1C24] hover:bg-[#262632] text-white border border-white/[0.08] flex items-center gap-1 transition active:scale-[0.98]"
            >
              Next Problem <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step Solution Drawer */}
      {isSubmitted && (
        <div className="bg-[#0E0E12] p-4 rounded-xl border border-white/[0.08] flex flex-col gap-2.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Step-by-Step Solution & Concept Derivation</span>
          </div>
          <div className="text-xs text-zinc-300 leading-relaxed">
            <Latex>{q.explanation}</Latex>
          </div>
          {q.formulaUsed && (
            <div className="bg-[#16161E] py-2 px-3 rounded-lg border border-white/[0.06] text-center my-1">
              <Latex math={q.formulaUsed} displayMode />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
