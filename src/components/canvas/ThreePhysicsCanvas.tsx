import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationType } from '../../types';
import { SimulationRenderer } from './SimulationRenderer';
import { ViewportApparatusSkeleton } from '../ui/GlobalPhysicsLoader';
import {
  PhysicsEngineMiddleware,
  defaultPhysicsMiddleware,
} from './physicsEngineMiddleware';
import { VECTOR_LEGENDS, VectorLegendItem } from '../../data/vectorLegends';
import { useTheme } from '../../context/ThemeContext';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Grid,
  TrendingUp,
  Compass,
  Maximize2,
  Minimize2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronDown,
  ChevronUp,
  Move3d,
  Tag,
  MousePointer,
  ArrowDown,
  ArrowUp,
  Sliders,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Award,
  Activity,
  Gauge,
  Camera,
  RefreshCw,
  AlertCircle,
  X,
  Zap,
  Moon,
  Sun,
  Box,
  FlaskConical,
  Rocket,
  Atom,
} from 'lucide-react';

interface ThreePhysicsCanvasProps {
  simulationType: SimulationType;
  params: Record<string, number>;
  simTime: number;
  showVectors: boolean;
  showLabels: boolean;
  showTrajectory: boolean;
  showGrid: boolean;
  showAxes: boolean;
  onToggleVectors: () => void;
  onToggleLabels: () => void;
  onToggleTrajectory: () => void;
  onToggleGrid: () => void;
  onToggleAxes: () => void;
  cameraPreset?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  isDark?: boolean;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isARMode?: boolean;
  onToggleAR?: () => void;
  bloomIntensity?: 'vibrant' | 'subtle' | 'off';
  conceptTitle?: string;
  onChangeBloom?: (val: 'vibrant' | 'subtle' | 'off') => void;
  onDisableTrajectory?: () => void;
  adaptivePerformance?: boolean;
  onToggleAdaptivePerformance?: () => void;
  onOpenLoadingScreen?: () => void;
}

