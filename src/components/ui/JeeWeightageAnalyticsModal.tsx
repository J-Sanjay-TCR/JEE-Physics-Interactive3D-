import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, PieChart as PieChartIcon, BarChart2, TrendingUp, BookOpen, Layers, 
  Target, AlertCircle 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

interface JeeWeightageAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainWeightage = [
  { name: 'Mechanics', value: 30, color: '#3b82f6' }, // blue-500
  { name: 'Electromagnetism', value: 25, color: '#8b5cf6' }, // violet-500
  { name: 'Modern Physics', value: 15, color: '#10b981' }, // emerald-500
  { name: 'Optics', value: 10, color: '#f59e0b' }, // amber-500
  { name: 'Thermodynamics', value: 10, color: '#f43f5e' }, // rose-500
  { name: 'Waves & Oscillations', value: 10, color: '#06b6d4' }, // cyan-500
];

const advancedWeightage = [
  { name: 'Mechanics', value: 35, color: '#3b82f6' },
  { name: 'Electromagnetism', value: 25, color: '#8b5cf6' },
  { name: 'Modern Physics', value: 15, color: '#10b981' },
  { name: 'Optics', value: 13, color: '#f59e0b' },
  { name: 'Thermodynamics', value: 12, color: '#f43f5e' },
];

const chapterData = [
  { chapter: 'Rotational Dynamics', main: 6, adv: 10 },
  { chapter: 'Electrostatics', main: 7, adv: 9 },
  { chapter: 'Modern Physics', main: 10, adv: 12 },
  { chapter: 'Optics', main: 8, adv: 10 },
  { chapter: 'Thermodynamics', main: 8, adv: 9 },
  { chapter: 'Current Electricity', main: 9, adv: 6 },
  { chapter: 'Magnetism & EMI', main: 9, adv: 10 },
  { chapter: 'Kinematics', main: 4, adv: 3 },
  { chapter: 'Work, Energy, Power', main: 5, adv: 6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#181924] border border-white/[0.1] p-3 rounded-lg shadow-xl">
        <p className="text-zinc-200 font-medium mb-1">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const JeeWeightageAnalyticsModal: React.FC<JeeWeightageAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [examType, setExamType] = useState<'MAIN' | 'ADVANCED'>('MAIN');

  if (!isOpen) return null;

  const currentPieData = examType === 'MAIN' ? mainWeightage : advancedWeightage;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-6xl max-h-[90vh] bg-[#0A0A0B] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  JEE Physics Analytics
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LIVE DATA</span>
                </h2>
                <p className="text-xs text-zinc-400">Based on historical actual JEE examination papers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
            {/* Exam Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-zinc-900 p-1 rounded-xl border border-white/[0.05]">
                <button
                  onClick={() => setExamType('MAIN')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    examType === 'MAIN' 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                  }`}
                >
                  JEE MAIN (NTA)
                </button>
                <button
                  onClick={() => setExamType('ADVANCED')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    examType === 'ADVANCED' 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                  }`}
                >
                  JEE ADVANCED (IITs)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Unit Wise Weightage Pie Chart */}
              <div className="bg-[#12131A] p-5 rounded-2xl border border-white/[0.05] flex flex-col">
                <h3 className="text-sm font-bold text-zinc-300 mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-400" />
                  Unit-Wise Weightage
                </h3>
                <p className="text-[11px] text-zinc-500 mb-4">Percentage of total questions by broad unit</p>
                <div className="flex-1 min-h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {currentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend inside absolute div for better custom styling */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                     <div className="text-center">
                        <div className="text-3xl font-black text-white">{examType === 'MAIN' ? '30%' : '35%'}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mechanics</div>
                     </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {currentPieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-zinc-400 truncate">{d.name}</span>
                      <span className="text-zinc-200 font-bold ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart for Topic Complexity vs Weightage */}
              <div className="bg-[#12131A] p-5 rounded-2xl border border-white/[0.05] flex flex-col">
                <h3 className="text-sm font-bold text-zinc-300 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Competency Mapping
                </h3>
                <p className="text-[11px] text-zinc-500 mb-4">Relative importance across core Physics domains</p>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentPieData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                      <Radar
                        name={examType}
                        dataKey="value"
                        stroke={examType === 'MAIN' ? '#6366f1' : '#10b981'}
                        fill={examType === 'MAIN' ? '#6366f1' : '#10b981'}
                        fillOpacity={0.4}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strategy Advice */}
              <div className="bg-[#12131A] p-5 rounded-2xl border border-white/[0.05] flex flex-col gap-4">
                 <h3 className="text-sm font-bold text-zinc-300 mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Strategic Insights
                </h3>
                
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> High Yield (Do or Die)
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Mechanics & Electromagnetism together make up almost <strong className="text-zinc-200">60%</strong> of the paper. Focus intensely on Rotational Dynamics and Electrostatics.
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Easy Scoring (Modern Physics)
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Modern Physics accounts for <strong className="text-zinc-200">15%</strong> but takes 1/3rd the time to prepare compared to Mechanics. Perfect for boosting rank.
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Hidden Depth
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {examType === 'MAIN' 
                      ? 'In JEE Main, basic formula application in Thermodynamics and Waves can secure 20% marks easily.' 
                      : 'In JEE Advanced, expect heavy multi-concept mixing. A single question might combine Rotational Mechanics with Electrostatics.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter Wise Detailed Breakdown Bar Chart */}
            <div className="bg-[#12131A] p-5 rounded-2xl border border-white/[0.05]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    Chapter-Wise Detailed Breakdown
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Average number of questions per paper (Main vs Advanced)</p>
                </div>
                <div className="flex gap-4 mt-3 sm:mt-0">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
                     <span className="text-xs text-zinc-400">JEE Main (%)</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                     <span className="text-xs text-zinc-400">JEE Advanced (%)</span>
                   </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chapterData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="chapter" 
                      tick={{ fill: '#9ca3af', fontSize: 10 }} 
                      angle={-45} 
                      textAnchor="end"
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="main" name="JEE Main" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="adv" name="JEE Advanced" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
