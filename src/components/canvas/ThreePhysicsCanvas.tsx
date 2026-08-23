import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationType } from '../../types';
import { SimulationRenderer } from './SimulationRenderer';
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
}

export const ThreePhysicsCanvas: React.FC<ThreePhysicsCanvasProps> = ({
  simulationType,
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
}) => {
  const { isCyberpunk, theme } = useTheme();
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

  // Cyberpunk Post-Processing Bloom Controls
  const [bloomIntensity, setBloomIntensity] = useState<'vibrant' | 'subtle' | 'off'>(() => {
    try {
      const saved = localStorage.getItem('jee_cyberpunk_bloom');
      if (saved === 'vibrant' || saved === 'subtle' || saved === 'off') return saved;
      return 'vibrant';
    } catch {
      return 'vibrant';
    }
  });

  const toggleBloomIntensity = useCallback(() => {
    setBloomIntensity((prev) => {
      const next = prev === 'vibrant' ? 'subtle' : prev === 'subtle' ? 'off' : 'vibrant';
      try {
        localStorage.setItem('jee_cyberpunk_bloom', next);
      } catch {}
      return next;
    });
  }, []);

  // Update Bloom Pass dynamically when bloom intensity changes without scene rebuild
  useEffect(() => {
    if (bloomPassRef.current) {
      if (bloomIntensity === 'off') {
        bloomPassRef.current.enabled = false;
      } else if (bloomIntensity === 'subtle') {
        bloomPassRef.current.enabled = true;
        bloomPassRef.current.strength = 0.75;
        bloomPassRef.current.radius = 0.35;
        bloomPassRef.current.threshold = 0.28;
      } else {
        bloomPassRef.current.enabled = true;
        bloomPassRef.current.strength = 1.35;
        bloomPassRef.current.radius = 0.45;
        bloomPassRef.current.threshold = 0.16;
      }
    }
  }, [bloomIntensity]);

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
  const [hiddenVectorIds, setHiddenVectorIds] = useState<Set<string>>(new Set());
  const [zoomPercent, setZoomPercent] = useState(100);
  const [wheelMode, setWheelMode] = useState<'scroll' | 'zoom'>('scroll');

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
    scene.background = new THREE.Color(isCyberpunk ? 0x030712 : isDark ? 0x09090c : 0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    resetCamera();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isCyberpunk ? 1.05 : 1.0;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Setup Post-Processing EffectComposer & UnrealBloomPass for Cyberpunk Mode
    if (isCyberpunk) {
      try {
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const strength = bloomIntensity === 'vibrant' ? 1.35 : bloomIntensity === 'subtle' ? 0.75 : 0;
        const threshold = bloomIntensity === 'vibrant' ? 0.16 : 0.28;
        const radius = bloomIntensity === 'vibrant' ? 0.45 : 0.35;

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
    } else {
      composerRef.current = null;
      bloomPassRef.current = null;
    }

    // 4. Lights with dynamic theme synchronization
    const ambientLight = new THREE.AmbientLight(
      isCyberpunk ? 0x00f0ff : isDark ? 0xffffff : 0xf8fafc,
      isCyberpunk ? 0.95 : isDark ? 0.95 : 1.35
    );
    scene.add(ambientLight);

    // Directional Key Sun Light
    const dirLight1 = new THREE.DirectionalLight(
      isCyberpunk ? 0xffffff : isDark ? 0xffffff : 0xffffff,
      isCyberpunk ? 1.6 : isDark ? 1.5 : 1.6
    );
    dirLight1.position.set(20, 32, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    // Directional Fill / Specular Rim Light
    const dirLight2 = new THREE.DirectionalLight(
      isCyberpunk ? 0x00ff9d : isDark ? 0x38bdf8 : 0x93c5fd,
      isCyberpunk ? 0.9 : isDark ? 0.75 : 0.45
    );
    dirLight2.position.set(-20, 12, -20);
    scene.add(dirLight2);

    // Hemisphere Light (Sky vs Ground Natural Irradiance)
    const hemiLight = new THREE.HemisphereLight(
      isCyberpunk ? 0x0c4a6e : isDark ? 0x334155 : 0xffffff,
      isCyberpunk ? 0x030712 : isDark ? 0x09090c : 0xe2e8f0,
      isCyberpunk ? 0.7 : isDark ? 0.65 : 0.85
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Dynamic Accent Fill Light
    const accentLight = new THREE.PointLight(
      isCyberpunk ? 0x00f0ff : isDark ? 0x06b6d4 : 0x3b82f6,
      isCyberpunk ? 0.75 : isDark ? 0.5 : 0.3,
      50
    );
    accentLight.position.set(0, 10, 15);
    scene.add(accentLight);

    // 5. Grid and Axes with theme-tuned colors
    const gridHelper = new THREE.GridHelper(
      40,
      40,
      isCyberpunk ? 0x00f0ff : isDark ? 0x475569 : 0x94a3b8,
      isCyberpunk ? 0x06283d : isDark ? 0x1e293b : 0xe2e8f0
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
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        try {
          if (isCyberpunk && composerRef.current && bloomIntensity !== 'off') {
            composerRef.current.render();
          } else {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
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
  }, [simulationType, isDark, isCyberpunk]);

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
      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing touch-none"
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
          <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#111114]/90 backdrop-blur-md border border-white/[0.08] text-[11px] sm:text-xs font-semibold text-cyan-400 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>3D Interactive Stage</span>
          </div>

          <div 
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#111114]/90 backdrop-blur-md border border-emerald-500/20 text-[11px] font-medium text-emerald-400 shadow-lg"
            title="Physics Engine Middleware: Fixed-step integration with non-penetration contact manifold and depth-bias z-fighting prevention active."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Physics Middleware</span>
          </div>

          {/* Cyberpunk Post-Processing Bloom Status Indicator */}
          {isCyberpunk && bloomIntensity !== 'off' && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#060D20]/90 backdrop-blur-md border border-fuchsia-500/30 text-[11px] font-semibold text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.25)]"
              title="Cyberpunk Unreal Bloom Post-Processing FX Active: Glowing vectors, lasers, trajectories and point charges pop against the dark background."
            >
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_8px_#e879f9]"></span>
              <span>Cyber-Bloom FX ({bloomIntensity})</span>
            </div>
          )}

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
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-sans font-bold border border-rose-500/30 animate-pulse">
                    Heavy Load
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

          {/* Cyberpunk Post-Processing Bloom FX Controller */}
          {isCyberpunk && (
            <button
              onClick={toggleBloomIntensity}
              title={`Cyberpunk Post-Processing Bloom FX: ${
                bloomIntensity === 'vibrant'
                  ? 'Vibrant Neon Bloom (Vectors, Lasers & Charges Pop)'
                  : bloomIntensity === 'subtle'
                  ? 'Subtle Cinematic Glow'
                  : 'Bloom Disabled'
              }. Click to cycle Vibrant / Soft / Off.`}
              aria-label="Toggle Cyberpunk Bloom FX"
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-semibold ${
                bloomIntensity === 'vibrant'
                  ? 'bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 shadow-[0_0_10px_rgba(217,70,239,0.35)]'
                  : bloomIntensity === 'subtle'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1C1C22]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${bloomIntensity !== 'off' ? 'text-fuchsia-400' : 'text-zinc-500'}`} />
              <span className="hidden xl:inline">
                {bloomIntensity === 'vibrant' ? 'Bloom: High' : bloomIntensity === 'subtle' ? 'Bloom: Soft' : 'Bloom: Off'}
              </span>
            </button>
          )}

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

          {/* 3D Arrow Labels Toggle */}
          <button
            onClick={onToggleLabels}
            title="Toggle 3D Vector & Physical Labels"
            aria-label="Toggle Labels"
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              showLabels ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:bg-[#1C1C22]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Labels</span>
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
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-[#1C1C22] rounded-lg transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

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
      <div className="hidden lg:block absolute bottom-3 right-16 pointer-events-none z-10">
        <div className="px-2.5 py-1 rounded-lg bg-[#0A0A0B]/85 backdrop-blur-sm border border-white/[0.08] text-[10px] text-zinc-400 shadow-md">
          <span className="text-zinc-300 font-semibold">Drag:</span> Rotate &bull;{' '}
          <span className="text-zinc-300 font-semibold">Wheel:</span> {wheelMode === 'scroll' ? 'Scroll Page (Ctrl+Zoom)' : '3D Zoom'} &bull;{' '}
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
    </div>
  );
};