export const ThreePhysicsCanvas: React.FC<ThreePhysicsCanvasProps> = ({
  simulationType,
  conceptTitle,
  params,
  simTime,
  showVectors,
  showLabels,
  showTrajectory,
  showGrid,
  showAxes,
  onToggleVectors,
  onToggleLabels,
  onToggleTrajectory,
  onToggleGrid,
  onToggleAxes,
  cameraPreset,
  isDark = true,
  isFocusMode = false,
  onToggleFocusMode,
  isARMode: externalARMode,
  onToggleAR: externalToggleAR,
  bloomIntensity = 'vibrant',
  onChangeBloom,
  onDisableTrajectory,
  adaptivePerformance: externalAdaptivePerf,
  onToggleAdaptivePerformance: externalToggleAdaptivePerf,
  onOpenLoadingScreen,
}) => {
  const { isCyberpunk, theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const simRendererRef = useRef<SimulationRenderer | null>(null);
  const physicsMiddlewareRef = useRef<PhysicsEngineMiddleware>(defaultPhysicsMiddleware);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const animFrameId = useRef<number>(0);

  // AR Mode State (controlled externally or internally)
  const [internalARMode, setInternalARMode] = useState(false);
  const isARMode = externalARMode !== undefined ? externalARMode : internalARMode;
  const toggleAR = externalToggleAR || (() => setInternalARMode((prev) => !prev));

  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AR Video Stream Reference
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      if (!isARMode) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setCameraError(null);
        setCameraLoading(false);
        return;
      }

      setCameraLoading(true);
      setCameraError(null);

      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('Camera API (getUserMedia) not supported by browser.');
        }

        let stream: MediaStream;
        try {
          // Attempt target facingMode (environment on phones/tablets)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: cameraFacing,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch {
          // Fallback to any available video stream (e.g., standard PC/laptop webcam)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('AR video play auto-resume:', playErr);
          }
        }
        streamRef.current = stream;
        setCameraLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error('AR Camera Access Denied or Unavailable:', err);
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'Camera permission denied. Please allow camera access in browser settings or open app in a new tab.'
            : err.message || 'Unable to access device camera.'
        );
        setCameraLoading(false);
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isARMode, cameraFacing]);

  const [envType, setEnvType] = useState<'void' | 'lab' | 'space'>('void');

  const toggleEnvironment = useCallback(() => {
    setEnvType((prev) => (prev === 'void' ? 'lab' : prev === 'lab' ? 'space' : 'void'));
  }, []);

  useEffect(() => {
    if (sceneRef.current && rendererRef.current) {
      if (isARMode) {
        sceneRef.current.background = null;
        rendererRef.current.setClearColor(0x000000, 0);
      } else {
        const bgColor = envType === 'space' 
          ? 0x000000 
          : envType === 'lab' 
            ? (isDark ? 0x1e293b : 0xe2e8f0)
            : (isCyberpunk ? 0x030712 : isDark ? 0x09090c : 0xf8fafc);
            
        sceneRef.current.background = new THREE.Color(bgColor);
        rendererRef.current.setClearColor(bgColor, 1);
      }
    }
  }, [isARMode, isCyberpunk, isDark, envType]);

  // Update Bloom Pass dynamically when bloom intensity changes without scene rebuild
  useEffect(() => {
    if (rendererRef.current) {
      if (bloomIntensity === 'vibrant') {
        rendererRef.current.toneMappingExposure = isCyberpunk ? 1.25 : 1.15;
      } else if (bloomIntensity === 'subtle') {
        rendererRef.current.toneMappingExposure = isCyberpunk ? 1.05 : 1.0;
      } else {
        rendererRef.current.toneMappingExposure = 1.0;
      }
    }

    if (bloomPassRef.current) {
      const isDarkEnv = isDark || isCyberpunk || envType === 'space' || (envType === 'lab' && isDark);
      if (bloomIntensity === 'off') {
        bloomPassRef.current.enabled = false;
        bloomPassRef.current.strength = 0;
      } else if (bloomIntensity === 'subtle') {
        bloomPassRef.current.enabled = true;
        bloomPassRef.current.strength = 0.58;
        bloomPassRef.current.radius = 0.38;
        bloomPassRef.current.threshold = isDarkEnv ? 0.38 : 0.52;
      } else {
        // Vibrant: High-contrast optical bloom with radiant neon trails, lasers & glowing vectors
        bloomPassRef.current.enabled = true;
        bloomPassRef.current.strength = 1.35;
        bloomPassRef.current.radius = 0.65;
        bloomPassRef.current.threshold = isDarkEnv ? 0.15 : 0.28;
      }
    }
    if (simRendererRef.current) {
      simRendererRef.current.setBloomIntensity(bloomIntensity);
    }
  }, [bloomIntensity, isDark, isCyberpunk, envType]);

  // Manual Orbit controls state
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({ radius: 25, theta: Math.PI / 4, phi: Math.PI / 3 });
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const defaultRadius = useRef(25);

  // Multi-touch tracking for Android & Mobile Pinch-to-Zoom
  const touchStartDist = useRef<number | null>(null);
  const touchStartRadius = useRef<number>(25);
  const touchStartMidpoint = useRef<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const [isTrajectoryHudExpanded, setIsTrajectoryHudExpanded] = useState(true);
  const [hiddenVectorIds, setHiddenVectorIds] = useState<Set<string>>(new Set());
  const [zoomPercent, setZoomPercent] = useState(100);
  const [wheelMode, setWheelMode] = useState<'scroll' | 'zoom'>('scroll');

  // Compute comprehensive projectile trajectory details & metrics
  const projectileTrajectoryData = React.useMemo(() => {
    if (simulationType !== 'projectile-motion') return null;
    const u = params.u ?? 20;
    const theta = params.theta ?? 45;
    const g = params.g ?? 9.8;
    const h0 = params.h0 ?? 0;
    const planeAngle = params.planeAngle ?? 0;

    const rad = (theta * Math.PI) / 180;
    const alpha = (planeAngle * Math.PI) / 180;
    const ux = u * Math.cos(rad);
    const uy = u * Math.sin(rad);

    // Standard quadratic for landing on incline: 0.5*g*t^2 - (uy - ux*tan(alpha))*t - h0 = 0
    const effUy = uy - ux * Math.tan(alpha);
    const disc = effUy * effUy + 2 * g * h0;
    const T = disc >= 0 ? (effUy + Math.sqrt(disc)) / g : (2 * uy) / g;
    const rangeX = ux * T;
    const rangeY = rangeX * Math.tan(alpha);
    const range = Math.hypot(rangeX, rangeY);

    const tApex = Math.max(0, uy / g);
    const maxH = h0 + (uy * uy) / (2 * g);
    const xApex = ux * tApex;

    // Radius of curvature at apex: rho = (ux)^2 / g
    const rhoApex = (ux * ux) / g;

    // Impact velocity
    const vyImpact = uy - g * T;
    const vImpact = Math.hypot(ux, vyImpact);

    return {
      u,
      theta,
      g,
      h0,
      planeAngle,
      ux,
      uy,
      T,
      range,
      rangeX,
      rangeY,
      maxH,
      xApex,
      tApex,
      rhoApex,
      vImpact,
      isElevated: h0 > 0.05,
      hasIncline: Math.abs(planeAngle) > 0.1,
    };
  }, [simulationType, params]);

  // Real-time flight ballistics tracking for HUD
  const liveProjectileState = React.useMemo(() => {
    if (!projectileTrajectoryData) return null;
    const { u, theta, g, h0, planeAngle, ux, uy, T, rangeX, rangeY } = projectileTrajectoryData;
    const cycleTime = T + 1.5;
    const curT = simTime % cycleTime;

    if (curT <= T) {
      const curX = ux * curT;
      const curY = h0 + uy * curT - 0.5 * g * curT * curT;
      const curVy = uy - g * curT;
      const curV = Math.hypot(ux, curVy);
      const isAtApex = Math.abs(curVy) <= 0.25;
      const isAscending = curVy > 0.25;
      const phase = isAtApex ? 'At Apex' : isAscending ? 'Ascending' : 'Descending';
      return {
        curT,
        curX,
        curY,
        curVx: ux,
        curVy,
        curV,
        phase,
        isLanded: false,
      };
    } else {
      return {
        curT,
        curX: rangeX,
        curY: rangeY,
        curVx: 0,
        curVy: 0,
        curV: 0,
        phase: 'Impact & Restitution',
        isLanded: true,
      };
    }
  }, [projectileTrajectoryData, simTime]);

  // Toggle single vector arrow visibility
  const toggleVectorVisibility = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHiddenVectorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Toggle all vectors visibility
  const toggleAllVectorsVisibility = useCallback((vectors: VectorLegendItem[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHiddenVectorIds((prev) => {
      if (prev.size > 0) {
        return new Set();
      } else {
        return new Set(vectors.map((v) => v.id));
      }
    });
  }, []);

  // Smooth scroll helper to jump to any menu section easily
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Real-time Frame Rate (FPS) and Hardware Load Metrics
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [isLowFps, setIsLowFps] = useState<boolean>(false);
  const [showFps, setShowFps] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jee_show_fps');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const frameTimesRef = useRef<number[]>([]);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Scene Initialization & Skeleton State for Smooth Concept Transitions
  const [isSceneInitializing, setIsSceneInitializing] = useState<boolean>(true);
  const firstFrameRenderedRef = useRef<boolean>(false);

  // Auto-Adjustment Adaptive Performance Manager for Low Frame Rates (< 30 FPS)
  const [internalAdaptivePerf, setInternalAdaptivePerf] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jee_adaptive_perf');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const adaptivePerformance = externalAdaptivePerf !== undefined ? externalAdaptivePerf : internalAdaptivePerf;
  const toggleAdaptivePerformance = externalToggleAdaptivePerf || (() => {
    setInternalAdaptivePerf((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jee_adaptive_perf', String(next));
      } catch {}
      return next;
    });
  });

  const adaptivePerformanceRef = useRef(adaptivePerformance);
  useEffect(() => {
    adaptivePerformanceRef.current = adaptivePerformance;
  }, [adaptivePerformance]);

  const bloomIntensityRef = useRef(bloomIntensity);
  useEffect(() => {
    bloomIntensityRef.current = bloomIntensity;
  }, [bloomIntensity]);

  const showTrajectoryRef = useRef(showTrajectory);
  useEffect(() => {
    showTrajectoryRef.current = showTrajectory;
  }, [showTrajectory]);

  const lowFpsCountRef = useRef<number>(0);
  const lowFpsStartTimeRef = useRef<number | null>(null);
  const lastAutoAdjustTimeRef = useRef<number>(0);
  const [autoAdjustmentToast, setAutoAdjustmentToast] = useState<{
    message: string;
    actionText?: string;
    onAction?: () => void;
  } | null>(null);

  // Auto-dismiss adaptive performance alert toast after 6 seconds
  useEffect(() => {
    if (!autoAdjustmentToast) return;
    const timer = setTimeout(() => setAutoAdjustmentToast(null), 6000);
    return () => clearTimeout(timer);
  }, [autoAdjustmentToast]);

  // Execute Auto-Adjustment when sustained < 30 FPS is detected for > 3.0s (corrected from 1.5s)
  const triggerAutoAdjustment = useCallback((detectedFps = 24, sustainedDurationSec = 3.0) => {
    const now = Date.now();
    if (now - lastAutoAdjustTimeRef.current < 4500) return; // Debounce 4.5 seconds
    lastAutoAdjustTimeRef.current = now;

    const durationStr = sustainedDurationSec >= 3.0 ? '3.0' : sustainedDurationSec.toFixed(1);

    // Stage 1: Step down bloom intensity if active
    if (bloomIntensityRef.current === 'vibrant') {
      onChangeBloom?.('subtle');
      setAutoAdjustmentToast({
        message: `⚡ Sustained low frame rate (${detectedFps} FPS) detected for > ${durationStr}s: Auto-stepped down bloom from Vibrant to Subtle to restore 60 FPS responsiveness.`,
        actionText: 'Keep Vibrant',
        onAction: () => onChangeBloom?.('vibrant'),
      });
      return;
    }
    if (bloomIntensityRef.current === 'subtle') {
      onChangeBloom?.('off');
      setAutoAdjustmentToast({
        message: `⚡ Sustained low frame rate (${detectedFps} FPS) detected for > ${durationStr}s: Disabled bloom shaders to prioritize smooth 60 FPS on your hardware.`,
        actionText: 'Re-enable',
        onAction: () => onChangeBloom?.('subtle'),
      });
      return;
    }

    // Stage 2: Disable or simplify heavy trajectory rendering
    if (showTrajectoryRef.current) {
      if (onDisableTrajectory) {
        onDisableTrajectory();
      } else {
        onToggleTrajectory();
      }
      setAutoAdjustmentToast({
        message: `⚡ Sustained low frame rate (${detectedFps} FPS) detected for > ${durationStr}s: Simplified trajectory visualization to eliminate frame drops.`,
        actionText: 'Restore',
        onAction: () => onToggleTrajectory(),
      });
      return;
    }

    // Stage 3: Clamp high-DPI retina rendering to 1.0x
    if (rendererRef.current && rendererRef.current.getPixelRatio() > 1.0) {
      rendererRef.current.setPixelRatio(1.0);
      setAutoAdjustmentToast({
        message: `⚡ Sustained low frame rate (${detectedFps} FPS) detected for > ${durationStr}s: Clamped render resolution to 1.0x for smooth 60 FPS interaction.`,
      });
    }
  }, [onChangeBloom, onDisableTrajectory, onToggleTrajectory]);

  // Reset scene initializing when concept/simulationType changes
  useEffect(() => {
    firstFrameRenderedRef.current = false;
    setIsSceneInitializing(true);
  }, [simulationType]);

  const toggleFps = useCallback(() => {
    setShowFps((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jee_show_fps', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Update Camera from spherical coordinates
  const updateCameraTransform = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    const x = cameraTarget.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = cameraTarget.current.y + radius * Math.cos(phi);
    const z = cameraTarget.current.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTarget.current);

    // Update zoom percentage indicator
    if (defaultRadius.current > 0) {
      const pct = Math.round((defaultRadius.current / radius) * 100);
      setZoomPercent(pct);
    }
  }, []);

  // Reset Camera Helper
  const resetCamera = useCallback(() => {
    if (!cameraRef.current) return;
    const pos = cameraPreset?.position || [12, 10, 16];
    const target = cameraPreset?.target || [0, 0, 0];

    cameraTarget.current.set(target[0], target[1], target[2]);
    const px = pos[0];
    const py = pos[1];
    const pz = pos[2];

    const dx = px - target[0];
    const dy = py - target[1];
    const dz = pz - target[2];
    const radius = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const phi = Math.acos(dy / radius);
    const theta = Math.atan2(dx, dz);

    defaultRadius.current = radius;
    cameraSpherical.current = { radius, theta, phi };
    updateCameraTransform();
  }, [cameraPreset, updateCameraTransform]);

  // Programmatic Zoom Helpers (Android + PC compatible)
  const handleZoom = useCallback((factor: number) => {
    cameraSpherical.current.radius = Math.max(
      3,
      Math.min(100, cameraSpherical.current.radius * factor)
    );
    updateCameraTransform();
  }, [updateCameraTransform]);

  // Camera Presets
  const setCameraPresetView = useCallback((view: '3d' | 'front' | 'top' | 'side') => {
    if (!cameraRef.current) return;
    const r = cameraSpherical.current.radius;
    if (view === '3d') {
      cameraSpherical.current.theta = Math.PI / 4;
      cameraSpherical.current.phi = Math.PI / 3;
    } else if (view === 'front') {
      cameraSpherical.current.theta = 0;
      cameraSpherical.current.phi = Math.PI / 2;
    } else if (view === 'top') {
      cameraSpherical.current.theta = 0;
      cameraSpherical.current.phi = 0.05; // avoid gimbal singularity
    } else if (view === 'side') {
      cameraSpherical.current.theta = Math.PI / 2;
      cameraSpherical.current.phi = Math.PI / 2;
    }
    updateCameraTransform();
  }, [updateCameraTransform]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    if (!isARMode) {
      const bgColor = envType === 'space' 
        ? 0x000000 
        : envType === 'lab' 
          ? (isDark ? 0x1e293b : 0xe2e8f0)
          : (isCyberpunk ? 0x030712 : isDark ? 0x09090c : 0xf8fafc);
      scene.background = new THREE.Color(bgColor);
    } else {
      scene.background = null;
    }
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    resetCamera();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(
      envType === 'space' 
        ? 0x000000 
        : envType === 'lab' 
          ? (isDark ? 0x1e293b : 0xe2e8f0)
          : (isCyberpunk ? 0x030712 : isDark ? 0x09090c : 0xf8fafc),
      isARMode ? 0 : 1
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isCyberpunk ? 1.05 : 1.0;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Setup Post-Processing EffectComposer & UnrealBloomPass for Neon Glowing Effects
    try {
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const isDarkEnv = isDark || isCyberpunk || envType === 'space' || (envType === 'lab' && isDark);
      const strength = bloomIntensity === 'vibrant' ? 1.35 : bloomIntensity === 'subtle' ? 0.58 : 0;
      const threshold = isDarkEnv
        ? (bloomIntensity === 'vibrant' ? 0.15 : 0.38)
        : (bloomIntensity === 'vibrant' ? 0.28 : 0.52);
      const radius = bloomIntensity === 'vibrant' ? 0.65 : 0.38;

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        strength,
        radius,
        threshold
      );
      bloomPass.enabled = bloomIntensity !== 'off';
      composer.addPass(bloomPass);
      bloomPassRef.current = bloomPass;

      const outputPass = new OutputPass();
      composer.addPass(outputPass);

      composerRef.current = composer;
    } catch (err) {
      console.warn('Postprocessing bloom setup encountered fallback:', err);
      composerRef.current = null;
      bloomPassRef.current = null;
    }

    // 4. Lights with dynamic theme synchronization
    const ambientLight = new THREE.AmbientLight(
      envType === 'space' ? 0x222233 : envType === 'lab' ? 0xffffff : (isCyberpunk ? 0x00f0ff : isDark ? 0xffffff : 0xf8fafc),
      envType === 'space' ? 0.3 : envType === 'lab' ? 1.5 : (isCyberpunk ? 0.95 : isDark ? 0.95 : 1.35)
    );
    scene.add(ambientLight);

    // Directional Key Sun Light
    const dirLight1 = new THREE.DirectionalLight(
      envType === 'space' ? 0xffffff : envType === 'lab' ? 0xffffff : (isCyberpunk ? 0xffffff : isDark ? 0xffffff : 0xffffff),
      envType === 'space' ? 2.5 : envType === 'lab' ? 1.2 : (isCyberpunk ? 1.6 : isDark ? 1.5 : 1.6)
    );
    dirLight1.position.set(20, 32, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    // Directional Fill / Specular Rim Light
    const dirLight2 = new THREE.DirectionalLight(
      envType === 'space' ? 0x4488ff : envType === 'lab' ? 0xddddff : (isCyberpunk ? 0x00ff9d : isDark ? 0x38bdf8 : 0x93c5fd),
      envType === 'space' ? 1.0 : envType === 'lab' ? 0.8 : (isCyberpunk ? 0.9 : isDark ? 0.75 : 0.45)
    );
    dirLight2.position.set(-20, 12, -20);
    scene.add(dirLight2);

    // Hemisphere Light (Sky vs Ground Natural Irradiance)
    const hemiLight = new THREE.HemisphereLight(
      envType === 'space' ? 0x000000 : envType === 'lab' ? 0xffffff : (isCyberpunk ? 0x0c4a6e : isDark ? 0x334155 : 0xffffff),
      envType === 'space' ? 0x111122 : envType === 'lab' ? 0xbbbbcc : (isCyberpunk ? 0x030712 : isDark ? 0x09090c : 0xe2e8f0),
      envType === 'space' ? 0.2 : envType === 'lab' ? 0.9 : (isCyberpunk ? 0.7 : isDark ? 0.65 : 0.85)
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Dynamic Accent Fill Light
    const accentLight = new THREE.PointLight(
      envType === 'space' ? 0x00ffff : envType === 'lab' ? 0xffffff : (isCyberpunk ? 0x00f0ff : isDark ? 0x06b6d4 : 0x3b82f6),
      envType === 'space' ? 1.5 : envType === 'lab' ? 0.5 : (isCyberpunk ? 0.75 : isDark ? 0.5 : 0.3),
      50
    );
    accentLight.position.set(0, 10, 15);
    scene.add(accentLight);

    // Add Starfield for Space Environment
    if (envType === 'space') {
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1500;
      const starPos = new Float32Array(starCount * 3);
      for(let i=0; i<starCount*3; i++) {
        starPos[i] = (Math.random() - 0.5) * 300;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8 });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);
    }

    // 5. Grid and Axes with theme-tuned colors
    const gridHelper = new THREE.GridHelper(
      40,
      40,
      envType === 'space' ? 0x333344 : envType === 'lab' ? 0x999999 : (isCyberpunk ? 0x00f0ff : isDark ? 0x475569 : 0x94a3b8),
      envType === 'space' ? 0x111122 : envType === 'lab' ? 0xcccccc : (isCyberpunk ? 0x06283d : isDark ? 0x1e293b : 0xe2e8f0)
    );
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    // 6. Simulation Renderer
    const simRenderer = new SimulationRenderer(scene);
    simRendererRef.current = simRenderer;
    simRenderer.initSimulation(simulationType, {
      scene,
      params,
      simTime,
      showVectors,
      showLabels,
      showTrajectory,
      showGrid,
      showAxes,
      isDark,
      bloomIntensity,
    });

    // 7. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setSize(w, h);
        if (bloomPassRef.current) {
          bloomPassRef.current.resolution.set(w, h);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // 8. Render Loop with Real-time FPS & Frame Time Profiler
    const render = (now: number) => {
      animFrameId.current = requestAnimationFrame(render);

      // Measure delta between animation frames
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (delta > 0 && delta < 500) {
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 25) {
          frameTimesRef.current.shift();
        }
      }

      // Smoothly update FPS state every 300ms to eliminate UI flicker
      if (now - lastFpsUpdateRef.current > 300 && frameTimesRef.current.length > 0) {
        const avgDelta =
          frameTimesRef.current.reduce((sum, val) => sum + val, 0) /
          frameTimesRef.current.length;
        const computedFps = Math.min(120, Math.round(1000 / avgDelta));
        setFps(computedFps);
        setFrameTimeMs(parseFloat(avgDelta.toFixed(1)));
        setIsLowFps(computedFps < 30);
        lastFpsUpdateRef.current = now;

        // Auto-adjustment feature: triggers when sustained low frame rate (<30 FPS) is detected for > 3.0s (corrected from 1.5s)
        if (adaptivePerformanceRef.current) {
          if (computedFps < 30) {
            if (lowFpsStartTimeRef.current === null) {
              lowFpsStartTimeRef.current = now;
            }
            const sustainedSec = (now - lowFpsStartTimeRef.current) / 1000;
            // Sustained low frame rate detected for > 3.0 seconds triggers auto-adjustment
            if (sustainedSec >= 3.0) {
              lowFpsStartTimeRef.current = null;
              triggerAutoAdjustment(computedFps, sustainedSec);
            }
          } else {
            lowFpsStartTimeRef.current = null;
          }
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        try {
          if (!isARMode && composerRef.current && bloomIntensity !== 'off') {
            composerRef.current.render();
          } else {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }

          // Mark scene as initialized once the first frame renders successfully
          if (!firstFrameRenderedRef.current) {
            firstFrameRenderedRef.current = true;
            setTimeout(() => {
              setIsSceneInitializing(false);
            }, 60);
          }
        } catch (renderErr) {
          console.error('WebGL render error caught in loop:', renderErr);
        }
      }
    };
    animFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
      if (simRendererRef.current) {
        simRendererRef.current.cleanup();
      }
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      bloomPassRef.current = null;
      renderer.dispose();
    };
  }, [simulationType, isDark, isCyberpunk, envType]);

  // Update simulation type or params
  useEffect(() => {
    if (simRendererRef.current && sceneRef.current) {
      simRendererRef.current.initSimulation(simulationType, {
        scene: sceneRef.current,
        params,
        simTime,
        showVectors,
        showLabels,
        showTrajectory,
        showGrid,
        showAxes,
        isDark,
        bloomIntensity,
      });
    }
  }, [simulationType]);

  // Update real-time physics on time/param changes
  useEffect(() => {
    if (simRendererRef.current && sceneRef.current) {
      simRendererRef.current.update({
        scene: sceneRef.current,
        params,
        simTime,
        showVectors,
        showLabels,
        showTrajectory,
        showGrid,
        showAxes,
        isDark,
      });
      if (hiddenVectorIds.size > 0) {
        simRendererRef.current.setHiddenVectors(hiddenVectorIds);
      }
    }
  }, [params, simTime, showVectors, showLabels, showTrajectory, hiddenVectorIds]);

  // Toggle Grid / Axes
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    if (axesHelperRef.current) axesHelperRef.current.visible = showAxes;
  }, [showGrid, showAxes]);

  // Mouse & Touch Orbit Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDragging.current = true;
    } else if (e.button === 2) {
      isPanning.current = true;
    }
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current && !isPanning.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    if (isDragging.current && cameraRef.current) {
      const speed = 0.005;
      cameraSpherical.current.theta -= deltaX * speed;
      cameraSpherical.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraSpherical.current.phi - deltaY * speed)
      );
      updateCameraTransform();
    } else if (isPanning.current && cameraRef.current) {
      const panSpeed = 0.02;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraRef.current.quaternion);

      cameraTarget.current.addScaledVector(right, -deltaX * panSpeed);
      cameraTarget.current.addScaledVector(up, deltaY * panSpeed);
      updateCameraTransform();
    }

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isPanning.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If holding Ctrl or Cmd, or if explicitly in 'zoom' mode, perform 3D camera zoom
    if (e.ctrlKey || e.metaKey || wheelMode === 'zoom') {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomSpeed = 0.0018;
      cameraSpherical.current.radius = Math.max(
        3,
        Math.min(100, cameraSpherical.current.radius * (1 + e.deltaY * zoomSpeed))
      );
      updateCameraTransform();
    } else {
      // In natural 'scroll' mode, seamlessly scroll the page / main container up and down
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollBy({ top: e.deltaY, behavior: 'auto' });
      } else {
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    }
  };

  // Android & Touch Screen Gestures: 1-Finger Rotate, 2-Finger Pinch Zoom & Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      // Double-Tap to Reset Camera on Android
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        resetCamera();
      }
      lastTapTime.current = now;
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchStartDist.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRadius.current = cameraSpherical.current.radius;
      touchStartMidpoint.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current && cameraRef.current) {
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
      const speed = 0.006;

      cameraSpherical.current.theta -= deltaX * speed;
      cameraSpherical.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraSpherical.current.phi - deltaY * speed)
      );
      updateCameraTransform();
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && cameraRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      // Pinch-to-Zoom
      if (touchStartDist.current && touchStartDist.current > 0) {
        const pinchRatio = touchStartDist.current / Math.max(10, currentDist);
        cameraSpherical.current.radius = Math.max(
          3,
          Math.min(100, touchStartRadius.current * pinchRatio)
        );
      }

      // Two-Finger Pan
      if (touchStartMidpoint.current) {
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;
        const deltaMidX = currentMidX - touchStartMidpoint.current.x;
        const deltaMidY = currentMidY - touchStartMidpoint.current.y;

        const panSpeed = 0.02;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraRef.current.quaternion);

        cameraTarget.current.addScaledVector(right, -deltaMidX * panSpeed);
        cameraTarget.current.addScaledVector(up, deltaMidY * panSpeed);

        touchStartMidpoint.current = { x: currentMidX, y: currentMidY };
      }

      updateCameraTransform();
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    touchStartDist.current = null;
    touchStartMidpoint.current = null;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentVectors: VectorLegendItem[] = VECTOR_LEGENDS[simulationType] || [];

  return (
    <div
      className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0B] select-none shadow-2xl flex flex-col touch-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* AR Camera Video Overlay */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 pointer-events-none ${isARMode ? 'opacity-100' : 'opacity-0 hidden'}`}
      />

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing touch-none z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      {/* Floating Top Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
        {/* Left Badges */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {isARMode ? (
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-950/90 backdrop-blur-md border border-emerald-400/50 text-[11px] sm:text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>AR Camera Live</span>
              <button
                onClick={() => setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
                title="Switch Camera (Rear / Front)"
                className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 ml-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#111114]/90 backdrop-blur-md border border-white/[0.08] text-[11px] sm:text-xs font-semibold text-cyan-400 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>3D Interactive Stage</span>
            </div>
          )}

          <div 
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#111114]/90 backdrop-blur-md border border-emerald-500/20 text-[11px] font-medium text-emerald-400 shadow-lg"
            title="Physics Engine Middleware: Fixed-step integration with non-penetration contact manifold and depth-bias z-fighting prevention active."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Physics Middleware</span>
          </div>

          {/* Cyberpunk Post-Processing Bloom Status Indicator */}
          {/* 3D Bloom Lighting Mode Pill (Vibrant / Subtle / Off) */}
          <button
            type="button"
            onClick={() => {
              const next = bloomIntensity === 'vibrant' ? 'subtle' : bloomIntensity === 'subtle' ? 'off' : 'vibrant';
              onChangeBloom?.(next);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] font-semibold transition border shadow-lg backdrop-blur-md cursor-pointer ${
              bloomIntensity === 'vibrant'
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : bloomIntensity === 'subtle'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-[#111114]/90 border-white/[0.08] text-zinc-400 hover:text-zinc-200'
            }`}
            title={`3D Bloom Lighting: ${bloomIntensity.toUpperCase()} (Click to toggle: Vibrant -> Subtle -> Off)`}
            aria-label="Toggle Bloom"
          >
            {bloomIntensity === 'vibrant' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            {bloomIntensity === 'subtle' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
            {bloomIntensity === 'off' && <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
            <span className="hidden sm:inline">Bloom:</span>
            <span className="capitalize font-mono font-bold">
              {bloomIntensity}
            </span>
          </button>

          {/* Laboratory Calibration Screen Quick Access */}
          {onOpenLoadingScreen && (
            <button
              type="button"
              onClick={onOpenLoadingScreen}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] font-semibold transition border shadow-lg backdrop-blur-md cursor-pointer bg-[#111114]/90 border-white/[0.08] text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/30"
              title="Open 3D Physics Laboratory Calibration & Loading Screen"
              aria-label="Calibrate Laboratory"
            >
              <Atom className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calibrate Lab</span>
            </button>
          )}

          {/* Adaptive Performance Auto-Optimization Pill */}
          <button
            type="button"
            onClick={toggleAdaptivePerformance}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] font-semibold transition border shadow-lg backdrop-blur-md cursor-pointer ${
              adaptivePerformance
                ? isDark
                  ? 'bg-[#0A1628]/90 border-cyan-500/30 text-cyan-300 hover:border-cyan-500/50'
                  : 'bg-cyan-50/90 border-cyan-200 text-cyan-800'
                : 'bg-[#111114]/90 border-white/[0.08] text-zinc-400 hover:text-zinc-200'
            }`}
            title={
              adaptivePerformance
                ? 'Adaptive Performance Active: Detects sustained low frame rate (<30 FPS for > 3.0s) and automatically tunes bloom or trajectory to sustain 60 FPS responsiveness. Click to toggle.'
                : 'Adaptive Performance Disabled: Click to enable auto-adjustment for low frame rates.'
            }
            aria-label="Toggle Adaptive Performance"
          >
            <Zap className={`w-3.5 h-3.5 ${adaptivePerformance ? 'text-cyan-400 fill-cyan-400/20' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">Auto-Opt:</span>
            <span className={adaptivePerformance ? 'text-emerald-400 font-bold' : 'text-zinc-500 font-normal'}>
              {adaptivePerformance ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Real-time Viewport FPS & Hardware Diagnostics Badge (Unobtrusive & Toggleable) */}
          <AnimatePresence>
            {showFps && (
              <motion.button
                key="fps-counter-badge"
                initial={{ opacity: 0, scale: 0.9, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={toggleFps}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#111114]/90 hover:bg-[#181820] backdrop-blur-md border border-white/[0.08] hover:border-emerald-500/30 text-[11px] font-mono font-bold shadow-lg transition-all cursor-pointer"
                title={`Real-Time Viewport Performance: ${fps} FPS (${frameTimeMs} ms render latency). Click to hide or toggle FPS counter.`}
                aria-label={`FPS: ${fps}, Frame latency: ${frameTimeMs}ms. Click to hide.`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    fps >= 50
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : fps >= 30
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                      : 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping'
                  }`}
                />
                <span
                  className={`font-semibold tracking-tight ${
                    fps >= 50
                      ? 'text-emerald-400'
                      : fps >= 30
                      ? 'text-amber-300'
                      : 'text-rose-400'
                  }`}
                >
                  {fps} FPS
                </span>
                <span className="text-zinc-500 font-normal hidden sm:inline">&bull;</span>
                <span className="text-zinc-400 font-normal text-[10px] hidden sm:inline">{frameTimeMs}ms</span>
                {isLowFps && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAutoAdjustment(fps, 3.0);
                    }}
                    title="Heavy Load (<30 FPS). Click to trigger auto-optimization step immediately."
                    className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-sans font-bold border border-rose-500/30 animate-pulse hover:bg-rose-500/40 transition cursor-pointer"
                  >
                    Heavy Load &bull; Optimize
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Perspective Angle Quick Switchers */}
          <div className="hidden sm:flex items-center gap-1 bg-[#111114]/90 backdrop-blur-md p-1 rounded-xl border border-white/[0.08] text-[10px] font-bold">
            <button
              onClick={() => setCameraPresetView('3d')}
              className="px-2 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 transition"
              title="Isometric 3D Perspective"
            >
              3D
            </button>
            <button
              onClick={() => setCameraPresetView('front')}
              className="px-2 py-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Front View (XY Plane)"
            >
              Front
            </button>
            <button
              onClick={() => setCameraPresetView('top')}
              className="px-2 py-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Top View (XZ Plane)"
            >
              Top
            </button>
            <button
              onClick={() => setCameraPresetView('side')}
              className="px-2 py-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Side View (YZ Plane)"
            >
              Side
            </button>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto bg-[#111114]/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-white/[0.08] shadow-xl">
          {/* Wheel Scroll vs 3D Zoom Toggle */}
          <button
            onClick={() => setWheelMode(wheelMode === 'scroll' ? 'zoom' : 'scroll')}
            title={
              wheelMode === 'scroll'
                ? 'Wheel Mode: Page Scrolling Active (Hold Ctrl/Cmd or click Zoom button to zoom 3D). Click to switch to Direct 3D Zoom.'
                : 'Wheel Mode: Direct 3D Zoom Active. Click to switch to Natural Page Scrolling.'
            }
            aria-label="Toggle Wheel Scroll Mode"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              wheelMode === 'scroll'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{wheelMode === 'scroll' ? 'Scroll Page' : 'Zoom 3D'}</span>
          </button>

          <div className="h-4 w-px bg-white/[0.08]"></div>

          <button
            onClick={resetCamera}
            title="Reset Camera & Center View"
            aria-label="Reset Camera"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-[#1C1C22] rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* FPS Counter Visibility Toggle */}
          <button
            onClick={toggleFps}
            title={showFps ? "Hide FPS & Performance Monitor" : "Show FPS Counter (Real-time Viewport Render Performance)"}
            aria-label="Toggle FPS Counter"
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              showFps
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1C1C22]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">FPS</span>
          </button>

          <div className="h-4 w-px bg-white/[0.08]"></div>

          {/* Vectors Toggle */}
          <button
            onClick={onToggleVectors}
            title="Toggle Force / Velocity Vectors"
            aria-label="Toggle Vectors"
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              showVectors ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:bg-[#1C1C22]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Vectors</span>
          </button>

          {/* Trajectory Toggle */}
          <button
            onClick={onToggleTrajectory}
            title="Toggle Trajectory Path"
            aria-label="Toggle Path"
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              showTrajectory ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:bg-[#1C1C22]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Path</span>
          </button>

          <button
            onClick={onToggleGrid}
            title="Toggle Floor Grid"
            aria-label="Toggle Grid"
            className={`p-1.5 rounded-lg transition text-xs ${
              showGrid ? 'bg-[#1C1C22] text-zinc-200' : 'text-zinc-500 hover:bg-[#1C1C22]/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleAxes}
            title="Toggle Coordinate Axes"
            aria-label="Toggle Axes"
            className={`p-1.5 rounded-lg transition text-xs ${
              showAxes ? 'bg-[#1C1C22] text-zinc-200' : 'text-zinc-500 hover:bg-[#1C1C22]/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              title={isFocusMode ? "Exit Focus Mode (Esc or F)" : "Enter Focus Mode (F) - Full Screen 3D Lab with Floating HUD"}
              aria-label="Toggle Focus Mode"
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold ${
                isFocusMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus Mode</span>
            </button>
          )}

          <button
            onClick={toggleAR}
            title={isARMode ? "Exit AR View" : "Enter AR View (Camera Overlay)"}
            aria-label="Toggle AR Mode"
            className={`p-1.5 px-2 rounded-lg transition flex items-center gap-1.5 text-xs font-bold shadow-sm ${
              isARMode
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-400'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isARMode ? 'Exit AR' : 'AR View'}</span>
            {isARMode && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />}
          </button>

          <button
            onClick={toggleTheme}
            title="Toggle Theme Mode"
            aria-label="Toggle Theme"
            className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-[#1C1C22] rounded-lg transition flex items-center justify-center"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Zap className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={toggleEnvironment}
            title={`Toggle 3D Environment (Current: ${envType.charAt(0).toUpperCase() + envType.slice(1)})`}
            aria-label="Toggle Environment"
            className="p-1.5 text-zinc-400 hover:text-indigo-300 hover:bg-[#1C1C22] rounded-lg transition flex items-center justify-center"
          >
            {envType === 'void' ? <Box className="w-4 h-4" /> : envType === 'lab' ? <FlaskConical className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-[#1C1C22] rounded-lg transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Canvas Labels (Legend) & Trajectory Details Toggles */}
      <div className="absolute top-14 left-3 z-10 pointer-events-auto flex items-center gap-2">
        <button
          onClick={onToggleLabels}
          title="Quickly hide or show the descriptive physics parameter labels directly on the canvas"
          aria-label="Toggle Canvas Legend"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-md border transition-all ${
            showLabels
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-[#111114]/90 text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-[#1C1C22]/90'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Legend</span>
        </button>

        {simulationType === 'projectile-motion' && showTrajectory && (
          <button
            onClick={() => setIsTrajectoryHudExpanded(prev => !prev)}
            title="Toggle Trajectory Details & Telemetry Overlay"
            aria-label="Toggle Trajectory Details"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-md border transition-all ${
              isTrajectoryHudExpanded
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-[#111114]/90 text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-[#1C1C22]/90'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trajectory Details</span>
          </button>
        )}
      </div>

      {/* Projectile Trajectory Flight Analytics & Telemetry HUD */}
      {simulationType === 'projectile-motion' && showTrajectory && projectileTrajectoryData && (
        <div className="absolute top-24 left-3 max-w-[calc(100%-24px)] sm:max-w-[340px] pointer-events-auto z-10 select-none">
          {!isTrajectoryHudExpanded ? (
            /* Micro-Capsule Summary */
            <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-[#0c0d14]/85 hover:bg-[#0c0d14]/95 backdrop-blur-xl border border-emerald-500/30 shadow-xl text-xs transition-all">
              <button
                onClick={() => setIsTrajectoryHudExpanded(true)}
                className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 transition"
                title="Expand Trajectory Details & Flight Analytics"
                aria-label="Expand Trajectory Details"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trajectory Details</span>
              </button>
              <div className="h-3.5 w-px bg-white/[0.1] hidden sm:block" />
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300 px-1">
                <span>R: <b className="text-emerald-400">{projectileTrajectoryData.range.toFixed(1)}m</b></span>
                <span>H: <b className="text-pink-400">{projectileTrajectoryData.maxH.toFixed(1)}m</b></span>
                <span>T: <b className="text-cyan-400">{projectileTrajectoryData.T.toFixed(2)}s</b></span>
              </div>
              <button
                onClick={() => setIsTrajectoryHudExpanded(true)}
                className="p-1 text-zinc-400 hover:text-emerald-300 rounded-lg hover:bg-white/[0.05] transition"
                title="Expand Trajectory Details"
                aria-label="Expand Trajectory Details"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Rich Translucent Trajectory Telemetry Card */
            <div className="bg-[#0c0d14]/90 backdrop-blur-2xl rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 text-xs">
              {/* Header Bar */}
              <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/[0.08] bg-emerald-950/20">
                <div
                  onClick={() => setIsTrajectoryHudExpanded(false)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Trajectory Telemetry
                  </span>
                  {liveProjectileState && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                      liveProjectileState.isLanded
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : liveProjectileState.phase === 'At Apex'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {liveProjectileState.phase}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsTrajectoryHudExpanded(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] rounded-md transition"
                    title="Collapse Trajectory HUD"
                    aria-label="Collapse Trajectory HUD"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Trajectory Analytics Grid */}
              <div className="p-3 space-y-2.5">
                {/* Benchmark Metrics Grid */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Max Height (H)</span>
                    <span className="text-xs font-mono font-bold text-pink-400">
                      {projectileTrajectoryData.maxH.toFixed(2)} m
                    </span>
                    <span className="text-[9px] text-zinc-500 block font-mono">
                      @ t={projectileTrajectoryData.tApex.toFixed(2)}s
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Range (R)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {projectileTrajectoryData.range.toFixed(2)} m
                    </span>
                    <span className="text-[9px] text-zinc-500 block font-mono">
                      {projectileTrajectoryData.hasIncline ? `Incline ${projectileTrajectoryData.planeAngle}°` : 'Flat ground'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Flight Time (T)</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {projectileTrajectoryData.T.toFixed(2)} s
                    </span>
                    <span className="text-[9px] text-zinc-500 block font-mono">
                      v_end={projectileTrajectoryData.vImpact.toFixed(1)}m/s
                    </span>
                  </div>
                </div>

                {/* JEE Advanced Curvature & Equation Row */}
                <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-purple-400" />
                      Apex Curvature (ρ)
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">ρ = (u cos θ)² / g</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-purple-300">
                    {projectileTrajectoryData.rhoApex.toFixed(2)} m
                  </span>
                </div>

                {/* Trajectory Parabolic Equation */}
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono">
                  <div className="text-zinc-400 flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-300">Cartesian Trajectory</span>
                    <span className="text-zinc-500">y(x)</span>
                  </div>
                  <div className="text-cyan-300 font-bold break-all">
                    y = {projectileTrajectoryData.isElevated ? `${projectileTrajectoryData.h0} + ` : ''}x·tan({projectileTrajectoryData.theta}°) - ({projectileTrajectoryData.g}·x²) / (2·{projectileTrajectoryData.u}²·cos²{projectileTrajectoryData.theta}°)
                  </div>
                </div>

                {/* Live Flight Telemetry Coordinates */}
                {liveProjectileState && (
                  <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Live:</span>
                      <span className="text-zinc-200">
                        ({liveProjectileState.curX.toFixed(1)}, {liveProjectileState.curY.toFixed(1)}) m
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Speed:</span>
                      <span className="text-emerald-400 font-bold">
                        {liveProjectileState.curV.toFixed(1)} m/s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Right Side Zoom Controller (Compatible with Android & Computer) */}
      <div className="absolute right-3 bottom-14 sm:bottom-12 flex flex-col items-center gap-1.5 bg-[#111114]/95 backdrop-blur-md p-1.5 rounded-2xl border border-white/[0.12] shadow-2xl z-10 pointer-events-auto">
        {/* Zoom In Button */}
        <button
          onClick={() => handleZoom(0.82)}
          title="Zoom In (or Scroll Up / Pinch Open on Android)"
          aria-label="Zoom In"
          className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-[#1C1C24] hover:bg-cyan-500/20 text-zinc-200 hover:text-cyan-300 flex items-center justify-center transition active:scale-95 shadow border border-white/[0.06]"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Percentage Badge */}
        <button
          onClick={resetCamera}
          title="Reset Camera Zoom"
          className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-400 hover:text-cyan-300 transition"
        >
          {zoomPercent}%
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => handleZoom(1.22)}
          title="Zoom Out (or Scroll Down / Pinch Close on Android)"
          aria-label="Zoom Out"
          className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-[#1C1C24] hover:bg-cyan-500/20 text-zinc-200 hover:text-cyan-300 flex items-center justify-center transition active:scale-95 shadow border border-white/[0.06]"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-5 h-px bg-white/[0.1]"></div>

        {/* Fit / Recenter Button */}
        <button
          onClick={resetCamera}
          title="Recenter Camera & Reset View"
          aria-label="Recenter Camera"
          className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-[#1C1C24] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 flex items-center justify-center transition active:scale-95 shadow border border-white/[0.06]"
        >
          <Move3d className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Left Vector Legend HUD (Names & Representation of All Colored Arrows) */}
      {showVectors && currentVectors.length > 0 && (
        <div className="absolute bottom-3 left-3 max-w-[calc(100%-80px)] sm:max-w-sm pointer-events-auto z-10 select-none">
          {!isLegendExpanded ? (
            /* Compact Collapsed Micro-Capsule (Non-intrusive, never covers 3D models) */
            <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-[#0c0d14]/80 hover:bg-[#0c0d14]/95 backdrop-blur-xl border border-white/[0.12] shadow-xl text-xs transition-all">
              <button
                onClick={() => setIsLegendExpanded(true)}
                className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-zinc-200 hover:text-cyan-300 transition"
                title="Expand detailed Vector & Arrow Legend"
                aria-label="Expand Vector Legend"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">Vectors</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  {currentVectors.length - hiddenVectorIds.size}/{currentVectors.length}
                </span>
              </button>

              <div className="h-3.5 w-px bg-white/[0.1] hidden sm:block" />

              {/* Mini Vector Color Dots & Symbols Preview Chips */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-[170px] sm:max-w-[220px] no-scrollbar py-0.5">
                {currentVectors.map((v) => {
                  const isHidden = hiddenVectorIds.has(v.id);
                  const liveVal = v.getLiveValue ? v.getLiveValue(params, simTime) : null;
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => toggleVectorVisibility(v.id, e)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition flex-shrink-0 border ${
                        isHidden
                          ? 'bg-zinc-800/40 text-zinc-500 border-zinc-700/40 line-through opacity-50'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08]'
                      }`}
                      title={`${v.name} (${v.symbol})${liveVal ? ` • Live: ${liveVal}` : ''}${v.formula ? ` • Formula: ${v.formula}` : ''}. Click to toggle.`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: isHidden ? '#71717a' : v.color,
                          boxShadow: isHidden ? 'none' : `0 0 6px ${v.color}aa`,
                        }}
                      />
                      <span style={{ color: isHidden ? '#71717a' : v.color }}>{v.symbol}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsLegendExpanded(true)}
                className="p-1 text-zinc-400 hover:text-cyan-300 rounded-lg hover:bg-white/[0.05] transition"
                title="Expand Legend"
                aria-label="Expand Legend"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Sleek Translucent Expanded Legend Card */
            <div className="w-72 sm:w-80 bg-[#0c0d14]/85 backdrop-blur-2xl rounded-2xl border border-white/[0.14] shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">
              {/* Legend Header Bar */}
              <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/[0.08] bg-white/[0.02]">
                <div
                  onClick={() => setIsLegendExpanded(false)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hiddenVectorIds.size > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                    } animate-pulse`}
                  />
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 transition flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    Vector & Arrow Legend
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                    {currentVectors.length - hiddenVectorIds.size}/{currentVectors.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Toggle All Button */}
                  <button
                    onClick={(e) => toggleAllVectorsVisibility(currentVectors, e)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] rounded-md transition"
                    title={hiddenVectorIds.size > 0 ? 'Show all vector arrows' : 'Hide all vector arrows'}
                    aria-label="Toggle All Vectors"
                  >
                    {hiddenVectorIds.size > 0 ? (
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>

                  {/* Collapse Button */}
                  <button
                    onClick={() => setIsLegendExpanded(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] rounded-md transition"
                    title="Collapse to compact pill"
                    aria-label="Collapse Vector Legend"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Legend Item Cards */}
              <div className="p-2 sm:p-2.5 flex flex-col gap-1.5 max-h-48 sm:max-h-52 overflow-y-auto custom-scrollbar">
                {currentVectors.map((v) => {
                  const isHidden = hiddenVectorIds.has(v.id);
                  const liveVal = v.getLiveValue ? v.getLiveValue(params, simTime) : null;
                  return (
                    <div
                      key={v.id}
                      onClick={() => toggleVectorVisibility(v.id)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                        isHidden
                          ? 'bg-[#121218]/40 border-white/[0.03] opacity-60 hover:opacity-80'
                          : 'bg-[#16161F]/80 border-white/[0.06] hover:border-cyan-500/30 hover:bg-[#1a1a24]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Colored Arrow Dot with Glow */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center transition"
                          style={{
                            backgroundColor: isHidden ? '#52525b' : v.color,
                            boxShadow: isHidden ? 'none' : `0 0 8px ${v.color}88`,
                          }}
                        >
                          <div className="w-1 h-1 rounded-full bg-white"></div>
                        </div>

                        {/* Vector Name & Symbol */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold truncate ${
                                isHidden ? 'text-zinc-500 line-through' : 'text-zinc-200'
                              }`}
                            >
                              {v.name}
                            </span>
                            <span
                              className="text-[10px] font-mono font-extrabold px-1 rounded"
                              style={{
                                color: isHidden ? '#71717a' : v.color,
                                backgroundColor: isHidden ? '#27272a' : `${v.color}22`,
                              }}
                            >
                              ({v.symbol})
                            </span>
                          </div>
                          {v.formula ? (
                            <p className="text-[10px] font-mono text-zinc-400 truncate">
                              {v.formula}
                            </p>
                          ) : (
                            <p className="text-[10px] text-zinc-500 truncate hidden sm:block">
                              {v.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Live Magnitude Value & Eye Toggle */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {liveVal && !isHidden && (
                          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {liveVal}
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleVectorVisibility(v.id, e)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition"
                          title={isHidden ? `Show ${v.name}` : `Hide ${v.name}`}
                          aria-label={isHidden ? `Show ${v.name}` : `Hide ${v.name}`}
                        >
                          {isHidden ? (
                            <EyeOff className="w-3 h-3 text-zinc-500" />
                          ) : (
                            <Eye className="w-3 h-3 text-cyan-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div className="px-3 py-1.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-400">
                <span>Click item to isolate vector</span>
                <button
                  onClick={() => setIsLegendExpanded(false)}
                  className="hover:text-cyan-300 text-zinc-500 transition font-semibold"
                >
                  Collapse
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Touch & Navigation Gesture Guide at bottom right */}
      <div className="hidden 2xl:block absolute bottom-3 right-16 pointer-events-none z-10">
        <div className="px-2.5 py-1 rounded-lg bg-[#0A0A0B]/85 backdrop-blur-sm border border-white/[0.08] text-[10px] text-zinc-400 shadow-md">
          <span className="text-zinc-300 font-semibold">Drag:</span> Rotate &bull;{' '}
          <span className="text-zinc-300 font-semibold">Wheel:</span> {wheelMode === 'scroll' ? 'Scroll Page' : '3D Zoom'} &bull;{' '}
          <span className="text-zinc-300 font-semibold">2-Finger:</span> Pinch
        </div>
      </div>

      {/* Quick Jump to Menus Floating Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#111114]/90 backdrop-blur-md border border-white/[0.1] shadow-2xl z-10 pointer-events-auto">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <ArrowDown className="w-3 h-3 text-cyan-400" />
          Jump to:
        </span>
        <button
          onClick={() => scrollToSection('section-controls')}
          className="px-2 py-0.5 rounded-lg bg-[#1C1C24] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 text-[10px] font-semibold transition flex items-center gap-1 border border-white/[0.05]"
        >
          <Sliders className="w-2.5 h-2.5 text-cyan-400" />
          Controls
        </button>
        <button
          onClick={() => scrollToSection('section-coaching')}
          className="px-2 py-0.5 rounded-lg bg-[#1C1C24] hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 text-[10px] font-semibold transition flex items-center gap-1 border border-white/[0.05]"
        >
          <GraduationCap className="w-2.5 h-2.5 text-amber-400" />
          Coaching
        </button>
        <button
          onClick={() => scrollToSection('section-equations')}
          className="px-2 py-0.5 rounded-lg bg-[#1C1C24] hover:bg-blue-500/20 text-zinc-300 hover:text-blue-300 text-[10px] font-semibold transition flex items-center gap-1 border border-white/[0.05]"
        >
          <BookOpen className="w-2.5 h-2.5 text-blue-400" />
          Equations
        </button>
        <button
          onClick={() => scrollToSection('section-jee')}
          className="px-2 py-0.5 rounded-lg bg-[#1C1C24] hover:bg-purple-500/20 text-zinc-300 hover:text-purple-300 text-[10px] font-semibold transition flex items-center gap-1 border border-white/[0.05]"
        >
          <Award className="w-2.5 h-2.5 text-purple-400" />
          JEE
        </button>
        <button
          onClick={() => scrollToSection('section-questions')}
          className="px-2 py-0.5 rounded-lg bg-[#1C1C24] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 text-[10px] font-semibold transition flex items-center gap-1 border border-white/[0.05]"
        >
          <HelpCircle className="w-2.5 h-2.5 text-emerald-400" />
          Questions
        </button>
      </div>

      {/* In-Viewport Apparatus Calibration Skeleton (When Switching Concepts) */}
      <AnimatePresence>
        {isSceneInitializing && (
          <ViewportApparatusSkeleton
            conceptTitle={conceptTitle || simulationType}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Adaptive Performance Low-FPS Auto-Adjustment Notification Toast */}
      <AnimatePresence>
        {autoAdjustmentToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 p-3 rounded-xl bg-[#090E1E]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3 pointer-events-auto"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              </div>
              <p className="text-xs text-zinc-200 leading-snug">
                {autoAdjustmentToast.message}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {autoAdjustmentToast.actionText && (
                <button
                  type="button"
                  onClick={() => {
                    autoAdjustmentToast.onAction?.();
                    setAutoAdjustmentToast(null);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition cursor-pointer"
                >
                  {autoAdjustmentToast.actionText}
                </button>
              )}
              <button
                type="button"
                onClick={() => setAutoAdjustmentToast(null)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/[0.08] transition"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR View Guidance Overlay */}
      {isARMode && (
        <div className="absolute bottom-16 sm:bottom-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[11px] font-medium shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>AR Mode: Drag to move apparatus • Pinch/scroll to resize in your room</span>
          </div>
        </div>
      )}

      {/* AR Camera Loading Spinner */}
      {isARMode && cameraLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#111114] border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-2xl">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Connecting Device Camera Stream...</span>
          </div>
        </div>
      )}

      {/* AR Camera Error Notice */}
      {isARMode && cameraError && (
        <div className="absolute top-16 left-3 right-3 sm:left-6 sm:right-6 z-40 p-3 rounded-xl bg-rose-950/95 backdrop-blur-md border border-rose-500/40 text-white shadow-2xl flex items-start gap-3 pointer-events-auto">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-rose-200">Camera Stream Notice</div>
            <p className="text-zinc-300 mt-0.5">{cameraError}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setCameraError(null);
                  setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'));
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition"
              >
                Switch Camera & Retry
              </button>
              <button
                onClick={toggleAR}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-[11px] font-semibold transition"
              >
                Exit AR
              </button>
            </div>
          </div>
          <button
            onClick={() => setCameraError(null)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
