import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JeeMainInsight, JeeAdvancedInsight } from '../../types';
import { Award, AlertTriangle, Zap, Layers, Flame, CheckCircle2 } from 'lucide-react';
import { Latex } from './Latex';
import { TrendAnalysisChart } from './TrendAnalysisChart';
import { LineChart } from 'lucide-react';

interface JeeInsightsPanelProps {
  jeeMain: JeeMainInsight;
  jeeAdvanced: JeeAdvancedInsight;
  conceptTitle?: string;
}

export const JeeInsightsPanel: React.FC<JeeInsightsPanelProps> = ({
  jeeMain,
  jeeAdvanced,
  conceptTitle = 'Physics Concept',
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'advanced' | 'trend'>('main');

  return (
    <div className="bg-[#111114]/90 backdrop-blur-md rounded-2xl p-5 border border-white/[0.08] shadow-xl flex flex-col gap-4">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            JEE Exam Strategy & Trap Alerts
          </span>
        </div>

        <div className="flex items-center bg-[#0A0A0E] p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('main')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'main'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            JEE Main
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'advanced'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3 h-3 text-pink-300" />
            JEE Advanced
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LineChart className="w-3 h-3 text-emerald-300" />
            Trend
          </button>
        </div>
      </div>

      {/* Tab Content with Smooth Transitions */}
      <AnimatePresence mode="wait" initial={false}>
        {/* Content for JEE Main */}
        {activeTab === 'main' && (
          <motion.div
            key="jee-tab-main"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl">
              <span className="text-xs text-blue-200 font-medium">Exam Weightage Level</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {jeeMain.weightage} Priority
              </span>
            </div>

            {/* Common Question Patterns */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                High-Frequency Question Archetypes
              </h4>
              <div className="flex flex-col gap-2">
                {jeeMain.commonPatterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0E0E12] p-3 rounded-xl border border-white/[0.06] text-xs text-zinc-300 leading-relaxed"
                  >
                    <Latex>{pat}</Latex>
                  </div>
                ))}
              </div>
            </div>

            {/* Shortcuts & Speed Techniques */}
            {jeeMain.keyShortcuts && jeeMain.keyShortcuts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Formula Shortcuts & Direct Results
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {jeeMain.keyShortcuts.map((sc, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-xl text-xs text-amber-200/90 leading-relaxed"
                    >
                      <Latex>{sc}</Latex>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trap Alerts */}
            {jeeMain.trapAlerts && jeeMain.trapAlerts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Common Conceptual Traps (Negative Marking Traps)
                </h4>
                <div className="flex flex-col gap-2">
                  {jeeMain.trapAlerts.map((trap, idx) => (
                    <div
                      key={idx}
                      className="bg-rose-950/25 border border-rose-800/40 p-3 rounded-xl text-xs text-rose-200/90 leading-relaxed flex items-start gap-2"
                    >
                      <span className="font-bold text-rose-400">⚠️</span>
                      <span className="flex-1"><Latex>{trap}</Latex></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Content for JEE Advanced */}
        {activeTab === 'advanced' && (
          <motion.div
            key="jee-tab-advanced"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between bg-purple-950/30 border border-purple-800/40 p-3 rounded-xl">
              <span className="text-xs text-purple-200 font-medium">Concept Depth Level</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {jeeAdvanced.weightage} Advanced Rigor
              </span>
            </div>

            {/* Deep Conceptual Insights */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Advanced Analytical Insights
              </h4>
              <div className="flex flex-col gap-2">
                {jeeAdvanced.deepConcepts.map((dc, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0E0E12] p-3 rounded-xl border border-white/[0.06] text-xs text-zinc-300 leading-relaxed"
                  >
                    <Latex>{dc}</Latex>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Concept Linkages */}
            {jeeAdvanced.multiConceptLinks && jeeAdvanced.multiConceptLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-pink-400" />
                  Multi-Chapter Cross-Linkages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {jeeAdvanced.multiConceptLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="bg-pink-950/20 border border-pink-800/30 p-2.5 rounded-xl text-xs text-pink-200/90 leading-relaxed"
                    >
                      <Latex>{link}</Latex>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculus Formulations */}
            {jeeAdvanced.calculusFormulations && jeeAdvanced.calculusFormulations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Calculus & Differential Formulations
                </h4>
                <div className="flex flex-col gap-2">
                  {jeeAdvanced.calculusFormulations.map((calc, idx) => (
                    <div
                      key={idx}
                      className="bg-cyan-950/20 border border-cyan-800/30 p-3 rounded-xl text-xs text-cyan-200/90"
                    >
                      <Latex math={calc} displayMode />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      
        {/* Content for Trend Analysis */}
        {activeTab === 'trend' && (
          <motion.div
            key="jee-tab-trend"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl mb-2">
              <span className="text-xs text-emerald-200 font-medium">Historical Weightage Trend</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                13-Year Data
              </span>
            </div>
            
            <TrendAnalysisChart conceptTitle={conceptTitle} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
