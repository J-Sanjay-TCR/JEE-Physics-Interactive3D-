const fs = require('fs');

let code = fs.readFileSync('src/components/ui/Sidebar.tsx', 'utf8');

// 1. Add prop to interface
code = code.replace(
    /onOpenTutorial\?: \(\) => void;/,
    "onOpenTutorial?: () => void;\n  onOpenAnalytics?: () => void;"
);

// 2. Add prop to component
code = code.replace(
    /onOpenTutorial,\n\s*isDark,/,
    "onOpenTutorial,\n  onOpenAnalytics,\n  isDark,"
);

// 3. Add button in Sidebar (e.g. above or below tutorial)
const btnHtml = `
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group \${
                isDark 
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' 
                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
              }\`}
            >
              <div className={\`p-1.5 rounded-md transition-colors \${
                isDark ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-emerald-100 group-hover:bg-emerald-200'
              }\`}>
                <TrendingUp className="w-4 h-4" />
              </div>
              JEE Analytics
            </button>
          )}
`;

code = code.replace(
    /\{onOpenTutorial && \(/,
    `${btnHtml}\n          {onOpenTutorial && (`
);

if(!code.includes('import {') || !code.includes('TrendingUp')) {
    code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, TrendingUp } from 'lucide-react';");
}

fs.writeFileSync('src/components/ui/Sidebar.tsx', code);
console.log('Patched Sidebar.tsx');
