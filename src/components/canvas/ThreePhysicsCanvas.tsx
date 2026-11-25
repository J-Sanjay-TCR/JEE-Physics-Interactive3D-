import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
  Play,
  Pause,
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
  Tv,
  Monitor,
  Columns,
  ArrowLeftRight,
  Copy,
  Check,
} from 'lucide-react';
import { ComparePreset, getComparisonPresets } from '../../data/comparisonPresets';
import { calculateAdaptiveFov, detectScreenMetrics, ScreenMetrics } from '../../utils/screenDetection';

export interface LabelDistanceMetrics {
  visible: boolean;
  scaleMult: number;
  opacity: number;
}

export function getCanvasLabelPriority(labelName: string): number {
  if (labelName.includes('vel') || labelName.includes('net') || labelName.includes('resultant')) return 3;
  if (
    labelName.includes('apex') ||
    labelName.includes('landing') ||
    labelName.includes('com') ||
    labelName.includes('tracker')
  ) {
    return 2.5;
  }
  if (labelName.startsWith('label-wp-')) return 0.5;
  return 1.5;
}

export function computeLabelDistanceMetrics(
  dist: number,
  refDist: number,
  priority: number
): LabelDistanceMetrics {
  if (!Number.isFinite(dist) || dist < 1.0) {
    return { visible: false, scaleMult: 0.42, opacity: 0 };
  }

  const safeRef = Math.max(8, Math.min(40, refDist || 20));
  const isSecondary = priority <= 0.75;
  const scaleDecayStart = safeRef * 1.05;
  const fadeStart = isSecondary ? safeRef * 0.90 : safeRef * 1.15;
  const fadeEnd = isSecondary ? safeRef * 1.28 : safeRef * 1.65;

  if (dist >= fadeEnd) {
    return { visible: false, scaleMult: 0.42, opacity: 0 };
  }

  // Distance-based scale curve:
  // - Close range (< 0.72 * refDist): compact (0.68 -> 1.0) so labels never overpower details
  // - Nominal range: balanced 1.0
  // - Long range (> 1.05 * refDist): attenuates down (1.0 -> 0.42) so labels shrink and recede cleanly
  let scaleMult = 1.0;
  const nearEnd = Math.max(2.5, safeRef * 0.72);
  if (dist < nearEnd) {
    const tNear = THREE.MathUtils.clamp((dist - 1.0) / Math.max(0.5, nearEnd - 1.0), 0, 1);
    scaleMult = THREE.MathUtils.lerp(0.68, 1.0, tNear * tNear * (3 - 2 * tNear));
  } else if (dist > scaleDecayStart) {
    const tFar = THREE.MathUtils.clamp((dist - scaleDecayStart) / Math.max(1, fadeEnd - scaleDecayStart), 0, 1);
    scaleMult = THREE.MathUtils.lerp(1.0, 0.42, tFar * tFar * (3 - 2 * tFar));
  }

  // Smooth cubic-Hermite opacity attenuation (near clip fade-in + long-distance fade-out)
  let opacity = 1.0;
  if (dist > fadeStart) {
    const tFade = THREE.MathUtils.clamp((dist - fadeStart) / Math.max(0.5, fadeEnd - fadeStart), 0, 1);
    opacity = 1.0 - tFade * tFade * (3 - 2 * tFade);
  } else if (dist < 2.2) {
    opacity = THREE.MathUtils.clamp((dist - 1.0) / 1.2, 0, 1);
  }

  if (opacity <= 0.04) {
    return { visible: false, scaleMult, opacity: 0 };
  }

  return { visible: true, scaleMult, opacity };
}

// Pre-allocated scratch buffers for zero-GC per-frame label projection & decluttering
const _labelProjVec = new THREE.Vector3();
const _labelCamForward = new THREE.Vector3();
const _labelCamUp = new THREE.Vector3();
const _labelDeltaVec = new THREE.Vector3();

interface LabelCandidate {
  sprite: THREE.Sprite;
  dist: number;
  distZ: number;
  basePriority: number;
  sortScore: number;
  ndcX: number;
  ndcY: number;
  halfW: number;
  halfH: number;
  opacity: number;
  scaleMult: number;
}

const _labelCandidates: LabelCandidate[] = [];
const _labelPlacedBoxes: { minX: number; maxX: number; minY: number; maxY: number }[] = [];

