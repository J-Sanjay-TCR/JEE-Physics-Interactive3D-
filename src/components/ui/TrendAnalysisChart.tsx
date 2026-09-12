import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0 || isLoading || data.length === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const filteredData = data.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]);
    if (filteredData.length === 0) return;

    const margin = { top: 20, right: 25, bottom: 35, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Define Gradients in SVG Defs
    const defs = svg.append('defs');

    // Blue gradient for Main
    const blueGradient = defs.append('linearGradient')
      .attr('id', 'blueAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    blueGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.4);
    blueGradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.0);

    // Pink gradient for Advanced
    const pinkGradient = defs.append('linearGradient')
      .attr('id', 'pinkAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    pinkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ec4899').attr('stop-opacity', 0.35);
    pinkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ec4899').attr('stop-opacity', 0.0);

    const x = d3.scaleLinear()
      .domain(d3.extent(filteredData, (d) => d.year) as [number, number])
      .range([0, width]);

    const maxVal = d3.max(filteredData, (d) =>
      Math.max(
        difficulty !== 'advanced' ? d.main : 0,
        difficulty !== 'main' ? d.advanced : 0
      )
    ) || 10;

    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.25])
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
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-dasharray', '2,2');

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
      .style('font-weight', '500');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}%`))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '10px')
      .style('font-weight', '500');

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
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 2.5)
          .attr('d', lineMain);

        g.selectAll('.dot-main')
          .data(filteredData)
          .enter()
          .append('circle')
          .attr('class', 'dot-main')
          .attr('cx', (d) => x(d.year))
          .attr('cy', (d) => y(d.main))
          .attr('r', 4)
          .attr('fill', '#0A0A0E')
          .attr('stroke', '#3b82f6')
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
          .attr('stroke', '#ec4899')
          .attr('stroke-width', 2.5)
          .attr('d', lineAdv);

        g.selectAll('.dot-adv')
          .data(filteredData)
          .enter()
          .append('circle')
          .attr('class', 'dot-adv')
          .attr('cx', (d) => x(d.year))
          .attr('cy', (d) => y(d.advanced))
          .attr('r', 4)
          .attr('fill', '#0A0A0E')
          .attr('stroke', '#ec4899')
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
            .attr('height', height - y(d.main))
            .attr('fill', '#3b82f6')
            .attr('rx', 3);

          // Adv Bar
          g.append('rect')
            .attr('x', xPos + 1)
            .attr('y', y(d.advanced))
            .attr('width', barBandWidth)
            .attr('height', height - y(d.advanced))
            .attr('fill', '#ec4899')
            .attr('rx', 3);
        } else if (difficulty === 'main') {
          g.append('rect')
            .attr('x', xPos - barBandWidth)
            .attr('y', y(d.main))
            .attr('width', barBandWidth * 2)
            .attr('height', height - y(d.main))
            .attr('fill', '#3b82f6')
            .attr('rx', 3);
        } else {
          g.append('rect')
            .attr('x', xPos - barBandWidth)
            .attr('y', y(d.advanced))
            .attr('width', barBandWidth * 2)
            .attr('height', height - y(d.advanced))
            .attr('fill', '#ec4899')
            .attr('rx', 3);
        }
      });
    }

    // Vertical hover guide line & crosshair overlay
    const hoverLine = g.append('line')
      .attr('stroke', 'rgba(255,255,255,0.25)')
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

  }, [data, difficulty, yearRange, dimensions, chartMode, isLoading]);

  // Calculate summary metrics
  const avgMain = data.length > 0 ? (data.reduce((acc, d) => acc + d.main, 0) / data.length).toFixed(1) : '0';
  const avgAdv = data.length > 0 ? (data.reduce((acc, d) => acc + d.advanced, 0) / data.length).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0E0E14] p-3 rounded-xl border border-white/[0.08]">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Exam:</span>
          <div className="flex bg-[#161720] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setDifficulty('both')}
              className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                difficulty === 'both' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setDifficulty('main')}
              className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                difficulty === 'main' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Main
            </button>
            <button
              onClick={() => setDifficulty('advanced')}
              className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                difficulty === 'advanced' ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Adv
            </button>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Style:</span>
          <div className="flex bg-[#161720] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setChartMode('spline')}
              className={`p-1 rounded-md transition ${
                chartMode === 'spline' ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Smooth Line & Area"
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartMode('bars')}
              className={`p-1 rounded-md transition ${
                chartMode === 'bars' ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Yearly Bars"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Year Range Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Years:</span>
          <select
            value={yearRange[0]}
            onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
            className="bg-[#161720] border border-white/[0.08] text-xs text-zinc-300 rounded-md px-1.5 py-0.5 outline-none focus:border-cyan-500"
          >
            {d3.range(2014, yearRange[1]).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-zinc-500 text-xs">-</span>
          <select
            value={yearRange[1]}
            onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
            className="bg-[#161720] border border-white/[0.08] text-xs text-zinc-300 rounded-md px-1.5 py-0.5 outline-none focus:border-cyan-500"
          >
            {d3.range(yearRange[0] + 1, 2027).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Summary Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          {(difficulty === 'both' || difficulty === 'main') && (
            <div className="flex items-center gap-1.5 text-blue-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span>JEE Main Avg: <strong>{avgMain}% (~1.8 Qs)</strong></span>
            </div>
          )}
          {(difficulty === 'both' || difficulty === 'advanced') && (
            <div className="flex items-center gap-1.5 text-pink-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              <span>JEE Adv Avg: <strong>{avgAdv}% (~1.5 Qs)</strong></span>
            </div>
          )}
        </div>

        <span className="text-[10px] text-zinc-500 font-medium">
          Hover chart to inspect year-wise problem types
        </span>
      </div>

      {/* Main D3 Chart Stage */}
      <div ref={wrapperRef} className="w-full h-[260px] relative bg-[#09090D] rounded-2xl border border-white/[0.06] p-2">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">
              Fetching 13-Year Grounded Weightage...
            </span>
          </div>
        ) : (
          <svg ref={chartRef} width={dimensions.width - 16} height={dimensions.height - 16} />
        )}
      </div>

      {/* Hovered Point Detailed Inspection Box */}
      {hoveredPoint && (
        <div className="p-3 bg-gradient-to-r from-[#12131C] to-[#0D0E16] rounded-xl border border-cyan-500/30 text-xs shadow-xl animate-fade-in flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-cyan-300 text-sm">Year {hoveredPoint.year} Examination Analysis</span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">NTA & IIT Shift Record</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-zinc-300 py-1 border-y border-white/[0.06]">
            <div>
              <span className="text-zinc-400 text-[10px] block">JEE Main:</span>
              <span className="font-bold text-blue-400">{hoveredPoint.main}%</span>
              <span className="text-zinc-500 text-[10px] ml-1.5">(~{hoveredPoint.mainQuestions} Questions)</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] block">JEE Advanced:</span>
              <span className="font-bold text-pink-400">{hoveredPoint.advanced}%</span>
              <span className="text-zinc-500 text-[10px] ml-1.5">(~{hoveredPoint.advQuestions} Questions)</span>
            </div>
          </div>
          {hoveredPoint.highlightNote && (
            <div className="flex items-start gap-1.5 text-[11px] text-emerald-300/90 pt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{hoveredPoint.highlightNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
