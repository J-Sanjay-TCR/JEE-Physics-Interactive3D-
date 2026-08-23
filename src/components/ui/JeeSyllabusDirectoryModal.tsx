import React, { useState, useMemo } from 'react';
import { JEE_SYLLABUS_DIRECTORY, JeeChapterSyllabusItem } from '../../data/jeeSyllabusDirectory';
import { ALL_CONCEPTS } from '../../data/allConcepts';
import { PhysicsConcept } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpen,
  Boxes,
  Search,
  Sliders,
  Play,
  CheckCircle2,
  Copy,
  Download,
  X,
  FileCode,
  Sparkles,
  Layers,
  ExternalLink,
  ChevronRight,
  Flame,
  Zap,
  Atom,
  Eye,
  Activity,
  Check,
} from 'lucide-react';

interface JeeSyllabusDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConcept: (concept: PhysicsConcept) => void;
}

export const JeeSyllabusDirectoryModal: React.FC<JeeSyllabusDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectConcept,
}) => {
  const { isDark, isCyberpunk } = useTheme();
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const units = ['All', 'Mechanics', 'Thermal Physics', 'Electricity & Magnetism', 'Optics', 'Modern Physics'] as const;

  const filteredList = useMemo(() => {
    return JEE_SYLLABUS_DIRECTORY.filter((item) => {
      const matchesUnit = selectedUnit === 'All' || item.unit_name === selectedUnit;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesUnit;

      const matchesSearch =
        item.chapter_name.toLowerCase().includes(query) ||
        item.core_explanation.toLowerCase().includes(query) ||
        item.important_cases.some((c) => c.toLowerCase().includes(query)) ||
        item['3d_model_spec'].interactive_variables.some((v) => v.toLowerCase().includes(query));

      return matchesUnit && matchesSearch;
    });
  }, [selectedUnit, searchQuery]);

  const handleLaunch = (conceptId: string) => {
    const target = ALL_CONCEPTS.find((c) => c.id === conceptId) || ALL_CONCEPTS[0];
    onSelectConcept(target);
    onClose();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(JEE_SYLLABUS_DIRECTORY, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyMarkdown = () => {
    let md = '# JEE Main & Advanced Physics Syllabus & 3D Interactive Lab Directory\n\n';
    JEE_SYLLABUS_DIRECTORY.forEach((item) => {
      md += `### ${item.chapter_name} (${item.unit_name})\n\n`;
      md += `**Core Explanation:**\n${item.core_explanation}\n\n`;
      md += `**Important JEE Cases:**\n`;
      item.important_cases.forEach((c) => {
        md += `- ${c}\n`;
      });
      md += `\n**3D Model Specification:**\n`;
      md += `- **Visual Scene:** ${item['3d_model_spec'].visual_description}\n`;
      md += `- **Interactive Variables:** ${item['3d_model_spec'].interactive_variables.join(', ')}\n`;
      md += `- **Expected Behavior:** ${item['3d_model_spec'].expected_behavior}\n\n`;
      md += `---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case 'Mechanics':
        return <Atom className="w-3.5 h-3.5 text-blue-400" />;
      case 'Thermal Physics':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Electricity & Magnetism':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'Optics':
        return <Eye className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'Modern Physics':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Boxes className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getUnitBadgeColor = (unit: string) => {
    switch (unit) {
      case 'Mechanics':
        return isCyberpunk
          ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
          : 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Thermal Physics':
        return isCyberpunk
          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
          : 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Electricity & Magnetism':
        return isCyberpunk
          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40'
          : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'Optics':
        return isCyberpunk
          ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40'
          : 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30';
      case 'Modern Physics':
        return isCyberpunk
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="jee-syllabus-directory-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'jee-syllabus-directory-modal-backdrop') {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isCyberpunk
            ? 'bg-[#040914] border-cyan-500/30 text-zinc-100 shadow-[0_0_50px_rgba(0,240,255,0.15)]'
            : isDark
            ? 'bg-[#0c0c12] border-white/10 text-zinc-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b ${
            isCyberpunk
              ? 'bg-[#061022]/90 border-cyan-500/20'
              : isDark
              ? 'bg-zinc-900/80 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                isCyberpunk
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : isDark
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${
                    isCyberpunk
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                      : isDark
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  }`}
                >
                  JEE Main & Advanced 2026
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {JEE_SYLLABUS_DIRECTORY.length} Interactive 3D Chapters
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5 flex items-center gap-2">
                Syllabus & 3D Interactive Specs Directory
              </h2>
            </div>
          </div>

          {/* Quick Action Tools: Search & Export */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopyJson}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                copiedType === 'json'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isCyberpunk
                  ? 'bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border-cyan-500/30'
                  : isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Copy the complete syllabus JSON schema"
            >
              {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
              <span>{copiedType === 'json' ? 'JSON Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                copiedType === 'markdown'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isCyberpunk
                  ? 'bg-fuchsia-950/40 hover:bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-500/30'
                  : isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Copy the formatted Markdown content brief"
            >
              {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copiedType === 'markdown' ? 'Brief Copied!' : 'Export Brief'}</span>
            </button>

            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                isCyberpunk
                  ? 'bg-cyan-950/30 hover:bg-cyan-900/50 text-zinc-300 border-cyan-500/30'
                  : isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          className={`p-4 border-b flex flex-col md:flex-row items-center justify-between gap-3 ${
            isCyberpunk
              ? 'bg-[#030712] border-cyan-500/20'
              : isDark
              ? 'bg-[#0a0a10] border-white/5'
              : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          {/* Unit selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {units.map((unit) => {
              const active = selectedUnit === unit;
              return (
                <button
                  key={unit}
                  onClick={() => setSelectedUnit(unit)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    active
                      ? isCyberpunk
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : isDark
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-blue-600 text-white border-blue-600 shadow'
                      : isCyberpunk
                      ? 'bg-cyan-950/20 text-zinc-400 border-cyan-500/20 hover:text-cyan-300 hover:bg-cyan-950/40'
                      : isDark
                      ? 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-zinc-200 hover:bg-zinc-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {unit !== 'All' && getUnitIcon(unit)}
                  <span>{unit}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chapters, cases, sliders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-1.5 rounded-xl text-xs border outline-none transition-all ${
                isCyberpunk
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 placeholder-zinc-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  : isDark
                  ? 'bg-zinc-900 border-white/10 text-zinc-200 placeholder-zinc-500 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Chapter Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
              <BookOpen className="w-10 h-10 stroke-1" />
              <p className="text-sm font-medium">No matching physics chapters found.</p>
              <button
                onClick={() => {
                  setSelectedUnit('All');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-xl ${
                    isCyberpunk
                      ? 'bg-gradient-to-b from-[#061226]/80 to-[#040916]/90 border-cyan-500/25 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.08)]'
                      : isDark
                      ? 'bg-[#111116] border-white/10 hover:border-white/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Unit & Chapter Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${getUnitBadgeColor(
                              item.unit_name
                            )}`}
                          >
                            {getUnitIcon(item.unit_name)}
                            {item.unit_name}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                          {item.chapter_name}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleLaunch(item.conceptId)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 whitespace-nowrap shadow-sm ${
                          isCyberpunk
                            ? 'bg-cyan-500 text-black border-cyan-400 hover:bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                            : isDark
                            ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch 3D Lab</span>
                      </button>
                    </div>

                    {/* Core Explanation */}
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isCyberpunk
                          ? 'bg-cyan-950/20 border-cyan-500/20 text-zinc-300'
                          : isDark
                          ? 'bg-zinc-900/60 border-white/5 text-zinc-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-zinc-100 block mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        Core Concept Summary
                      </span>
                      {item.core_explanation}
                    </div>

                    {/* Important JEE Cases */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        High-Yield JEE Cases ({item.important_cases.length})
                      </div>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {item.important_cases.map((scenario, idx) => (
                          <li
                            key={idx}
                            className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 ${
                              isCyberpunk
                                ? 'bg-zinc-900/40 border-cyan-500/10'
                                : isDark
                                ? 'bg-zinc-900/40 border-white/5'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{scenario}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 3D Model Specification */}
                    <div
                      className={`p-3 rounded-xl border space-y-2.5 text-xs ${
                        isCyberpunk
                          ? 'bg-[#02050e] border-cyan-500/30'
                          : isDark
                          ? 'bg-zinc-950 border-white/10'
                          : 'bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5" />
                          3D Interactive Model Specification
                        </span>
                      </div>

                      {/* Visual Description */}
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong className="text-zinc-100">Visual Scene:</strong>{' '}
                        {item['3d_model_spec'].visual_description}
                      </p>

                      {/* Interactive Variables */}
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block mb-1.5 flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-cyan-400" />
                          Interactive Sliders & Variables ({item['3d_model_spec'].interactive_variables.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item['3d_model_spec'].interactive_variables.map((variable, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                                isCyberpunk
                                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                  : isDark
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Expected Behavior */}
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong className="text-emerald-400">Simulation Dynamics:</strong>{' '}
                        {item['3d_model_spec'].expected_behavior}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info & stats */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isCyberpunk
              ? 'bg-[#061022] border-cyan-500/20 text-zinc-400'
              : isDark
              ? 'bg-zinc-900 text-zinc-400 border-white/10'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All 21 JEE Physics chapters equipped with live 3D physics rendering</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-semibold text-zinc-300">
              Showing {filteredList.length} of {JEE_SYLLABUS_DIRECTORY.length} topics
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