export function updateDistanceScaledLabels(
  labelsGroup: THREE.Group | null | undefined,
  camera: THREE.PerspectiveCamera | null | undefined,
  options: { refDist: number; orbitRadius: number; isSplit?: boolean }
) {
  if (!labelsGroup || !camera || !labelsGroup.visible || labelsGroup.children.length === 0) return;

  camera.updateMatrixWorld();
  _labelCamForward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
  _labelCamUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

  const safeRef = Math.max(8, Math.min(40, options.refDist || 20));
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const aspect = Math.max(0.4, camera.aspect || 1);
  const safeMaxX = options.isSplit ? 0.94 : 0.88;
  const safeMaxY = 0.82;

  _labelCandidates.length = 0;
  _labelPlacedBoxes.length = 0;

  let nearestDist = Infinity;

  for (let i = 0; i < labelsGroup.children.length; i++) {
    const child = labelsGroup.children[i] as THREE.Sprite;
    if (!child || !(child as any).isSprite) continue;

    const ud = child.userData;
    if (!ud?.desiredVisible || ud.hiddenByFilter) {
      child.visible = false;
      continue;
    }

    const anchor = (ud.anchorPos as THREE.Vector3) || child.position;
    const dist = camera.position.distanceTo(anchor);
    const basePriority = getCanvasLabelPriority(child.name || '');

    const metrics = computeLabelDistanceMetrics(dist, safeRef, basePriority);
    if (!metrics.visible) {
      child.visible = false;
      continue;
    }

    _labelDeltaVec.subVectors(anchor, camera.position);
    const distZ = _labelDeltaVec.dot(_labelCamForward);
    if (distZ <= 0.8) {
      child.visible = false;
      continue;
    }

    _labelProjVec.copy(anchor).project(camera);
    if (
      !Number.isFinite(_labelProjVec.x) ||
      !Number.isFinite(_labelProjVec.y) ||
      _labelProjVec.z < -1 ||
      _labelProjVec.z > 1 ||
      Math.abs(_labelProjVec.x) > safeMaxX ||
      Math.abs(_labelProjVec.y) > safeMaxY
    ) {
      child.visible = false;
      continue;
    }

    if (dist < nearestDist) {
      nearestDist = dist;
    }

    const baseScaleX = (ud.baseScaleX as number) || child.scale.x;
    const baseScaleY = (ud.baseScaleY as number) || child.scale.y;
    const pillFrac = (ud.pillFraction as number) || 0.7;

    const halfH = (baseScaleY * metrics.scaleMult * 0.5) / (distZ * tanHalfFov);
    const halfW = (baseScaleX * pillFrac * metrics.scaleMult * 0.5) / (distZ * tanHalfFov * aspect);

    _labelCandidates.push({
      sprite: child,
      dist,
      distZ,
      basePriority,
      sortScore: basePriority - dist * 0.025,
      ndcX: _labelProjVec.x,
      ndcY: _labelProjVec.y,
      halfW: halfW * 1.08,
      halfH: halfH * 1.15,
      opacity: metrics.opacity,
      scaleMult: metrics.scaleMult,
    });
  }

  if (_labelCandidates.length === 0) return;

  // Attenuate distant background labels relative to the closest foreground anchor
  if (Number.isFinite(nearestDist)) {
    for (let i = 0; i < _labelCandidates.length; i++) {
      const c = _labelCandidates[i];
      if (c.dist > nearestDist + safeRef * 0.65) {
        c.opacity *= 0.72;
      }
    }
  }

  _labelCandidates.sort((a, b) => b.sortScore - a.sortScore);

  const isZoomedOut = options.orbitRadius > safeRef * 1.08;
  const maxNdcArea = isZoomedOut ? 0.09 : 0.18;
  let usedNdcArea = 0;

  const collidesWithPlaced = (minX: number, maxX: number, minY: number, maxY: number) => {
    for (let i = 0; i < _labelPlacedBoxes.length; i++) {
      const b = _labelPlacedBoxes[i];
      if (minX < b.maxX && maxX > b.minX && minY < b.maxY && maxY > b.minY) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < _labelCandidates.length; i++) {
    const c = _labelCandidates[i];
    if (c.opacity <= 0.04) {
      c.sprite.visible = false;
      continue;
    }

    // Screen-coverage budget: when zoomed out or densely clustered, keep high-priority labels and hide excess
    const approxArea = (c.halfW * 2) * (c.halfH * 2) * 0.25;
    if (usedNdcArea + approxArea > maxNdcArea && c.basePriority < 2.2) {
      c.sprite.visible = false;
      continue;
    }

    const ud = c.sprite.userData;
    const anchor = (ud.anchorPos as THREE.Vector3) || c.sprite.position;

    let chosenNdcY = c.ndcY;
    let worldYOffset = 0;
    let placed = !collidesWithPlaced(c.ndcX - c.halfW, c.ndcX + c.halfW, chosenNdcY - c.halfH, chosenNdcY + c.halfH);

    if (!placed) {
      const ndcStep = c.halfH * 2.15;
      const upY = c.ndcY + ndcStep;
      if (
        upY + c.halfH <= safeMaxY &&
        !collidesWithPlaced(c.ndcX - c.halfW, c.ndcX + c.halfW, upY - c.halfH, upY + c.halfH)
      ) {
        chosenNdcY = upY;
        worldYOffset = ndcStep * c.distZ * tanHalfFov;
        placed = true;
      } else {
        const downY = c.ndcY - ndcStep;
        if (
          downY - c.halfH >= -safeMaxY &&
          !collidesWithPlaced(c.ndcX - c.halfW, c.ndcX + c.halfW, downY - c.halfH, downY + c.halfH)
        ) {
          chosenNdcY = downY;
          worldYOffset = -ndcStep * c.distZ * tanHalfFov;
          placed = true;
        }
      }
    }

    if (!placed) {
      c.sprite.visible = false;
      continue;
    }

    _labelPlacedBoxes.push({
      minX: c.ndcX - c.halfW,
      maxX: c.ndcX + c.halfW,
      minY: chosenNdcY - c.halfH,
      maxY: chosenNdcY + c.halfH,
    });
    usedNdcArea += approxArea;

    c.sprite.position.copy(anchor);
    if (worldYOffset !== 0) {
      c.sprite.position.addScaledVector(_labelCamUp, worldYOffset);
    }

    const baseScaleX = (ud.baseScaleX as number) || c.sprite.scale.x;
    const baseScaleY = (ud.baseScaleY as number) || c.sprite.scale.y;
    c.sprite.scale.set(baseScaleX * c.scaleMult, baseScaleY * c.scaleMult, 1);

    const mat = c.sprite.material as THREE.SpriteMaterial;
    if (mat) {
      mat.opacity = c.opacity;
    }
    c.sprite.visible = true;
  }
}

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
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onReset?: () => void;
  speed?: number;
  onChangeSpeed?: (val: number) => void;
  isProjectorMode?: boolean;
  onToggleProjectorMode?: () => void;
  isSplitScreen?: boolean;
  onToggleSplitScreen?: () => void;
  paramsB?: Record<string, number>;
  activeCompareTarget?: 'A' | 'B';
  onSelectCompareTarget?: (target: 'A' | 'B') => void;
  onCopyAtoB?: () => void;
  onSwapAB?: () => void;
  onApplyComparePreset?: (preset: ComparePreset) => void;
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
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onChangeSpeed,
  isProjectorMode = false,
  onToggleProjectorMode,
  isSplitScreen = false,
  onToggleSplitScreen,
  paramsB,
  activeCompareTarget = 'A',
  onSelectCompareTarget,
  onCopyAtoB,
  onSwapAB,
  onApplyComparePreset,
}) => {
  const { isCyberpunk, theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sceneBRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const simRendererRef = useRef<SimulationRenderer | null>(null);
  const simRendererBRef = useRef<SimulationRenderer | null>(null);
  const physicsMiddlewareRef = useRef<PhysicsEngineMiddleware>(defaultPhysicsMiddleware);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const gridHelperBRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperBRef = useRef<THREE.AxesHelper | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLight1Ref = useRef<THREE.DirectionalLight | null>(null);
  const dirLight2Ref = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const accentLightRef = useRef<THREE.PointLight | null>(null);
  const starfieldRef = useRef<THREE.Points | null>(null);
  const ambientLightBRef = useRef<THREE.AmbientLight | null>(null);
  const dirLight1BRef = useRef<THREE.DirectionalLight | null>(null);
  const dirLight2BRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightBRef = useRef<THREE.HemisphereLight | null>(null);
  const accentLightBRef = useRef<THREE.PointLight | null>(null);
  const starfieldBRef = useRef<THREE.Points | null>(null);
  const pmremEnvRTRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const drawBufferSizeRef = useRef(new THREE.Vector2());
  const panRightVecRef = useRef(new THREE.Vector3());
  const panUpVecRef = useRef(new THREE.Vector3());
  const isSplitScreenRef = useRef(isSplitScreen);
  useEffect(() => {
    isSplitScreenRef.current = isSplitScreen;
  }, [isSplitScreen]);
  const paramsBRef = useRef(paramsB);
  useEffect(() => {
    paramsBRef.current = paramsB;
  }, [paramsB]);
  const composerRef = useRef<EffectComposer | null>(null);
  const composerRenderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const isLowTierDeviceRef = useRef<boolean>(false);
  const animFrameId = useRef<number>(0);
  const [webglError, setWebglError] = useState<string | null>(null);

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

  const applyEnvironmentToScene = useCallback(
    (
      targetScene: THREE.Scene,
      lights: {
        ambient: THREE.AmbientLight | null;
        dir1: THREE.DirectionalLight | null;
        dir2: THREE.DirectionalLight | null;
        hemi: THREE.HemisphereLight | null;
        accent: THREE.PointLight | null;
        stars: THREE.Points | null;
      },
      existingGridRef: React.MutableRefObject<THREE.GridHelper | null>
    ) => {
      const bgColor =
        envType === 'space'
          ? 0x000000
          : envType === 'lab'
            ? isDark
              ? 0x1e293b
              : 0xe2e8f0
            : isCyberpunk
              ? 0x030712
              : isDark
                ? 0x09090c
                : 0xf8fafc;

      if (isARMode) {
        targetScene.background = null;
      } else {
        targetScene.background = new THREE.Color(bgColor);
      }
      targetScene.environmentIntensity =
        envType === 'space' ? 0.42 : envType === 'lab' ? 0.58 : isDark || isCyberpunk ? 0.64 : 0.72;

      if (lights.ambient) {
        lights.ambient.color.setHex(
          envType === 'space'
            ? 0x222233
            : envType === 'lab'
              ? 0xffffff
              : isCyberpunk
                ? 0x0ea5e9
                : isDark
                  ? 0xe2e8f0
                  : 0xf8fafc
        );
        lights.ambient.intensity =
          envType === 'space' ? 0.16 : envType === 'lab' ? 0.30 : isCyberpunk ? 0.22 : isDark ? 0.24 : 0.34;
      }
      if (lights.dir1) {
        lights.dir1.color.setHex(0xffffff);
        lights.dir1.intensity =
          envType === 'space' ? 1.85 : envType === 'lab' ? 1.25 : isCyberpunk ? 1.4 : isDark ? 1.35 : 1.35;
      }
      if (lights.dir2) {
        lights.dir2.color.setHex(
          envType === 'space'
            ? 0x4488ff
            : envType === 'lab'
              ? 0xddddff
              : isCyberpunk
                ? 0x00ff9d
                : isDark
                  ? 0x38bdf8
                  : 0x93c5fd
        );
        lights.dir2.intensity =
          envType === 'space' ? 0.65 : envType === 'lab' ? 0.45 : isCyberpunk ? 0.52 : isDark ? 0.48 : 0.38;
      }
      if (lights.hemi) {
        lights.hemi.color.setHex(
          envType === 'space'
            ? 0x000000
            : envType === 'lab'
              ? 0xffffff
              : isCyberpunk
                ? 0x0c4a6e
                : isDark
                  ? 0x334155
                  : 0xffffff
        );
        lights.hemi.groundColor.setHex(
          envType === 'space'
            ? 0x111122
            : envType === 'lab'
              ? 0xbbbbcc
              : isCyberpunk
                ? 0x030712
                : isDark
                  ? 0x09090c
                  : 0xe2e8f0
        );
        lights.hemi.intensity =
          envType === 'space' ? 0.22 : envType === 'lab' ? 0.55 : isCyberpunk ? 0.42 : isDark ? 0.42 : 0.52;
      }
      if (lights.accent) {
        lights.accent.color.setHex(
          envType === 'space'
            ? 0x00ffff
            : envType === 'lab'
              ? 0xffffff
              : isCyberpunk
                ? 0x00f0ff
                : isDark
                  ? 0x06b6d4
                  : 0x3b82f6
        );
        lights.accent.intensity =
          envType === 'space' ? 0.90 : envType === 'lab' ? 0.28 : isCyberpunk ? 0.40 : isDark ? 0.32 : 0.20;
      }
      if (lights.stars) {
        lights.stars.visible = envType === 'space' && !isARMode;
      }

      const oldGrid = existingGridRef.current;
      const wasVisible = oldGrid ? oldGrid.visible : showGrid;
      if (oldGrid) {
        targetScene.remove(oldGrid);
        oldGrid.geometry.dispose();
        const gm = oldGrid.material;
        if (Array.isArray(gm)) gm.forEach((m) => m.dispose());
        else gm.dispose();
      }
      const nextGrid = new THREE.GridHelper(
        40,
        40,
        envType === 'space'
          ? 0x333344
          : envType === 'lab'
            ? 0x999999
            : isCyberpunk
              ? 0x00f0ff
              : isDark
                ? 0x475569
                : 0x94a3b8,
        envType === 'space'
          ? 0x111122
          : envType === 'lab'
            ? 0xcccccc
            : isCyberpunk
              ? 0x06283d
              : isDark
                ? 0x1e293b
                : 0xe2e8f0
      );
      nextGrid.position.y = -0.01;
      nextGrid.visible = wasVisible;
      targetScene.add(nextGrid);
      existingGridRef.current = nextGrid;
      return bgColor;
    },
    [envType, isARMode, isCyberpunk, isDark, showGrid]
  );

  useEffect(() => {
    if (sceneRef.current && rendererRef.current) {
      const bgColor = applyEnvironmentToScene(
        sceneRef.current,
        {
          ambient: ambientLightRef.current,
          dir1: dirLight1Ref.current,
          dir2: dirLight2Ref.current,
          hemi: hemiLightRef.current,
          accent: accentLightRef.current,
          stars: starfieldRef.current,
        },
        gridHelperRef
      );
      rendererRef.current.setClearColor(isARMode ? 0x000000 : bgColor, isARMode ? 0 : 1);
    }
    if (sceneBRef.current) {
      applyEnvironmentToScene(
        sceneBRef.current,
        {
          ambient: ambientLightBRef.current,
          dir1: dirLight1BRef.current,
          dir2: dirLight2BRef.current,
          hemi: hemiLightBRef.current,
          accent: accentLightBRef.current,
          stars: starfieldBRef.current,
        },
        gridHelperBRef
      );
    }
  }, [isARMode, isCyberpunk, isDark, envType, applyEnvironmentToScene]);

  // Update Bloom Pass dynamically when bloom intensity changes without scene rebuild
  useEffect(() => {
    if (rendererRef.current) {
      if (bloomIntensity === 'vibrant') {
        rendererRef.current.toneMappingExposure = isCyberpunk ? 1.03 : 0.98;
      } else if (bloomIntensity === 'subtle') {
        rendererRef.current.toneMappingExposure = isCyberpunk ? 1.0 : 0.98;
      } else {
        rendererRef.current.toneMappingExposure = 0.96;
      }
    }

    if (bloomPassRef.current) {
      const isLowTier = isLowTierDeviceRef.current;
      const isDarkEnv = isDark || isCyberpunk || envType === 'space' || (envType === 'lab' && isDark);
      if (bloomIntensity === 'off') {
        bloomPassRef.current.enabled = false;
        bloomPassRef.current.strength = 0;
      } else if (bloomIntensity === 'subtle') {
        bloomPassRef.current.enabled = true;
        bloomPassRef.current.strength = isLowTier ? 0.14 : 0.22;
        bloomPassRef.current.radius = isLowTier ? 0.18 : 0.24;
        bloomPassRef.current.threshold = isDarkEnv ? 0.84 : 0.94;
      } else {
        // Vibrant: Selective HDR optical bloom exclusively on bright emitters while solid surfaces stay crisp
        bloomPassRef.current.enabled = true;
        bloomPassRef.current.strength = isLowTier ? 0.30 : 0.45;
        bloomPassRef.current.radius = isLowTier ? 0.24 : 0.36;
        bloomPassRef.current.threshold = isDarkEnv ? 0.68 : 0.82;
      }
    }
    if (simRendererRef.current) {
      simRendererRef.current.setBloomIntensity(bloomIntensity);
    }
    if (simRendererBRef.current) {
      simRendererBRef.current.setBloomIntensity(bloomIntensity);
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
  const [isTrajectoryHudExpanded, setIsTrajectoryHudExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [hiddenVectorIds, setHiddenVectorIds] = useState<Set<string>>(new Set());
  const [zoomPercent, setZoomPercent] = useState(100);
  const [wheelMode, setWheelMode] = useState<'scroll' | 'zoom'>('scroll');
  const [detectedAspect, setDetectedAspect] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerHeight > 0) {
      return window.innerWidth / window.innerHeight;
    }
    return 16 / 9;
  });
  const [canvasHeight, setCanvasHeight] = useState<number>(480);

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

  // Comparative ballistic calculations for Setup B in Split-Screen Mode
  const projectileTrajectoryDataB = React.useMemo(() => {
    if (simulationType !== 'projectile-motion' || !paramsB) return null;
    const u = paramsB.u !== undefined ? paramsB.u : 20;
    const thetaDeg = paramsB.theta !== undefined ? paramsB.theta : 60;
    const g = paramsB.g !== undefined ? paramsB.g : 9.8;
    const h0 = paramsB.h0 !== undefined ? paramsB.h0 : 0;
    const planeAngleDeg = paramsB.planeAngle !== undefined ? paramsB.planeAngle : 0;

    const theta = (thetaDeg * Math.PI) / 180;
    const planeAngle = (planeAngleDeg * Math.PI) / 180;

    const ux = u * Math.cos(theta);
    const uy = u * Math.sin(theta);

    let T: number;
    let rangeX: number;
    let rangeY: number;
    let range: number;

    if (Math.abs(planeAngle) > 0.001) {
      const cosB = Math.cos(planeAngle);
      const tanB = Math.tan(planeAngle);
      const denom = 0.5 * g;
      const aCoeff = denom / (ux * ux);
      const bCoeff = tanB - uy / ux;
      const cCoeff = -h0;
      const discr = bCoeff * bCoeff - 4 * aCoeff * cCoeff;
      rangeX = (-bCoeff + Math.sqrt(Math.max(0, discr))) / (2 * aCoeff);
      rangeY = rangeX * tanB;
      range = rangeX / cosB;
      T = rangeX / ux;
    } else {
      const discr = uy * uy + 2 * g * h0;
      T = (uy + Math.sqrt(Math.max(0, discr))) / g;
      rangeX = ux * T;
      rangeY = 0;
      range = rangeX;
    }

    const tApex = Math.max(0, uy / g);
    const maxH = h0 + (uy * uy) / (2 * g);
    const vyImpact = uy - g * T;
    const vImpact = Math.hypot(ux, vyImpact);

    return {
      u,
      theta: thetaDeg,
      g,
      h0,
      planeAngle: planeAngleDeg,
      ux,
      uy,
      T,
      range,
      rangeX,
      rangeY,
      maxH,
      tApex,
      vImpact,
    };
  }, [simulationType, paramsB]);

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

  const isARModeRef = useRef(isARMode);
  useEffect(() => {
    isARModeRef.current = isARMode;
  }, [isARMode]);

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
    const rawRadius = Math.sqrt(dx * dx + dy * dy + dz * dz);
    let radius = Math.max(0.001, Number.isFinite(rawRadius) ? rawRadius : 20);
    const phi = Math.acos(THREE.MathUtils.clamp(dy / radius, -1, 1));
    const theta = Math.atan2(dx, dz);

    // Dynamic 4:3 projector and narrow screen distance adaptation
    const w = containerRef.current?.clientWidth || 800;
    const h = containerRef.current?.clientHeight || 600;
    const aspect = w / Math.max(1, h);
    if (aspect <= 1.45 || isProjectorMode) {
      // Scale camera radius slightly (1.04x - 1.18x) on 4:3 screens so boundary edges are not clipped
      radius *= Math.min(1.18, Math.max(1.04, 1.35 / Math.max(0.75, aspect)));
    }

    defaultRadius.current = radius;
    cameraSpherical.current = { radius, theta, phi };
    updateCameraTransform();
  }, [cameraPreset, updateCameraTransform, isProjectorMode]);

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

  // Global event listeners for decoupled camera reset, preset views, and zoom controls
  useEffect(() => {
    const handleResetCam = () => resetCamera();
    const handleCamPreset = (e: Event) => {
      const custom = e as CustomEvent<'3d' | 'front' | 'top' | 'side'>;
      if (custom.detail) {
        setCameraPresetView(custom.detail);
      }
    };
    const handleZoomEvent = (e: Event) => {
      const custom = e as CustomEvent<number>;
      if (typeof custom.detail === 'number') {
        handleZoom(custom.detail);
      }
    };
    window.addEventListener('physics-canvas-reset-camera', handleResetCam);
    window.addEventListener('physics-canvas-camera-preset', handleCamPreset);
    window.addEventListener('physics-canvas-zoom', handleZoomEvent);
    return () => {
      window.removeEventListener('physics-canvas-reset-camera', handleResetCam);
      window.removeEventListener('physics-canvas-camera-preset', handleCamPreset);
      window.removeEventListener('physics-canvas-zoom', handleZoomEvent);
    };
  }, [resetCamera, setCameraPresetView, handleZoom]);

  // Complete GPU Resource Disposal Helper
  const disposeSceneResources = useCallback((scene: THREE.Scene | null) => {
    if (!scene) return;
    const textureSlots = [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'alphaMap',
      'bumpMap',
      'displacementMap',
      'envMap',
      'lightMap',
    ] as const;

    scene.traverse((child) => {
      const anyChild = child as any;
      if (typeof anyChild.dispose === 'function' && child instanceof THREE.InstancedMesh) {
        anyChild.dispose();
      }
      const mesh = child as THREE.Mesh;
      if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m: any) => {
          if (!m) return;
          for (const slot of textureSlots) {
            if (m[slot] && typeof m[slot].dispose === 'function') {
              m[slot].dispose();
            }
          }
          if (typeof m.dispose === 'function') m.dispose();
        });
      }
    });
  }, []);

  // Initialize Three.js Scene (Only recreates WebGL context on simulationType change)
  useEffect(() => {
    if (!containerRef.current) return;
    setWebglError(null);

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with Adaptive 4:3 Projector / Widescreen FOV
    const initialAspect = width / Math.max(1, height);
    const initialFov = calculateAdaptiveFov(initialAspect, 45);
    const camera = new THREE.PerspectiveCamera(initialFov, initialAspect, 0.1, 1000);
    cameraRef.current = camera;
    resetCamera();

    // 3. Renderer (guarded against WebGL context failure)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch (err: any) {
      console.error('[ThreePhysicsCanvas] Failed to initialize WebGLRenderer:', err);
      setWebglError(
        err?.message || '3D WebGL hardware acceleration is unavailable in this browser session.'
      );
      return;
    }

    renderer.domElement.id = 'three-physics-webgl-canvas';
    const isMobileDevice =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024));

    // Software WebGL fallback detector (SwiftShader / llvmpipe / WARP)
    let isSoftwareGl = false;
    try {
      const gl = renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const unmaskedRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      isSoftwareGl = /SwiftShader|llvmpipe|Software Rasterizer|WARP/i.test(unmaskedRenderer);
    } catch {
      isSoftwareGl = false;
    }

    isLowTierDeviceRef.current = isMobileDevice || isSoftwareGl;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure =
      bloomIntensity === 'vibrant'
        ? isCyberpunk
          ? 1.03
          : 0.98
        : bloomIntensity === 'subtle'
          ? isCyberpunk
            ? 1.0
            : 0.98
          : 0.96;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl
        ? Math.min(window.devicePixelRatio || 1, 1.0)
        : isMobileDevice
          ? Math.min(window.devicePixelRatio || 1, 1.2)
          : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = !(isMobileDevice || isSoftwareGl);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Procedural IBL Reflection Map via RoomEnvironment + PMREMGenerator
    let pmrem: THREE.PMREMGenerator | null = null;
    let roomEnv: RoomEnvironment | null = null;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      roomEnv = new RoomEnvironment();
      const envRT = pmrem.fromScene(roomEnv, 0.04);
      pmremEnvRTRef.current = envRT;
      scene.environment = envRT.texture;
      if (sceneBRef.current) {
        sceneBRef.current.environment = envRT.texture;
      }
      roomEnv.dispose();
      pmrem.dispose();
      roomEnv = null;
      pmrem = null;
    } catch (envErr) {
      console.warn('[ThreePhysicsCanvas] PMREM environment fallback:', envErr);
      roomEnv?.dispose();
      pmrem?.dispose();
    }

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Setup Post-Processing EffectComposer & HalfFloat HDR UnrealBloomPass
    try {
      let hdrRenderTarget: THREE.WebGLRenderTarget | undefined;
      try {
        hdrRenderTarget = new THREE.WebGLRenderTarget(width, height, {
          type: THREE.HalfFloatType,
          samples: isMobileDevice || isSoftwareGl ? 0 : 4,
        });
        composerRenderTargetRef.current = hdrRenderTarget;
      } catch {
        hdrRenderTarget = undefined;
        composerRenderTargetRef.current = null;
      }

      const composer = hdrRenderTarget
        ? new EffectComposer(renderer, hdrRenderTarget)
        : new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const isLowTier = isMobileDevice || isSoftwareGl;
      const isDarkEnv = isDark || isCyberpunk || envType === 'space' || (envType === 'lab' && isDark);
      const strength = isLowTier
        ? bloomIntensity === 'vibrant'
          ? 0.30
          : bloomIntensity === 'subtle'
            ? 0.14
            : 0
        : bloomIntensity === 'vibrant'
          ? 0.45
          : bloomIntensity === 'subtle'
            ? 0.22
            : 0;
      const threshold = isDarkEnv
        ? bloomIntensity === 'vibrant'
          ? 0.68
          : 0.84
        : bloomIntensity === 'vibrant'
          ? 0.82
          : 0.94;
      const radius = isLowTier
        ? bloomIntensity === 'vibrant'
          ? 0.24
          : 0.18
        : bloomIntensity === 'vibrant'
          ? 0.36
          : 0.24;

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
      composerRenderTargetRef.current?.dispose();
      composerRenderTargetRef.current = null;
      composerRef.current = null;
      bloomPassRef.current = null;
    }

    // 4. Lights (configured via applyEnvironmentToScene & held in refs)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(20, 32, 20);
    dirLight1.castShadow = !(isMobileDevice || isSoftwareGl);
    const shadowRes = isMobileDevice || isSoftwareGl ? 512 : 1024;
    dirLight1.shadow.mapSize.set(shadowRes, shadowRes);
    dirLight1.shadow.camera.left = -18;
    dirLight1.shadow.camera.right = 18;
    dirLight1.shadow.camera.top = 18;
    dirLight1.shadow.camera.bottom = -18;
    dirLight1.shadow.camera.near = 1;
    dirLight1.shadow.camera.far = 85;
    dirLight1.shadow.bias = -0.0004;
    dirLight1.shadow.normalBias = 0.02;
    scene.add(dirLight1);
    dirLight1Ref.current = dirLight1;

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.75);
    dirLight2.position.set(-20, 12, -20);
    scene.add(dirLight2);
    dirLight2Ref.current = dirLight2;

    const hemiLight = new THREE.HemisphereLight(0x334155, 0x09090c, 0.65);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const accentLight = new THREE.PointLight(0x06b6d4, 0.5, 50);
    accentLight.position.set(0, 10, 15);
    scene.add(accentLight);
    accentLightRef.current = accentLight;

    // Pre-create Starfield (toggled via applyEnvironmentToScene without rebuilding renderer)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    stars.visible = envType === 'space' && !isARMode;
    scene.add(stars);
    starfieldRef.current = stars;

    // 5. Grid and Axes
    const initialBg = applyEnvironmentToScene(
      scene,
      {
        ambient: ambientLight,
        dir1: dirLight1,
        dir2: dirLight2,
        hemi: hemiLight,
        accent: accentLight,
        stars,
      },
      gridHelperRef
    );
    renderer.setClearColor(isARMode ? 0x000000 : initialBg, isARMode ? 0 : 1);

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.visible = showAxes;
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

    // 7. Resize Observer with Adaptive FOV for 4:3 Projectors & Mobile Screens
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w <= 0 || h <= 0) return;

      const aspect = w / h;
      cameraRef.current.aspect = aspect;
      cameraRef.current.fov = calculateAdaptiveFov(aspect, 45);
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setPixelRatio(rendererRef.current.getPixelRatio());
        composerRef.current.setSize(w, h);
      }
      setDetectedAspect(aspect);
      setCanvasHeight(h);
      if (h < 330) {
        setIsTrajectoryHudExpanded(false);
        setIsLegendExpanded(false);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    handleResize();

    // 8. Render Loop with Zero-Allocation Scratch Buffers & FPS Profiler
    const render = (now: number) => {
      animFrameId.current = requestAnimationFrame(render);

      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (delta > 0 && delta < 500) {
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 25) {
          frameTimesRef.current.shift();
        }
      }

      if (now - lastFpsUpdateRef.current > 1200 && frameTimesRef.current.length > 0) {
        const avgDelta =
          frameTimesRef.current.reduce((sum, val) => sum + val, 0) /
          frameTimesRef.current.length;
        const computedFps = Math.min(120, Math.round(1000 / avgDelta));
        setFps(computedFps);
        setFrameTimeMs(parseFloat(avgDelta.toFixed(1)));
        setIsLowFps(computedFps < 30);
        lastFpsUpdateRef.current = now;

        if (adaptivePerformanceRef.current) {
          if (computedFps < 30) {
            if (lowFpsStartTimeRef.current === null) {
              lowFpsStartTimeRef.current = now;
            }
            const sustainedSec = (now - lowFpsStartTimeRef.current) / 1000;
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
          const isSplit = Boolean(isSplitScreenRef.current && sceneBRef.current);
          const dSize = drawBufferSizeRef.current;
          rendererRef.current.getDrawingBufferSize(dSize);
          const fullW = dSize.x;
          const fullH = dSize.y;

          if (isSplit && sceneBRef.current) {
            const halfW = Math.floor(fullW / 2);
            rendererRef.current.setScissorTest(true);

            cameraRef.current.aspect = halfW / Math.max(1, fullH);
            cameraRef.current.updateProjectionMatrix();
            updateDistanceScaledLabels(simRendererRef.current?.getLabelsGroup(), cameraRef.current, {
              refDist: defaultRadius.current,
              orbitRadius: cameraSpherical.current.radius,
              isSplit: true,
            });
            rendererRef.current.setViewport(0, 0, halfW, fullH);
            rendererRef.current.setScissor(0, 0, halfW, fullH);
            rendererRef.current.render(sceneRef.current, cameraRef.current);

            const rightW = fullW - halfW;
            cameraRef.current.aspect = rightW / Math.max(1, fullH);
            cameraRef.current.updateProjectionMatrix();
            updateDistanceScaledLabels(simRendererBRef.current?.getLabelsGroup(), cameraRef.current, {
              refDist: defaultRadius.current,
              orbitRadius: cameraSpherical.current.radius,
              isSplit: true,
            });
            rendererRef.current.setViewport(halfW, 0, rightW, fullH);
            rendererRef.current.setScissor(halfW, 0, rightW, fullH);
            rendererRef.current.render(sceneBRef.current, cameraRef.current);

            rendererRef.current.setScissorTest(false);
          } else {
            cameraRef.current.aspect = fullW / Math.max(1, fullH);
            cameraRef.current.updateProjectionMatrix();
            updateDistanceScaledLabels(simRendererRef.current?.getLabelsGroup(), cameraRef.current, {
              refDist: defaultRadius.current,
              orbitRadius: cameraSpherical.current.radius,
              isSplit: false,
            });
            rendererRef.current.setViewport(0, 0, fullW, fullH);

            if (!isARModeRef.current && composerRef.current && bloomIntensityRef.current !== 'off') {
              composerRef.current.render();
            } else {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
          }

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

    const canvasElement = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('[ThreePhysicsCanvas] WebGL context lost. Preventing default to allow clean GPU restoration...');
      cancelAnimationFrame(animFrameId.current);
    };
    const handleContextRestored = () => {
      console.log('[ThreePhysicsCanvas] WebGL context restored. Resuming render loop...');
      animFrameId.current = requestAnimationFrame(render);
    };
    canvasElement.addEventListener('webglcontextlost', handleContextLost, false);
    canvasElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      canvasElement.removeEventListener('webglcontextlost', handleContextLost);
      canvasElement.removeEventListener('webglcontextrestored', handleContextRestored);
      resizeObserver.disconnect();
      if (simRendererRef.current) {
        simRendererRef.current.cleanup();
        simRendererRef.current = null;
      }
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      if (composerRenderTargetRef.current) {
        composerRenderTargetRef.current.dispose();
        composerRenderTargetRef.current = null;
      }
      bloomPassRef.current = null;
      if (pmremEnvRTRef.current) {
        pmremEnvRTRef.current.dispose();
        pmremEnvRTRef.current = null;
      }
      disposeSceneResources(sceneRef.current);
      sceneRef.current = null;
      ambientLightRef.current = null;
      dirLight1Ref.current = null;
      dirLight2Ref.current = null;
      hemiLightRef.current = null;
      accentLightRef.current = null;
      starfieldRef.current = null;
      gridHelperRef.current = null;
      axesHelperRef.current = null;
      renderer.dispose();
      rendererRef.current = null;
      if (canvasElement && canvasElement.parentNode) {
        canvasElement.parentNode.removeChild(canvasElement);
      }
    };
  }, [simulationType]);

  // Update real-time physics on time/param/theme changes
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
        bloomIntensity,
      });
      simRendererRef.current.setHiddenVectors(hiddenVectorIds);
    }
  }, [params, simTime, showVectors, showLabels, showTrajectory, hiddenVectorIds, isDark, bloomIntensity]);

  // Toggle Grid / Axes
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    if (axesHelperRef.current) axesHelperRef.current.visible = showAxes;
    if (gridHelperBRef.current) gridHelperBRef.current.visible = showGrid;
    if (axesHelperBRef.current) axesHelperBRef.current.visible = showAxes;
  }, [showGrid, showAxes]);

  // Split-Screen Setup B Scene Lifecycle & Lighting
  useEffect(() => {
    if (!isSplitScreen) {
      if (simRendererBRef.current) {
        simRendererBRef.current.cleanup();
        simRendererBRef.current = null;
      }
      if (sceneBRef.current) {
        disposeSceneResources(sceneBRef.current);
        sceneBRef.current = null;
      }
      ambientLightBRef.current = null;
      dirLight1BRef.current = null;
      dirLight2BRef.current = null;
      hemiLightBRef.current = null;
      accentLightBRef.current = null;
      starfieldBRef.current = null;
      gridHelperBRef.current = null;
      axesHelperBRef.current = null;
      return;
    }

    const sceneB = new THREE.Scene();
    if (pmremEnvRTRef.current) {
      sceneB.environment = pmremEnvRTRef.current.texture;
    }

    const isMobileDevice =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    sceneB.add(ambientLight);
    ambientLightBRef.current = ambientLight;

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(20, 32, 20);
    dirLight1.castShadow = !isMobileDevice;
    dirLight1.shadow.mapSize.set(isMobileDevice ? 512 : 1024, isMobileDevice ? 512 : 1024);
    dirLight1.shadow.camera.left = -18;
    dirLight1.shadow.camera.right = 18;
    dirLight1.shadow.camera.top = 18;
    dirLight1.shadow.camera.bottom = -18;
    dirLight1.shadow.camera.near = 1;
    dirLight1.shadow.camera.far = 85;
    dirLight1.shadow.bias = -0.0004;
    dirLight1.shadow.normalBias = 0.02;
    sceneB.add(dirLight1);
    dirLight1BRef.current = dirLight1;

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.75);
    dirLight2.position.set(-20, 12, -20);
    sceneB.add(dirLight2);
    dirLight2BRef.current = dirLight2;

    const hemiLight = new THREE.HemisphereLight(0x334155, 0x09090c, 0.65);
    hemiLight.position.set(0, 50, 0);
    sceneB.add(hemiLight);
    hemiLightBRef.current = hemiLight;

    const accentLight = new THREE.PointLight(0x06b6d4, 0.5, 50);
    accentLight.position.set(0, 10, 15);
    sceneB.add(accentLight);
    accentLightBRef.current = accentLight;

    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    stars.visible = envType === 'space' && !isARMode;
    sceneB.add(stars);
    starfieldBRef.current = stars;

    applyEnvironmentToScene(
      sceneB,
      {
        ambient: ambientLight,
        dir1: dirLight1,
        dir2: dirLight2,
        hemi: hemiLight,
        accent: accentLight,
        stars,
      },
      gridHelperBRef
    );

    const axesHelperB = new THREE.AxesHelper(5);
    axesHelperB.visible = showAxes;
    sceneB.add(axesHelperB);
    axesHelperBRef.current = axesHelperB;

    const simRendererB = new SimulationRenderer(sceneB);
    simRendererBRef.current = simRendererB;
    simRendererB.initSimulation(simulationType, {
      scene: sceneB,
      params: paramsB || params,
      simTime,
      showVectors,
      showLabels,
      showTrajectory,
      showGrid,
      showAxes,
      isDark,
      bloomIntensity,
    });

    sceneBRef.current = sceneB;

    return () => {
      if (simRendererBRef.current) {
        simRendererBRef.current.cleanup();
        simRendererBRef.current = null;
      }
      if (sceneBRef.current) {
        disposeSceneResources(sceneBRef.current);
        sceneBRef.current = null;
      }
      ambientLightBRef.current = null;
      dirLight1BRef.current = null;
      dirLight2BRef.current = null;
      hemiLightBRef.current = null;
      accentLightBRef.current = null;
      starfieldBRef.current = null;
      gridHelperBRef.current = null;
      axesHelperBRef.current = null;
    };
  }, [isSplitScreen, simulationType, disposeSceneResources]);

  // Update Scene B physics on param, time, or theme change
  useEffect(() => {
    if (isSplitScreen && simRendererBRef.current && sceneBRef.current) {
      simRendererBRef.current.update({
        scene: sceneBRef.current,
        params: paramsB || params,
        simTime,
        showVectors,
        showLabels,
        showTrajectory,
        showGrid,
        showAxes,
        isDark,
        bloomIntensity,
      });
      simRendererBRef.current.setHiddenVectors(hiddenVectorIds);
    }
  }, [isSplitScreen, paramsB, simTime, showVectors, showLabels, showTrajectory, hiddenVectorIds, isDark, bloomIntensity]);

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
      const right = panRightVecRef.current.set(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
      const up = panUpVecRef.current.set(0, 1, 0).applyQuaternion(cameraRef.current.quaternion);

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
        const right = panRightVecRef.current.set(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
        const up = panUpVecRef.current.set(0, 1, 0).applyQuaternion(cameraRef.current.quaternion);

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
      className="relative w-full h-full min-h-[260px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0B] select-none shadow-2xl flex flex-col touch-none"
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

      {/* WebGL Context / Hardware Initialization Fallback UI */}
      {webglError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-[#070B14]/96">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/40 bg-[#10131F] p-5 text-center shadow-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-sm font-extrabold text-white">3D WebGL Renderer Unavailable</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{webglError}</p>
            <button
              type="button"
              onClick={() => setWebglError(null)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
            >
              Retry Initialization
            </button>
          </div>
        </div>
      )}

      {/* Unified Top Controls & Telemetry Bar - Integrated in a single responsive row to prevent collisions */}
      {!isFocusMode && (
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none gap-1 sm:gap-2 z-30">
          {/* Left Controls: Stage/AR, Split-Screen, Aspect Ratio, Preset Views */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0 overflow-x-auto max-w-[56%] sm:max-w-[60%] no-scrollbar py-0.5">
            {isARMode ? (
              <div className="px-2 py-1 rounded-lg bg-emerald-950/95 border border-emerald-400/50 text-[10px] sm:text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">AR Live</span>
                <button
                  onClick={() => setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
                  title="Switch Camera (Rear / Front)"
                  className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 ml-0.5 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-[#111114]/95 border border-white/[0.1] text-[10px] sm:text-xs font-semibold text-cyan-400 flex items-center gap-1.5 shadow-md shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>3D Stage</span>
              </div>
            )}

            {/* Split-Screen Side-by-Side Comparison Toggle Button */}
            {onToggleSplitScreen && (
              <button
                type="button"
                onClick={onToggleSplitScreen}
                className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition border shadow-md cursor-pointer shrink-0 ${
                  isSplitScreen
                    ? 'bg-gradient-to-r from-cyan-600/90 to-amber-600/90 text-white border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400/40'
                    : 'bg-[#111114]/95 border-white/[0.1] text-zinc-300 hover:text-cyan-300'
                }`}
                title="Split-Screen Comparison View (C): Render two parameter sets side-by-side on the same canvas with synchronized orbit camera"
                aria-label="Toggle Split-Screen Comparison"
              >
                <Columns className={`w-3.5 h-3.5 ${isSplitScreen ? 'text-cyan-200' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline">Compare</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
                  isSplitScreen ? 'bg-cyan-400 text-black' : 'bg-white/10 text-zinc-400'
                }`}>
                  {isSplitScreen ? 'A vs B' : 'C'}
                </span>
              </button>
            )}

            {/* Screen Aspect Ratio & 4:3 Projector Calibration Badge */}
            <button
              type="button"
              onClick={onToggleProjectorMode}
              className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition border shadow-md cursor-pointer shrink-0 ${
                isProjectorMode || (detectedAspect >= 1.15 && detectedAspect <= 1.48)
                  ? 'bg-amber-950/95 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'bg-[#111114]/95 border-white/[0.1] text-zinc-400 hover:text-zinc-200'
              }`}
              title={`Detected Canvas Ratio: ${detectedAspect.toFixed(2)} (${
                detectedAspect >= 1.15 && detectedAspect <= 1.48
                  ? '4:3 Projector / Classroom display'
                  : detectedAspect > 1.48 && detectedAspect <= 1.68
                  ? '16:10 Projector / Display'
                  : detectedAspect > 1.68
                  ? '16:9 Widescreen monitor'
                  : 'Adaptive viewport'
              }). Adaptive FOV active. Click to toggle 4:3 Projector mode.`}
              aria-label="Toggle Projector Display Mode"
            >
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isProjectorMode || (detectedAspect >= 1.15 && detectedAspect <= 1.48)
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`} />
                <Tv className={`w-3.5 h-3.5 ${isProjectorMode || (detectedAspect >= 1.15 && detectedAspect <= 1.48) ? 'text-amber-400' : 'text-zinc-400'}`} />
              </div>
              <span className="font-mono font-bold">
                {detectedAspect >= 1.15 && detectedAspect <= 1.48 ? '4:3' : detectedAspect >= 1.49 && detectedAspect <= 1.68 ? '16:10' : detectedAspect > 1.68 ? '16:9' : `${detectedAspect.toFixed(1)}`}
              </span>
            </button>

            {/* Perspective Angle Quick Switchers (Visible on md+ screens) */}
            <div className="hidden md:flex items-center gap-0.5 bg-[#111114]/95 p-0.5 rounded-lg border border-white/[0.1] text-[10px] font-bold shrink-0">
              <button
                onClick={() => setCameraPresetView('3d')}
                className="px-1.5 py-0.5 rounded text-zinc-300 hover:text-white hover:bg-white/10 transition"
                title="Isometric 3D Perspective"
              >
                3D
              </button>
              <button
                onClick={() => setCameraPresetView('front')}
                className="px-1.5 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                title="Front View (XY Plane)"
              >
                Front
              </button>
              <button
                onClick={() => setCameraPresetView('top')}
                className="px-1.5 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                title="Top View (XZ Plane)"
              >
                Top
              </button>
            </div>
          </div>

          {/* Center: Live Non-Overlapping FPS & Render Telemetry Pill (hidden on narrow screens to avoid crowding) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#050A1A]/95 border border-cyan-500/40 shadow-md text-xs font-mono pointer-events-auto shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  fps >= 55 ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : fps >= 30 ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-rose-500 animate-ping'
                }`}
              />
              <span className={`font-black ${fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-300' : 'text-rose-400'}`}>
                {fps} FPS
              </span>
            </div>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-300 text-[11px]">{frameTimeMs}ms</span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1 pointer-events-auto bg-[#111114]/95 p-1 rounded-xl border border-white/[0.1] shadow-md shrink-0">
            {/* Bloom Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = bloomIntensity === 'vibrant' ? 'subtle' : bloomIntensity === 'subtle' ? 'off' : 'vibrant';
                onChangeBloom?.(next);
              }}
              className={`p-1.5 rounded-lg text-xs transition ${
                bloomIntensity === 'vibrant'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                  : bloomIntensity === 'subtle'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={`3D Bloom: ${bloomIntensity.toUpperCase()}`}
            >
              {bloomIntensity === 'vibrant' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              {bloomIntensity === 'subtle' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
              {bloomIntensity === 'off' && <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Vectors Toggle */}
            <button
              onClick={onToggleVectors}
              title="Toggle Vectors"
              className={`p-1.5 rounded-lg transition ${showVectors ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>

            {/* Trajectory Toggle */}
            <button
              onClick={onToggleTrajectory}
              title="Toggle Trajectory Path"
              className={`p-1.5 rounded-lg transition ${showTrajectory ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Recenter Camera */}
            <button
              onClick={resetCamera}
              title="Reset Camera View"
              className="p-1.5 text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-1.5 text-zinc-400 hover:text-white transition"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Canvas Labels (Legend) & Trajectory Details Toggles - Hidden in Focus Mode & Split Screen */}
      {!isFocusMode && !isSplitScreen && (
        <div className="absolute top-12 sm:top-14 left-2 sm:left-3 z-20 pointer-events-auto flex items-center gap-2">
          <button
            onClick={onToggleLabels}
            title="Quickly hide or show the descriptive physics parameter labels directly on the canvas"
            aria-label="Toggle Canvas Legend"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border transition-all ${
              showLabels
                ? 'bg-[#2B1F0A]/95 text-amber-300 border-amber-500/40'
                : 'bg-[#111114]/95 text-zinc-400 border-white/[0.1] hover:text-zinc-200 hover:bg-[#1C1C22]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Legend</span>
          </button>

          {simulationType === 'projectile-motion' && showTrajectory && (
            <button
              onClick={() => {
                setIsTrajectoryHudExpanded((prev) => {
                  const next = !prev;
                  if (next) setIsLegendExpanded(false);
                  return next;
                });
              }}
              title="Toggle Trajectory Details & Telemetry Overlay"
              aria-label="Toggle Trajectory Details"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border transition-all ${
                isTrajectoryHudExpanded
                  ? 'bg-[#07291E]/95 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#111114]/95 text-zinc-400 border-white/[0.1] hover:text-zinc-200 hover:bg-[#1C1C22]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trajectory Details</span>
            </button>
          )}
        </div>
      )}

      {/* Projectile Trajectory Flight Analytics & Telemetry HUD - Hidden in Split Screen */}
      {simulationType === 'projectile-motion' && showTrajectory && projectileTrajectoryData && !isSplitScreen && (
        <div
          className={`absolute ${
            isFocusMode
              ? 'top-[7.25rem] sm:top-[6.25rem] lg:top-20 left-2.5 sm:left-4'
              : 'top-[5.5rem] sm:top-[6rem] left-2 sm:left-3'
          } max-w-[calc(100%-24px)] sm:max-w-[340px] pointer-events-auto z-10 select-none`}
        >
          {!isTrajectoryHudExpanded ? (
            /* Micro-Capsule Summary */
            <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-[#0c0d14]/95 hover:bg-[#0c0d14] border border-emerald-500/35 shadow-xl text-xs transition-all">
              <button
                onClick={() => {
                  setIsTrajectoryHudExpanded(true);
                  setIsLegendExpanded(false);
                }}
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
                onClick={() => {
                  setIsTrajectoryHudExpanded(true);
                  setIsLegendExpanded(false);
                }}
                className="p-1 text-zinc-400 hover:text-emerald-300 rounded-lg hover:bg-white/[0.05] transition"
                title="Expand Trajectory Details"
                aria-label="Expand Trajectory Details"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Rich Trajectory Telemetry Card (dynamically height-clamped to canvasHeight to prevent vertical collisions) */
            <div
              style={{ maxHeight: Math.max(130, canvasHeight - (isFocusMode ? 240 : 175)) }}
              className="bg-[#0c0d14]/96 rounded-2xl border border-emerald-500/35 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 text-xs"
            >
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
              <div className="p-3 space-y-2.5 overflow-y-auto custom-scrollbar">
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

      {/* Floating Right Side Zoom Controller (Compatible with Android & Computer) - Hidden in Focus Mode */}
      {!isFocusMode && (
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 max-h-[calc(100%-120px)] overflow-y-auto no-scrollbar flex flex-col items-center gap-1 sm:gap-1.5 bg-[#111114]/95 p-1 sm:p-1.5 rounded-2xl border border-white/[0.12] shadow-2xl z-20 pointer-events-auto">
          {/* Zoom In Button */}
          <button
            onClick={() => handleZoom(0.82)}
            title="Zoom In (or Scroll Up / Pinch Open on Android)"
            aria-label="Zoom In"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#1C1C24] hover:bg-cyan-500/20 text-zinc-200 hover:text-cyan-300 flex items-center justify-center transition active:scale-95 shadow border border-white/[0.06]"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Percentage Badge */}
          <button
            onClick={resetCamera}
            title="Reset Camera Zoom"
            className="px-1 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-zinc-400 hover:text-cyan-300 transition"
          >
            {zoomPercent}%
          </button>

          {/* Zoom Out Button */}
          <button
            onClick={() => handleZoom(1.22)}
            title="Zoom Out (or Scroll Down / Pinch Close on Android)"
            aria-label="Zoom Out"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#1C1C24] hover:bg-cyan-500/20 text-zinc-200 hover:text-cyan-300 flex items-center justify-center transition active:scale-95 shadow border border-white/[0.06]"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="w-4 h-px bg-white/[0.1]"></div>

          {/* Fit / Recenter Button */}
          <button
            onClick={resetCamera}
            title="Recenter Camera & Reset View"
            aria-label="Recenter Camera"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#1C1C24] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 flex items-center justify-center transition active:scale-95 shadow border border-white/[0.06]"
          >
            <Move3d className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Bottom Left Vector Legend HUD (Names & Representation of All Colored Arrows) */}
      {showVectors && currentVectors.length > 0 && (
        <div
          className={`absolute ${
            isFocusMode
              ? 'bottom-[8.25rem] sm:bottom-[8.75rem] left-2.5 sm:left-4'
              : isSplitScreen
                ? 'bottom-[7.5rem] sm:bottom-[8.25rem] left-2 sm:left-3'
                : 'bottom-16 sm:bottom-[4.5rem] left-2 sm:left-3'
          } max-w-[calc(100%-24px)] sm:max-w-xs xl:max-w-sm pointer-events-auto z-10 select-none`}
        >
          {!isLegendExpanded ? (
            /* Compact Collapsed Micro-Capsule (Non-intrusive, never covers 3D models) */
            <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-[#0c0d14]/95 hover:bg-[#0c0d14] border border-white/[0.14] shadow-xl text-xs transition-all">
              <button
                onClick={() => {
                  setIsLegendExpanded(true);
                  setIsTrajectoryHudExpanded(false);
                }}
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
                onClick={() => {
                  setIsLegendExpanded(true);
                  setIsTrajectoryHudExpanded(false);
                }}
                className="p-1 text-zinc-400 hover:text-cyan-300 rounded-lg hover:bg-white/[0.05] transition"
                title="Expand Legend"
                aria-label="Expand Legend"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Sleek Opaque Expanded Legend Card */
            <div className="w-[min(19rem,calc(100vw-24px))] sm:w-80 bg-[#0c0d14]/96 rounded-2xl border border-white/[0.16] shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">
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
              <div
                style={{ maxHeight: Math.max(110, Math.min(208, canvasHeight - (isFocusMode ? 255 : 185))) }}
                className="p-2 sm:p-2.5 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar"
              >
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

      {/* Touch & Navigation Gesture Guide - visible on wide desktop at top right */}
      <div className="hidden 2xl:block absolute top-14 right-3 pointer-events-none z-10">
        <div className="px-2.5 py-1 rounded-lg bg-[#0A0A0B]/95 border border-white/[0.1] text-[10px] text-zinc-400 shadow-md">
          <span className="text-zinc-300 font-semibold">Drag:</span> Orbit &bull;{' '}
          <span className="text-zinc-300 font-semibold">Wheel:</span> Zoom &bull;{' '}
          <span className="text-zinc-300 font-semibold">2-Finger:</span> Pinch
        </div>
      </div>

      {/* Dedicated Non-Overlapping 3D Viewport Playback, Reset & AR Dock */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[calc(100%-24px)] overflow-x-auto py-0.5 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-2xl bg-[#060B18]/96 hover:bg-[#060B18] border border-cyan-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.75)] text-white text-xs">
          {/* Individual Play / Pause Button */}
          {onTogglePlay && (
            <button
              type="button"
              id="btn-sim-play-toggle"
              onClick={onTogglePlay}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer shrink-0 ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25 ring-1 ring-amber-300/50'
                  : 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-cyan-400/25'
              }`}
              title={isPlaying ? 'Pause 3D Simulation (Space)' : 'Run 3D Simulation (Space)'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="font-extrabold text-[11px]">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="font-extrabold text-[11px]">Play</span>
                </>
              )}
            </button>
          )}

          {/* Individual Reset Button */}
          {onReset && (
            <button
              type="button"
              id="btn-sim-reset-toggle"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1 text-[11px] font-semibold active:scale-95 cursor-pointer shrink-0"
              title="Reset Simulation Clock (t = 0s, R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <div className="h-4 w-px bg-white/[0.1] shrink-0" />

          {/* Individual AR View Toggle Button */}
          <button
            type="button"
            id="btn-ar-view-toggle"
            onClick={toggleAR}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-[11px] transition shadow-sm active:scale-95 cursor-pointer shrink-0 ${
              isARMode
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-1 ring-emerald-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
            }`}
            title={isARMode ? 'Exit AR Mode (Camera Overlay)' : 'Enter AR Mode: Project 3D Model into Room'}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isARMode ? 'Exit AR' : 'AR View'}</span>
            {isARMode && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping ml-0.5" />}
          </button>

          {/* Speed Selector (if onChangeSpeed is provided) */}
          {onChangeSpeed && speed !== undefined && (
            <>
              <div className="h-4 w-px bg-white/[0.1] shrink-0 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-0.5 bg-black/40 p-0.5 rounded-xl border border-white/[0.06] shrink-0">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeSpeed(s)}
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                      speed === s
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="h-4 w-px bg-white/[0.1] shrink-0" />

          {/* Reset Camera Center */}
          <button
            type="button"
            onClick={resetCamera}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition cursor-pointer shrink-0"
            title="Center / Reset 3D Camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* In-Viewport Apparatus Calibration Skeleton (When Switching Concepts) */}
      <AnimatePresence>
        {isSceneInitializing && (
          <ViewportApparatusSkeleton
            conceptTitle={conceptTitle || 'Apparatus'}
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
            className={`absolute ${
              isFocusMode || isSplitScreen ? 'bottom-[7.5rem] sm:bottom-[8.5rem]' : 'bottom-16 sm:bottom-[4.5rem]'
            } left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 p-3 rounded-xl bg-[#090E1E]/96 border border-cyan-500/45 shadow-2xl text-white flex items-center justify-between gap-3 pointer-events-auto`}
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
        <div className={`absolute ${isFocusMode ? 'bottom-[8.25rem] sm:bottom-[8.75rem]' : 'bottom-16 sm:bottom-[4.5rem]'} left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 w-full max-w-md text-center`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/90 border border-emerald-400/40 text-emerald-300 text-[11px] font-medium shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>AR Mode: Drag to move apparatus • Pinch/scroll to resize in your room</span>
          </div>
        </div>
      )}

      {/* AR Camera Loading Spinner */}
      {isARMode && cameraLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#111114] border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-2xl">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Connecting Device Camera Stream...</span>
          </div>
        </div>
      )}

      {/* AR Camera Error Notice */}
      {isARMode && cameraError && (
        <div className="absolute top-16 left-3 right-3 sm:left-6 sm:right-6 z-40 p-3 rounded-xl bg-rose-950/95 border border-rose-500/40 text-white shadow-2xl flex items-start gap-3 pointer-events-auto">
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

      {/* Split-Screen Canvas Overlays: Center Divider & Synchronized Viewport Badges */}
      {isSplitScreen && (
        <>
          {/* Vertical Center Scissor Divider Line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-cyan-500/80 via-white/50 to-amber-500/80 shadow-[0_0_12px_rgba(0,240,255,0.4)] pointer-events-none z-20" />

          {/* Mobile Split-Screen Clean Unified Header (Under 768px - Never overlaps with center divider or badges) */}
          <div className="md:hidden absolute top-12 left-2 right-2 z-20 pointer-events-auto flex items-center justify-between gap-1 p-1 rounded-xl bg-[#070B14]/96 border border-white/20 shadow-xl text-xs">
            <button
              type="button"
              onClick={() => onSelectCompareTarget?.('A')}
              className={`flex-1 px-2 py-1 rounded-lg transition flex items-center justify-center gap-1 min-w-0 ${
                activeCompareTarget === 'A'
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'text-cyan-400/80 hover:bg-cyan-500/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="truncate">Set A</span>
              {activeCompareTarget === 'A' && <Check className="w-3 h-3 text-cyan-300 stroke-[3] shrink-0" />}
            </button>

            <div className="flex items-center gap-0.5 shrink-0 px-1 border-x border-white/10">
              {onSwapAB && (
                <button
                  type="button"
                  onClick={onSwapAB}
                  className="p-1 rounded text-zinc-300 hover:text-white hover:bg-white/15 transition active:scale-95"
                  title="Swap Setup A ⇄ Setup B"
                  aria-label="Swap Setup A and B"
                >
                  <ArrowLeftRight className="w-3 h-3 text-amber-400" />
                </button>
              )}
              {onCopyAtoB && (
                <button
                  type="button"
                  onClick={onCopyAtoB}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-95 flex items-center gap-0.5"
                  title="Copy Setup A parameters to Setup B"
                >
                  <Copy className="w-2.5 h-2.5 text-cyan-400" />
                  <span>A→B</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectCompareTarget?.('B')}
              className={`flex-1 px-2 py-1 rounded-lg transition flex items-center justify-center gap-1 min-w-0 ${
                activeCompareTarget === 'B'
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'text-amber-400/80 hover:bg-amber-500/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">Set B</span>
              {activeCompareTarget === 'B' && <Check className="w-3 h-3 text-amber-300 stroke-[3] shrink-0" />}
            </button>
          </div>

          {/* Desktop & Tablet Center Scissor Action Pill (Visible on md+ screens) */}
          <div className="hidden md:flex absolute top-14 left-1/2 -translate-x-1/2 pointer-events-auto items-center gap-1.5 p-1 rounded-full bg-[#070B14]/96 border border-white/20 shadow-2xl z-20">
            <button
              type="button"
              onClick={() => onSelectCompareTarget?.('A')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
                activeCompareTarget === 'A'
                  ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                  : 'text-cyan-300 hover:bg-cyan-500/20'
              }`}
              title="Select Setup A to adjust parameters"
            >
              <span>Set A</span>
              {activeCompareTarget === 'A' && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            {onSwapAB && (
              <button
                type="button"
                onClick={onSwapAB}
                className="p-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/15 transition active:scale-95"
                title="Swap Setup A ⇄ Setup B"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onCopyAtoB && (
              <button
                type="button"
                onClick={onCopyAtoB}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-95 flex items-center gap-1"
                title="Copy Setup A parameters to Setup B"
              >
                <Copy className="w-2.5 h-2.5" />
                <span>A→B</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectCompareTarget?.('B')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
                activeCompareTarget === 'B'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  : 'text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Select Setup B to adjust parameters"
            >
              <span>Set B</span>
              {activeCompareTarget === 'B' && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          </div>

          {/* Viewport A Header Badge (Left - Visible on md+ screens with constrained width) */}
          <div className="hidden md:block absolute top-12 sm:top-14 left-2 sm:left-3 z-20 pointer-events-auto max-w-[180px]">
            <button
              type="button"
              onClick={() => onSelectCompareTarget?.('A')}
              className={`w-full px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-left transition shadow-md ${
                activeCompareTarget === 'A'
                  ? 'bg-cyan-950/96 border-cyan-400 text-cyan-200 shadow-[0_0_14px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400'
                  : 'bg-[#080E1C]/94 border-cyan-500/35 text-cyan-400 hover:border-cyan-400/60'
              }`}
              title="Click to edit Parameter Set A"
            >
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>SET A</span>
                {activeCompareTarget === 'A' && (
                  <span className="px-1 py-0.2 rounded text-[8px] bg-cyan-400/20 text-cyan-300 uppercase font-mono">
                    Active
                  </span>
                )}
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                {simulationType === 'projectile-motion' && (
                  <span>θ={params.theta ?? 45}°, u={params.u ?? 20}m/s</span>
                )}
                {simulationType === 'lcr-circuit' && (
                  <span>f={params.f ?? 159}Hz, R={params.R ?? 10}Ω</span>
                )}
                {simulationType === 'youngs-double-slit' && (
                  <span>λ={params.wavelength ?? 550}nm</span>
                )}
                {((simulationType as string) === 'shm-spring-pendulum' || (simulationType as string) === 'simple-pendulum') && (
                  <span>L={params.length ?? 2.0}m, θ={params.angle ?? 30}°</span>
                )}
              </div>
            </button>
          </div>

          {/* Viewport B Header Badge (Right - Visible on md+ screens with constrained width) */}
          <div className="hidden md:block absolute top-12 sm:top-14 right-2 sm:right-3 z-20 pointer-events-auto max-w-[180px]">
            <button
              type="button"
              onClick={() => onSelectCompareTarget?.('B')}
              className={`w-full px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-left transition shadow-md ${
                activeCompareTarget === 'B'
                  ? 'bg-amber-950/96 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                  : 'bg-[#18110A]/94 border-amber-500/35 text-amber-400 hover:border-amber-400/60'
              }`}
              title="Click to edit Parameter Set B"
            >
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>SET B</span>
                {activeCompareTarget === 'B' && (
                  <span className="px-1 py-0.2 rounded text-[8px] bg-amber-400/20 text-amber-300 uppercase font-mono">
                    Active
                  </span>
                )}
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                {simulationType === 'projectile-motion' && (
                  <span>θ={paramsB?.theta ?? 60}°, u={paramsB?.u ?? 20}m/s</span>
                )}
                {simulationType === 'lcr-circuit' && (
                  <span>f={paramsB?.f ?? 318}Hz, R={paramsB?.R ?? 10}Ω</span>
                )}
                {simulationType === 'youngs-double-slit' && (
                  <span>λ={paramsB?.wavelength ?? 400}nm</span>
                )}
                {((simulationType as string) === 'shm-spring-pendulum' || (simulationType as string) === 'simple-pendulum') && (
                  <span>L={paramsB?.length ?? 4.0}m, θ={paramsB?.angle ?? 30}°</span>
                )}
              </div>
            </button>
          </div>

          {/* Live Comparative Delta Telemetry Strip at Bottom (elevated cleanly above bottom playback bar) */}
          <div className={`absolute ${isFocusMode ? 'bottom-[7.75rem] sm:bottom-[8.25rem]' : 'bottom-[3.75rem] sm:bottom-[4.25rem]'} left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl z-20 pointer-events-auto`}>
            <div className="p-1 sm:p-2 rounded-xl bg-[#070B14]/96 border border-white/15 shadow-xl flex items-center justify-between gap-1.5 sm:gap-3 text-[10px] sm:text-[11px] overflow-hidden">
              {/* Setup A Summary */}
              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[10px] sm:text-[11px] font-mono shrink min-w-0">
                <span className="font-bold text-cyan-400 font-sans shrink-0">A:</span>
                {projectileTrajectoryData ? (
                  <span className="truncate">R=<b>{projectileTrajectoryData.range.toFixed(1)}m</b>, H=<b>{projectileTrajectoryData.maxH.toFixed(1)}m</b></span>
                ) : (
                  <span className="truncate">{Object.entries(params).slice(0, 2).map(([k, v]) => `${k}=${v}`).join(', ')}</span>
                )}
              </div>

              {/* Comparative Delta Strip (Set B - Set A) */}
              {projectileTrajectoryData && projectileTrajectoryDataB ? (
                <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-white font-mono text-[9.5px] sm:text-[11px] shrink-0">
                  <span className="text-zinc-400 font-sans font-bold text-[9px] hidden sm:inline">Δ(B-A):</span>
                  <span className={projectileTrajectoryDataB.range - projectileTrajectoryData.range >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    ΔR: {(projectileTrajectoryDataB.range - projectileTrajectoryData.range >= 0 ? '+' : '')}
                    {(projectileTrajectoryDataB.range - projectileTrajectoryData.range).toFixed(1)}m
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className={projectileTrajectoryDataB.maxH - projectileTrajectoryData.maxH >= 0 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                    ΔH: {(projectileTrajectoryDataB.maxH - projectileTrajectoryData.maxH >= 0 ? '+' : '')}
                    {(projectileTrajectoryDataB.maxH - projectileTrajectoryData.maxH).toFixed(1)}m
                  </span>
                  <span className="text-zinc-600 hidden xs:inline">•</span>
                  <span className={`hidden xs:inline ${projectileTrajectoryDataB.T - projectileTrajectoryData.T >= 0 ? 'text-indigo-400 font-bold' : 'text-orange-400 font-bold'}`}>
                    ΔT: {(projectileTrajectoryDataB.T - projectileTrajectoryData.T >= 0 ? '+' : '')}
                    {(projectileTrajectoryDataB.T - projectileTrajectoryData.T).toFixed(2)}s
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300 font-mono text-[10px] shrink-0">
                  <span>Synchronized A vs B</span>
                </div>
              )}

              {/* Setup B Summary */}
              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[10px] sm:text-[11px] font-mono shrink min-w-0 justify-end">
                <span className="font-bold text-amber-400 font-sans shrink-0">B:</span>
                {projectileTrajectoryDataB ? (
                  <span className="truncate">R=<b>{projectileTrajectoryDataB.range.toFixed(1)}m</b>, H=<b>{projectileTrajectoryDataB.maxH.toFixed(1)}m</b></span>
                ) : (
                  <span className="truncate">{paramsB && Object.entries(paramsB).slice(0, 2).map(([k, v]) => `${k}=${v}`).join(', ')}</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
