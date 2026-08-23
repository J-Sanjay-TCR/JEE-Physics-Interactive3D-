import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_CONCEPTS } from '../../data/allConcepts';
import { PhysicsConcept, CategoryId, SpecialCase } from '../../types';
import { Latex } from './Latex';
import { generateChapterPdf, generateMasterCompendiumPdf } from '../../utils/pdfGenerator';
import {
  Search,
  X,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Flame,
  Atom,
  Eye,
  Activity,
  Ruler,
  AlertTriangle,
  GraduationCap,
  LogOut,
  Layers,
  ChevronRight,
  Filter,
  ArrowRight,
  Compass,
  Download,
  Printer,
} from 'lucide-react';

interface FormulaDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConcept: (concept: PhysicsConcept, preset?: Record<string, number>) => void;
}

export const FormulaDirectoryModal: React.FC<FormulaDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectConcept,
}) => {
  const [viewMode, setViewMode] = useState<'formulas' | 'cases'>('formulas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [downloadingChapterId, setDownloadingChapterId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<{ fileName: string } | null>(null);

  const handleDownloadChapter = (chapterId: string) => {
    setDownloadingChapterId(chapterId);
    try {
      const res = generateChapterPdf(chapterId);
      setDownloadToast({ fileName: res.fileName });
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloadingChapterId(null), 400);
    }
  };

  const handleDownloadMaster = () => {
    setDownloadingChapterId('master');
    try {
      const res = generateMasterCompendiumPdf();
      setDownloadToast({ fileName: res.fileName });
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloadingChapterId(null), 400);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Flatten all formulas with parent concept metadata
  const allFormulas = useMemo(() => {
    const list: {
      formula: { name: string; latex: string; explanation: string; keyVariables?: string[] };
      concept: PhysicsConcept;
      index: number;
    }[] = [];

    ALL_CONCEPTS.forEach((c) => {
      c.formulas.forEach((f, idx) => {
        list.push({
          formula: f,
          concept: c,
          index: idx,
        });
      });
    });
    return list;
  }, []);

  // Flatten all special cases with parent concept metadata
  const allCases = useMemo(() => {
    const list: {
      caseItem: SpecialCase;
      concept: PhysicsConcept;
    }[] = [];

    ALL_CONCEPTS.forEach((c) => {
      const cases = c.specialCases || c.coachingModule?.subtopics.flatMap((st) => st.cases) || [];
      cases.forEach((cs) => {
        list.push({
          caseItem: cs,
          concept: c,
        });
      });
    });
    return list;
  }, []);

  // Category list with accurate counts
  const categories = useMemo(() => {
    const getCount = (catId: string) => {
      if (viewMode === 'formulas') {
        return catId === 'all'
          ? allFormulas.length
          : allFormulas.filter((f) => f.concept.category === catId).length;
      } else {
        return catId === 'all'
          ? allCases.length
          : allCases.filter((c) => c.concept.category === catId).length;
      }
    };

    return [
      { id: 'all', label: 'All Chapters', count: getCount('all'), icon: BookOpen },
      { id: 'mechanics', label: 'Mechanics', count: getCount('mechanics'), icon: Atom },
      { id: 'thermal', label: 'Thermal Physics', count: getCount('thermal'), icon: Flame },
      { id: 'electromagnetism', label: 'Electrodynamics', count: getCount('electromagnetism'), icon: Zap },
      { id: 'waves-oscillations', label: 'Waves & SHM', count: getCount('waves-oscillations'), icon: Activity },
      { id: 'optics', label: 'Optics', count: getCount('optics'), icon: Eye },
      { id: 'modern', label: 'Modern Physics', count: getCount('modern'), icon: Sparkles },
      { id: 'experimental', label: 'Experimental', count: getCount('experimental'), icon: Ruler },
    ];
  }, [allFormulas, allCases, viewMode]);

  // Quick filter tags
  const quickTags = [
    'Projectile',
    'Friction',
    'Circular Motion',
    'SHM',
    'Rolling Motion',
    'Biot-Savart',
    'Photoelectric',
    'Young\'s Double Slit',
  ];

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return allFormulas.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.concept.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const matchesSearch =
        item.formula.name.toLowerCase().includes(q) ||
        item.formula.latex.toLowerCase().includes(q) ||
        item.formula.explanation.toLowerCase().includes(q) ||
        item.concept.title.toLowerCase().includes(q) ||
        item.concept.chapterId.toLowerCase().includes(q) ||
        item.concept.topic.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [allFormulas, selectedCategory, searchQuery]);

  // Group filtered formulas by Concept for structured hierarchy
  const groupedFormulas = useMemo(() => {
    const groups: { concept: PhysicsConcept; items: typeof filteredFormulas }[] = [];
    const map = new Map<string, typeof filteredFormulas>();

    filteredFormulas.forEach((item) => {
      const cid = item.concept.id;
      if (!map.has(cid)) {
        map.set(cid, []);
      }
      map.get(cid)!.push(item);
    });

    map.forEach((items) => {
      if (items.length > 0) {
        groups.push({
          concept: items[0].concept,
          items,
        });
      }
    });

    return groups;
  }, [filteredFormulas]);

  // Filter cases
  const filteredCases = useMemo(() => {
    return allCases.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.concept.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const matchesSearch =
        item.caseItem.title.toLowerCase().includes(q) ||
        item.caseItem.description.toLowerCase().includes(q) ||
        item.caseItem.conditionLatex.toLowerCase().includes(q) ||
        item.caseItem.formulaLatex.toLowerCase().includes(q) ||
        item.concept.title.toLowerCase().includes(q) ||
        item.concept.topic.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [allCases, selectedCategory, searchQuery]);

  // Group filtered cases by Concept
  const groupedCases = useMemo(() => {
    const groups: { concept: PhysicsConcept; items: typeof filteredCases }[] = [];
    const map = new Map<string, typeof filteredCases>();

    filteredCases.forEach((item) => {
      const cid = item.concept.id;
      if (!map.has(cid)) {
        map.set(cid, []);
      }
      map.get(cid)!.push(item);
    });

    map.forEach((items) => {
      if (items.length > 0) {
        groups.push({
          concept: items[0].concept,
          items,
        });
      }
    });

    return groups;
  }, [filteredCases]);

  const handleCopy = (latex: string, id: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md cursor-pointer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="formula-hub-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-7xl h-[92vh] max-h-[920px] bg-[#0c1018] border border-cyan-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-zinc-100 cursor-default"
          >
            {/* Top Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#111622] gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 shrink-0 shadow-sm">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 id="formula-hub-title" className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                      JEE Master Formula & Physics Law Hub
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      JEE Main & Adv
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                    Hierarchically organized equations, governing laws, parameter presets, and boundary limits
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {/* View Mode Switcher */}
                <div className="flex items-center bg-[#070A0F] p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setViewMode('formulas')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      viewMode === 'formulas'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Formulas ({allFormulas.length})
                  </button>
                  <button
                    onClick={() => setViewMode('cases')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                      viewMode === 'cases'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow font-bold'
                        : 'text-amber-300/80 hover:text-amber-200'
                    }`}
                  >
                    Special Cases ({allCases.length})
                  </button>
                </div>

                {/* Prominent Header Exit Button */}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 flex items-center gap-1.5 transition shadow-xs active:scale-95"
                  title="Close Formula Hub (Esc or click backdrop)"
                  aria-label="Exit Formula Hub"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline font-semibold">Exit Hub</span>
                  <span className="px-1 py-0.2 rounded bg-rose-500/20 text-[10px] font-mono">Esc</span>
                </button>
              </div>
            </div>

            {/* Main Master-Detail Layout */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              {/* Left Sidebar Navigation (Chapters & Search) */}
              <div className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#0A0D15] flex flex-col shrink-0">
                {/* Search Box */}
                <div className="p-3 border-b border-white/[0.06] bg-[#080B12]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search laws, symbols, terms..."
                      className="w-full pl-9 pr-7 py-2 bg-[#121622] border border-white/[0.1] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs font-semibold p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories / Chapters Nav List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                  <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Physics Chapters
                  </div>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs font-bold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                            isSelected
                              ? 'bg-cyan-500/30 text-cyan-200'
                              : 'bg-white/[0.05] text-zinc-500'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}

                  {/* Popular quick filter tag chips in sidebar */}
                  <div className="pt-3 px-2">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-cyan-400" />
                      Quick Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quickTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearchQuery(tag);
                            setSelectedCategory('all');
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition border ${
                            searchQuery.toLowerCase() === tag.toLowerCase()
                              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 font-bold'
                              : 'bg-[#121622] text-zinc-400 hover:text-zinc-200 border-white/[0.06] hover:border-cyan-500/30'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Filters Option if filtered */}
                {(searchQuery || selectedCategory !== 'all') && (
                  <div className="p-2 border-t border-white/[0.06] bg-[#080B12]">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold transition text-center"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Right Content Area: Structured Grouped Cards */}
              <div className="flex-1 min-w-0 flex flex-col bg-[#07090E] overflow-hidden">
                {/* Content Header Banner */}
                <div className="px-4 sm:px-6 py-2.5 border-b border-white/[0.06] bg-[#0A0D15] flex items-center justify-between text-xs text-zinc-400 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {selectedCategoryObj.label}
                    </span>
                    {searchQuery && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px]">
                        Matching: "{searchQuery}"
                      </span>
                    )}
                  </div>
                  <div className="text-xs">
                    Showing <strong className="text-cyan-400 font-bold">{viewMode === 'formulas' ? filteredFormulas.length : filteredCases.length}</strong> items in <strong className="text-zinc-200">{viewMode === 'formulas' ? groupedFormulas.length : groupedCases.length}</strong> topics
                  </div>
                </div>

                {/* Scrollable Grouped Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-thin">
                  {viewMode === 'formulas' ? (
                    groupedFormulas.length === 0 ? (
                      <div className="text-center py-20 space-y-3">
                        <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
                        <p className="text-zinc-300 font-semibold text-sm">No formulas match your criteria</p>
                        <p className="text-xs text-zinc-500">Try choosing a different chapter or clearing the search box</p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 transition"
                        >
                          Show All Formulas
                        </button>
                      </div>
                    ) : (
                      groupedFormulas.map((group) => (
                        <div key={group.concept.id} className="space-y-3">
                          {/* Structured Section Header for each Topic */}
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] flex-wrap gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                {group.concept.topic}
                              </span>
                              <h3 className="text-sm font-bold text-white tracking-wide truncate">
                                {group.concept.title}
                              </h3>
                              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                                ({group.concept.subtitle})
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleDownloadChapter(group.concept.chapterId)}
                                disabled={downloadingChapterId === group.concept.chapterId}
                                className="flex items-center gap-1 text-xs text-slate-950 font-bold bg-cyan-500 hover:bg-cyan-400 px-2.5 py-1 rounded-lg transition shrink-0 active:scale-95 shadow-xs disabled:opacity-50"
                                title={`Download PDF Formula Sheet for this chapter (${group.concept.chapterId})`}
                              >
                                <Download className="w-3 h-3" />
                                <span>{downloadingChapterId === group.concept.chapterId ? 'Downloading...' : 'PDF Sheet'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  onSelectConcept(group.concept);
                                  onClose();
                                }}
                                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition shrink-0"
                              >
                                <span>Open 3D Lab</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Formula Cards for this Topic */}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                            {group.items.map((item) => {
                              const copyKey = `${item.concept.id}-${item.index}`;
                              const isCopied = copiedIndex === copyKey;

                              return (
                                <div
                                  key={copyKey}
                                  className="p-4 rounded-2xl bg-[#0E121B] border border-white/[0.08] hover:border-cyan-500/45 hover:bg-[#111724] transition-all flex flex-col justify-between shadow-md group"
                                >
                                  <div className="space-y-2.5">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                                        {item.formula.name}
                                      </h4>

                                      <button
                                        onClick={() => handleCopy(item.formula.latex, copyKey)}
                                        title="Copy LaTeX formula"
                                        className="p-1.5 rounded-lg bg-[#141A28] text-zinc-400 hover:text-white hover:bg-cyan-500/20 border border-white/[0.06] transition flex items-center gap-1 shrink-0"
                                      >
                                        {isCopied ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-medium hidden sm:inline">Copy LaTeX</span>
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {/* Pristine LaTeX Math Stage */}
                                    <div className="p-3 rounded-xl bg-[#06080E] border border-cyan-500/20 flex items-center justify-center overflow-x-auto text-cyan-200 font-mono shadow-inner">
                                      <Latex math={item.formula.latex} displayMode className="text-sm sm:text-base text-cyan-200" />
                                    </div>

                                    {/* Explanation */}
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                      {item.formula.explanation}
                                    </p>

                                    {/* Variables Breakdown */}
                                    {item.formula.keyVariables && item.formula.keyVariables.length > 0 && (
                                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-400 pt-1">
                                        <span className="font-semibold text-zinc-500">Variables:</span>
                                        {item.formula.keyVariables.map((v, i) => (
                                          <span key={i} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-cyan-300 font-mono text-[10px]">
                                            {v}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* JEE Trap Warning */}
                                    {item.concept.jeeMain?.trapAlerts?.[0] && (
                                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200/90 flex items-start gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">
                                          <strong className="text-amber-300 font-bold">JEE Trap:</strong> {item.concept.jeeMain.trapAlerts[0]}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Bottom Action Footer */}
                                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                                    <span className="truncate">{item.concept.badge}</span>
                                    <button
                                      onClick={() => {
                                        onSelectConcept(item.concept);
                                        onClose();
                                      }}
                                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                                    >
                                      <span>Simulate</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    /* Special Cases & Limits View */
                    groupedCases.length === 0 ? (
                      <div className="text-center py-20 space-y-3">
                        <Sparkles className="w-12 h-12 text-zinc-600 mx-auto" />
                        <p className="text-zinc-300 font-semibold text-sm">No special cases match your criteria</p>
                        <p className="text-xs text-zinc-500">Try choosing a different chapter or clearing filters</p>
                      </div>
                    ) : (
                      groupedCases.map((group) => (
                        <div key={group.concept.id} className="space-y-3">
                          {/* Topic Section Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {group.concept.topic}
                              </span>
                              <h3 className="text-sm font-bold text-white tracking-wide truncate">
                                {group.concept.title}
                              </h3>
                            </div>
                            <span className="text-xs text-zinc-400 font-mono">
                              {group.items.length} Cases
                            </span>
                          </div>

                          {/* Cases Cards Grid */}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                            {group.items.map((item) => (
                              <div
                                key={item.caseItem.id}
                                className="p-4 rounded-2xl bg-[#0E121B] border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#111724] transition-all flex flex-col justify-between shadow-md"
                              >
                                <div className="space-y-3">
                                  {/* Case Header */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      {item.caseItem.categoryTag || 'Special Case'}
                                    </span>
                                    <span className="text-[11px] text-zinc-400 font-mono">
                                      {item.concept.title}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-bold text-white">
                                    {item.caseItem.title}
                                  </h4>

                                  {/* Trigger Condition & Result Box */}
                                  <div className="bg-[#06080E] p-3 rounded-xl border border-white/[0.08] flex flex-col gap-2 shadow-inner">
                                    <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-2 overflow-x-auto">
                                      <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0">Condition:</span>
                                      <Latex math={item.caseItem.conditionLatex} className="text-amber-200" />
                                    </div>
                                    <div className="text-xs text-cyan-300 font-semibold border-t border-white/[0.06] pt-1.5 flex items-center gap-2 overflow-x-auto">
                                      <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0">Result:</span>
                                      <Latex math={item.caseItem.formulaLatex} className="text-cyan-200" />
                                    </div>
                                  </div>

                                  <p className="text-xs text-zinc-300 leading-relaxed">
                                    {item.caseItem.description}
                                  </p>

                                  {item.caseItem.jeeTrapAlert && (
                                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-[11px] text-rose-200/90 flex items-start gap-2">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                      <span className="leading-relaxed">
                                        <strong className="text-rose-300 font-bold">Negative Marking Trap:</strong> {item.caseItem.jeeTrapAlert}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                                  <span className="text-[11px] text-zinc-400 font-medium">
                                    {item.concept.topic}
                                  </span>
                                  <button
                                    onClick={() => {
                                      onSelectConcept(item.concept, item.caseItem.parameterPreset);
                                      onClose();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition-all shadow-md shrink-0"
                                  >
                                    <span>Simulate Case in 3D</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-white/[0.08] bg-[#10141E] flex items-center justify-between text-xs gap-3 shrink-0">
              <div className="flex items-center gap-2 text-zinc-400 truncate">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Coaching Syllabus: Mechanics, Electromagnetism, Thermal, Waves, Optics, Modern Physics</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Prominent Footer Exit Button */}
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-white/[0.08] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-200 border border-white/[0.1] hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  title="Exit Formula Hub (Esc)"
                >
                  <LogOut className="w-3.5 h-3.5 rotate-180" />
                  <span>Exit Formula Hub</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
