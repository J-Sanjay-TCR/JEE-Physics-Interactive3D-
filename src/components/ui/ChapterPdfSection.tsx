import React, { useState, useMemo } from 'react';
import { CHAPTERS, CATEGORIES, ALL_CONCEPTS, isClass11Chapter, isClass12Chapter, CLASS_11_CHAPTER_IDS, CLASS_12_CHAPTER_IDS } from '../../data/allConcepts';
import { Chapter, CategoryId, PhysicsConcept } from '../../types';
import { generateChapterPdf, generateMasterCompendiumPdf } from '../../utils/pdfGenerator';
import { useTheme } from '../../context/ThemeContext';
import { Latex } from './Latex';
import {
  Download,
  FileText,
  Sparkles,
  Printer,
  Check,
  Layers,
  ArrowDownToLine,
  Search,
  BookOpen,
  Atom,
  Flame,
  Zap,
  Activity,
  Eye,
  Ruler,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';

interface ChapterPdfSectionProps {
  onSelectConcept?: (concept: PhysicsConcept) => void;
  onOpenPdfModal?: (chapterId?: string) => void;
}

export const ChapterPdfSection: React.FC<ChapterPdfSectionProps> = ({
  onSelectConcept,
  onOpenPdfModal,
}) => {
  const { isDark } = useTheme();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<'all' | 'class-11' | 'class-12'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<{
    fileName: string;
    chapterName: string;
  } | null>(null);

  const totalBranchCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CHAPTERS.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = CHAPTERS.filter((ch) => ch.category === cat.id).length;
    });
    return counts;
  }, []);

  const handleToggleBranch = (catId: string) => {
    if (selectedBranch === catId) {
      setSelectedBranch('all');
    } else {
      setSelectedBranch(catId);
      if (selectedClass !== 'all' && catId !== 'all') {
        const hasChaptersInClass = CHAPTERS.some((ch) => {
          if (ch.category !== catId) return false;
          return selectedClass === 'class-11' ? isClass11Chapter(ch.id) : isClass12Chapter(ch.id);
        });
        if (!hasChaptersInClass) {
          setSelectedClass('all');
        }
      }
    }
  };

  const handleToggleClass = (classId: 'all' | 'class-11' | 'class-12') => {
    const nextClass = selectedClass === classId && classId !== 'all' ? 'all' : classId;
    setSelectedClass(nextClass);
    if (selectedBranch !== 'all' && nextClass !== 'all') {
      const hasChaptersInBranch = CHAPTERS.some((ch) => {
        if (ch.category !== selectedBranch) return false;
        return nextClass === 'class-11' ? isClass11Chapter(ch.id) : isClass12Chapter(ch.id);
      });
      if (!hasChaptersInBranch) {
        setSelectedBranch('all');
      }
    }
  };

  // Category Icon Map
  const getCategoryIcon = (catId: CategoryId | string) => {
    switch (catId) {
      case 'mechanics':
        return Atom;
      case 'thermal':
        return Flame;
      case 'electromagnetism':
        return Zap;
      case 'waves-oscillations':
        return Activity;
      case 'optics':
        return Eye;
      case 'modern':
        return Sparkles;
      case 'experimental':
        return Ruler;
      default:
        return BookOpen;
    }
  };

  const filteredChapters = CHAPTERS.filter((ch) => {
    const matchesBranch = selectedBranch === 'all' || ch.category === selectedBranch;
    let matchesClass = true;
    if (selectedClass === 'class-11') matchesClass = isClass11Chapter(ch.id);
    else if (selectedClass === 'class-12') matchesClass = isClass12Chapter(ch.id);

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ch.name.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q) ||
      ALL_CONCEPTS.some(
        (c) =>
          c.chapterId === ch.id &&
          (c.title.toLowerCase().includes(q) ||
            c.formulas.some((f) => f.name.toLowerCase().includes(q)))
      );
    return matchesBranch && matchesClass && matchesSearch;
  });

  const handleDownload = (chapterId: string) => {
    setDownloadingId(chapterId);
    try {
      const result = generateChapterPdf(chapterId);
      setDownloadToast(result);
      setTimeout(() => setDownloadToast(null), 4500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
    }
  };

  const handleDownloadMaster = () => {
    setDownloadingId('master');
    try {
      const result = generateMasterCompendiumPdf();
      setDownloadToast({
        fileName: result.fileName,
        chapterName: 'Master 18-Chapter Compendium',
      });
      setTimeout(() => setDownloadToast(null), 5000);
    } catch (err) {
      console.error('Master compendium download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 700);
    }
  };

  return (
    <section id="home-pdf-section" className="space-y-6 scroll-mt-20">
      {/* Download Confirmation Toast */}
      {downloadToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>
              Downloaded <strong>{downloadToast.fileName}</strong> to your computer's{' '}
              <strong>Downloads folder</strong>!
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold hidden sm:inline">
            PDF File Ready
          </span>
        </div>
      )}

      {/* Section Header with Master Download CTA */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-r from-[#121422] via-[#0E101A] to-[#0A0B12] border-white/[0.08] shadow-2xl'
            : 'bg-gradient-to-r from-cyan-50/80 via-white to-blue-50/60 border-slate-200 shadow-xl'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25'
                    : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-cyan-500" />
                Chapter-Wise PDF Formula Sheets
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                18 Chapters • Clean & Concise
              </span>
            </div>

            <h2
              className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Downloadable JEE Physics Formula Sheets (PDF)
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-zinc-300/90' : 'text-slate-600'
              }`}
            >
              Download high-resolution, vector-typeset PDF formula sheets for every single chapter.
              Each formula sheet includes governing laws, SI units, variables index, high-yield shortcuts,
              and negative-marking trap alerts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleDownloadMaster}
              disabled={downloadingId === 'master'}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              <ArrowDownToLine className="w-4 h-4 shrink-0" />
              <span>
                {downloadingId === 'master'
                  ? 'Generating Compendium...'
                  : 'Download Master Compendium (All 18 Chapters)'}
              </span>
            </button>

            {onOpenPdfModal && (
              <button
                onClick={() => onOpenPdfModal()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                <span>Open Full-Screen Sheet Viewer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Portion and Branch Filter Controls */}
      <div className="space-y-3 pt-1">
        {/* Class Portion Buttons & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl border bg-black/20 border-white/[0.06] overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleToggleClass('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-[32px] ${
                selectedClass === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs font-black'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Syllabus</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedClass === 'all' ? 'bg-slate-950/25 text-slate-950' : 'bg-white/10 text-zinc-400'
              }`}>
                {CHAPTERS.length}
              </span>
            </button>

            <button
              onClick={() => handleToggleClass('class-11')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-[32px] ${
                selectedClass === 'class-11'
                  ? 'bg-blue-500 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Class 11 Portion</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedClass === 'class-11' ? 'bg-white/25 text-white' : 'bg-white/10 text-zinc-400'
              }`}>
                {CLASS_11_CHAPTER_IDS.size}
              </span>
            </button>

            <button
              onClick={() => handleToggleClass('class-12')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-[32px] ${
                selectedClass === 'class-12'
                  ? 'bg-purple-500 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Class 12 Portion</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedClass === 'class-12' ? 'bg-white/25 text-white' : 'bg-white/10 text-zinc-400'
              }`}>
                {CLASS_12_CHAPTER_IDS.size}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chapters or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs transition focus:outline-none min-h-[34px] ${
                isDark
                  ? 'bg-[#12131F] border border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-cyan-500'
                  : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
              }`}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => handleToggleBranch('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[32px] ${
              selectedBranch === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : isDark
                ? 'bg-[#141520] text-zinc-400 hover:text-white border border-white/[0.06]'
                : 'bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            All Branches ({CHAPTERS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            const isSelected = selectedBranch === cat.id;
            const branchCount = totalBranchCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => handleToggleBranch(cat.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-[32px] ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : isDark
                    ? 'bg-[#141520] text-zinc-400 hover:text-white border border-white/[0.06]'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-slate-950/25 text-slate-950' : 'bg-white/10 text-zinc-400'
                }`}>
                  {branchCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters Grid with Individual PDF Download */}
      {filteredChapters.length === 0 ? (
        <div className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 ${
          isDark ? 'bg-[#0E0F18] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">No chapters match your filter</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              There are no chapters in {selectedBranch !== 'all' ? selectedBranch : 'this category'} for {selectedClass !== 'all' ? selectedClass : 'this portion'}.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedBranch('all');
              setSelectedClass('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredChapters.map((ch, idx) => {
            const Icon = getCategoryIcon(ch.category);
            const chConcepts = ALL_CONCEPTS.filter((c) => c.chapterId === ch.id);
            const totalFormulas = chConcepts.reduce((acc, c) => acc + c.formulas.length, 0);
            const isDownloading = downloadingId === ch.id;
            const topFormula = chConcepts[0]?.formulas[0];
            const isC11 = isClass11Chapter(ch.id);

            return (
              <div
                key={ch.id}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all group ${
                  isDark
                    ? 'bg-[#0E0F18] hover:bg-[#131422] border-white/[0.08] hover:border-cyan-500/40 shadow-lg'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-cyan-400 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Chapter Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDark
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                            Chapter #{idx + 1} • {ch.category}
                          </span>
                        </div>
                        <h3
                          className={`text-sm sm:text-base font-bold truncate group-hover:text-cyan-500 transition ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {ch.name}
                        </h3>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
                      isC11
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}>
                      {isC11 ? 'Class 11' : 'Class 12'}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed line-clamp-2 ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}
                  >
                    {ch.description}
                  </p>

                  {/* Key Equation Sample */}
                  {topFormula && (
                    <div
                      className={`p-2.5 rounded-xl border text-center overflow-x-auto ${
                        isDark
                          ? 'bg-[#151726] border-white/[0.06]'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-zinc-400 block mb-0.5 truncate">
                        {topFormula.name}
                      </span>
                      <Latex
                        math={topFormula.latex}
                        displayMode
                        className="text-cyan-400 font-mono text-xs"
                      />
                    </div>
                  )}

                  {/* Badges / Stats */}
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-500" />
                      {totalFormulas} Formulas
                    </span>
                    <span>•</span>
                    <span>{chConcepts.length} Topics</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Shortcuts & Traps</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 mt-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleDownload(ch.id)}
                    disabled={isDownloading}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 min-h-[36px]"
                    title={`Download PDF Formula Sheet for ${ch.name}`}
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>{isDownloading ? 'Generating PDF...' : 'Download PDF Sheet'}</span>
                  </button>

                  {onOpenPdfModal && (
                    <button
                      onClick={() => onOpenPdfModal(ch.id)}
                      className={`p-2 rounded-xl border transition flex items-center justify-center min-h-[36px] min-w-[36px] ${
                        isDark
                          ? 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border-white/[0.08]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                      title={`View formula sheet preview for ${ch.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
