import React, { useState, useRef, useEffect } from 'react';
import { PhysicsConcept } from '../../types';
import { ALL_CONCEPTS } from '../../data/allConcepts';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import {
  Search,
  Sparkles,
  BookOpen,
  Star,
  Sun,
  Moon,
  Compass,
  Atom,
  Menu,
  Bot,
  Zap,
  HelpCircle,
  Home,
  Layers,
  X,
  FileText,
  Download,
  ChevronDown,
  Flame,
  Radio,
  Keyboard,
  TrendingUp,
  MoreVertical,
} from 'lucide-react';

interface HeaderProps {
  currentConcept: PhysicsConcept;
  onSelectConcept: (concept: PhysicsConcept) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  onOpenFormulaHub?: () => void;
  onOpenPdfModal?: (chapterId?: string) => void;
  onOpenSyllabusDirectory?: () => void;
  onOpenAiTutor?: () => void;
  onOpenTutorial?: () => void;
  onOpenSpotlightTour?: () => void;
  onOpenShortcuts?: () => void;
  onOpenAnalytics?: () => void;
  onOpenLoadingScreen?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  currentView?: 'home' | 'lab';
  onSetView?: (view: 'home' | 'lab') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentConcept,
  onSelectConcept,
  favorites,
  onToggleFavorite,
  isDark: propIsDark,
  onToggleDark,
  onOpenFormulaHub,
  onOpenPdfModal,
  onOpenSyllabusDirectory,
  onOpenAiTutor,
  onOpenTutorial,
  onOpenSpotlightTour,
  onOpenShortcuts,
  onOpenAnalytics,
  onOpenLoadingScreen,
  onToggleSidebar,
  isSidebarOpen,
  currentView = 'home',
  onSetView,
}) => {
  const { theme, isDark, isCyberpunk, cycleTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchModalOpen, setIsMobileSearchModalOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const moreToolsRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const isCurrentFavorite = favorites.includes(currentConcept.id);

  // Filter concepts based on search query
  const filteredConcepts = searchQuery.trim()
    ? ALL_CONCEPTS.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.formulas.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
        setIsMoreToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileSearchModalOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [isMobileSearchModalOpen]);

  return (
    <header
      id="header-navbar"
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4 ${
      isCyberpunk
        ? 'bg-[#030712]/92 border-cyan-500/20 text-zinc-100 shadow-[0_4px_25px_rgba(0,240,255,0.06)]'
        : isDark 
        ? 'bg-[#0A0A0B]/90 border-white/[0.08] text-zinc-100' 
        : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-2.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Collapse Syllabus Navigation" : "Open Syllabus Navigation"}
            aria-label="Toggle Syllabus Navigation"
            className={`p-2 rounded-xl border transition shadow-xs flex items-center gap-1.5 text-xs font-semibold ${
              isSidebarOpen
                ? isCyberpunk
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-cyan-100 text-cyan-800 border-cyan-300 font-bold shadow-xs'
                : isCyberpunk
                ? 'bg-[#0A1020] hover:bg-[#101A30] text-zinc-300 hover:text-cyan-300 border-cyan-500/20'
                : isDark
                ? 'bg-[#14141C] hover:bg-[#1C1C26] text-zinc-300 hover:text-white border-white/[0.08]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border-slate-200'
            }`}
          >
            <Menu className={`w-4 h-4 ${isCyberpunk ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <span className="hidden sm:inline text-xs">Syllabus</span>
          </button>
        )}

        <button
          onClick={() => onSetView?.('home')}
          className="flex items-center gap-2.5 text-left group"
          title="Return to Home Dashboard"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition ${
            isCyberpunk
              ? 'bg-gradient-to-tr from-cyan-400 via-teal-500 to-emerald-400 shadow-[0_0_18px_rgba(0,240,255,0.45)] text-black'
              : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20'
          }`}>
            <Atom className={`w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow ${isCyberpunk ? 'text-slate-950 stroke-[2.5]' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-extrabold text-sm sm:text-base lg:text-lg tracking-tight transition truncate ${
                isCyberpunk
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 font-mono'
                  : isDark ? 'text-zinc-100 group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-600'
              }`}>
                JEE 3D Physics Lab
              </h1>
              <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                isCyberpunk
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
              }`}>
                {isCyberpunk ? '⚡ SYNAPSE HUD' : 'JEE Main & Adv'}
              </span>
              <div className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${
                isCyberpunk
                  ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 shadow-[0_0_8px_rgba(0,255,157,0.2)]'
                  : isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>Founder: <strong className={isDark ? "text-emerald-200" : "text-emerald-900"}>Sanjay.J</strong></span>
              </div>
            </div>
            <p className={`text-[10px] sm:text-[11px] font-medium hidden md:block truncate ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              Interactive 3D Simulations & Coaching • Founded by <span className={isCyberpunk ? "text-cyan-300 font-semibold" : isDark ? "text-cyan-300 font-semibold" : "text-cyan-700 font-semibold"}>Sanjay.J</span>
            </p>
          </div>
        </button>
      </div>

      {/* View Mode Switcher (Home vs 3D Lab) */}
      {onSetView && (
        <div className={`flex items-center p-1 rounded-xl border shrink-0 ${
          isCyberpunk
            ? 'bg-[#060B18] border-cyan-500/25 shadow-inner'
            : isDark ? 'bg-[#12121A] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => onSetView('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'home'
                ? isCyberpunk
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home Hub</span>
          </button>
          <button
            onClick={() => onSetView('lab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'lab'
                ? isCyberpunk
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Studio</span>
          </button>
        </div>
      )}

      {/* Global Interactive Search */}
      <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-sm hidden lg:block">
        <div className="relative flex items-center">
          <Search className={`absolute left-3 w-4 h-4 pointer-events-none ${isCyberpunk ? 'text-cyan-400' : isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search Laws, Formulas, Concepts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs transition focus:outline-none focus:ring-1 ${
              isCyberpunk
                ? 'bg-[#060B18] border-cyan-500/25 text-cyan-100 placeholder-zinc-500 focus:border-cyan-400 focus:ring-cyan-400/40 font-mono shadow-inner'
                : isDark
                ? 'bg-[#121216] border-white/[0.08] text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:ring-cyan-500/40'
                : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-cyan-500/40'
            }`}
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && filteredConcepts.length > 0 && (
          <div className={`absolute top-full mt-2 left-0 right-0 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 flex flex-col p-1.5 divide-y ${
            isCyberpunk
              ? 'bg-[#060B18]/98 border-cyan-500/30 divide-cyan-950/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
              : isDark
              ? 'bg-[#121216]/95 border-white/[0.1] divide-white/[0.05]'
              : 'bg-white/95 border-slate-200 divide-slate-100 shadow-slate-300'
          }`}>
            {filteredConcepts.map((concept) => (
              <button
                key={concept.id}
                onClick={() => {
                  onSelectConcept(concept);
                  onSetView?.('lab');
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className={`p-3 text-left rounded-xl transition flex flex-col gap-1 ${
                  isCyberpunk ? 'hover:bg-cyan-500/10' : isDark ? 'hover:bg-[#1A1A22]' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{concept.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isCyberpunk
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
                      : isDark ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}>
                    {concept.topic}
                  </span>
                </div>
                <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{concept.subtitle}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsMobileSearchModalOpen(true)}
          className={`lg:hidden p-2 rounded-xl border transition flex items-center justify-center min-h-[38px] min-w-[38px] ${
            isCyberpunk
              ? 'bg-[#060B18] border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
              : isDark
              ? 'bg-[#121216] border-white/[0.08] text-zinc-300 hover:text-white hover:bg-[#1A1A22]'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
          }`}
          title="Search Formulas & Concepts"
          aria-label="Search Formulas & Concepts"
        >
          <Search className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Primary Direct Action Buttons */}
        {onOpenPdfModal && (
          <button
            onClick={() => onOpenPdfModal()}
            className={`hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-xl border transition items-center gap-1.5 text-xs font-semibold shadow-xs shrink-0 ${
              isCyberpunk
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : isDark
                ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/35'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-300'
            }`}
            title="Download JEE Chapter-Wise PDF Formula Sheets"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">PDF Sheets</span>
          </button>
        )}

        {onOpenFormulaHub && (
          <button
            id="header-formula-btn"
            onClick={onOpenFormulaHub}
            className={`hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl border transition items-center gap-1.5 text-xs font-semibold shadow-xs shrink-0 ${
              isCyberpunk
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(0,255,157,0.2)]'
                : isDark
                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200'
            }`}
            title="Open Complete JEE Physics Formula & Law Hub"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Formulas</span>
          </button>
        )}

        {onOpenAnalytics && (
          <button
            onClick={onOpenAnalytics}
            className={`hidden xl:flex px-2.5 sm:px-3 py-1.5 rounded-xl border transition items-center gap-1.5 text-xs font-semibold shadow-xs shrink-0 ${
              isCyberpunk
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : isDark
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
            title="Open JEE Physics Weightage & Score Intelligence Hub"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analytics</span>
          </button>
        )}

        {/* Consolidated "More Tools" Menu */}
        <div ref={moreToolsRef} className="relative">
          <button
            onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
            title="More Physics Tools, Syllabus Directory, Guided Tour, Shortcuts & Calibration"
            aria-label="More Physics Tools"
            className={`px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 shadow-xs active:scale-95 min-h-[38px] sm:min-h-[40px] shrink-0 ${
              isMoreToolsOpen
                ? isCyberpunk
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : isDark
                  ? 'bg-white/[0.12] text-white border-white/[0.2]'
                  : 'bg-slate-200 text-slate-900 border-slate-300'
                : isCyberpunk
                ? 'bg-[#060B18] border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15'
                : isDark
                ? 'bg-[#14141C] border-white/[0.08] text-zinc-300 hover:text-white hover:bg-[#1C1C26]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <MoreVertical className="w-4 h-4 sm:hidden text-cyan-400" />
            <Layers className="w-3.5 h-3.5 hidden sm:block text-cyan-400" />
            <span className="hidden sm:inline text-xs font-bold">Tools</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isMoreToolsOpen ? 'rotate-180 text-cyan-400' : 'opacity-70'}`} />
          </button>

          {/* More Tools Dropdown */}
          {isMoreToolsOpen && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl backdrop-blur-2xl p-1.5 z-50 flex flex-col gap-1 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 ${
              isCyberpunk
                ? 'bg-[#040816]/98 border-cyan-500/40 text-zinc-100 shadow-[0_10px_40px_rgba(0,0,0,0.85)] divide-y divide-cyan-950/40'
                : isDark
                ? 'bg-[#121218]/98 border-white/[0.14] text-zinc-100 shadow-2xl divide-y divide-white/[0.05]'
                : 'bg-white/98 border-slate-200 text-slate-900 shadow-2xl divide-y divide-slate-100'
            }`}>
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono flex items-center justify-between">
                <span>Physics Resources & Labs</span>
                <span className="text-[9px] text-zinc-500 font-sans">Quick Access</span>
              </div>

              <div className="flex flex-col gap-0.5 pt-1">
                {onOpenPdfModal && (
                  <button
                    onClick={() => {
                      onOpenPdfModal();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-cyan-500/15 text-cyan-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">Chapter PDF Sheets</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>High-yield revision notes & formulas</div>
                    </div>
                  </button>
                )}

                {onOpenFormulaHub && (
                  <button
                    onClick={() => {
                      onOpenFormulaHub();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-cyan-500/15 text-cyan-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">Formula & Law Hub</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>150+ master formulas & boundary cases</div>
                    </div>
                  </button>
                )}

                {onOpenAnalytics && (
                  <button
                    onClick={() => {
                      onOpenAnalytics();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-emerald-500/15 text-emerald-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">JEE Weightage Analytics</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>10-year exam trend intelligence</div>
                    </div>
                  </button>
                )}

                {onOpenSyllabusDirectory && (
                  <button
                    onClick={() => {
                      onOpenSyllabusDirectory();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-fuchsia-500/15 text-fuchsia-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">Syllabus & 3D Specs</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Full curriculum matrix & parameters</div>
                    </div>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-0.5 pt-1">
                {onOpenSpotlightTour && (
                  <button
                    onClick={() => {
                      onOpenSpotlightTour();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-cyan-500/15 text-cyan-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">Interactive Spotlight Tour</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Guided walk-through of 3D features</div>
                    </div>
                  </button>
                )}

                {onOpenTutorial && (
                  <button
                    onClick={() => {
                      onOpenTutorial();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-indigo-500/15 text-indigo-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">Step-by-Step Tutorial</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Learn how to experiment effectively</div>
                    </div>
                  </button>
                )}

                {onOpenShortcuts && (
                  <button
                    onClick={() => {
                      onOpenShortcuts();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-cyan-500/15 text-cyan-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-zinc-300 flex items-center justify-center shrink-0">
                      <Keyboard className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs">Keyboard Shortcuts</div>
                        <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Hotkeys for power users</div>
                      </div>
                      <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/30 border border-white/10">?</kbd>
                    </div>
                  </button>
                )}

                {onOpenLoadingScreen && (
                  <button
                    onClick={() => {
                      onOpenLoadingScreen();
                      setIsMoreToolsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                      isCyberpunk ? 'hover:bg-cyan-500/15 text-cyan-200' : isDark ? 'hover:bg-white/[0.06] text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Atom className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs">Calibrate Laboratory</div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Reset shaders & stage physics engine</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search & Quick Tools Modal Overlay */}
      {isMobileSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-3 sm:p-4 animate-fadeIn lg:hidden">
          <div className={`rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isCyberpunk
              ? 'bg-[#030712] border-cyan-500/30'
              : isDark ? 'bg-[#121218] border-white/[0.12]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-3.5 border-b flex items-center justify-between gap-2 ${
              isCyberpunk
                ? 'border-cyan-500/25 bg-[#060B18]'
                : isDark ? 'border-white/[0.08] bg-[#161622]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 150+ formulas, laws, chapters..."
                  className={`flex-1 bg-transparent text-sm focus:outline-none ${
                    isDark ? 'text-zinc-100 placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <button
                onClick={() => setIsMobileSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Mobile Modal */}
            <div className={`p-2.5 border-b flex items-center justify-between gap-2 ${
              isCyberpunk
                ? 'bg-[#040814] border-cyan-500/20'
                : isDark ? 'bg-[#0E0E14] border-white/[0.05]' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <span className="text-[11px] font-semibold text-zinc-400">Quick Theme:</span>
              <button
                onClick={cycleTheme}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  isCyberpunk
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : isDark
                    ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                    : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                }`}
              >
                {isCyberpunk ? <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" /> : isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{isCyberpunk ? 'Cyberpunk Synapse' : isDark ? 'Switch to Light' : 'Switch to Synapse'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-white/[0.05]">
              {filteredConcepts.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  {searchQuery ? 'No matching concepts found' : 'Type to search 150+ JEE Physics formulas & labs'}
                </div>
              ) : (
                filteredConcepts.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => {
                      onSelectConcept(concept);
                      onSetView?.('lab');
                      setIsMobileSearchModalOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-3 text-left rounded-xl transition flex flex-col gap-1 ${
                      isCyberpunk ? 'hover:bg-cyan-500/10' : isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{concept.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isCyberpunk
                          ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
                          : isDark ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}>
                        {concept.topic}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{concept.subtitle}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


