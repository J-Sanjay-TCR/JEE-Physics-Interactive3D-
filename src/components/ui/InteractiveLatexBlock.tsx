import React, { useState, useMemo } from 'react';
import { PhysicsFormula, PhysicsParameter, RealtimeQuantity } from '../../types';
import { Latex } from './Latex';
import { HighlightedPhysicsText } from './TerminologyTooltip';
import {
  Copy,
  Check,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Maximize2,
  Minimize2,
  Calculator,
  Layers,
} from 'lucide-react';

interface InteractiveLatexBlockProps {
  formula: PhysicsFormula;
  parameters?: PhysicsParameter[];
  currentParams?: Record<string, number>;
  liveQuantities?: RealtimeQuantity[];
  onParamChange?: (id: string, value: number) => void;
  focusedVariable?: string | null;
  onHoverVariable?: (symbol: string | null) => void;
  index?: number;
  showAllEvaluated?: boolean;
}

export const InteractiveLatexBlock: React.FC<InteractiveLatexBlockProps> = ({
  formula,
  parameters = [],
  currentParams = {},
  liveQuantities = [],
  onParamChange,
  focusedVariable,
  onHoverVariable,
  index = 0,
  showAllEvaluated = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'symbolic' | 'evaluated' | 'derivation'>(
    showAllEvaluated ? 'evaluated' : 'symbolic'
  );
  const [showVariableControls, setShowVariableControls] = useState(false);

  // Sync mode if parent requests all evaluated
  React.useEffect(() => {
    if (showAllEvaluated) {
      setMode('evaluated');
    }
  }, [showAllEvaluated]);

  // Find parameters referenced in this formula
  const relatedParams = useMemo(() => {
    const raw = formula.latex + ' ' + (formula.keyVariables?.join(' ') || '') + ' ' + formula.explanation;
    return parameters.filter((p) => {
      const sym = p.symbol;
      return (
        raw.includes(sym) ||
        raw.includes(`\\${sym}`) ||
        raw.includes(p.id) ||
        (formula.keyVariables && formula.keyVariables.includes(p.id))
      );
    });
  }, [formula, parameters]);

  // Generate dynamic highlighted LaTeX when a variable is focused or parameters change
  const highlightedLatex = useMemo(() => {
    let latex = formula.latex;
    if (!focusedVariable) return latex;

    // Highlight target variable with KaTeX color
    // e.g. replacing 'u' or '\theta' or 'g' with '\textcolor{#38bdf8}{\mathbf{...}}'
    const target = focusedVariable;
    if (target.length === 1 && /[a-zA-Z]/.test(target)) {
      // Single letter variable - replace occurrences that are whole tokens or not inside macros
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\\\[a-zA-Z]*)(${escaped})(?![a-zA-Z])`, 'g');
      latex = latex.replace(regex, `\\textcolor{#38bdf8}{\\mathbf{$1}}`);
    } else if (target.startsWith('\\')) {
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'g');
      latex = latex.replace(regex, `\\textcolor{#38bdf8}{\\mathbf{$1}}`);
    }
    return latex;
  }, [formula.latex, focusedVariable]);

  // Generate live substituted evaluation LaTeX string
  const evaluatedLatex = useMemo(() => {
    // Generate an illustrative substituted equation with real parameters plugged in
    const latex = formula.latex;
    let substituted = latex;

    // Substitute parameter values
    parameters.forEach((p) => {
      const val = currentParams[p.id] ?? p.defaultVal;
      const formattedVal = val % 1 === 0 ? val.toString() : val.toFixed(2);
      const sym = p.symbol;

      if (sym && sym.length === 1) {
        const regex = new RegExp(`(?<!\\\\[a-zA-Z]*)(${sym})(?![a-zA-Z])`, 'g');
        substituted = substituted.replace(regex, `(${formattedVal})`);
      } else if (sym && sym.startsWith('\\')) {
        const regex = new RegExp(`(${sym.replace(/\\/g, '\\\\')})`, 'g');
        substituted = substituted.replace(regex, `(${formattedVal}^\\circ)`);
      }
    });

    // Check if we have a matching live quantity to show final evaluated output
    const matchQuantity = liveQuantities.find(
      (q) =>
        formula.name.toLowerCase().includes(q.label.toLowerCase()) ||
        q.label.toLowerCase().includes(formula.name.toLowerCase()) ||
        (q.symbol && formula.latex.startsWith(q.symbol))
    );

    if (matchQuantity) {
      return `\\begin{aligned} \\text{Symbolic: } & ${formula.latex} \\\\[6pt] \\text{Substituted: } & ${substituted} \\\\[6pt] \\mathbf{\\text{Calculated: }} & \\mathbf{${matchQuantity.symbol || matchQuantity.label} = ${typeof matchQuantity.value === 'number' ? matchQuantity.value.toFixed(2) : matchQuantity.value}\\text{ ${matchQuantity.unit}}} \\end{aligned}`;
    }

    return `\\begin{aligned} \\text{Formula: } & ${formula.latex} \\\\[6pt] \\text{Active Values: } & ${substituted} \\end{aligned}`;
  }, [formula, parameters, currentParams, liveQuantities]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formula.latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        focusedVariable && relatedParams.some((p) => p.symbol === focusedVariable || p.id === focusedVariable)
          ? 'bg-[#151828] border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
          : 'bg-[#0E0E14] border-white/[0.08] hover:border-white/[0.16] shadow-md'
      }`}
    >
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#12121A] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <h4 className="text-xs font-bold text-zinc-100 truncate">{formula.name}</h4>
        </div>

        {/* View Mode Toggle Pill Buttons */}
        <div className="flex items-center gap-1 bg-[#0A0A0E] p-1 rounded-xl border border-white/[0.06] shrink-0">
          <button
            onClick={() => setMode('symbolic')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              mode === 'symbolic'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Standard Symbolic LaTeX"
          >
            Formula
          </button>
          <button
            onClick={() => setMode('evaluated')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
              mode === 'evaluated'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Dynamic Parameter Substitution"
          >
            <Calculator className="w-3 h-3" />
            <span>Plug Values</span>
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="Copy LaTeX Formula"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main LaTeX Math Stage */}
      <div className="p-4 flex flex-col gap-3">
        <div className="bg-[#151520] py-3.5 px-4 rounded-xl border border-white/[0.08] text-center overflow-x-auto my-0.5 shadow-inner">
          {mode === 'symbolic' ? (
            <Latex math={highlightedLatex} displayMode className="text-cyan-200 text-sm md:text-base font-mono" />
          ) : (
            <Latex math={evaluatedLatex} displayMode className="text-cyan-300 text-xs md:text-sm font-mono" />
          )}
        </div>

        {/* Explanation Text */}
        <p className="text-[12px] text-zinc-300 leading-relaxed">
          <HighlightedPhysicsText text={formula.explanation} />
        </p>

        {/* Interactive Parameter Variables Tags Bar */}
        {relatedParams.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Active Variables ({relatedParams.length}):</span>
              </span>
              <button
                onClick={() => setShowVariableControls(!showVariableControls)}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-0.5 transition"
              >
                <span>{showVariableControls ? 'Hide Controls' : 'Adjust Variables'}</span>
                {showVariableControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Variable Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {relatedParams.map((p) => {
                const val = currentParams[p.id] ?? p.defaultVal;
                const isHovered = focusedVariable === p.symbol || focusedVariable === p.id;
                return (
                  <button
                    key={p.id}
                    onMouseEnter={() => onHoverVariable?.(p.symbol)}
                    onMouseLeave={() => onHoverVariable?.(null)}
                    onClick={() => {
                      if (focusedVariable === p.symbol) {
                        onHoverVariable?.(null);
                      } else {
                        onHoverVariable?.(p.symbol);
                      }
                      setShowVariableControls(true);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono transition flex items-center gap-1.5 border ${
                      isHovered
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                        : 'bg-[#181824] text-zinc-300 border-white/[0.08] hover:border-cyan-500/40 hover:text-cyan-200'
                    }`}
                  >
                    <span className="font-bold text-cyan-400">{p.symbol}:</span>
                    <span>
                      {val.toFixed(p.step < 0.1 ? 2 : 1)} {p.unit}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Slider Adjuster Box */}
            {showVariableControls && onParamChange && (
              <div className="p-3 bg-[#121218] rounded-xl border border-white/[0.08] space-y-2.5 mt-1 animate-fadeIn">
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Live Variable Tweaker
                </div>
                {relatedParams.map((p) => {
                  const val = currentParams[p.id] ?? p.defaultVal;
                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium truncate">
                          {p.label} ({p.symbol})
                        </span>
                        <span className="font-mono text-cyan-400 font-bold text-[11px]">
                          {val.toFixed(2)} {p.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={p.min}
                        max={p.max}
                        step={p.step}
                        value={val}
                        onChange={(e) => onParamChange(p.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
