const fs = require('fs');

let code = fs.readFileSync('src/components/ui/Sidebar.tsx', 'utf8');

code = code.replace(
    /onToggleOpen: \(\) => void;/,
    "onToggleOpen: () => void;\n  onOpenAnalytics?: () => void;"
);

code = code.replace(
    /onToggleOpen,\n\}\) => \{/,
    "onToggleOpen,\n  onOpenAnalytics,\n}) => {"
);

// Add the button near the bottom of the sidebar or in a tools section
const buttonHtml = `
        {/* Tools Section */}
        <div className="px-4 py-2 mt-4">
          <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 px-2">Tools</div>
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <div className="p-1.5 rounded-md transition-colors bg-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              JEE Analytics
            </button>
          )}
        </div>
`;

code = code.replace(
    /<\/div>\n\s*<\/div>\n\s*<\/motion\.div>\n\s*<\/>\n\s*\);\n\}/,
    `${buttonHtml}\n      </div>\n    </div>\n    </motion.div>\n    </>\n  );\n}`
);

fs.writeFileSync('src/components/ui/Sidebar.tsx', code);
console.log('Patched Sidebar.tsx again');
