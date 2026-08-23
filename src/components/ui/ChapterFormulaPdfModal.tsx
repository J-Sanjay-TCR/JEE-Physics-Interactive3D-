import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CHAPTERS, CATEGORIES, ALL_CONCEPTS } from '../../data/allConcepts';
import { JEE_CHAPTER_SHEETS, JeeChapterSheet } from '../../data/jeeFormulaSheetData';
import { Chapter, CategoryId, PhysicsConcept } from '../../types';
import {
  generateChapterPdf,
  generateMasterCompendiumPdf,
  buildChapterPdfDoc,
  buildMasterPdfDoc,
  cleanLatexForPdf,
  sanitizeUnicodeForPdf,
  findJeeSheet,
  PdfDocumentResult,
} from '../../utils/pdfGenerator';
import {
  validateChapterSheetData,
  SheetValidationReport,
  autoRepairFormulaString,
} from '../../utils/formulaValidator';
import { Latex } from './Latex';
import { useTheme } from '../../context/ThemeContext';
import {
  Download,
  FileText,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Atom,
  Flame,
  Zap,
  Activity,
  Eye,
  Ruler,
  Printer,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Layers,
  ArrowDownToLine,
  Check,
  Award,
  Clock,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
  HelpCircle,
  AlertTriangle,
  ZapOff,
  RotateCcw,
  CheckCheck,
  Wrench,
} from 'lucide-react';

interface ChapterFormulaPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapterId?: string;
  onSelectConcept?: (concept: PhysicsConcept) => void;
}

