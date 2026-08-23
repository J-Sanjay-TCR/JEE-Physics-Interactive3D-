import React, { useRef, useEffect, useState } from 'react';
import { GraphConfig } from '../../types';
import { LineChart, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LiveGraphPanelProps {
  graphConfigs: GraphConfig[];
  params: Record<string, number>;
  simTime: number;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeConfig =
    graphConfigs.find((g) => g.id === selectedGraphId) || graphConfigs[0];

  useEffect(() => {
    if (!activeConfig && graphConfigs.length > 0) {
      setSelectedGraphId(graphConfigs[0].id);
    }
  }, [graphConfigs]);

  // Draw Graph on Canvas
  useEffect(() => {
    if (!canvasRef.current || !activeConfig) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const points = activeConfig.calc(params, simTime);
    if (!points || points.length === 0) return;

    // Calculate bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    if (minX === maxX) {
      minX -= 1;
      maxX += 1;
    }
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    // Add padding
    const ySpan = maxY - minY || 1;
    minY -= ySpan * 0.1;
    maxY += ySpan * 0.1;

    const padding = { top: 25, right: 30, bottom: 40, left: 55 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const toCanvasX = (x: number) =>
      padding.left + ((x - minX) / (maxX - minX)) * graphWidth;
    const toCanvasY = (y: number) =>
      height - padding.bottom - ((y - minY) / (maxY - minY)) * graphHeight;

    // 1. Grid lines
    ctx.strokeStyle = isDark ? 'rgba(63, 63, 78, 0.4)' : 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const val = minX + (i / xTicks) * (maxX - minX);
      const cx = toCanvasX(val);
      ctx.beginPath();
      ctx.moveTo(cx, padding.top);
      ctx.lineTo(cx, height - padding.bottom);
      ctx.stroke();

      // Label
      ctx.fillStyle = isDark ? '#71717a' : '#64748b';
      ctx.font = '10px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(val.toFixed(1), cx, height - padding.bottom + 16);
    }

    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = minY + (i / yTicks) * (maxY - minY);
      const cy = toCanvasY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, cy);
      ctx.lineTo(width - padding.right, cy);
      ctx.stroke();

      // Label
      ctx.fillStyle = isDark ? '#71717a' : '#64748b';
      ctx.font = '10px "Fira Code", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(1), padding.left - 8, cy + 3);
    }
    ctx.setLineDash([]);

    // 2. Axes
    ctx.strokeStyle = isDark ? 'rgba(161, 161, 170, 0.5)' : 'rgba(100, 116, 139, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // 3. Data Curve
    ctx.strokeStyle = activeConfig.color || (isDark ? '#38bdf8' : '#0284c7');
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    points.forEach((p, idx) => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Fill under curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, `${activeConfig.color || (isDark ? '#38bdf8' : '#0284c7')}33`);
    gradient.addColorStop(1, isDark ? 'rgba(10, 10, 14, 0)' : 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.lineTo(toCanvasX(points[points.length - 1].x), height - padding.bottom);
    ctx.lineTo(toCanvasX(points[0].x), height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Current point highlight if time series
    if (activeConfig.type === 'time-series') {
      const curX = simTime % (maxX || 1);
      const curPt = points.find((p) => Math.abs(p.x - curX) < (maxX - minX) / points.length) || points[0];
      if (curPt) {
        const cx = toCanvasX(curPt.x);
        const cy = toCanvasY(curPt.y);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [activeConfig, params, simTime, isDark]);

  if (!graphConfigs || graphConfigs.length === 0) {
    return (
      <div className={`rounded-2xl p-5 border text-center text-sm transition-colors ${
        isDark ? 'bg-[#111114]/90 border-white/[0.08] text-zinc-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <Info className="w-5 h-5 mx-auto mb-2 opacity-50" />
        No dynamic graph needed for this experimental setup.
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-xl flex flex-col gap-4 transition-colors ${
      isDark ? 'bg-[#111114]/90 border-white/[0.08]' : 'bg-white/95 border-slate-200 shadow-slate-200'
    }`}>
      {/* Header and Graph Tabs */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200'
      }`}>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
          isDark ? 'text-zinc-300' : 'text-slate-700'
        }`}>
          <LineChart className="w-4 h-4 text-cyan-500" />
          <span>Real-Time Analytical Graphs</span>
        </div>

        {graphConfigs.length > 1 && (
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            isDark ? 'bg-[#0A0A0E] border-white/[0.08]' : 'bg-slate-100 border-slate-300'
          }`}>
            {graphConfigs.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGraphId(g.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-h-[32px] ${
                  selectedGraphId === g.id
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
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

      {/* Main Canvas Viewport */}
      <div className={`relative w-full h-52 sm:h-56 rounded-xl border overflow-hidden flex items-center justify-center transition-colors ${
        isDark ? 'bg-[#0A0A0E] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
      }`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          className="w-full h-full"
        />

        {/* Floating Axis Labels */}
        <div className={`absolute top-2 left-3 text-[11px] font-semibold ${
          isDark ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          {activeConfig?.yLabel} ({activeConfig?.yUnit})
        </div>
        <div className={`absolute bottom-1 right-3 text-[11px] font-semibold ${
          isDark ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          {activeConfig?.xLabel} ({activeConfig?.xUnit})
        </div>
      </div>
    </div>
  );
};
