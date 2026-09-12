import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsConcept } from './types';
import { ALL_CONCEPTS, getConceptById } from './data/allConcepts';
import { useTheme } from './context/ThemeContext';
import { ThreePhysicsCanvas } from './components/canvas/ThreePhysicsCanvas';
import { ParameterControls } from './components/ui/ParameterControls';
import { LiveGraphPanel } from './components/ui/LiveGraphPanel';
import { EquationPanel } from './components/ui/EquationPanel';
import { JeeInsightsPanel } from './components/ui/JeeInsightsPanel';
import { QuestionArena } from './components/ui/QuestionArena';
import { CoachingModulePanel } from './components/ui/CoachingModulePanel';
import { Header } from './components/ui/Header';
import { Sidebar } from './components/ui/Sidebar';
import { HomePage } from './components/ui/HomePage';
import { MobileNavBottomSheet } from './components/ui/MobileNavBottomSheet';
import { OnboardingScreen } from './components/ui/OnboardingScreen';
import { DraggableAiTutorFab } from './components/ui/DraggableAiTutorFab';
import { FormulaDirectoryModal } from './components/ui/FormulaDirectoryModal';
import { ChapterFormulaPdfModal } from './components/ui/ChapterFormulaPdfModal';
import { JeeSyllabusDirectoryModal } from './components/ui/JeeSyllabusDirectoryModal';
import { AiPhysicsTutorModal } from './components/ui/AiPhysicsTutorModal';
import { UserTutorialModal } from './components/ui/UserTutorialModal';
import { SpotlightTutorialOverlay, startTutorial } from './components/ui/SpotlightTutorialOverlay';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { FocusModeOverlay } from './components/ui/FocusModeOverlay';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';
import { CursorEffect } from './components/ui/CursorEffect';
import { JeeWeightageAnalyticsModal } from './components/ui/JeeWeightageAnalyticsModal';
import { GlobalPhysicsLoader } from './components/ui/GlobalPhysicsLoader';
import {
  Menu,
  X,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sliders,
  LineChart,
  BookOpen,
  Award,
  Zap,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Camera,
  Layers,
} from 'lucide-react';

