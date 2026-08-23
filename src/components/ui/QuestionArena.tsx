import React, { useState } from 'react';
import { Question } from '../../types';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, RotateCcw, Lightbulb, Zap, Sparkles } from 'lucide-react';
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
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const q = questions[activeQIndex];

  if (!q) {
    return (
      <div className="bg-[#111114]/90 rounded-2xl p-5 border border-white/[0.08] text-center text-zinc-500 text-sm">
        No practice questions currently loaded for this topic.
      </div>
    );
  }

  const handleFetchAiHint = async () => {
    if (loadingHint) return;
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
    if (isSubmitted) return;
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
    setSelectedOption(null);
    setNumericalInput('');
    setIsSubmitted(false);
    setAiHint(null);
    setActiveQIndex((prev) => (prev + 1) % questions.length);
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setNumericalInput('');
    setIsSubmitted(false);
    setAiHint(null);
    setActiveQIndex(0);
    setScore(0);
  };

  return (
    <div className="bg-[#111114]/90 backdrop-blur-md rounded-2xl p-5 border border-white/[0.08] shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            JEE Practice Arena & Concept Solver
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400">
            Q {activeQIndex + 1} of {questions.length}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
            {q.difficulty}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#0E0E12] p-4 rounded-xl border border-white/[0.08]">
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
                    <span><Latex>{opt}</Latex></span>
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
            Reset Quiz
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
              className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-pink-500/20"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-[#1C1C24] hover:bg-[#262632] text-white border border-white/[0.08] flex items-center gap-1 transition"
            >
              Next Question <ChevronRight className="w-3.5 h-3.5" />
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
