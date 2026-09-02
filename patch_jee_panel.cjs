const fs = require('fs');

let code = fs.readFileSync('src/components/ui/JeeInsightsPanel.tsx', 'utf8');

// 1. Add Import
code = code.replace(
    "import { Latex } from './Latex';",
    "import { Latex } from './Latex';\nimport { TrendAnalysisChart } from './TrendAnalysisChart';\nimport { LineChart } from 'lucide-react';"
);

// 2. Destructure conceptTitle
code = code.replace(
    "jeeAdvanced,\n}) => {",
    "jeeAdvanced,\n  conceptTitle = 'Physics Concept',\n}) => {"
);

// 3. Update tab state
code = code.replace(
    "const [activeTab, setActiveTab] = useState<'main' | 'advanced'>('main');",
    "const [activeTab, setActiveTab] = useState<'main' | 'advanced' | 'trend'>('main');"
);

// 4. Add new tab button
code = code.replace(
    /<\/button>\n\s*<\/div>\n\s*<\/div>/,
    `</button>
          <button
            onClick={() => setActiveTab('trend')}
            className={\`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 \${
              activeTab === 'trend'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }\`}
          >
            <LineChart className="w-3 h-3 text-emerald-300" />
            Trend
          </button>
        </div>
      </div>`
);

// 5. Add tab content
const trendContent = `
        {/* Content for Trend Analysis */}
        {activeTab === 'trend' && (
          <motion.div
            key="jee-tab-trend"
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl mb-2">
              <span className="text-xs text-emerald-200 font-medium">Historical Weightage Trend</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10-Year Data
              </span>
            </div>
            
            <TrendAnalysisChart conceptTitle={conceptTitle} />
          </motion.div>
        )}
`;

code = code.replace(
    /<\/AnimatePresence>\n\s*<\/div>/,
    `${trendContent}\n      </AnimatePresence>\n    </div>`
);

fs.writeFileSync('src/components/ui/JeeInsightsPanel.tsx', code);
console.log('Patched JeeInsightsPanel.tsx');
