import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fetchWeightageData, WeightageDataPoint } from '../../utils/jeeWeightageApi';
import { Loader2 } from 'lucide-react';

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
  const [dimensions, setDimensions] = useState({ width: 0, height: 250 });

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
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions(prev => ({ ...prev, width: entries[0].contentRect.width }));
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const filteredData = data.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
    
    if (filteredData.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.year) as [number, number])
      .range([0, width]);

    const maxVal = d3.max(filteredData, d => Math.max(difficulty !== 'advanced' ? d.main : 0, difficulty !== 'main' ? d.advanced : 0)) || 10;

    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.2])
      .range([height, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(filteredData.length).tickSize(-height).tickFormat(() => ''))
      .selectAll('line').attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '2,2');

    // Axes
    const xAxis = d3.axisBottom(x).ticks(filteredData.length).tickFormat(d3.format('d'));
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '10px');
      
    g.selectAll('.domain').attr('stroke', 'none');

    // Line generators
    const lineMain = d3.line<typeof filteredData[0]>()
      .x(d => x(d.year))
      .y(d => y(d.main))
      .curve(d3.curveMonotoneX);

    const lineAdv = d3.line<typeof filteredData[0]>()
      .x(d => x(d.year))
      .y(d => y(d.advanced))
      .curve(d3.curveMonotoneX);

    // Main line
    if (difficulty === 'both' || difficulty === 'main') {
      g.append('path')
        .datum(filteredData)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6') // blue-500
        .attr('stroke-width', 2.5)
        .attr('d', lineMain);
        
      g.selectAll('.dot-main')
        .data(filteredData)
        .enter().append('circle')
        .attr('class', 'dot-main')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.main))
        .attr('r', 4)
        .attr('fill', '#111114')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2);
    }

    // Advanced line
    if (difficulty === 'both' || difficulty === 'advanced') {
      g.append('path')
        .datum(filteredData)
        .attr('fill', 'none')
        .attr('stroke', '#ec4899') // pink-500
        .attr('stroke-width', 2.5)
        .attr('d', lineAdv);
        
      g.selectAll('.dot-adv')
        .data(filteredData)
        .enter().append('circle')
        .attr('class', 'dot-adv')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.advanced))
        .attr('r', 4)
        .attr('fill', '#111114')
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 2);
    }
    
    // Add simple y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 10)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#9ca3af')
      .style('font-size', '10px')
      .text('Weightage (%)');

  }, [data, difficulty, yearRange, dimensions]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0E] p-3 rounded-xl border border-white/[0.08]">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Difficulty:</span>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="bg-[#111114] border border-white/[0.1] text-xs text-zinc-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500/50"
          >
            <option value="both">Both (Main & Adv)</option>
            <option value="main">JEE Main Only</option>
            <option value="advanced">JEE Advanced Only</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Year Range:</span>
          <select 
            value={yearRange[0]}
            onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
            className="bg-[#111114] border border-white/[0.1] text-xs text-zinc-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500/50"
          >
            {d3.range(2014, yearRange[1] + 1).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-zinc-500 text-xs">-</span>
          <select 
            value={yearRange[1]}
            onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
            className="bg-[#111114] border border-white/[0.1] text-xs text-zinc-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500/50"
          >
            {d3.range(yearRange[0], 2027).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Chart Legend */}
      <div className="flex justify-center gap-4 text-xs font-medium">
        {(difficulty === 'both' || difficulty === 'main') && (
           <div className="flex items-center gap-1.5 text-blue-200">
             <div className="w-2 h-2 rounded-full bg-blue-500" />
             JEE Main
           </div>
        )}
        {(difficulty === 'both' || difficulty === 'advanced') && (
           <div className="flex items-center gap-1.5 text-pink-200">
             <div className="w-2 h-2 rounded-full bg-pink-500" />
             JEE Advanced
           </div>
        )}
      </div>

      <div ref={wrapperRef} className="w-full h-[250px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
             <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">Fetching Trend Data...</span>
          </div>
        ) : (
          <svg ref={chartRef} width={dimensions.width} height={dimensions.height} />
        )}
      </div>
    </div>
  );
};
