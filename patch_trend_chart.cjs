const fs = require('fs');

let code = fs.readFileSync('src/components/ui/TrendAnalysisChart.tsx', 'utf8');

// 1. Remove generateMockData function
code = code.replace(/\/\/ Generate realistic mock data[\s\S]*?return data;\n};\n/, '');

// 2. Add imports
code = code.replace(
    "import * as d3 from 'd3';",
    "import * as d3 from 'd3';\nimport { fetchWeightageData, WeightageDataPoint } from '../../utils/jeeWeightageApi';\nimport { Loader2 } from 'lucide-react';"
);

// 3. Update component state and effect
const stateReplacement = `
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
  }, [conceptTitle]);`;

code = code.replace(
    /const chartRef[\s\S]*?}, \[conceptTitle\]\);/,
    stateReplacement
);

// 4. Wrap svg rendering in a loading condition
code = code.replace(
    /<div ref=\{wrapperRef\} className="w-full h-\[250px\]">\n\s*<svg ref=\{chartRef\} width=\{dimensions.width\} height=\{dimensions.height\} \/>\n\s*<\/div>/,
    `<div ref={wrapperRef} className="w-full h-[250px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
             <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">Fetching Trend Data...</span>
          </div>
        ) : (
          <svg ref={chartRef} width={dimensions.width} height={dimensions.height} />
        )}
      </div>`
);

fs.writeFileSync('src/components/ui/TrendAnalysisChart.tsx', code);
console.log('Patched TrendAnalysisChart with Async Data Fetching');
