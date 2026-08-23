import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsFormula, PhysicsParameter, RealtimeQuantity, CoachingInstituteModule } from '../../types';
import { InteractiveLatexBlock } from './InteractiveLatexBlock';
import { Latex } from './Latex';
import { HighlightedPhysicsText, TerminologyTooltip } from './TerminologyTooltip';
import { getConceptDerivation } from '../../data/conceptDerivations';
import { generateChapterPdf } from '../../utils/pdfGenerator';
import { JeeUnitConverter } from './JeeUnitConverter';
import {
  BookOpen,
  FileText,
  Calculator,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronRight,
  Zap,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Maximize2,
  Download,
  Atom,
  Scale,
} from 'lucide-react';

interface EquationPanelProps {
  formulas: PhysicsFormula[];
  assumptions: string[];
  parameters?: PhysicsParameter[];
  currentParams?: Record<string, number>;
  liveQuantities?: RealtimeQuantity[];
  onParamChange?: (id: string, value: number) => void;
  conceptId?: string;
  chapterId?: string;
  conceptTitle?: string;
  coachingModule?: CoachingInstituteModule;
}

export const EquationPanel: React.FC<EquationPanelProps> = ({
  formulas = [],
  assumptions = [],
  parameters = [],
  currentParams = {},
  liveQuantities = [],
  onParamChange,
  conceptId = '',
  chapterId = '',
  conceptTitle = 'Physics Principles',
  coachingModule,
}) => {
  const [activeTab, setActiveTab] = useState<'formulas' | 'derivation' | 'assumptions' | 'converter'>('formulas');
  const [focusedVariable, setFocusedVariable] = useState<string | null>(null);
  const [showAllEvaluated, setShowAllEvaluated] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownloadPdf = () => {
    const targetChapter = chapterId || 'kinematics';
    setIsDownloading(true);
    try {
      const res = generateChapterPdf(targetChapter);
      setDownloadToast(`Saved ${res.fileName} to Downloads`);
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsDownloading(false), 400);
    }
  };

  // Load comprehensive step-by-step calculus derivation
  const derivationData = useMemo(() => {
    return getConceptDerivation(conceptId || 'projectile-motion');
  }, [conceptId]);

  // Unique list of parameter symbols available in this concept
  const availableVariables = useMemo(() => {
    return parameters.map((p) => ({
      id: p.id,
      label: p.label,
      symbol: p.symbol,
      unit: p.unit,
      val: currentParams[p.id] ?? p.defaultVal,
    }));
  }, [parameters, currentParams]);

  const handleCopyAllFormulas = () => {
    const text = formulas.map((f) => `### ${f.name}\n$$${f.latex}$$\n${f.explanation}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-[#111114]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl flex flex-col gap-4">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Interactive Mathematical Laws & Equations
            </h3>
            <p className="text-[11px] text-zinc-400">
              Real-time parameter variable mapping & step-by-step calculus proofs
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#0A0A0E] p-1 rounded-xl border border-white/[0.08] self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'formulas'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Formulas ({formulas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('derivation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'derivation'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Calculus Derivation</span>
          </button>

          <button
            onClick={() => setActiveTab('assumptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'assumptions'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Boundary Conditions ({assumptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'converter'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Unit Converter</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 active:scale-95 disabled:opacity-50"
            title="Download this Chapter's PDF Formula Sheet to your Downloads folder"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Generating...' : 'PDF Sheet'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{downloadToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Subtab Switching Area */}
      <AnimatePresence mode="wait" initial={false}>
        {/* Main Tab 1: Interactive Formulas Grid */}
        {activeTab === 'formulas' && (
          <motion.div
            key="eq-tab-formulas"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Dynamic Variable Filter / Highlighter Bar */}
            {availableVariables.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0A0A0E] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    Highlight Variable:
                  </span>

                  <button
                    onClick={() => setFocusedVariable(null)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                      focusedVariable === null
                        ? 'bg-white/[0.12] text-white font-bold'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>

                  {availableVariables.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setFocusedVariable(focusedVariable === v.symbol ? null : v.symbol)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition flex items-center gap-1 border ${
                        focusedVariable === v.symbol
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-sm font-bold ring-1 ring-cyan-400/40'
                          : 'bg-[#14141E] text-zinc-300 border-white/[0.08] hover:border-cyan-500/40 hover:text-cyan-200'
                      }`}
                    >
                      <span className="font-bold text-cyan-400">{v.symbol}</span>
                      <span className="text-[10px] text-zinc-400">
                        = {v.val.toFixed(1)} {v.unit}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Toggle Plug-in Values & Copy All */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowAllEvaluated(!showAllEvaluated)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                      showAllEvaluated
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-[#14141E] text-zinc-300 border-white/[0.08] hover:text-white'
                    }`}
                    title="Toggle numerical value substitution across all equations"
                  >
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{showAllEvaluated ? 'Show Symbolic' : 'Plug Live Values'}</span>
                  </button>

                  <button
                    onClick={handleCopyAllFormulas}
                    className="p-1.5 rounded-lg bg-[#14141E] text-zinc-400 hover:text-white border border-white/[0.08] transition"
                    title="Copy All LaTeX Equations"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Formula Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {formulas.map((formula, idx) => (
                <InteractiveLatexBlock
                  key={idx}
                  formula={formula}
                  parameters={parameters}
                  currentParams={currentParams}
                  liveQuantities={liveQuantities}
                  onParamChange={onParamChange}
                  focusedVariable={focusedVariable}
                  onHoverVariable={setFocusedVariable}
                  index={idx}
                  showAllEvaluated={showAllEvaluated}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Tab 2: Step-by-Step Calculus Derivation */}
        {activeTab === 'derivation' && (
          <motion.div
            key="eq-tab-derivation"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Derivation Overview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#141424] to-[#101018] border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-zinc-100">{derivationData.title}</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  JEE Advanced Rigor
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                <span className="font-semibold text-zinc-100">Governing Principle:</span> {derivationData.coreLaw}
              </p>
            </div>

            {/* Sequential Derivation Steps */}
            <div className="space-y-3">
              {derivationData.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-[#0E0E14] border border-white/[0.08] hover:border-indigo-500/30 transition space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                      {step.stepNumber}
                    </span>
                    <h5 className="text-xs font-bold text-zinc-200">{step.title}</h5>
                  </div>

                  <div className="py-3 px-4 rounded-xl bg-[#14141F] border border-white/[0.06] text-center overflow-x-auto my-1 shadow-inner">
                    <Latex math={step.latex} displayMode className="text-cyan-200 font-mono text-xs sm:text-sm" />
                  </div>

                  <p className="text-[12px] text-zinc-400 leading-relaxed">
                    <HighlightedPhysicsText text={step.explanation} />
                  </p>
                </div>
              ))}
            </div>

            {/* Final Boxed Result & JEE Exam Insight */}
            <div className="p-4 rounded-2xl bg-[#151522] border border-cyan-500/30 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Final Derived Master Equations:</span>
              </div>
              <div className="py-3 px-4 rounded-xl bg-[#0C0C12] border border-cyan-500/20 text-center overflow-x-auto">
                <Latex math={derivationData.finalResultLatex} displayMode className="text-cyan-300 font-mono text-sm" />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-200/90 leading-relaxed">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">JEE Examiner Pro-Tip: </span>
                  <HighlightedPhysicsText text={derivationData.jeeInsight} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Tab 3: Idealized Assumptions & Boundary Conditions */}
        {activeTab === 'assumptions' && (
          <motion.div
            key="eq-tab-assumptions"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-[#0E0E12]/80 p-4 rounded-2xl border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Idealized Assumptions & Model Validity Limits</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                All mathematical formulas in JEE mechanics & electromagnetism operate strictly under specific physical approximations. Verify these boundary conditions before applying formulas to numerical problems.
              </p>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {assumptions.map((a, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-[#14141D] border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>
                      <HighlightedPhysicsText text={a} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Derivation Boundary Conditions */}
            {derivationData.boundaryConditions.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0E0E12] border border-white/[0.08] space-y-2">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Analytical Limits & Edge Cases:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                  {derivationData.boundaryConditions.map((bc, idx) => (
                    <li key={idx}>
                      <HighlightedPhysicsText text={bc} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Tab 4: JEE Unit & Dimension Converter */}
        {activeTab === 'converter' && (
          <motion.div
            key="eq-tab-converter"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <JeeUnitConverter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
