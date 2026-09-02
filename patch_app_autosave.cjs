const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for saved session
code = code.replace(
    /const \[completedConcepts, setCompletedConcepts\] = useState<string\[\]>\(\[\]\);/,
    "const [completedConcepts, setCompletedConcepts] = useState<string[]>([]);\n  const [savedSessionParams, setSavedSessionParams] = useState<Record<string, number> | null>(null);\n  const [showRestorePrompt, setShowRestorePrompt] = useState(false);"
);

// 2. Modify handleSelectConcept to check localStorage and handle ParamChange to save to localStorage
const paramChangeHtml = `
  const handleParamChange = (id: string, val: number) => {
    setParamValues((prev) => {
      const newParams = { ...prev, [id]: val };
      // Auto-save to localStorage
      try {
        localStorage.setItem(\`jee_physics_params_\${currentConcept.id}\`, JSON.stringify(newParams));
      } catch (e) {
        console.warn('Failed to save session params to localStorage');
      }
      return newParams;
    });
  };
`;

code = code.replace(
    /const handleParamChange = \(id: string, val: number\) => \{\n\s*setParamValues\(\(prev\) => \(\{ \.\.\.prev, \[id\]: val \}\)\);\n\s*\};/,
    paramChangeHtml
);

// Modify handleSelectConcept
const selectConceptReplacement = `
  // Concept Change Handler
  const handleSelectConcept = (concept: PhysicsConcept, preset?: Record<string, number>) => {
    setCurrentConcept(concept);
    const newParams: Record<string, number> = {};
    concept.parameters.forEach((p) => {
      newParams[p.id] = p.defaultVal;
    });
    
    if (preset) {
      Object.assign(newParams, preset);
      setParamValues(newParams);
      setShowRestorePrompt(false);
    } else {
      // Check for saved session
      try {
        const saved = localStorage.getItem(\`jee_physics_params_\${concept.id}\`);
        if (saved) {
          const parsed = JSON.parse(saved);
          let isDifferent = false;
          // Check if saved is actually different from defaults
          for (const key in parsed) {
            if (parsed[key] !== newParams[key]) {
              isDifferent = true;
              break;
            }
          }
          if (isDifferent) {
            setSavedSessionParams(parsed);
            setShowRestorePrompt(true);
          } else {
            setShowRestorePrompt(false);
          }
        } else {
          setShowRestorePrompt(false);
        }
      } catch (e) {
        setShowRestorePrompt(false);
      }
      setParamValues(newParams);
    }
    
    setSimTime(0);
    setCurrentView('lab');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    // Mark as visited/explored
    if (!completedConcepts.includes(concept.id)) {
      const updated = [...completedConcepts, concept.id];
      setCompletedConcepts(updated);
      try {
`;

code = code.replace(
    /\/\/ Concept Change Handler\n\s*const handleSelectConcept = \(concept: PhysicsConcept, preset\?: Record<string, number>\) => \{[\s\S]*?try \{/,
    selectConceptReplacement
);

// 3. Add UI for the restore prompt in the main lab view
// We'll put it right below the main tag
const restoreBannerHtml = `
          {showRestorePrompt && savedSessionParams && (
            <div className={\`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border mb-2 shrink-0 \${
              isCyberpunk 
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' 
                : isDark 
                ? 'bg-amber-950/30 border-amber-500/20 text-amber-200' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }\`}>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 shrink-0 animate-pulse" />
                <span className="text-sm font-medium">Found a saved session for <strong>{currentConcept.title}</strong></span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRestorePrompt(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg opacity-70 hover:opacity-100 transition-opacity"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setParamValues(savedSessionParams);
                    setShowRestorePrompt(false);
                  }}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm \${
                    isCyberpunk ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-amber-500 text-white hover:bg-amber-600'
                  }\`}
                >
                  Restore Values
                </button>
              </div>
            </div>
          )}
`;

code = code.replace(
    /aria-hidden=\{isAiTutorOpen\}\n\s*>\n\s*\{\/\* Concept Header Banner/,
    `aria-hidden={isAiTutorOpen}\n        >\n${restoreBannerHtml}\n          {/* Concept Header Banner`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx with AutoSave and Restore Prompt');
