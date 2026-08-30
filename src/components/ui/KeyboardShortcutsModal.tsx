import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import {
  Keyboard,
  X,
  Search,
  Sparkles,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Maximize2,
  Eye,
  Bot,
  BookOpen,
  Download,
  Layers,
  Zap,
  Check,
  Compass,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Grid,
  Sun,
  Activity,
  Info,
} from 'lucide-react';

export interface ShortcutItem {
  id: string;
  category: 'simulation' | 'canvas' | 'tools' | 'navigation';
  keys: string[];
  label: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
}

export const SHORTCUTS_LIST: ShortcutItem[] = [
  // Simulation Controls
  {
    id: 'play-pause',
    category: 'simulation',
    keys: ['P', 'Space'],
    label: 'Play / Pause Simulation',
    description: 'Instantly freeze or resume 3D physics dynamics and ODE solving.',
    icon: <Play className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'speed-up',
    category: 'simulation',
    keys: ['S'],
    label: 'Speed Up Simulation',
    description: 'Cycle simulation playback speed (0.25x → 0.5x → 1.0x → 1.5x → 2.0x).',
    badge: 'Dynamic',
    icon: <FastForward className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'slow-down',
    category: 'simulation',
    keys: ['Shift', 'S'],
    label: 'Slow Down Simulation',
    description: 'Reverse cycle playback speed down to high-precision slow motion.',
    badge: 'Precision',
    icon: <FastForward className="w-4 h-4 text-cyan-400 rotate-180" />,
  },
  {
    id: 'reset-time',
    category: 'simulation',
    keys: ['R'],
    label: 'Reset Simulation Time',
    description: 'Rewind simulation clock to initial state (t = 0.00 s).',
    icon: <RotateCcw className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'prev-concept',
    category: 'simulation',
    keys: ['['],
    label: 'Previous Physics Concept',
    description: 'Jump to the previous 3D lab in the JEE syllabus sequence.',
    icon: <ArrowLeft className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 'next-concept',
    category: 'simulation',
    keys: [']'],
    label: 'Next Physics Concept',
    description: 'Jump to the next 3D lab in the JEE syllabus sequence.',
    icon: <ArrowRight className="w-4 h-4 text-indigo-400" />,
  },

  // 3D Canvas & Visual Layers
  {
    id: 'focus-mode',
    category: 'canvas',
    keys: ['F'],
    label: 'Toggle Focus Mode',
    description: 'Enter or exit immersive fullscreen 3D simulation workspace with HUD telemetry.',
    badge: 'Popular',
    icon: <Maximize2 className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'toggle-vectors',
    category: 'canvas',
    keys: ['V'],
    label: 'Toggle Vector Arrows',
    description: 'Show/hide real-time force, velocity, acceleration, and field vectors.',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'toggle-labels',
    category: 'canvas',
    keys: ['L'],
    label: 'Toggle Dynamic Labels',
    description: 'Toggle floating 3D value badges, angle readouts, and field notations.',
    icon: <Eye className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'toggle-trajectory',
    category: 'canvas',
    keys: ['O'],
    label: 'Toggle Trajectory Orbit',
    description: 'Show/hide geometric path curves, particle traces, and ray reflections.',
    icon: <Activity className="w-4 h-4 text-fuchsia-400" />,
  },
  {
    id: 'toggle-grid',
    category: 'canvas',
    keys: ['G'],
    label: 'Toggle 3D Floor Grid',
    description: 'Toggle Cartesian spatial reference ground plane and measurement grid.',
    icon: <Grid className="w-4 h-4 text-zinc-400" />,
  },
  {
    id: 'toggle-axes',
    category: 'canvas',
    keys: ['A'],
    label: 'Toggle Spatial Axes',
    description: 'Show/hide orthogonal 3D coordinate frame (X-Red, Y-Green, Z-Blue).',
    icon: <Compass className="w-4 h-4 text-rose-400" />,
  },

  // JEE Tools & AI Doubt Solver
  {
    id: 'shortcuts-cheat-sheet',
    category: 'tools',
    keys: ['?'],
    label: 'Keyboard Shortcuts Cheat Sheet',
    description: 'Open or close this global interactive hotkey guide from anywhere.',
    badge: 'Help',
    icon: <Keyboard className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'ai-tutor',
    category: 'tools',
    keys: ['T'],
    label: 'Open AI Physics Tutor',
    description: 'Launch AI voice tutor with instant barge-in, math derivations, and voice doubts.',
    badge: 'AI Ursa',
    icon: <Bot className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'formula-hub',
    category: 'tools',
    keys: ['U'],
    label: 'Open Formula Directory',
    description: 'Browse the compendium of 150+ interactive LaTeX physics formulas & laws.',
    icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'pdf-sheets',
    category: 'tools',
    keys: ['D'],
    label: 'Download Chapter PDF Sheets',
    description: 'Generate high-resolution printable JEE chapter formula sheets.',
    icon: <Download className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'close-modal',
    category: 'tools',
    keys: ['Esc'],
    label: 'Close Active Modal / Exit Focus',
    description: 'Instantly dismiss open dialogs, search panels, and exit focus mode.',
    icon: <X className="w-4 h-4 text-rose-400" />,
  },

  // Workspace & Navigation
  {
    id: 'switch-tabs',
    category: 'navigation',
    keys: ['1', '-', '6'],
    label: 'Switch Lab Tabs (1 to 6)',
    description: '1: Controls, 2: Coaching, 3: Equations, 4: Graphs, 5: JEE Insights, 6: Questions.',
    badge: 'Fast Tab',
    icon: <Sliders className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 'toggle-sidebar',
    category: 'navigation',
    keys: ['B'],
    label: 'Toggle Syllabus Sidebar',
    description: 'Expand or collapse the full 18-chapter JEE physics hierarchy sidebar.',
    icon: <Layers className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 'cycle-theme',
    category: 'navigation',
    keys: ['M'],
    label: 'Cycle Visual Theme',
    description: 'Toggle between Cyberpunk Synapse, Deep Space Dark, and Solar Light themes.',
    icon: <Sun className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'home-view',
    category: 'navigation',
    keys: ['H'],
    label: 'Return to Home Overview',
    description: 'Navigate back to the main JEE Physics 3D Studio curriculum dashboard.',
    icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteShortcut?: (shortcutId: string) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onExecuteShortcut,
}) => {
  const { isDark, isCyberpunk } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentlyPressedKey, setRecentlyPressedKey] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Listen to keypresses while modal is open for live keycap feedback
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Record visual key press
      let keyDisplay = e.key.toUpperCase();
      if (e.key === ' ') keyDisplay = 'SPACE';
      if (e.key === 'Shift') keyDisplay = 'SHIFT';
      if (e.key === '?') keyDisplay = '?';

      setRecentlyPressedKey(keyDisplay);
      const timer = setTimeout(() => setRecentlyPressedKey(null), 1200);
      return () => clearTimeout(timer);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter shortcuts
  const filteredShortcuts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SHORTCUTS_LIST.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      const matchesLabel = item.label.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesKeys = item.keys.some((k) => k.toLowerCase().includes(query));

      return matchesLabel || matchesDesc || matchesKeys;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Hotkeys', count: SHORTCUTS_LIST.length },
    {
      id: 'simulation',
      label: 'Simulation & Time',
      count: SHORTCUTS_LIST.filter((s) => s.category === 'simulation').length,
    },
    {
      id: 'canvas',
      label: '3D Canvas & HUD',
      count: SHORTCUTS_LIST.filter((s) => s.category === 'canvas').length,
    },
    {
      id: 'tools',
      label: 'AI & JEE Tools',
      count: SHORTCUTS_LIST.filter((s) => s.category === 'tools').length,
    },
    {
      id: 'navigation',
      label: 'Navigation & Tabs',
      count: SHORTCUTS_LIST.filter((s) => s.category === 'navigation').length,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`relative w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden z-10 ${
            isCyberpunk
              ? 'bg-[#030712]/98 border-cyan-500/40 text-cyan-100 shadow-[0_0_50px_rgba(0,240,255,0.25)]'
              : isDark
              ? 'bg-[#0F1017]/98 border-white/[0.12] text-zinc-100 shadow-2xl shadow-indigo-950/40'
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-2xl'
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 sm:p-6 border-b flex flex-col gap-4 shrink-0 ${
              isCyberpunk
                ? 'bg-gradient-to-r from-cyan-950/70 via-[#060B18] to-fuchsia-950/60 border-cyan-500/25'
                : isDark
                ? 'bg-gradient-to-r from-indigo-950/50 via-[#13141F] to-slate-900/50 border-white/[0.08]'
                : 'bg-gradient-to-r from-cyan-50/80 via-slate-50 to-indigo-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 ${
                    isCyberpunk
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 shadow-indigo-500/20'
                      : 'bg-cyan-100 text-cyan-700 border-cyan-300 shadow-cyan-500/10'
                  }`}
                >
                  <Keyboard className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                      Keyboard Shortcuts
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isCyberpunk
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          : isDark
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}
                    >
                      Press ? anytime
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}
                  >
                    Quickly navigate 3D physics labs, time scales, and AI doubt solvers with single-key shortcuts.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center gap-2">
                {recentlyPressedKey && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                      isCyberpunk
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : isDark
                        ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400'
                        : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                    }`}
                  >
                    <span>Key:</span>
                    <span className="font-extrabold">{recentlyPressedKey}</span>
                  </motion.div>
                )}

                <button
                  onClick={onClose}
                  className={`p-2 rounded-2xl border transition flex items-center justify-center ${
                    isCyberpunk
                      ? 'bg-[#060B18] border-cyan-500/30 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/20'
                      : isDark
                      ? 'bg-[#181924] border-white/[0.08] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  aria-label="Close shortcuts modal"
                  title="Close (Escape)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-zinc-400' : 'text-slate-400'
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter shortcuts by key or function (e.g. Focus, Speed, P, Tutor)..."
                  className={`w-full pl-9.5 pr-8 py-2 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none transition ${
                    isCyberpunk
                      ? 'bg-[#040814] border-cyan-500/35 text-cyan-100 placeholder-cyan-500/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                      : isDark
                      ? 'bg-[#151622] border-white/[0.1] text-zinc-100 placeholder-zinc-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition active:scale-95 flex items-center gap-1.5 ${
                        isSelected
                          ? isCyberpunk
                            ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                            : isDark
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                            : 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                          : isCyberpunk
                          ? 'bg-[#040814]/80 text-zinc-400 border-cyan-500/20 hover:text-cyan-300 hover:bg-cyan-950/40'
                          : isDark
                          ? 'bg-[#161722] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.05]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-black/30 text-white'
                            : isDark
                            ? 'bg-white/[0.06] text-zinc-400'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body List of Shortcuts */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            {filteredShortcuts.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    isDark
                      ? 'bg-white/[0.03] border-white/[0.08] text-zinc-500'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <Search className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm">No shortcuts matched "{searchQuery}"</div>
                <p
                  className={`text-xs max-w-sm ${
                    isDark ? 'text-zinc-500' : 'text-slate-500'
                  }`}
                >
                  Try searching for keywords like "focus", "speed", "play", "reset", or "tutor".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition"
                >
                  Reset Search Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {filteredShortcuts.map((item) => {
                  const isHighlighted =
                    recentlyPressedKey &&
                    item.keys.some(
                      (k) =>
                        k.toUpperCase() === recentlyPressedKey ||
                        (k === 'Space' && recentlyPressedKey === 'SPACE') ||
                        (k === 'Shift' && recentlyPressedKey === 'SHIFT')
                    );

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isHighlighted
                          ? isCyberpunk
                            ? 'bg-cyan-500/20 border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-[1.02]'
                            : isDark
                            ? 'bg-indigo-600/25 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[1.02]'
                            : 'bg-cyan-100 border-cyan-400 shadow-md scale-[1.02]'
                          : isCyberpunk
                          ? 'bg-[#060B18]/90 border-cyan-500/25 hover:border-cyan-400/50 hover:bg-cyan-950/30'
                          : isDark
                          ? 'bg-[#141520]/90 border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1A1C2B]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                      }`}
                    >
                      {/* Left: Icon & Text description */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${
                            isCyberpunk
                              ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300'
                              : isDark
                              ? 'bg-[#1D1E2C] border-white/[0.08] text-indigo-300'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {item.icon || <Sparkles className="w-4 h-4 text-cyan-400" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold tracking-tight">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                                  isCyberpunk
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    : isDark
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                    : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed line-clamp-2 ${
                              isDark ? 'text-zinc-400' : 'text-slate-500'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Realistic Keycap Badges */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {item.keys.map((key, i) => (
                          <React.Fragment key={key + i}>
                            {i > 0 && (
                              <span className="text-[10px] font-bold text-zinc-500">
                                {item.id === 'switch-tabs' ? '' : '+'}
                              </span>
                            )}
                            <kbd
                              className={`px-2.5 py-1 min-w-[28px] text-center rounded-lg text-xs font-mono font-black border transition shadow-sm ${
                                isHighlighted
                                  ? isCyberpunk
                                    ? 'bg-cyan-400 text-black border-white shadow-[0_0_15px_#00f0ff]'
                                    : isDark
                                    ? 'bg-indigo-400 text-black border-white shadow-[0_0_15px_#818cf8]'
                                    : 'bg-cyan-600 text-white border-cyan-700 shadow-md'
                                  : isCyberpunk
                                  ? 'bg-[#0C1528] text-cyan-300 border-cyan-400/40 shadow-[0_2px_0_rgba(0,240,255,0.3)]'
                                  : isDark
                                  ? 'bg-[#1E202E] text-zinc-200 border-white/[0.15] shadow-[0_2px_0_rgba(255,255,255,0.1)]'
                                  : 'bg-slate-100 text-slate-800 border-slate-300 shadow-[0_2px_0_rgba(0,0,0,0.1)]'
                              }`}
                            >
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div
            className={`p-3.5 sm:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 ${
              isCyberpunk
                ? 'bg-[#02050E] border-cyan-500/25 text-cyan-400/80'
                : isDark
                ? 'bg-[#0A0B10] border-white/[0.08] text-zinc-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong>Pro-Tip:</strong> Press <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold mx-1">F</kbd> for Fullscreen Focus Lab, <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold mx-1">P</kbd> to Pause, and <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold mx-1">S</kbd> to change Simulation Speed.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 active:scale-95 ${
                  isCyberpunk
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : isDark
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Got It</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
