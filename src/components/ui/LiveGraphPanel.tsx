import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { GraphConfig } from '../../types';
import { LineChart, Info, Activity, Maximize2, Zap, Crosshair } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LiveGraphPanelProps {
  graphConfigs: GraphConfig[];
  params: Record<string, number>;
  simTime: number;
}

interface HoveredData {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
}

export const LiveGraphPanel: React.FC<LiveGraphPanelProps> = ({
  graphConfigs,
  params,
  simTime,
}) => {
  const { isDark } = useTheme();
  const [selectedGraphId, setSelectedGraphId] = useState<string>(
    graphConfigs[0]?.id || ''
  );
  const [hoveredPoint, setHoveredPoint] = useState<HoveredData | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 240 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeConfig =
    graphConfigs.find((g) => g.id === selectedGraphId) || graphConfigs[0];

  useEffect(() => {
    if (!activeConfig && graphConfigs.length > 0) {
      setSelectedGraphId(graphConfigs[0].id);
    }
  }, [graphConfigs, activeConfig]);

  // Track container size for responsive, crisp Hi-DPI canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 50) {
        setContainerSize({
          width: Math.floor(rect.width),
          height: Math.floor(Math.max(220, Math.min(260, rect.width * 0.42))),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute curve points
  const points = useMemo(() => {
    if (!activeConfig) return [];
    try {
      return activeConfig.calc(params, simTime) || [];
    } catch {
      return [];
    }
  }, [activeConfig, params, simTime]);

  // Compute accurate analytical statistics
  const analyticsStats = useMemo(() => {
    if (!points || points.length === 0) {
      return { current: 0, peak: 0, min: 0, avg: 0, peakX: 0 };
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let peakX = points[0].x;

    points.forEach((p) => {
      if (p.y < min) min = p.y;
      if (p.y > max) {
        max = p.y;
        peakX = p.x;
      }
      sum += p.y;
    });

    const avg = sum / points.length;

    // Current point based on simTime
    let current = points[points.length - 1]?.y ?? 0;
    if (activeConfig?.type === 'time-series') {
      const maxX = Math.max(...points.map((p) => p.x));
      const minX = Math.min(...points.map((p) => p.x));
      const curX = simTime % (maxX || 1);
      const curPt = points.find(
        (p) => Math.abs(p.x - curX) <= (maxX - minX) / points.length
      );
      if (curPt) current = curPt.y;
    }

    return { current, peak: max, min, avg, peakX };
  }, [points, activeConfig, simTime]);

  // Draw Graph on Canvas with High-DPI and Interactive Crosshairs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeConfig || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = containerSize.width;
    const height = containerSize.height;

    // Set high-res buffer
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Calculate logical bounding box
    let rawMinX = Infinity;
    let rawMaxX = -Infinity;
    let rawMinY = Infinity;
    let rawMaxY = -Infinity;

    points.forEach((p) => {
      if (p.x < rawMinX) rawMinX = p.x;
      if (p.x > rawMaxX) rawMaxX = p.x;
      if (p.y < rawMinY) rawMinY = p.y;
      if (p.y > rawMaxY) rawMaxY = p.y;
    });

    if (rawMinX === rawMaxX) {
      rawMinX -= 1;
      rawMaxX += 1;
    }
    if (rawMinY === rawMaxY) {
      rawMinY -= 1;
      rawMaxY += 1;
    }

    // Logical physical anchoring:
    // If all values are non-negative (e.g. Energy, Height, Time, Speed), anchor bottom cleanly near 0
    let minY = rawMinY;
    let maxY = rawMaxY;
    const ySpan = rawMaxY - rawMinY || 1;

    if (rawMinY >= 0) {
      minY = Math.max(0, rawMinY - ySpan * 0.05);
      maxY = rawMaxY + ySpan * 0.12;
    } else if (rawMaxY <= 0) {
      minY = rawMinY - ySpan * 0.12;
      maxY = Math.min(0, rawMaxY + ySpan * 0.05);
    } else {
      // Crosses zero (e.g. displacement, velocity)
      minY = rawMinY - ySpan * 0.1;
      maxY = rawMaxY + ySpan * 0.1;
    }

    let minX = rawMinX;
    let maxX = rawMaxX;
    if (rawMinX >= 0) {
      minX = Math.max(0, rawMinX);
      maxX = rawMaxX + (rawMaxX - rawMinX) * 0.04;
    }

    const padding = { top: 28, right: 28, bottom: 38, left: 54 };
    const graphWidth = Math.max(10, width - padding.left - padding.right);
    const graphHeight = Math.max(10, height - padding.top - padding.bottom);

    const toCanvasX = (x: number) =>
      padding.left + ((x - minX) / (maxX - minX)) * graphWidth;
    const toCanvasY = (y: number) =>
      height - padding.bottom - ((y - minY) / (maxY - minY)) * graphHeight;

    // 1. Subtle Oscilloscope Grid lines
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const xTicks = width < 420 ? 4 : 6;
    for (let i = 0; i <= xTicks; i++) {
      const val = minX + (i / xTicks) * (maxX - minX);
      const cx = toCanvasX(val);

      ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(203, 213, 225, 0.8)';
      ctx.beginPath();
      ctx.moveTo(cx, padding.top);
      ctx.lineTo(cx, height - padding.bottom);
      ctx.stroke();

      // Tick Label
      ctx.fillStyle = isDark ? '#71717a' : '#64748b';
      ctx.font = '10px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        val >= 100 ? val.toFixed(0) : val >= 10 ? val.toFixed(1) : val.toFixed(2),
        cx,
        height - padding.bottom + 16
      );
    }

    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = minY + (i / yTicks) * (maxY - minY);
      const cy = toCanvasY(val);

      ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(203, 213, 225, 0.8)';
      ctx.beginPath();
      ctx.moveTo(padding.left, cy);
      ctx.lineTo(width - padding.right, cy);
      ctx.stroke();

      // Tick Label
      ctx.fillStyle = isDark ? '#71717a' : '#64748b';
      ctx.font = '10px "Fira Code", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        Math.abs(val) >= 100 ? val.toFixed(0) : Math.abs(val) >= 10 ? val.toFixed(1) : val.toFixed(2),
        padding.left - 8,
        cy + 3
      );
    }
    ctx.setLineDash([]);

    // 2. Zero baseline highlight if within domain
    if (minY <= 0 && maxY >= 0) {
      const zeroY = toCanvasY(0);
      ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(14, 165, 233, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(width - padding.right, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Axes Borders
    ctx.strokeStyle = isDark ? 'rgba(161, 161, 170, 0.4)' : 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // 4. Gradient Fill under curve
    const mainColor = activeConfig.color || (isDark ? '#06b6d4' : '#0284c7');
    const areaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    areaGrad.addColorStop(0, `${mainColor}40`);
    areaGrad.addColorStop(0.7, `${mainColor}12`);
    areaGrad.addColorStop(1, isDark ? 'rgba(6, 182, 212, 0)' : 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.lineTo(toCanvasX(points[points.length - 1].x), height - padding.bottom);
    ctx.lineTo(toCanvasX(points[0].x), height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // 5. Data Curve Line with Neon Glow
    ctx.save();
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = isDark ? 8 : 4;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    points.forEach((p, idx) => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.restore();

    // 6. Current Simulation Tracer Marker
    if (activeConfig.type === 'time-series') {
      const curX = simTime % (maxX || 1);
      const curPt =
        points.find(
          (p) => Math.abs(p.x - curX) <= (maxX - minX) / points.length
        ) || points[0];

      if (curPt) {
        const cx = toCanvasX(curPt.x);
        const cy = toCanvasY(curPt.y);

        // Outer pulsing wave
        ctx.strokeStyle = `${mainColor}66`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    }

    // 7. Interactive Hover Crosshair & Reticle
    if (hoveredPoint) {
      const hx = hoveredPoint.canvasX;
      const hy = hoveredPoint.canvasY;

      // Vertical guideline
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(hx, padding.top);
      ctx.lineTo(hx, height - padding.bottom);
      ctx.stroke();

      // Horizontal guideline
      ctx.beginPath();
      ctx.moveTo(padding.left, hy);
      ctx.lineTo(width - padding.right, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point reticle ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [
    activeConfig,
    points,
    params,
    simTime,
    isDark,
    containerSize,
    hoveredPoint,
  ]);

  // Handle pointer tracking on canvas
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !activeConfig || points.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const width = containerSize.width;
      const height = containerSize.height;
      const padding = { top: 28, right: 28, bottom: 38, left: 54 };
      const graphWidth = Math.max(10, width - padding.left - padding.right);
      const graphHeight = Math.max(10, height - padding.top - padding.bottom);

      if (
        clientX < padding.left ||
        clientX > width - padding.right ||
        clientY < padding.top ||
        clientY > height - padding.bottom
      ) {
        setHoveredPoint(null);
        return;
      }

      // Find domain bounds
      let minX = Math.min(...points.map((p) => p.x));
      let maxX = Math.max(...points.map((p) => p.x));
      if (minX >= 0) {
        minX = 0;
        maxX += maxX * 0.04;
      }

      let minY = Math.min(...points.map((p) => p.y));
      let maxY = Math.max(...points.map((p) => p.y));
      const ySpan = maxY - minY || 1;
      if (minY >= 0) {
        minY = Math.max(0, minY - ySpan * 0.05);
        maxY += ySpan * 0.12;
      } else if (maxY <= 0) {
        minY -= ySpan * 0.12;
        maxY = Math.min(0, maxY + ySpan * 0.05);
      } else {
        minY -= ySpan * 0.1;
        maxY += ySpan * 0.1;
      }

      // Invert clientX to data X
      const targetX = minX + ((clientX - padding.left) / graphWidth) * (maxX - minX);

      // Find closest point by x
      let closest = points[0];
      let minDist = Math.abs(points[0].x - targetX);

      for (let i = 1; i < points.length; i++) {
        const d = Math.abs(points[i].x - targetX);
        if (d < minDist) {
          minDist = d;
          closest = points[i];
        }
      }

      const canvasX = padding.left + ((closest.x - minX) / (maxX - minX)) * graphWidth;
      const canvasY = height - padding.bottom - ((closest.y - minY) / (maxY - minY)) * graphHeight;

      setHoveredPoint({
        x: closest.x,
        y: closest.y,
        canvasX,
        canvasY,
      });
    },
    [activeConfig, points, containerSize]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  if (!graphConfigs || graphConfigs.length === 0) {
    return (
      <div
        className={`rounded-2xl p-5 border text-center text-sm transition-colors ${
          isDark
            ? 'bg-[#111114]/90 border-white/[0.08] text-zinc-500'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <Info className="w-5 h-5 mx-auto mb-2 opacity-50" />
        No dynamic graph needed for this experimental setup.
      </div>
    );
  }

  return (
    <div
      className={`relative backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-xl flex flex-col gap-3.5 transition-all overflow-hidden anim-graph-glow ${
        isDark
          ? 'bg-[#0B0D15]/95 border-cyan-500/30 shadow-cyan-950/20'
          : 'bg-white/95 border-slate-200 shadow-slate-200'
      }`}
    >
      {/* Background Cyber-Oscilloscope Scan Beam */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent anim-graph-oscilloscope pointer-events-none" />

      {/* Header and Graph Tabs */}
      <div
        className={`relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}
      >
        <div
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-cyan-400' : 'text-slate-800'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <LineChart className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_#22d3ee]" />
          <span>Real-Time Physics Analytical Telemetry</span>
        </div>

        {graphConfigs.length > 1 && (
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto no-scrollbar ${
              isDark
                ? 'bg-[#07080E] border-white/[0.08]'
                : 'bg-slate-100 border-slate-300'
            }`}
          >
            {graphConfigs.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGraphId(g.id);
                  setHoveredPoint(null);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition min-h-[30px] whitespace-nowrap ${
                  selectedGraphId === g.id
                    ? isDark
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-white text-cyan-800 border border-cyan-300 shadow-xs font-bold'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g.title.split('(')[0].trim()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Accurate Real-Time Analytics Metrics Strip */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          className={`p-2 rounded-xl border flex flex-col gap-0.5 ${
            isDark
              ? 'bg-[#0E111C] border-cyan-500/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Live Value
          </span>
          <div className="text-sm sm:text-base font-black text-cyan-300 font-mono">
            {analyticsStats.current.toFixed(2)}{' '}
            <span className="text-[10px] text-zinc-400 font-normal">
              {activeConfig?.yUnit}
            </span>
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border flex flex-col gap-0.5 ${
            isDark
              ? 'bg-[#0E111C] border-emerald-500/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-emerald-400" />
            Peak (Max)
          </span>
          <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
            {analyticsStats.peak.toFixed(2)}{' '}
            <span className="text-[10px] text-zinc-400 font-normal">
              {activeConfig?.yUnit}
            </span>
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border flex flex-col gap-0.5 ${
            isDark
              ? 'bg-[#0E111C] border-indigo-500/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-indigo-400" />
            Minimum
          </span>
          <div className="text-sm sm:text-base font-black text-indigo-300 font-mono">
            {analyticsStats.min.toFixed(2)}{' '}
            <span className="text-[10px] text-zinc-400 font-normal">
              {activeConfig?.yUnit}
            </span>
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border flex flex-col gap-0.5 ${
            isDark
              ? 'bg-[#0E111C] border-purple-500/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-purple-400" />
            Mean Avg
          </span>
          <div className="text-sm sm:text-base font-black text-purple-300 font-mono">
            {analyticsStats.avg.toFixed(2)}{' '}
            <span className="text-[10px] text-zinc-400 font-normal">
              {activeConfig?.yUnit}
            </span>
          </div>
        </div>
      </div>

      {/* Main High-Res Canvas Viewport */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-xl border overflow-hidden flex items-center justify-center transition-colors cursor-crosshair cyber-graph-grid ${
          isDark
            ? 'bg-[#05060A] border-cyan-500/25 shadow-inner'
            : 'bg-slate-50 border-slate-200'
        }`}
        style={{ height: `${containerSize.height}px` }}
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full block touch-none"
        />

        {/* Floating Axis Labels */}
        <div
          className={`absolute top-2 left-3 px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-wider pointer-events-none backdrop-blur-xs ${
            isDark
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
              : 'bg-white/80 text-slate-700 border border-slate-300'
          }`}
        >
          {activeConfig?.yLabel}{' '}
          <span className="text-zinc-400 font-mono">({activeConfig?.yUnit})</span>
        </div>

        <div
          className={`absolute bottom-2 right-3 px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-wider pointer-events-none backdrop-blur-xs ${
            isDark
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
              : 'bg-white/80 text-slate-700 border border-slate-300'
          }`}
        >
          {activeConfig?.xLabel}{' '}
          <span className="text-zinc-400 font-mono">({activeConfig?.xUnit})</span>
        </div>

        {/* Interactive Floating Tooltip HUD on Hover */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-75"
            style={{
              left: `${Math.min(
                containerSize.width - 160,
                Math.max(10, hoveredPoint.canvasX - 75)
              )}px`,
              top: `${Math.max(8, hoveredPoint.canvasY - 55)}px`,
            }}
          >
            <div className="bg-[#090C16]/95 border border-cyan-400/60 rounded-xl px-2.5 py-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md text-[11px] text-zinc-100 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{activeConfig?.yLabel}:</span>
                <span className="text-white">{hoveredPoint.y.toFixed(2)} {activeConfig?.yUnit}</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                <span>{activeConfig?.xLabel}:</span> {hoveredPoint.x.toFixed(2)} {activeConfig?.xUnit}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