export const ChapterFormulaPdfModal: React.FC<ChapterFormulaPdfModalProps> = ({
  isOpen,
  onClose,
  initialChapterId,
  onSelectConcept,
}) => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewChapterId, setActivePreviewChapterId] = useState<string>(
    initialChapterId || CHAPTERS[0].id
  );
  const [downloadingChapterId, setDownloadingChapterId] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<{
    fileName: string;
    chapterName: string;
  } | null>(null);

  // View Mode: 'preview' (PDF thumbnail and sheet preview) or 'interactive' (KaTeX interactive guide)
  const [viewMode, setViewMode] = useState<'preview' | 'interactive'>('preview');

  // Preview format: 'sheet' (visual A4 mockup) or 'native' (embedded real vector PDF iframe)
  const [previewRenderType, setPreviewRenderType] = useState<'sheet' | 'native'>('sheet');

  // Page number for multi-page sheet preview
  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Generated PDF Document Result for Preview
  const [pdfDocResult, setPdfDocResult] = useState<PdfDocumentResult | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);
  const prevBlobUrlRef = useRef<string | null>(null);

  // Pre-generation Validation & Try Again Handler
  const handleValidateAndRetry = () => {
    setIsValidating(true);
    try {
      const result = buildChapterPdfDoc(activePreviewChapterId);
      if (prevBlobUrlRef.current && prevBlobUrlRef.current !== result.blobUrl) {
        try {
          URL.revokeObjectURL(prevBlobUrlRef.current);
        } catch {
          // ignore
        }
      }
      prevBlobUrlRef.current = result.blobUrl;
      setPdfDocResult(result);
      const totalChecked = result.validationReport?.totalFormulasChecked || 0;
      const errorCount = result.validationReport?.errorCount || 0;
      if (errorCount === 0) {
        setValidationNotice(`Pre-generation validation verified: All ${totalChecked} formulas passed regex formatting checks with 0 errors!`);
      } else {
        setValidationNotice(`Validation auto-repaired formulas: ${totalChecked} formulas scanned, remaining errors: ${errorCount}.`);
      }
      setTimeout(() => setValidationNotice(null), 4500);
    } catch (err) {
      console.error('Validation & retry failed:', err);
      setValidationNotice('Validation error occurred while processing formulas.');
      setTimeout(() => setValidationNotice(null), 4000);
    } finally {
      setIsValidating(false);
    }
  };

  // When initialChapterId changes or modal opens
  useEffect(() => {
    if (initialChapterId) {
      setActivePreviewChapterId(initialChapterId);
    }
  }, [initialChapterId, isOpen]);

  // Generate PDF document result for thumbnail/preview whenever activePreviewChapterId changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGeneratingDoc(true);

    try {
      const result = buildChapterPdfDoc(activePreviewChapterId);

      if (isMounted) {
        if (prevBlobUrlRef.current && prevBlobUrlRef.current !== result.blobUrl) {
          try {
            URL.revokeObjectURL(prevBlobUrlRef.current);
          } catch {
            // ignore
          }
        }
        prevBlobUrlRef.current = result.blobUrl;
        setPdfDocResult(result);
        setActivePage(1);
      }
    } catch (err) {
      console.error('Failed to build PDF preview doc:', err);
    } finally {
      if (isMounted) {
        setIsGeneratingDoc(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [activePreviewChapterId, isOpen]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        try {
          URL.revokeObjectURL(prevBlobUrlRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Handle Escape key
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

  // Filtered Chapters
  const filteredChapters = useMemo(() => {
    return CHAPTERS.filter((ch) => {
      const matchesCategory = selectedCategory === 'all' || ch.category === selectedCategory;
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

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Active Preview Chapter and its concepts
  const activeChapter = useMemo(() => {
    return CHAPTERS.find((ch) => ch.id === activePreviewChapterId) || filteredChapters[0] || CHAPTERS[0];
  }, [activePreviewChapterId, filteredChapters]);

  const activeConcepts = useMemo(() => {
    return ALL_CONCEPTS.filter((c) => c.chapterId === activeChapter.id);
  }, [activeChapter]);

  // Match JEE Chapter Sheet data if available
  const activeJeeSheet = useMemo<JeeChapterSheet | undefined>(() => {
    const normId = activeChapter.id.toLowerCase().trim();
    const normName = activeChapter.name.toLowerCase().trim();

    return JEE_CHAPTER_SHEETS.find((s) => {
      if (s.id.toLowerCase() === normId) return true;
      if (s.name.toLowerCase() === normName) return true;
      if (s.aliases.some((a) => a.toLowerCase() === normId || a.toLowerCase() === normName)) return true;
      if (normId.includes(s.id) || s.id.includes(normId)) return true;
      return false;
    });
  }, [activeChapter]);

  // Total pages estimated (minimum 2 for a full sheet)
  const totalPages = useMemo(() => {
    return Math.max(2, pdfDocResult?.pageCount || 2);
  }, [pdfDocResult]);

  // Handle Individual Chapter Download
  const handleDownloadChapter = (chapterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingChapterId(chapterId);

    try {
      if (pdfDocResult && chapterId === activeChapter.id) {
        pdfDocResult.doc.save(pdfDocResult.fileName);
        setDownloadSuccessToast({
          fileName: pdfDocResult.fileName,
          chapterName: pdfDocResult.chapterName,
        });
      } else {
        const result = generateChapterPdf(chapterId);
        setDownloadSuccessToast(result);
      }
      setTimeout(() => setDownloadSuccessToast(null), 4500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setTimeout(() => setDownloadingChapterId(null), 500);
    }
  };

  // Handle Master Compendium Download
  const handleDownloadMaster = () => {
    setDownloadingChapterId('master');
    try {
      const result = generateMasterCompendiumPdf();
      setDownloadSuccessToast({
        fileName: result.fileName,
        chapterName: 'Master 18-Chapter Compendium',
      });
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    } catch (err) {
      console.error('Failed to generate master compendium:', err);
    } finally {
      setTimeout(() => setDownloadingChapterId(null), 700);
    }
  };

  // Handle Open in New Tab / Print
  const handleOpenPrintTab = () => {
    if (pdfDocResult?.blobUrl) {
      window.open(pdfDocResult.blobUrl, '_blank');
    } else {
      const res = buildChapterPdfDoc(activeChapter.id);
      window.open(res.blobUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/85 backdrop-blur-md cursor-pointer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="formula-pdf-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D0E15] border border-white/[0.1] rounded-3xl w-full max-w-6xl flex flex-col max-h-[92vh] shadow-2xl overflow-hidden cursor-default text-zinc-200"
          >
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-white/[0.08] bg-[#131420] flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 id="formula-pdf-title" className="text-base sm:text-lg font-black text-white truncate">
                      JEE Physics PDF Formula Sheets
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Printer className="w-3 h-3 text-cyan-400" />
                      100% Vector Print & Offline Ready
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    High-yield formulas, conditions, shortcuts & exam traps formatted for clear study
                  </p>
                </div>
              </div>

              {/* Master Download & Close Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadMaster}
                  disabled={downloadingChapterId === 'master'}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 min-h-[36px]"
                  title="Download All 18 Chapters combined into one Master PDF"
                >
                  <ArrowDownToLine className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {downloadingChapterId === 'master' ? 'Generating...' : 'Download Master PDF (18 Ch)'}
                  </span>
                  <span className="sm:hidden font-bold">Master PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/[0.08] transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar: Branch selector and search */}
            <div className="p-2.5 sm:px-5 py-2 bg-[#090A10] border-b border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[30px] ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  All 18 Chapters
                </button>
                {CATEGORIES.map((cat) => {
                  const Icon = getCategoryIcon(cat.id);
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-[30px] ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search chapters & formulas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-[#12131D] border border-white/[0.08] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition min-h-[30px]"
                />
              </div>
            </div>

            {/* Success Toast Notification when file is downloaded */}
            <AnimatePresence>
              {downloadSuccessToast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-950/90 border-y border-emerald-500/40 px-4 py-2 flex items-center justify-between gap-3 text-xs text-emerald-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      Successfully downloaded <strong>{downloadSuccessToast.fileName}</strong> to your <strong>Downloads folder</strong>!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 hidden md:inline">
                    Clean Vector PDF Ready
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Body: Left Column (Chapters List) + Right Column (PDF Preview Stage) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#07080D]">
              {/* Left Column: Chapters List (4 cols on lg) */}
              <div className="lg:col-span-4 border-r border-white/[0.06] overflow-y-auto p-3 space-y-2 max-h-[32vh] lg:max-h-none">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>Chapters ({filteredChapters.length})</span>
                  <span className="text-cyan-400 font-mono">Live Preview</span>
                </div>

                {filteredChapters.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 space-y-2">
                    <FileText className="w-7 h-7 mx-auto opacity-40 text-zinc-400" />
                    <p className="text-xs">No chapters match your query.</p>
                  </div>
                ) : (
                  filteredChapters.map((ch, idx) => {
                    const isSelected = ch.id === activeChapter.id;
                    const Icon = getCategoryIcon(ch.category);
                    const chConcepts = ALL_CONCEPTS.filter((c) => c.chapterId === ch.id);
                    const chSheet = findJeeSheet(ch.id, ch.name);
                    const totalFormulas = chSheet
                      ? chSheet.coreFormulas.reduce((acc, s) => acc + s.items.length, 0)
                      : chConcepts.reduce((acc, c) => acc + c.formulas.length, 0);
                    const isDownloading = downloadingChapterId === ch.id;

                    return (
                      <div
                        key={ch.id}
                        onClick={() => setActivePreviewChapterId(ch.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-[#151726] border-cyan-500/60 shadow-md shadow-cyan-500/10'
                            : 'bg-[#0E0F17] hover:bg-[#13141F] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-cyan-300'
                              }`}
                            >
                              {ch.name}
                            </h4>
                          </div>

                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-zinc-400" />
                            {totalFormulas} Formulas
                          </span>

                          <button
                            onClick={(e) => handleDownloadChapter(ch.id, e)}
                            disabled={isDownloading}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 active:scale-95 ${
                              isDownloading
                                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 animate-pulse'
                                : 'bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30'
                            }`}
                            title={`Download ${ch.name} PDF`}
                          >
                            <Download className="w-2.5 h-2.5 shrink-0" />
                            <span>{isDownloading ? '...' : 'PDF'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: PDF Preview Stage with Thumbnail Bar (8 cols on lg) */}
              <div className="lg:col-span-8 flex flex-col overflow-hidden bg-[#0B0C14]">
                {/* Mode & Toolbar Bar */}
                <div className="p-3 bg-[#11121E] border-b border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
                  {/* Left: View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-[#090A10] p-0.5 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        viewMode === 'preview'
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>PDF Sheet Preview</span>
                    </button>

                    <button
                      onClick={() => setViewMode('interactive')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        viewMode === 'interactive'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Interactive Guide</span>
                    </button>
                  </div>

                  {/* Center/Right: Preview Controls when in Preview Mode */}
                  {viewMode === 'preview' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Render Type: Mockup vs Native PDF */}
                      <div className="flex items-center gap-1 bg-[#090A10] p-0.5 rounded-lg border border-white/[0.06] text-[11px]">
                        <button
                          onClick={() => setPreviewRenderType('sheet')}
                          className={`px-2 py-0.5 rounded font-medium transition ${
                            previewRenderType === 'sheet'
                              ? 'bg-white/15 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Vector Sheet
                        </button>
                        <button
                          onClick={() => setPreviewRenderType('native')}
                          className={`px-2 py-0.5 rounded font-medium transition ${
                            previewRenderType === 'native'
                              ? 'bg-white/15 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Native PDF
                        </button>
                      </div>

                      {/* Zoom Controls (when in sheet mode) */}
                      {previewRenderType === 'sheet' && (
                        <div className="hidden sm:flex items-center gap-1 bg-[#090A10] p-0.5 rounded-lg border border-white/[0.06] text-xs">
                          <button
                            onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                            className="p-1 text-zinc-400 hover:text-white rounded"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-3 h-3" />
                          </button>
                          <span className="px-1 text-[11px] font-mono text-zinc-300">{zoomLevel}%</span>
                          <button
                            onClick={() => setZoomLevel((z) => Math.min(130, z + 15))}
                            className="p-1 text-zinc-400 hover:text-white rounded"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Validate & Retry Button */}
                      <button
                        onClick={handleValidateAndRetry}
                        disabled={isValidating || isGeneratingDoc}
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition text-xs flex items-center gap-1 active:scale-95"
                        title="Pre-Generation Regex Validation & Auto-Repair formatting check"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline text-[11px] font-bold">
                          {isValidating ? 'Validating...' : 'Validate & Retry'}
                        </span>
                      </button>

                      {/* Open Full PDF in New Tab */}
                      <button
                        onClick={handleOpenPrintTab}
                        className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/[0.08] transition text-xs flex items-center gap-1"
                        title="Open Raw PDF in New Browser Tab for Printing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Print Tab</span>
                      </button>
                    </div>
                  )}

                  {/* Primary Download Button */}
                  <button
                    onClick={() => handleDownloadChapter(activeChapter.id)}
                    disabled={downloadingChapterId === activeChapter.id}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {downloadingChapterId === activeChapter.id ? 'Saving PDF...' : 'Download PDF'}
                    </span>
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
                  {viewMode === 'preview' ? (
                    <div className="space-y-4">
                      {/* Live Validation Alert Notification if triggered */}
                      {validationNotice && (
                        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center gap-2">
                            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold">{validationNotice}</span>
                          </div>
                          <button
                            onClick={() => setValidationNotice(null)}
                            className="p-1 text-emerald-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Document Summary & Pre-Generation Validation Status Card */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#14162B] via-[#101222] to-[#0D0E1A] border border-cyan-500/30 flex items-center justify-between gap-3 flex-wrap">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              {activeChapter.category.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              📄 {pdfDocResult?.fileName || `${activeChapter.name}-JEE-Formula-Sheet.pdf`}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-white truncate">
                            {activeChapter.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Pre-generation Regex Validation Status Badge */}
                          {pdfDocResult?.validationReport?.isReadyForPdf ? (
                            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-medium text-emerald-300 flex items-center gap-1.5 shadow-xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Validation: 0 Format Errors</span>
                              <span className="text-[10px] text-emerald-400/80 font-mono">
                                ({pdfDocResult.validationReport.totalFormulasChecked} checked)
                              </span>
                            </div>
                          ) : (
                            <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/35 text-[11px] font-medium text-amber-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Validation Alert ({pdfDocResult?.validationReport?.errorCount || 0} issues)</span>
                            </div>
                          )}

                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                            {totalPages} Pages • Crystal Clear ASCII
                          </span>
                        </div>
                      </div>

                      {/* Pre-Generation Validation & Try Again Banner (if errors or user wants verification) */}
                      {pdfDocResult?.validationReport && !pdfDocResult.validationReport.isReadyForPdf && (
                        <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                              <span>
                                Formatting Anomalies Detected ({pdfDocResult.validationReport.errorCount} items)
                              </span>
                            </div>
                            <button
                              onClick={handleValidateAndRetry}
                              disabled={isValidating}
                              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Auto-Repair & Try Again</span>
                            </button>
                          </div>
                          <ul className="text-[11px] text-amber-200/90 space-y-1 pl-4 list-disc">
                            {pdfDocResult.validationReport.details
                              .filter((d) => !d.result.isValid)
                              .slice(0, 3)
                              .map((d, idx) => (
                                <li key={idx}>
                                  <span className="font-semibold">{d.section} - {d.itemTitle}:</span>{' '}
                                  {d.result.errors.map((e) => e.message).join(', ')}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* PDF Thumbnail Strip (Miniature Page Selector) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-1">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-cyan-400" />
                            <span>PDF Page Thumbnails ({totalPages} Pages)</span>
                          </span>
                          <span className="text-[10px] text-zinc-500">Click a thumbnail to inspect</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {Array.from({ length: totalPages }).map((_, pIdx) => {
                            const pageNum = pIdx + 1;
                            const isActive = activePage === pageNum;

                            return (
                              <div
                                key={pageNum}
                                onClick={() => setActivePage(pageNum)}
                                className={`relative p-2 rounded-xl border transition-all cursor-pointer group flex flex-col items-center text-center ${
                                  isActive
                                    ? 'bg-[#181B2D] border-cyan-400 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/40'
                                    : 'bg-[#0E0F1A] hover:bg-[#141525] border-white/[0.08] hover:border-white/[0.16]'
                                }`}
                              >
                                {/* Miniature Page Mockup */}
                                <div className="w-full aspect-[210/297] rounded-md bg-white p-1.5 text-slate-900 flex flex-col justify-between overflow-hidden shadow-xs border border-slate-300">
                                  <div className="bg-[#0f172a] rounded-xs p-1 text-left">
                                    <div className="h-1 w-2/3 bg-cyan-400 rounded-full mb-0.5"></div>
                                    <div className="h-0.5 w-1/2 bg-slate-300 rounded-full"></div>
                                  </div>

                                  <div className="space-y-1 my-1">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-xs border border-slate-200"></div>
                                    <div className="h-1.5 w-4/5 bg-slate-100 rounded-xs border border-slate-200"></div>
                                    <div className="h-1.5 w-full bg-emerald-50 rounded-xs border border-emerald-200"></div>
                                    {pageNum === 2 && (
                                      <div className="h-1.5 w-full bg-rose-50 rounded-xs border border-rose-200"></div>
                                    )}
                                  </div>

                                  <div className="border-t border-slate-200 pt-0.5 flex justify-between items-center text-[5px] text-slate-400 font-mono">
                                    <span>JEE 3D LAB</span>
                                    <span>P.{pageNum}</span>
                                  </div>
                                </div>

                                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold">
                                  <span className={isActive ? 'text-cyan-300' : 'text-zinc-400'}>
                                    Page {pageNum}
                                  </span>
                                  {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                  )}
                                </div>
                                <span className="text-[9px] text-zinc-500 truncate w-full">
                                  {pageNum === 1 ? 'Formulas & Definitions' : 'Special Cases, Shortcuts & Traps'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Main Preview Container */}
                      {previewRenderType === 'native' && pdfDocResult?.blobUrl ? (
                        <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900 shadow-2xl">
                          <iframe
                            src={pdfDocResult.blobUrl}
                            title={`${activeChapter.name} PDF Preview`}
                            className="w-full h-[520px] bg-slate-900"
                          />
                        </div>
                      ) : (
                        /* High-Fidelity A4 Visual Sheet Mockup */
                        <div className="flex justify-center p-1 sm:p-3 overflow-x-auto bg-[#07080D]/80 rounded-2xl border border-white/[0.06]">
                          <div
                            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                            className="w-full max-w-[650px] min-h-[820px] bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-8 flex flex-col justify-between transition-transform duration-150 relative border border-slate-300"
                          >
                            {/* Top Running Header Line */}
                            <div>
                              <div className="flex items-center justify-between text-[8px] font-semibold text-slate-500 pb-1 border-b border-cyan-500 mb-4">
                                <span className="tracking-wider">
                                  JEE 3D PHYSICS LAB • FORMULA & SHORTCUT REVISION SHEET
                                </span>
                                <span className="uppercase text-slate-700 font-bold">
                                  {activeChapter.name}
                                </span>
                              </div>

                              {/* Navy Banner */}
                              <div className="bg-[#0f172a] text-white p-4 rounded-md border-l-4 border-cyan-400 mb-4 shadow-xs">
                                <h2 className="text-base sm:text-lg font-black tracking-tight mb-0.5">
                                  {activeChapter.name}
                                </h2>
                                <p className="text-[10px] text-cyan-200 font-medium">
                                  {activeChapter.category.toUpperCase()} | Target: JEE Main & Advanced (Comprehensive)
                                </p>
                                <p className="text-[9px] text-slate-300 mt-1 leading-tight">
                                  {activeChapter.description}
                                </p>
                              </div>

                              {/* Content on Sheet */}
                              {activeJeeSheet ? (
                                <div className="space-y-3">
                                  {/* Definitions on Page 1 */}
                                  {activePage === 1 && activeJeeSheet.basicDefinitions && (
                                    <div className="space-y-1.5">
                                      <div className="text-[9px] font-bold text-indigo-950 uppercase border-b border-indigo-200 pb-0.5">
                                        1. Key Definitions & Dimensions
                                      </div>
                                      <div className="space-y-1">
                                        {activeJeeSheet.basicDefinitions.map((d, dIdx) => (
                                          <div key={dIdx} className="p-2 bg-slate-50 rounded border border-slate-200 text-[8.5px]">
                                            <div className="font-bold text-indigo-900">• {d.term}:</div>
                                            <div className="text-slate-700">{d.definition}</div>
                                            <div className="text-slate-500 font-mono text-[7.5px] mt-0.5">
                                              Symbol: {d.symbol} | SI Unit: {d.siUnit}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Core Formulas */}
                                  <div className="space-y-2">
                                    <div className="text-[9px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-0.5">
                                      2. Governing Formulas & Conditions
                                    </div>
                                    {(activePage === 1
                                      ? (activeJeeSheet.coreFormulas || []).slice(0, 2)
                                      : (activeJeeSheet.coreFormulas || []).slice(2)
                                    ).map((sec, sIdx) => (
                                      <div key={sIdx} className="space-y-1.5">
                                        <div className="text-[8.5px] font-bold text-indigo-950">
                                          § {sec.sectionTitle}
                                        </div>
                                        <div className="space-y-1.5">
                                          {(sec.items || []).map((item, iIdx) => (
                                            <div key={iIdx} className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                                              <div className="text-[8.5px] font-bold text-slate-900">
                                                • {item.name}:
                                              </div>
                                              <div className="p-1 bg-white rounded border border-slate-300 font-mono text-[9px] font-bold text-slate-900">
                                                {cleanLatexForPdf(item.formula)}
                                              </div>
                                              <div className="text-[7.5px] text-slate-500 italic">
                                                Condition: {item.conditionOrMeaning} {item.siUnit ? `[${item.siUnit}]` : ''}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Page 2: Special Cases, Shortcuts & Traps */}
                                  {activePage === 2 && (
                                    <div className="space-y-2.5 pt-2">
                                      {/* Special Cases */}
                                      {activeJeeSheet.specialCases && activeJeeSheet.specialCases.length > 0 && (
                                        <div className="space-y-1.5">
                                          <div className="text-[9px] font-bold text-amber-900 uppercase border-b border-amber-200 pb-0.5">
                                            3. High-Yield Special Cases
                                          </div>
                                          {activeJeeSheet.specialCases.map((sc, scIdx) => (
                                            <div key={scIdx} className="p-2 bg-amber-50 rounded border border-amber-200 text-[8px] space-y-0.5">
                                              <div className="font-bold text-amber-950">Case: {sc.title}</div>
                                              <div className="font-mono text-[8.5px] font-bold text-amber-900">{cleanLatexForPdf(sc.resultFormula)}</div>
                                              <div className="text-amber-800 italic">Condition: {sc.condition} — {sc.notes}</div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Shortcuts */}
                                      {activeJeeSheet.jeeQuickRevision?.shortcuts && (
                                        <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-[8px] text-emerald-950 space-y-1">
                                          <div className="font-bold text-emerald-800 uppercase">⚡ High-Yield Shortcuts:</div>
                                          {activeJeeSheet.jeeQuickRevision.shortcuts.map((s, idx) => (
                                            <div key={idx}>› {cleanLatexForPdf(s)}</div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Traps */}
                                      {activeJeeSheet.jeeQuickRevision?.trapsAndPitfalls && (
                                        <div className="p-2 bg-rose-50 rounded border border-rose-200 text-[8px] text-rose-950 space-y-1">
                                          <div className="font-bold text-rose-800 uppercase">⚠️ Exam Traps & Negative Marking:</div>
                                          {activeJeeSheet.jeeQuickRevision.trapsAndPitfalls.map((t, idx) => (
                                            <div key={idx}>! {cleanLatexForPdf(t)}</div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* Fallback concepts view */
                                <div className="space-y-3">
                                  {activeConcepts.map((concept, cIdx) => (
                                    <div key={concept.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                                      <div className="text-xs font-bold text-indigo-950">
                                        {cIdx + 1}. {concept.title}
                                      </div>
                                      <div className="space-y-1.5">
                                        {concept.formulas.map((f, fIdx) => (
                                          <div key={fIdx} className="p-2 bg-white rounded border border-slate-200 space-y-1">
                                            <div className="text-[9px] font-bold text-slate-800">• {f.name}:</div>
                                            <div className="p-1 bg-slate-100 rounded font-mono text-[9px] font-bold text-slate-900">
                                              {cleanLatexForPdf(f.latex)}
                                            </div>
                                            <div className="text-[8px] text-slate-500 italic">{f.explanation}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Running Footer Line */}
                            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500 font-mono mt-6">
                              <span>Founded by Sanjay.J • JEE 3D Physics Lab</span>
                              <span>Page {activePage} of {totalPages}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Commit Download Bar */}
                      <div className="p-3.5 rounded-2xl bg-[#121320] border border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              Commit & Save Formula Sheet
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Clean, high-readability vector PDF download to your browser's Downloads folder
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadChapter(activeChapter.id)}
                          disabled={downloadingChapterId === activeChapter.id}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          <span>
                            {downloadingChapterId === activeChapter.id
                              ? 'Exporting Vector PDF...'
                              : `Download ${activeChapter.name} PDF`}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Interactive KaTeX Breakdown Mode */
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[#11121F] border border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {activeChapter.name} — Interactive Formula Guide
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Click 'Open in 3D Lab' on any topic to inspect dynamic 3D vectors & simulations
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownloadChapter(activeChapter.id)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>

                      {/* If JEE Sheet present, show rich categories */}
                      {activeJeeSheet ? (
                        <div className="space-y-3">
                          {/* Core Formulas */}
                          {(activeJeeSheet.coreFormulas || []).map((sec, sIdx) => (
                            <div key={sIdx} className="p-4 rounded-2xl bg-[#11121F] border border-white/[0.08] space-y-3">
                              <h4 className="text-sm font-bold text-cyan-300">
                                Section {sIdx + 1}: {sec.sectionTitle}
                              </h4>
                              <div className="space-y-2">
                                {(sec.items || []).map((item, iIdx) => (
                                  <div key={iIdx} className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                                      <span>{item.name}</span>
                                      {item.siUnit && (
                                        <span className="text-[10px] text-zinc-400 font-mono">
                                          SI: {item.siUnit}
                                        </span>
                                      )}
                                    </div>
                                    <div className="py-2 px-3 rounded-lg bg-[#0E0F1A] border border-white/[0.04] text-center font-mono text-sm text-cyan-300">
                                      {item.formula}
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                      <strong>Condition:</strong> {item.conditionOrMeaning}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Shortcuts & Traps */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeJeeSheet.jeeQuickRevision?.shortcuts && (
                              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                                <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                                  <span>⚡ JEE High-Yield Shortcuts:</span>
                                </div>
                                <div className="space-y-1.5 text-xs text-zinc-300">
                                  {(activeJeeSheet.jeeQuickRevision.shortcuts || []).map((s, idx) => (
                                    <div key={idx} className="leading-relaxed">› {s}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeJeeSheet.jeeQuickRevision?.trapsAndPitfalls && (
                              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/25 space-y-2">
                                <div className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                                  <span>⚠️ Negative Marking Trap Alerts:</span>
                                </div>
                                <div className="space-y-1.5 text-xs text-rose-200/90">
                                  {(activeJeeSheet.jeeQuickRevision.trapsAndPitfalls || []).map((t, idx) => (
                                    <div key={idx} className="leading-relaxed">! {t}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        (activeConcepts || []).map((concept, cIdx) => (
                          <div
                            key={concept.id}
                            className="p-3.5 sm:p-4 rounded-2xl bg-[#11121F] border border-white/[0.08] space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                                  {cIdx + 1}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-white">
                                  {concept.title}
                                </h4>
                              </div>

                              {onSelectConcept && (
                                <button
                                  onClick={() => {
                                    onSelectConcept(concept);
                                    onClose();
                                  }}
                                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                                >
                                  <span>Open in 3D Lab</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <div className="space-y-2">
                              {(concept.formulas || []).map((f, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="p-2.5 sm:p-3 rounded-xl bg-[#161828] border border-white/[0.06] space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                                    <span>{f.name}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      Formula #{fIdx + 1}
                                    </span>
                                  </div>
                                  <div className="py-1.5 px-2 rounded-lg bg-[#0E0F1A] border border-white/[0.04] text-center overflow-x-auto">
                                    <Latex
                                      math={f.latex}
                                      displayMode
                                      className="text-cyan-300 font-mono text-xs sm:text-sm"
                                    />
                                  </div>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    {f.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Information */}
            <div className="p-3 sm:px-5 py-2 border-t border-white/[0.08] bg-[#10111D] flex items-center justify-between gap-3 text-xs text-zinc-400 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  All PDF sheets are generated in vector quality directly in your browser and saved to your <strong>Downloads</strong> folder.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadChapter(activeChapter.id)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1.5 transition text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {activeChapter.name}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
