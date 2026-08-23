import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsConcept, SpecialCase } from '../../types';
import { Latex } from './Latex';
import { HighlightedPhysicsText, TerminologyTooltip } from './TerminologyTooltip';
import {
  BookOpen,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Table,
  CheckCircle2,
  Bookmark,
  Layers,
  GraduationCap,
  ArrowRight,
  Filter,
  Atom,
} from 'lucide-react';

interface CoachingModulePanelProps {
  concept: PhysicsConcept;
  onApplyPreset?: (preset: Record<string, number>) => void;
  onSwitchToSimulation?: () => void;
}

export const CoachingModulePanel: React.FC<CoachingModulePanelProps> = ({
  concept,
  onApplyPreset,
  onSwitchToSimulation,
}) => {
  const module = concept.coachingModule;
  const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState(0);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  if (!module) {
    return (
      <div className="bg-[#111114]/90 backdrop-blur-md rounded-2xl p-6 border border-white/[0.08] text-center text-zinc-400 text-sm">
        Coaching module content is loading for {concept.title}...
      </div>
    );
  }

  const subtopics = module.subtopics || [];
  const activeSubtopic = subtopics[selectedSubtopicIndex] || subtopics[0];

  const allCases: SpecialCase[] = subtopics.flatMap((st) => st.cases || []);
  const filteredCases = allCases.filter((c) => {
    if (filterTag === 'all') return true;
    return c.categoryTag === filterTag;
  });

  const availableTags = Array.from(
    new Set(allCases.map((c) => c.categoryTag).filter(Boolean))
  ) as string[];

  const handleApply = (caseItem: SpecialCase) => {
    if (caseItem.parameterPreset && onApplyPreset) {
      onApplyPreset(caseItem.parameterPreset);
      if (onSwitchToSimulation) {
        onSwitchToSimulation();
      }
    }
  };

  return (
    <div className="bg-[#111114]/95 backdrop-blur-md rounded-2xl p-5 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      {/* Module Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {module.chapterCode || 'JEE ADVANCED MODULE'}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Coaching Theory & Cases</span>
            </div>
            <h3 className="text-base font-bold text-zinc-100 mt-0.5">
              {concept.title}: Subtopics & Special Cases
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-900/80 p-1 rounded-xl border border-white/[0.06]">
          <span className="text-[11px] font-semibold text-zinc-400 px-2 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-amber-400" /> {allCases.length} Special Cases
          </span>
        </div>
      </div>

      {/* Chapter Synopsis */}
      <div className="bg-gradient-to-r from-blue-950/20 via-zinc-900/40 to-purple-950/20 border border-white/[0.08] p-4 rounded-xl text-xs text-zinc-300 leading-relaxed">
        <div className="flex items-center gap-1.5 text-zinc-200 font-semibold mb-1.5 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>Core Physical Synopsis</span>
        </div>
        <div className="text-zinc-300/90 leading-relaxed">
          <HighlightedPhysicsText text={module.synopsis || ''} />
        </div>
      </div>

      {/* Subtopic Selector Tabs */}
      {subtopics.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {subtopics.map((st, idx) => (
            <button
              key={st.id || idx}
              onClick={() => setSelectedSubtopicIndex(idx)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 ${
                selectedSubtopicIndex === idx
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/40'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-white/[0.06]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{st.title}</span>
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                {(st.cases || []).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active Subtopic Summary & Key Points with Animation */}
      <AnimatePresence mode="wait">
        {activeSubtopic && (
          <motion.div
            key={`subtopic-${selectedSubtopicIndex}`}
            initial={{ opacity: 0, y: 6, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0B0B0E] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {activeSubtopic.title}
              </h4>
            </div>
            <div className="text-xs text-zinc-400 leading-relaxed">
              <HighlightedPhysicsText text={activeSubtopic.summary || ''} />
            </div>

            {/* Key Postulates / Points */}
            {(activeSubtopic.keyPoints || []).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {(activeSubtopic.keyPoints || []).map((pt, pIdx) => (
                  <div
                    key={pIdx}
                    className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/[0.04] text-xs text-zinc-300 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-snug flex-1">
                      <HighlightedPhysicsText text={pt} />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Derivation / Direct Shortcuts */}
            {activeSubtopic.shortcuts && activeSubtopic.shortcuts.length > 0 && (
              <div className="mt-2 pt-3 border-t border-white/[0.06]">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Coaching Institute Shortcuts & Speed Techniques
                </div>
                <div className="flex flex-col gap-1.5">
                  {activeSubtopic.shortcuts.map((sc, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-amber-950/20 border border-amber-800/30 px-3 py-2 rounded-lg text-xs text-amber-200/90 leading-relaxed font-medium"
                    >
                      <Latex>{sc}</Latex>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Special Cases & Boundary Conditions Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Exhaustive Special Cases, Boundary Conditions & Limits
            </h4>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                filterTag === 'all'
                  ? 'bg-zinc-200 text-zinc-900 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({allCases.length})
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  filterTag === tag
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Cases Grid / Accordion */}
        <div className="flex flex-col gap-3">
          {filteredCases.map((caseItem) => {
            const isExpanded = expandedCaseId === caseItem.id;
            const hasPreset = !!caseItem.parameterPreset;

            return (
              <div
                key={caseItem.id}
                className="bg-[#0D0D11] border border-white/[0.08] hover:border-white/[0.15] rounded-xl overflow-hidden transition-all duration-200"
              >
                {/* Case Header Card */}
                <div
                  onClick={() => setExpandedCaseId(isExpanded ? null : caseItem.id)}
                  className="p-3.5 cursor-pointer flex items-start sm:items-center justify-between gap-3 select-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                        caseItem.categoryTag === 'Special Case'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : caseItem.categoryTag === 'Boundary Condition'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : caseItem.categoryTag === 'JEE Advanced'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : caseItem.categoryTag === 'Extreme Limit'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {caseItem.categoryTag || 'Case'}
                    </span>
                    <span className="text-xs font-bold text-zinc-100">{caseItem.title}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasPreset && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Sliders className="w-2.5 h-2.5" /> Sim Ready
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Case Expanded Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] flex flex-col gap-3.5 bg-black/20">
                    {/* Condition & Equation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      <div className="bg-zinc-900/80 p-3 rounded-lg border border-white/[0.04]">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                          Trigger Condition
                        </div>
                        <div className="text-xs text-amber-300 font-semibold">
                          <Latex>{caseItem.conditionLatex}</Latex>
                        </div>
                      </div>

                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-800/30">
                        <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider mb-1">
                          Direct Formula Result
                        </div>
                        <div className="text-xs text-blue-200 font-semibold">
                          <Latex>{caseItem.formulaLatex}</Latex>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-zinc-300 leading-relaxed">
                      <Latex>{caseItem.description}</Latex>
                    </div>

                    {/* Physical Significance */}
                    {caseItem.physicalSignificance && (
                      <div className="text-xs text-zinc-400 bg-zinc-900/50 p-2.5 rounded-lg border border-white/[0.04]">
                        <span className="font-semibold text-zinc-300">Physical Insight: </span>
                        <Latex>{caseItem.physicalSignificance}</Latex>
                      </div>
                    )}

                    {/* Trap Alert */}
                    {caseItem.jeeTrapAlert && (
                      <div className="bg-rose-950/25 border border-rose-800/40 p-3 rounded-lg text-xs text-rose-200/90 leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-300">Negative Marking Trap: </span>
                          <Latex>{caseItem.jeeTrapAlert}</Latex>
                        </div>
                      </div>
                    )}

                    {/* Simulate Button */}
                    {hasPreset && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleApply(caseItem)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md flex items-center gap-1.5 transition"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Simulate This Exact Case</span>
                          <ArrowRight className="w-3 h-3 ml-0.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Tables */}
      {module.comparisonTables && module.comparisonTables.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Coaching Institute Comparison & Classification Matrix
            </h4>
          </div>

          {(module.comparisonTables || []).map((table, tIdx) => (
            <div
              key={tIdx}
              className="bg-[#0B0B0E] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg"
            >
              <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 px-4 py-2.5 border-b border-white/[0.06] text-xs font-bold text-purple-200 flex items-center justify-between">
                <span>{table.title}</span>
                <span className="text-[10px] text-zinc-500 font-mono font-normal">
                  {(table.rows || []).length} rows × {(table.headers || []).length} columns
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-[#14141E] border-b border-white/[0.08]">
                      {(table.headers || []).map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className={`py-3 px-4 font-semibold text-purple-200 text-[11px] uppercase tracking-wider border-r border-white/[0.04] last:border-r-0 align-top whitespace-normal break-words leading-relaxed ${
                            hIdx === 0 ? 'w-1/4 min-w-[150px]' : 'min-w-[150px]'
                          }`}
                        >
                          <div className="leading-snug">
                            <Latex>{h}</Latex>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(table.rows || []).map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-purple-500/[0.03] transition-colors even:bg-white/[0.01]"
                      >
                        {(row || []).map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-3 px-4 border-r border-white/[0.04] last:border-r-0 align-top whitespace-normal break-words leading-relaxed ${
                              cIdx === 0
                                ? 'font-semibold text-zinc-100 bg-white/[0.015] w-1/4 min-w-[150px]'
                                : 'text-zinc-300 min-w-[150px]'
                            }`}
                          >
                            <div className="leading-relaxed">
                              <Latex>{cell}</Latex>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Approximations & Boundary Validity Matrix */}
      {module.standardApproximations && module.standardApproximations.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Standard Physical Approximations & Validity Regimes
            </h4>
          </div>

          <div className="bg-[#0B0B0E] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 px-4 py-2.5 border-b border-white/[0.06] text-xs font-bold text-emerald-200 flex items-center justify-between">
              <span>Idealized Limits vs Exact Physical Laws</span>
              <span className="text-[10px] text-zinc-500 font-mono font-normal">
                {module.standardApproximations.length} Conditions
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-[#121816] border-b border-white/[0.08]">
                    <th className="py-3 px-4 font-semibold text-emerald-200 text-[11px] uppercase tracking-wider border-r border-white/[0.04] w-1/4 min-w-[160px] align-top whitespace-normal break-words leading-relaxed">
                      Physical Regime / Condition
                    </th>
                    <th className="py-3 px-4 font-semibold text-emerald-200 text-[11px] uppercase tracking-wider border-r border-white/[0.04] w-1/4 min-w-[150px] align-top whitespace-normal break-words leading-relaxed">
                      Exact Formulation
                    </th>
                    <th className="py-3 px-4 font-semibold text-emerald-200 text-[11px] uppercase tracking-wider border-r border-white/[0.04] w-1/4 min-w-[150px] align-top whitespace-normal break-words leading-relaxed">
                      JEE Approximation
                    </th>
                    <th className="py-3 px-4 font-semibold text-emerald-200 text-[11px] uppercase tracking-wider last:border-r-0 w-1/4 min-w-[160px] align-top whitespace-normal break-words leading-relaxed">
                      Validity Range & Limits
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {module.standardApproximations.map((approx, aIdx) => (
                    <tr
                      key={aIdx}
                      className="hover:bg-emerald-500/[0.03] transition-colors even:bg-white/[0.01]"
                    >
                      <td className="py-3 px-4 border-r border-white/[0.04] align-top font-semibold text-zinc-100 bg-white/[0.015] whitespace-normal break-words leading-relaxed">
                        <Latex>{approx.condition || ''}</Latex>
                      </td>
                      <td className="py-3 px-4 border-r border-white/[0.04] align-top text-zinc-300 whitespace-normal break-words leading-relaxed font-mono text-[11px]">
                        <Latex>{approx.exactFormula || ''}</Latex>
                      </td>
                      <td className="py-3 px-4 border-r border-white/[0.04] align-top text-emerald-300 font-medium whitespace-normal break-words leading-relaxed font-mono text-[11px]">
                        <Latex>{approx.approxFormula || ''}</Latex>
                      </td>
                      <td className="py-3 px-4 align-top text-zinc-400 whitespace-normal break-words leading-relaxed text-[11px]">
                        <Latex>{approx.validityRange || ''}</Latex>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Frequently Tested JEE Tricks & Memorization Aids */}
      {module.frequentlyTestedTricks && module.frequentlyTestedTricks.length > 0 && (
        <div className="bg-amber-950/15 border border-amber-800/30 p-4 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Coaching Institute High-Yield Exam Tricks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {module.frequentlyTestedTricks.map((trick, trIdx) => (
              <div
                key={trIdx}
                className="bg-black/30 p-2.5 rounded-lg border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed font-medium"
              >
                ⚡ <Latex>{trick || ''}</Latex>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
