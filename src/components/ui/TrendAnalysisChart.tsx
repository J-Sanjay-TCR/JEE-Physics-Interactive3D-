import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { fetchWeightageData, WeightageDataPoint } from '../../utils/jeeWeightageApi';
import { Loader2, TrendingUp, Sparkles, BarChart2, LineChart, Info } from 'lucide-react';

interface TrendAnalysisChartProps {
  conceptTitle: string;
}

export const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({ conceptTitle }) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<WeightageDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<'both' | 'main' | 'advanced'>('both');
  const [yearRange, setYearRange] = useState<[number, number]>([2014, 2026]);
  const [chartMode, setChartMode] = useState<'spline' | 'bars'>('spline');
  const [dimensions, setDimensions] = useState({ width: 0, height: 260 });
  const [hoveredPoint, setHoveredPoint] = useState<WeightageDataPoint | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchWeightageData(conceptTitle).then((fetchedData) => {
      if (isMounted) {
        setData(fetchedData);
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [conceptTitle]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions((prev) => ({ ...prev, width: entries[0].contentRect.width }));
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]);
  }, [data, yearRange]);

  // Accurate summary metrics & trend trajectory calculation based strictly on filteredData
  const metrics = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgMain: '0',
        avgAdv: '0',
        avgMainQs: '0',
        avgAdvQs: '0',
        trendLabel: 'Awaiting Data',
        trendColor: 'text-zinc-400',
        peakYear: 2024,
        peakVal: 0,
      };
    }

    const totalMain = filteredData.reduce((acc, d) => acc + d.main, 0);
    const totalAdv = filteredData.reduce((acc, d) => acc + d.advanced, 0);
    const totalMainQs = filteredData.reduce((acc, d) => acc + (d.mainQuestions || 0), 0);
    const totalAdvQs = filteredData.reduce((acc, d) => acc + (d.advQuestions || 0), 0);

    const avgMain = (totalMain / filteredData.length).toFixed(1);
    const avgAdv = (totalAdv / filteredData.length).toFixed(1);
    const avgMainQs = (totalMainQs / filteredData.length).toFixed(1);
    const avgAdvQs = (totalAdvQs / filteredData.length).toFixed(1);

    // Peak Year detection
    let peakYear = filteredData[0].year;
    let peakVal = filteredData[0].main;
    filteredData.forEach((d) => {
      const v = Math.max(d.main, d.advanced);
      if (v > peakVal) {
        peakVal = v;
        peakYear = d.year;
      }
    });

    // Recent 4-year linear regression slope for Trend Direction
    let trendLabel = 'Stable Core Yield';
    let trendColor = 'text-cyan-400';

    if (filteredData.length >= 3) {
      const recent = filteredData.slice(-4);
      const n = recent.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      recent.forEach((pt, i) => {
        const xVal = i;
        const yVal = difficulty === 'advanced' ? pt.advanced : pt.main;
        sumX += xVal;
        sumY += yVal;
        sumXY += xVal * yVal;
        sumXX += xVal * xVal;
      });
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);

      if (slope > 0.2) {
        trendLabel = `↗ Upward Surge (+${slope.toFixed(2)}%/yr)`;
        trendColor = 'text-emerald-400';
      } else if (slope < -0.2) {
        trendLabel = `↘ Consolidating (${slope.toFixed(2)}%/yr)`;
        trendColor = 'text-amber-400';
      } else {
        trendLabel = '→ Stable High-Yield';
        trendColor = 'text-cyan-400';
      }
    }

    return {
      avgMain,
      avgAdv,
      avgMainQs,
      avgAdvQs,
      trendLabel,
      trendColor,
      peakYear,
      peakVal: peakVal.toFixed(1),
    };
  }, [filteredData, difficulty]);

  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0 || isLoading || filteredData.length === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 24, right: 25, bottom: 35, left: 45 };
    const width = Math.max(10, dimensions.width - margin.left - margin.right);
    const height = Math.max(10, dimensions.height - margin.top - margin.bottom);

    // Define Gradients & SVG Filters in Defs
    const defs = svg.append('defs');

    // Blue gradient for Main
    const blueGradient = defs.append('linearGradient')
      .attr('id', 'blueAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    blueGradient.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.45);
    blueGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0284c7').attr('stop-opacity', 0.0);

    // Pink gradient for Advanced
    const pinkGradient = defs.append('linearGradient')
      .attr('id', 'pinkAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    pinkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.45);
    pinkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#e11d48').attr('stop-opacity', 0.0);

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'neonGlow')
      .attr('x', '-30%').attr('y', '-30%')
      .attr('width', '160%').attr('height', '160%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const x = d3.scaleLinear()
      .domain(d3.extent(filteredData, (d: WeightageDataPoint) => d.year) as [number, number])
      .range([0, width]);

    const maxVal = d3.max(filteredData, (d: WeightageDataPoint) =>
      Math.max(
        difficulty !== 'advanced' ? d.main : 0,
        difficulty !== 'main' ? d.advanced : 0
      )
    ) || 10;

    const y = d3.scaleLinear()
      .domain([0, Math.ceil(maxVal * 1.28)])
      .range([height, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Subtle Horizontal Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'rgba(6, 182, 212, 0.12)')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3.axisBottom(x)
      .ticks(Math.min(filteredData.length, 13))
      .tickFormat(d3.format('d'));

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('font-weight', '600');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}%`))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('font-weight', '600');

    g.selectAll('.domain').attr('stroke', 'none');
    g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.08)');

    if (chartMode === 'spline') {
      // Area Generators
      const areaMain = d3.area<typeof filteredData[0]>()
        .x((d) => x(d.year))
        .y0(height)
        .y1((d) => y(d.main))
        .curve(d3.curveMonotoneX);

      const areaAdv = d3.area<typeof filteredData[0]>()
        .x((d) => x(d.year))
        .y0(height)
        .y1((d) => y(d.advanced))
        .curve(d3.curveMonotoneX);

      // Line Generators
      const lineMain = d3.line<typeof filteredData[0]>()
        .x((d) => x(d.year))
        .y((d) => y(d.main))
        .curve(d3.curveMonotoneX);

      const lineAdv = d3.line<typeof filteredData[0]>()
        .x((d) => x(d.year))
        .y((d) => y(d.advanced))
        .curve(d3.curveMonotoneX);

      // Render JEE Main Area & Line
      if (difficulty === 'both' || difficulty === 'main') {
        g.append('path')
          .datum(filteredData)
          .attr('fill', 'url(#blueAreaGrad)')
          .attr('d', areaMain);

        g.append('path')
          .datum(filteredData)
          .attr('fill', 'none')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2.8)
          .attr('filter', 'url(#neonGlow)')
          .attr('d', lineMain);

        g.selectAll('.dot-main')
          .data(filteredData)
          .enter()
          .append('circle')
          .attr('class', 'dot-main')
          .attr('cx', (d: WeightageDataPoint) => x(d.year))
          .attr('cy', (d: WeightageDataPoint) => y(d.main))
          .attr('r', 4.5)
          .attr('fill', '#07080E')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2.5)
          .style('cursor', 'pointer');
      }

      // Render JEE Advanced Area & Line
      if (difficulty === 'both' || difficulty === 'advanced') {
        g.append('path')
          .datum(filteredData)
          .attr('fill', 'url(#pinkAreaGrad)')
          .attr('d', areaAdv);

        g.append('path')
          .datum(filteredData)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 2.8)
          .attr('filter', 'url(#neonGlow)')
          .attr('d', lineAdv);

        g.selectAll('.dot-adv')
          .data(filteredData)
          .enter()
          .append('circle')
          .attr('class', 'dot-adv')
          .attr('cx', (d: WeightageDataPoint) => x(d.year))
          .attr('cy', (d: WeightageDataPoint) => y(d.advanced))
          .attr('r', 4.5)
          .attr('fill', '#07080E')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 2.5)
          .style('cursor', 'pointer');
      }
    } else {
      // Bar Chart Representation
      const barBandWidth = Math.max(8, (width / filteredData.length) * 0.35);

      filteredData.forEach((d) => {
        const xPos = x(d.year);

        if (difficulty === 'both') {
          // Main Bar
          g.append('rect')
            .attr('x', xPos - barBandWidth - 1)
            .attr('y', y(d.main))
            .attr('width', barBandWidth)
            .attr('height', Math.max(2, height - y(d.main)))
            .attr('fill', '#38bdf8')
            .attr('rx', 3);

          // Adv Bar
          g.append('rect')
            .attr('x', xPos + 1)
            .attr('y', y(d.advanced))
            .attr('width', barBandWidth)
            .attr('height', Math.max(2, height - y(d.advanced)))
            .attr('fill', '#f43f5e')
            .attr('rx', 3);
        } else if (difficulty === 'main') {
          g.append('rect')
            .attr('x', xPos - barBandWidth)
            .attr('y', y(d.main))
            .attr('width', barBandWidth * 2)
            .attr('height', Math.max(2, height - y(d.main)))
            .attr('fill', '#38bdf8')
            .attr('rx', 3);
        } else {
          g.append('rect')
            .attr('x', xPos - barBandWidth)
            .attr('y', y(d.advanced))
            .attr('width', barBandWidth * 2)
            .attr('height', Math.max(2, height - y(d.advanced)))
            .attr('fill', '#f43f5e')
            .attr('rx', 3);
        }
      });
    }

    // Vertical hover guide line & crosshair overlay
    const hoverLine = g.append('line')
      .attr('stroke', 'rgba(6, 182, 212, 0.6)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const overlay = g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const bisectYear = d3.bisector((d: WeightageDataPoint) => d.year).center;

    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const yearVal = x.invert(mx);
        const index = bisectYear(filteredData, yearVal);
        const point = filteredData[index];

        if (point) {
          hoverLine
            .attr('x1', x(point.year))
            .attr('x2', x(point.year))
            .attr('y1', 0)
            .attr('y2', height)
            .style('opacity', 1);

          setHoveredPoint(point);
        }
      })
      .on('mouseleave', () => {
        hoverLine.style('opacity', 0);
        setHoveredPoint(null);
      });

  }, [filteredData, difficulty, dimensions, chartMode, isLoading]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0A0C14] p-3 rounded-xl border border-cyan-500/20 shadow-md">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Exam:</span>
          <div className="flex bg-[#121422] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setDifficulty('both')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                difficulty === 'both' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setDifficulty('main')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                difficulty === 'main' ? 'bg-sky-500 text-slate-950 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Main
            </button>
            <button
              onClick={() => setDifficulty('advanced')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                difficulty === 'advanced' ? 'bg-rose-500 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Adv
            </button>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Style:</span>
          <div className="flex bg-[#121422] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setChartMode('spline')}
              className={`p-1.5 rounded-md transition ${
                chartMode === 'spline' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Smooth Line & Area"
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartMode('bars')}
              className={`p-1.5 rounded-md transition ${
                chartMode === 'bars' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Yearly Bars"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Year Range Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Window:</span>
          <select
            value={yearRange[0]}
            onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
            className="bg-[#121422] border border-cyan-500/20 text-xs text-zinc-200 rounded-md px-2 py-1 outline-none focus:border-cyan-400 font-mono"
          >
            {d3.range(2014, yearRange[1]).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-zinc-500 text-xs">-</span>
          <select
            value={yearRange[1]}
            onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
            className="bg-[#121422] border border-cyan-500/20 text-xs text-zinc-200 rounded-md px-2 py-1 outline-none focus:border-cyan-400 font-mono"
          >
            {d3.range(yearRange[0] + 1, 2027).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accurate Summary & Mathematical Trajectory Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs bg-[#090B13] p-2.5 rounded-xl border border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-3">
          {(difficulty === 'both' || difficulty === 'main') && (
            <div className="flex items-center gap-1.5 text-sky-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] animate-pulse" />
              <span>Main Avg: <strong className="text-white font-mono">{metrics.avgMain}%</strong> <span className="text-zinc-400 text-[11px]">(~{metrics.avgMainQs} Qs)</span></span>
            </div>
          )}
          {(difficulty === 'both' || difficulty === 'advanced') && (
            <div className="flex items-center gap-1.5 text-rose-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse" />
              <span>Adv Avg: <strong className="text-white font-mono">{metrics.avgAdv}%</strong> <span className="text-zinc-400 text-[11px]">(~{metrics.avgAdvQs} Qs)</span></span>
            </div>
          )}
        </div>

        {/* Statistical Trend Trajectory Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#121424] px-2 py-0.5 rounded-md border border-white/[0.08]">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span className={`text-[11px] font-bold ${metrics.trendColor}`}>
              {metrics.trendLabel}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            Peak: {metrics.peakYear} ({metrics.peakVal}%)
          </span>
        </div>
      </div>

      {/* Main D3 Chart Stage with Oscilloscope Animation & Glowing Border */}
      <div
        ref={wrapperRef}
        className="w-full h-[260px] relative bg-[#06070B] rounded-2xl border border-cyan-500/25 p-2 overflow-hidden anim-graph-glow cyber-graph-grid shadow-inner"
      >
        {/* Animated oscilloscope light beam */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent anim-graph-oscilloscope pointer-events-none" />

        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">
              Synchronizing 13-Year Grounded Weightage Matrix...
            </span>
          </div>
        ) : (
          <svg ref={chartRef} width={dimensions.width - 16} height={dimensions.height - 16} className="relative z-10" />
        )}
      </div>

      {/* Hovered Point Detailed Inspection Box */}
      {hoveredPoint && (
        <div className="p-3.5 bg-gradient-to-r from-[#0E1120] via-[#0C0E1A] to-[#0A0C14] rounded-xl border border-cyan-400/50 text-xs shadow-[0_0_25px_rgba(6,182,212,0.2)] anim-ai-quantum-glow flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent anim-ai-laser-scan pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-black text-cyan-200 text-sm">Exam Year {hoveredPoint.year} Intelligence</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded uppercase tracking-wider font-mono font-bold">
              IIT / NTA Historical Shift
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-zinc-200 py-1.5 border-y border-white/[0.08] relative z-10">
            <div className="bg-[#12162A] p-2 rounded-lg border border-sky-500/20">
              <span className="text-sky-300 text-[10.5px] font-bold block">JEE Main Weightage:</span>
              <span className="font-mono font-black text-white text-sm">{hoveredPoint.main}%</span>
              <span className="text-sky-300/80 text-[10.5px] ml-1.5">(~{hoveredPoint.mainQuestions} Questions)</span>
            </div>
            <div className="bg-[#1F1322] p-2 rounded-lg border border-rose-500/20">
              <span className="text-rose-300 text-[10.5px] font-bold block">JEE Advanced Weightage:</span>
              <span className="font-mono font-black text-white text-sm">{hoveredPoint.advanced}%</span>
              <span className="text-rose-300/80 text-[10.5px] ml-1.5">(~{hoveredPoint.advQuestions} Questions)</span>
            </div>
          </div>
          {hoveredPoint.highlightNote && (
            <div className="flex items-start gap-2 text-[11px] text-emerald-300 pt-0.5 relative z-10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{hoveredPoint.highlightNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