export default function App() {
  const { isDark, isCyberpunk, theme, toggleTheme, cycleTheme } = useTheme();
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('ai_physics_user_name') || '');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingScreenOpen, setIsLoadingScreenOpen] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<PhysicsConcept>(ALL_CONCEPTS[0]);
  const [currentView, setCurrentView] = useState<'home' | 'lab'>('home');
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [savedSessionParams, setSavedSessionParams] = useState<Record<string, number> | null>(null);

  // Parameters map for active simulation
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ALL_CONCEPTS[0].parameters.forEach((p) => {
      initial[p.id] = p.defaultVal;
    });
    return initial;
  });

  // Simulation Time & Controls
  const [simTime, setSimTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);

  // Viewport Toggles
  const [showVectors, setShowVectors] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [isARMode, setIsARMode] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState<'vibrant' | 'subtle' | 'off'>(() => {
    try {
      const saved = localStorage.getItem('jee_cyberpunk_bloom');
      if (saved === 'vibrant' || saved === 'subtle' || saved === 'off') return saved;
      return 'vibrant';
    } catch {
      return 'vibrant';
    }
  });

  const handleBloomChange = (val: 'vibrant' | 'subtle' | 'off') => {
    setBloomIntensity(val);
    try {
      localStorage.setItem('jee_cyberpunk_bloom', val);
    } catch {}
  };

  // Navigation state
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });
  const [isFormulaHubOpen, setIsFormulaHubOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfChapterId, setPdfChapterId] = useState<string | undefined>(undefined);
  const [isSyllabusDirectoryOpen, setIsSyllabusDirectoryOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    try {
      return localStorage.getItem('jee_physics_tutorial_seen') !== 'true';
    } catch {
      return true;
    }
  });

  const handleOpenPdfModal = (chapterId?: string) => {
    setPdfChapterId(chapterId || currentConcept.chapterId);
    setIsPdfModalOpen(true);
  };
  const [activeTab, setActiveTab] = useState<
    'controls' | 'coaching' | 'equations' | 'graphs' | 'jee' | 'questions'
  >('controls');
  const [activeSectionId, setActiveSectionId] = useState<string>('home-hero-section');

  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll state on concept change or view switch to prevent messy scroll persistence
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentConcept.id, currentView]);

  // Active section scroll tracking for Sidebar navigation synchronization
  useEffect(() => {
    const container = mainScrollRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sectionIds =
            currentView === 'home'
              ? [
                  'home-hero-section',
                  'home-flagship-section',
                  'home-chapters-grid',
                  'home-pdf-section',
                  'home-founder-section',
                ]
              : [
                  'section-top',
                  'section-3d',
                  `section-${activeTab}`,
                  'section-chapter-roadmap',
                ];

          const containerRect = container.getBoundingClientRect();
          let current = sectionIds[0];

          for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top - containerRect.top <= 240) {
                current = id;
              }
            }
          }
          setActiveSectionId(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentView, currentConcept.id, activeTab]);

  // Browser Back/Forward history listener
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.view) {
          setCurrentView(e.state.view);
        }
        if (e.state.conceptId) {
          const found = getConceptById(e.state.conceptId);
          if (found) setCurrentConcept(found);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Keyboard Shortcuts (Press ? for Cheat Sheet, F for Focus, P for Play/Pause, S for Speed, etc.)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, select, or contenteditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      // Escape to close active modal or exit Focus Mode
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          return;
        }
        if (isAiTutorOpen) {
          e.preventDefault();
          setIsAiTutorOpen(false);
          return;
        }
        if (isPdfModalOpen) {
          e.preventDefault();
          setIsPdfModalOpen(false);
          return;
        }
        if (isFormulaHubOpen) {
          e.preventDefault();
          setIsFormulaHubOpen(false);
          return;
        }
        if (isSyllabusDirectoryOpen) {
          e.preventDefault();
          setIsSyllabusDirectoryOpen(false);
          return;
        }
        if (isTutorialOpen) {
          e.preventDefault();
          setIsTutorialOpen(false);
          return;
        }
        if (isARMode) {
          e.preventDefault();
          setIsARMode(false);
          return;
        }
        if (isFocusMode) {
          e.preventDefault();
          setIsFocusMode(false);
          return;
        }
        return;
      }

      // '?' or Shift + '/' to toggle Keyboard Shortcuts Cheat Sheet
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Avoid triggering single-key shortcuts when holding Ctrl / Cmd / Alt
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 'A' or 'a' to toggle AR Mode (Camera Physical Environment Overlay)
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setIsARMode((prev) => !prev);
        return;
      }

      // 'F' or 'f' to toggle Focus Mode
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (currentView !== 'lab') {
          setCurrentView('lab');
        }
        setIsFocusMode((prev) => !prev);
        return;
      }

      // 'P' or 'p' or 'Space' for Play / Pause
      if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
        return;
      }

      // 'S' or 's' for Speed up / slow down simulation
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const SPEEDS = [0.25, 0.5, 1.0, 1.5, 2.0];
        const currentIndex = SPEEDS.findIndex((s) => Math.abs(s - speed) < 0.05);
        if (e.shiftKey) {
          // Slow down (cycle backwards)
          const nextIndex = currentIndex <= 0 ? SPEEDS.length - 1 : currentIndex - 1;
          setSpeed(SPEEDS[nextIndex]);
        } else {
          // Speed up (cycle forwards)
          const nextIndex = currentIndex === -1 || currentIndex >= SPEEDS.length - 1 ? 0 : currentIndex + 1;
          setSpeed(SPEEDS[nextIndex]);
        }
        return;
      }

      // 'R' or 'r' for Reset simulation time
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setSimTime(0);
        return;
      }

      // '[' and ']' for Concept navigation
      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const currentIndex = ALL_CONCEPTS.findIndex((c) => c.id === currentConcept.id);
        if (currentIndex !== -1) {
          const nextIndex =
            e.key === '['
              ? (currentIndex - 1 + ALL_CONCEPTS.length) % ALL_CONCEPTS.length
              : (currentIndex + 1) % ALL_CONCEPTS.length;
          handleSelectConcept(ALL_CONCEPTS[nextIndex]);
        }
        return;
      }

      // 3D Canvas visual toggles
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setShowVectors((prev) => !prev);
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setShowLabels((prev) => !prev);
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setShowTrajectory((prev) => !prev);
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGrid((prev) => !prev);
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setShowAxes((prev) => !prev);
        return;
      }

      // 'T' or 't' for AI Tutor
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsAiTutorOpen((prev) => !prev);
        return;
      }

      // 'U' or 'u' for Formula Hub
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        setIsFormulaHubOpen((prev) => !prev);
        return;
      }

      // 'D' or 'd' for PDF Sheets Modal
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleOpenPdfModal();
        return;
      }

      // 'M' or 'm' for Cycle Theme
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        cycleTheme();
        return;
      }

      // 'H' or 'h' for Home Overview
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setCurrentView('home');
        return;
      }

      // 'B' or 'b' for Toggle Sidebar
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      // '1' to '6' for Lab Sub-tabs
      const tabMap: Record<string, 'controls' | 'coaching' | 'equations' | 'graphs' | 'jee' | 'questions'> = {
        '1': 'controls',
        '2': 'coaching',
        '3': 'equations',
        '4': 'graphs',
        '5': 'jee',
        '6': 'questions',
      };
      if (tabMap[e.key]) {
        e.preventDefault();
        if (currentView !== 'lab') {
          setCurrentView('lab');
        }
        setActiveTab(tabMap[e.key]);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [
    isShortcutsOpen,
    isAiTutorOpen,
    isPdfModalOpen,
    isFormulaHubOpen,
    isSyllabusDirectoryOpen,
    isTutorialOpen,
    isFocusMode,
    currentView,
    speed,
    currentConcept.id,
    cycleTheme,
  ]);

  // Persistence (Favorites & Completed concepts)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jee_fav_concepts');
      return saved ? JSON.parse(saved) : ['projectile-motion', 'lcr-circuit'];
    } catch {
      return ['projectile-motion'];
    }
  });

  const [completedConcepts, setCompletedConcepts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jee_completed_concepts');
      return saved ? JSON.parse(saved) : ['projectile-motion'];
    } catch {
      return ['projectile-motion'];
    }
  });

  // Animation Loop for Physics Simulation
  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    let animId: number;
    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setSimTime((t) => t + delta * speed);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  
  // Concept Change Handler
  const handleSelectConcept = (concept: PhysicsConcept, preset?: Record<string, number>) => {
    setCurrentConcept(concept);
    const newParams: Record<string, number> = {};
    concept.parameters.forEach((p) => {
      newParams[p.id] = p.defaultVal;
    });
    
    if (preset) {
      Object.assign(newParams, preset);
      setParamValues(newParams);
      setShowRestorePrompt(false);
    } else {
      // Check for saved session
      try {
        const saved = localStorage.getItem(`jee_physics_params_${concept.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          let isDifferent = false;
          // Check if saved is actually different from defaults
          for (const key in parsed) {
            if (parsed[key] !== newParams[key]) {
              isDifferent = true;
              break;
            }
          }
          if (isDifferent) {
            setSavedSessionParams(parsed);
            setShowRestorePrompt(true);
          } else {
            setShowRestorePrompt(false);
          }
        } else {
          setShowRestorePrompt(false);
        }
      } catch (e) {
        setShowRestorePrompt(false);
      }
      setParamValues(newParams);
    }
    
    setSimTime(0);
    setIsLoadingScreenOpen(true);
    setCurrentView('lab');
    window.history.pushState({ view: 'lab', conceptId: concept.id }, '', `#lab-${concept.id}`);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    // Mark as visited/explored
    if (!completedConcepts.includes(concept.id)) {
      const updated = [...completedConcepts, concept.id];
      setCompletedConcepts(updated);
      try {
        localStorage.setItem('jee_completed_concepts', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleSetView = useCallback((view: 'home' | 'lab') => {
    setCurrentView(view);
    window.history.pushState({ view, conceptId: currentConcept.id }, '', `#${view}`);
  }, [currentConcept.id]);

  
  const handleParamChange = (id: string, val: number) => {
    setParamValues((prev) => {
      const newParams = { ...prev, [id]: val };
      // Auto-save to localStorage
      try {
        localStorage.setItem(`jee_physics_params_${currentConcept.id}`, JSON.stringify(newParams));
      } catch (e) {
        console.warn('Failed to save session params to localStorage');
      }
      return newParams;
    });
  };


  const handleResetSimulation = () => {
    setSimTime(0);
  };

  // Full default simulation state recovery (for ErrorBoundary & recovery triggers)
  const handleFullSimulationRecovery = useCallback(() => {
    const defaultConcept = ALL_CONCEPTS[0];
    setCurrentConcept(defaultConcept);
    const initialParams: Record<string, number> = {};
    defaultConcept.parameters.forEach((p) => {
      initialParams[p.id] = p.defaultVal;
    });
    setParamValues(initialParams);
    setSimTime(0);
    setIsPlaying(true);
    setSpeed(1.0);
    setShowVectors(true);
    setShowLabels(true);
    setShowTrajectory(true);
    setShowGrid(true);
    setShowAxes(true);
    setIsFocusMode(false);
  }, []);

  const handleToggleFavorite = (id: string) => {
    const nextFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(nextFavs);
    try {
      localStorage.setItem('jee_fav_concepts', JSON.stringify(nextFavs));
    } catch {}
  };

  // Handle loader complete safely
  const handleLoaderComplete = useCallback(() => {
    setIsInitialLoading(false);
    setIsLoadingScreenOpen(false);
  }, []);

  // Expose switch to lab view on window for interactive tours
  useEffect(() => {
    (window as any).__switchToLabView = () => {
      setCurrentView('lab');
    };
    return () => {
      delete (window as any).__switchToLabView;
    };
  }, []);

  // Guided Spotlight Tour Launcher
  const handleStartSpotlightTour = useCallback(() => {
    if (currentView !== 'lab') {
      setCurrentView('lab');
      setTimeout(() => {
        startTutorial();
      }, 160);
    } else {
      startTutorial();
    }
  }, [currentView]);

  // Compute Real-time Quantities
  const liveQuantities = currentConcept.computeLiveQuantities(paramValues, simTime);

  return (
    <div className={`h-screen h-[100dvh] max-h-screen overflow-hidden flex flex-col transition-colors duration-200 ${
      isCyberpunk ? 'bg-[#030712] text-zinc-100' : isDark ? 'bg-[#0A0A0B] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Global Physics Laboratory Loading Screen */}
      <AnimatePresence>
        {(isInitialLoading || isLoadingScreenOpen) && (
          <GlobalPhysicsLoader
            onComplete={handleLoaderComplete}
            conceptTitle={currentConcept.title}
            isInitial={isInitialLoading}
          />
        )}
      </AnimatePresence>

      {!isInitialLoading && !userName && (
        <OnboardingScreen 
          onComplete={(name) => {
            localStorage.setItem('ai_physics_user_name', name);
            setUserName(name);
          }}
        />
      )}
      {/* Top Navigation Header */}
      <Header
        currentConcept={currentConcept}
        onSelectConcept={handleSelectConcept}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        isDark={isDark}
        onToggleDark={toggleTheme}
        onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
        onOpenPdfModal={handleOpenPdfModal}
        onOpenSyllabusDirectory={() => setIsSyllabusDirectoryOpen(true)}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenSpotlightTour={handleStartSpotlightTour}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenLoadingScreen={() => setIsLoadingScreenOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        currentView={currentView}
        onSetView={handleSetView}
      />

      {/* Unified Main Application Body Container */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Unified Responsive Sidebar (Desktop docked + Mobile off-canvas drawer) */}
        <Sidebar
          currentConcept={currentConcept}
          onSelectConcept={handleSelectConcept}
          favorites={favorites}
          completedConcepts={completedConcepts}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          currentView={currentView}
          onSetView={handleSetView}
          activeTab={activeTab}
          onSetActiveTab={setActiveTab}
          activeSectionId={activeSectionId}
        />

        {/* Unified Global Scroll Container: smooth scrollable for both Home & Lab */}
        <main
          id="main-scroll-container"
          ref={mainScrollRef}
          className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth transition-all ${
            isAiTutorOpen ? 'pointer-events-none select-none filter blur-xs opacity-30' : ''
          }`}
          aria-hidden={isAiTutorOpen}
        >
          {currentView === 'home' ? (
            <HomePage
              onSelectConcept={handleSelectConcept}
              onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
              onOpenPdfModal={handleOpenPdfModal}
              onOpenSyllabusDirectory={() => setIsSyllabusDirectoryOpen(true)}
              onOpenAiTutor={() => setIsAiTutorOpen(true)}
              onOpenTutorial={handleStartSpotlightTour}
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
              completedConcepts={completedConcepts}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <div className="p-3 sm:p-5 pb-24 lg:pb-10 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">

          {showRestorePrompt && savedSessionParams && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border mb-2 shrink-0 ${
              isCyberpunk 
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' 
                : isDark 
                ? 'bg-amber-950/30 border-amber-500/20 text-amber-200' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 shrink-0 animate-pulse" />
                <span className="text-sm font-medium">Found a saved session for <strong>{currentConcept.title}</strong></span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRestorePrompt(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg opacity-70 hover:opacity-100 transition-opacity"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setParamValues(savedSessionParams);
                    setShowRestorePrompt(false);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                    isCyberpunk ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  Restore Values
                </button>
              </div>
            </div>
          )}

          {/* Concept Header Banner - Responsive on Mobile & Desktop */}
          <div id="section-top" className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-colors shadow-sm shrink-0 ${
            isCyberpunk
              ? 'bg-[#060B18]/95 backdrop-blur-md border-cyan-500/30 text-zinc-100 shadow-[0_0_20px_rgba(0,240,255,0.06)]'
              : isDark
              ? 'bg-[#111114]/95 backdrop-blur-md border-white/[0.08] text-zinc-100'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-900 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition flex items-center gap-1.5 shadow-xs shrink-0 min-h-[40px] active:scale-95 ${
                    isSidebarOpen
                      ? isCyberpunk
                        ? 'bg-[#0A1428] hover:bg-[#0E1C38] text-cyan-200 border-cyan-500/30'
                        : isDark
                        ? 'bg-[#1C1C24] hover:bg-[#242430] text-zinc-200 border-white/[0.08]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : isCyberpunk
                      ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : isDark
                      ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}
                  title={isSidebarOpen ? "Collapse Syllabus Navigation" : "Open Syllabus Navigation"}
                  aria-label="Toggle Syllabus Navigation"
                >
                  {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4 text-cyan-400" />}
                  <span className="text-xs font-semibold hidden md:inline">
                    {isSidebarOpen ? "Collapse" : "Syllabus"}
                  </span>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={`text-base sm:text-lg lg:text-xl font-extrabold tracking-tight truncate ${
                      isDark ? 'text-zinc-100' : 'text-slate-900'
                    }`}>
                      {currentConcept.title}
                    </h2>
                    {currentConcept.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                        isCyberpunk
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.25)] font-mono'
                          : isDark
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}>
                        {currentConcept.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] sm:text-xs font-medium line-clamp-1 mt-0.5 ${
                    isDark ? 'text-zinc-400' : 'text-slate-500'
                  }`}>
                    {currentConcept.subtitle}
                  </p>
                </div>
              </div>

              {/* Mobile-only Focus Mode & AR View Buttons */}
              <div className="lg:hidden flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsARMode(!isARMode)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                    isARMode
                      ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : isCyberpunk
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : isDark
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                  title="Toggle AR View (Camera Overlay)"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">{isARMode ? 'Exit AR' : 'AR'}</span>
                </button>

                <button
                  onClick={() => setIsFocusMode(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                    isCyberpunk
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                  }`}
                  title="Focus Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px]">Focus</span>
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Tabs for Secondary Panels */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto">
              {/* Desktop AR View Trigger Button */}
              <button
                onClick={() => setIsARMode(!isARMode)}
                className={`hidden lg:flex px-3 py-2 rounded-xl text-xs font-bold transition items-center gap-1.5 shadow-xs active:scale-95 shrink-0 ${
                  isARMode
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400 font-bold'
                    : isCyberpunk
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : isDark
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
                title={isARMode ? "Exit AR Mode (Return to 3D Stage)" : "AR View: Project 3D Simulation into physical room via device camera"}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isARMode ? 'Exit AR' : 'AR View'}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  isARMode ? 'bg-black/30 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {isARMode ? 'LIVE' : '3D AR'}
                </span>
              </button>

              {/* Desktop Focus Mode Trigger Button */}
              <button
                onClick={() => setIsFocusMode(true)}
                className={`hidden lg:flex px-3 py-2 rounded-xl text-xs font-bold transition items-center gap-1.5 shadow-xs active:scale-95 shrink-0 ${
                  isCyberpunk
                    ? 'bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 hover:from-cyan-500/35 hover:to-emerald-500/35 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-mono'
                    : isDark
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40'
                    : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300'
                }`}
                title="Enter Focus Mode (F) - Full Screen 3D Lab with Floating HUD"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Focus Mode</span>
                <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-[10px] font-mono">F</span>
              </button>

              <div
                id="lab-tab-switcher"
                className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto whitespace-nowrap scrollbar-none w-full lg:w-auto ${
                isCyberpunk ? 'bg-[#060B18] border-cyan-500/25' : isDark ? 'bg-[#0A0A0E] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'controls'
                      ? isCyberpunk ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)] font-black' : 'bg-cyan-500 text-white shadow-sm font-bold'
                      : isCyberpunk ? 'text-zinc-400 hover:text-cyan-300 hover:bg-[#0C172E]' : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161C]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Controls & HUD</span>
                </button>

                <button
                  onClick={() => setActiveTab('coaching')}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'coaching'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm font-bold'
                      : isDark ? 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/20' : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Coaching Module</span>
                </button>

                <button
                  onClick={() => setActiveTab('graphs')}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'graphs'
                      ? isCyberpunk ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)] font-black' : 'bg-cyan-500 text-white shadow-sm font-bold'
                      : isCyberpunk ? 'text-zinc-400 hover:text-cyan-300 hover:bg-[#0C172E]' : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161C]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Graphs</span>
                </button>

                <button
                  onClick={() => setActiveTab('equations')}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'equations'
                      ? isCyberpunk ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)] font-black' : 'bg-cyan-500 text-white shadow-sm font-bold'
                      : isCyberpunk ? 'text-zinc-400 hover:text-cyan-300 hover:bg-[#0C172E]' : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161C]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Equations</span>
                </button>

                <button
                  onClick={() => setActiveTab('jee')}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'jee'
                      ? isCyberpunk ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)] font-black' : 'bg-cyan-500 text-white shadow-sm font-bold'
                      : isCyberpunk ? 'text-zinc-400 hover:text-cyan-300 hover:bg-[#0C172E]' : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161C]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>JEE Strategy</span>
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'questions'
                      ? isCyberpunk ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)] font-black' : 'bg-cyan-500 text-white shadow-sm font-bold'
                      : isCyberpunk ? 'text-zinc-400 hover:text-cyan-300 hover:bg-[#0C172E]' : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161C]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Practice ({currentConcept.questions.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary 3D Stage & Core Controls Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left 3D Viewport (Takes 7 cols on XL) */}
            <div id="section-3d" className="xl:col-span-7 h-[360px] sm:h-[460px] xl:h-[580px] w-full scroll-mt-20">
              <GlobalErrorBoundary onReset={handleFullSimulationRecovery}>
                <ThreePhysicsCanvas
                  simulationType={currentConcept.simulationType}
                  conceptTitle={currentConcept.title}
                  params={paramValues}
                  simTime={simTime}
                  showVectors={showVectors}
                  showLabels={showLabels}
                  showTrajectory={showTrajectory}
                  showGrid={showGrid}
                  showAxes={showAxes}
                  onToggleVectors={() => setShowVectors(!showVectors)}
                  onToggleLabels={() => setShowLabels(!showLabels)}
                  onToggleTrajectory={() => setShowTrajectory(!showTrajectory)}
                  onToggleGrid={() => setShowGrid(!showGrid)}
                  onToggleAxes={() => setShowAxes(!showAxes)}
                  cameraPreset={currentConcept.cameraPreset}
                  isDark={isDark}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={() => setIsFocusMode(true)}
                  isARMode={isARMode}
                  onToggleAR={() => setIsARMode(!isARMode)}
                  bloomIntensity={bloomIntensity}
                  onChangeBloom={handleBloomChange}
                  onDisableTrajectory={() => setShowTrajectory(false)}
                  onOpenLoadingScreen={() => setIsLoadingScreenOpen(true)}
                />
              </GlobalErrorBoundary>
            </div>

            {/* Right Active Functional Panel (Takes 5 cols on XL) */}
            <div id="section-controls" className="xl:col-span-5 flex flex-col gap-4 scroll-mt-20 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'controls' && (
                  <motion.div
                    key="tab-controls"
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.995 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <ParameterControls
                      parameters={currentConcept.parameters}
                      values={paramValues}
                      onChangeParam={handleParamChange}
                      isPlaying={isPlaying}
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      onReset={handleResetSimulation}
                      speed={speed}
                      onChangeSpeed={setSpeed}
                      liveQuantities={liveQuantities}
                      specialCases={currentConcept.specialCases}
                      simulationType={currentConcept.simulationType}
                      isARMode={isARMode}
                      onToggleAR={() => setIsARMode(!isARMode)}
                      bloomIntensity={bloomIntensity}
                      onChangeBloom={handleBloomChange}
                      onApplySpecialCase={(preset) => {
                        setParamValues((prev) => ({ ...prev, ...preset }));
                        setSimTime(0);
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === 'coaching' && (
                  <motion.div
                    key="tab-coaching"
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.995 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <CoachingModulePanel
                      concept={currentConcept}
                      onApplyPreset={(preset) => {
                        setParamValues((prev) => ({ ...prev, ...preset }));
                        setSimTime(0);
                      }}
                      onSwitchToSimulation={() => setActiveTab('controls')}
                    />
                  </motion.div>
                )}

                {activeTab === 'graphs' && (
                  <motion.div
                    key="tab-graphs"
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.995 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <LiveGraphPanel
                      graphConfigs={currentConcept.graphConfigs}
                      params={paramValues}
                      simTime={simTime}
                    />
                  </motion.div>
                )}

                {activeTab === 'equations' && (
                  <motion.div
                    key="tab-equations"
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.995 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <EquationPanel
                      formulas={currentConcept.formulas}
                      assumptions={currentConcept.assumptions}
                      parameters={currentConcept.parameters}
                      currentParams={paramValues}
                      liveQuantities={liveQuantities}
                      onParamChange={handleParamChange}
                      conceptId={currentConcept.id}
                      chapterId={currentConcept.chapterId}
                      conceptTitle={currentConcept.title}
                      coachingModule={currentConcept.coachingModule}
                    />
                  </motion.div>
                )}

                {activeTab === 'jee' && (
                  <motion.div
                    key="tab-jee"
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.995 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <JeeInsightsPanel
                      jeeMain={currentConcept.jeeMain}
                      jeeAdvanced={currentConcept.jeeAdvanced}
                      conceptTitle={currentConcept.title}
                      onOpenGlobalAnalytics={() => setIsAnalyticsOpen(true)}
                    />
                  </motion.div>
                )}

                {activeTab === 'questions' && (
                  <motion.div
                    key="tab-questions"
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.995 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <QuestionArena
                      questions={currentConcept.questions}
                      currentParams={paramValues}
                      conceptTitle={currentConcept.title}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chapter Roadmap & Sibling Concepts Section */}
          <section
            id="section-chapter-roadmap"
            className={`rounded-2xl border p-4 sm:p-5 space-y-4 scroll-mt-20 transition shadow-sm ${
              isCyberpunk
                ? 'bg-[#060D1E]/90 border-cyan-500/30'
                : isDark
                ? 'bg-[#0E0E14] border-white/[0.08]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-inherit">
              <div>
                <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                  isDark ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span>Chapter Roadmap: Sibling Labs</span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Explore all interactive 3D simulations in this chapter module.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-bold self-start sm:self-auto">
                {ALL_CONCEPTS.filter((c) => c.chapterId === currentConcept.chapterId).length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_CONCEPTS.filter((c) => c.chapterId === currentConcept.chapterId).map((concept) => {
                const isCurrent = concept.id === currentConcept.id;
                return (
                  <button
                    key={`sibling-${concept.id}`}
                    onClick={() => {
                      if (!isCurrent) {
                        handleSelectConcept(concept);
                        setTimeout(() => {
                          document.getElementById('section-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 40);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 min-h-[72px] ${
                      isCurrent
                        ? isCyberpunk
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : isDark
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200'
                          : 'bg-cyan-50 border-cyan-400 text-cyan-950'
                        : isDark
                        ? 'bg-[#14141E] hover:bg-[#1C1C28] border-white/[0.06] text-zinc-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{concept.title}</span>
                      {isCurrent ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-black shrink-0">
                          Active
                        </span>
                      ) : concept.badge ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 shrink-0">
                          {concept.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className={`text-[10.5px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {concept.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </main>
  </div>

      {/* Focus Mode Full-Screen 3D Laboratory Overlay */}
      {isFocusMode && currentView === 'lab' && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-[#070709] flex flex-col overflow-hidden select-none">
          <div className="relative w-full h-full">
            <ThreePhysicsCanvas
              simulationType={currentConcept.simulationType}
              conceptTitle={currentConcept.title}
              params={paramValues}
              simTime={simTime}
              showVectors={showVectors}
              showLabels={showLabels}
              showTrajectory={showTrajectory}
              showGrid={showGrid}
              showAxes={showAxes}
              onToggleVectors={() => setShowVectors(!showVectors)}
              onToggleLabels={() => setShowLabels(!showLabels)}
              onToggleTrajectory={() => setShowTrajectory(!showTrajectory)}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleAxes={() => setShowAxes(!showAxes)}
              cameraPreset={currentConcept.cameraPreset}
              isDark={isDark}
              isFocusMode={true}
              onToggleFocusMode={() => setIsFocusMode(false)}
              isARMode={isARMode}
              onToggleAR={() => setIsARMode(!isARMode)}
              bloomIntensity={bloomIntensity}
              onChangeBloom={handleBloomChange}
              onDisableTrajectory={() => setShowTrajectory(false)}
              onOpenLoadingScreen={() => setIsLoadingScreenOpen(true)}
            />

            <FocusModeOverlay
              concept={currentConcept}
              params={paramValues}
              onChangeParam={handleParamChange}
              liveQuantities={liveQuantities}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={handleResetSimulation}
              speed={speed}
              onChangeSpeed={setSpeed}
              simTime={simTime}
              onExitFocusMode={() => setIsFocusMode(false)}
              showVectors={showVectors}
              showLabels={showLabels}
              showTrajectory={showTrajectory}
              showGrid={showGrid}
              showAxes={showAxes}
              onToggleVectors={() => setShowVectors(!showVectors)}
              onToggleLabels={() => setShowLabels(!showLabels)}
              onToggleTrajectory={() => setShowTrajectory(!showTrajectory)}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleAxes={() => setShowAxes(!showAxes)}
              isARMode={isARMode}
              onToggleAR={() => setIsARMode(!isARMode)}
              onApplyPreset={(preset) => {
                setParamValues((prev) => ({ ...prev, ...preset }));
                setSimTime(0);
              }}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Draggable Floating AI Physics Tutor Circle Button */}
      <DraggableAiTutorFab
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        isOpen={isAiTutorOpen}
      />

      {/* Global Formula & Law Hub Directory Modal */}
      <FormulaDirectoryModal
        isOpen={isFormulaHubOpen}
        onClose={() => setIsFormulaHubOpen(false)}
        onSelectConcept={handleSelectConcept}
      />

      {/* Downloadable PDF Formula Sheets Modal */}
      <ChapterFormulaPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        initialChapterId={pdfChapterId}
        onSelectConcept={handleSelectConcept}
      />

      {/* Complete JEE Syllabus & 3D Interactive Specs Directory Modal */}
      <JeeSyllabusDirectoryModal
        isOpen={isSyllabusDirectoryOpen}
        onClose={() => setIsSyllabusDirectoryOpen(false)}
        onSelectConcept={handleSelectConcept}
      />

      {/* Global AI Physics Tutor & Instant Doubt Solver Modal */}
      <AiPhysicsTutorModal
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        currentConcept={currentConcept}
        currentParams={paramValues}
        userName={userName}
      />

      {/* JEE Weightage Analytics Modal */}
      <JeeWeightageAnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />

      {/* Global Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Interactive 3D Physics Lab User Tutorial Modal */}
      <UserTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          setCurrentView('home');
        }}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
        onOpenPdfModal={() => handleOpenPdfModal()}
        onOpenSpotlightTour={handleStartSpotlightTour}
        onOpenQuestionArena={() => {
          setIsTutorialOpen(false);
          setCurrentView('home');
          setActiveTab('questions');
        }}
      />

      {/* Animated Onboarding & Spotlight Walkthrough Overlay */}
      <SpotlightTutorialOverlay />

      {/* Touch-Friendly Context-Aware Mobile Bottom-Sheet Menu & Navigation Bar */}
      <MobileNavBottomSheet
        currentView={currentView}
        onSetView={setCurrentView}
        currentConcept={currentConcept}
        onSelectConcept={handleSelectConcept}
        favorites={favorites}
        completedConcepts={completedConcepts}
        onToggleFavorite={handleToggleFavorite}
        paramValues={paramValues}
        onChangeParam={handleParamChange}
        liveQuantities={liveQuantities}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onResetSimulation={handleResetSimulation}
        speed={speed}
        onChangeSpeed={setSpeed}
        simTime={simTime}
        showVectors={showVectors}
        showLabels={showLabels}
        showTrajectory={showTrajectory}
        showGrid={showGrid}
        showAxes={showAxes}
        onToggleVectors={() => setShowVectors(!showVectors)}
        onToggleLabels={() => setShowLabels(!showLabels)}
        onToggleTrajectory={() => setShowTrajectory(!showTrajectory)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleAxes={() => setShowAxes(!showAxes)}
        onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
        onOpenPdfModal={handleOpenPdfModal}
        onOpenSyllabusDirectory={() => setIsSyllabusDirectoryOpen(true)}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onEnterFocusMode={() => setIsFocusMode(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        bloomIntensity={bloomIntensity}
        onChangeBloom={handleBloomChange}
      />

      {/* Global PC Cursor & Ambient Spotlight Effect */}
      <CursorEffect />
    </div>
  );
}
