/**
 * Pre-Generation Formula String Validator & Auto-Repair Engine
 * Validates formula strings against regex patterns to detect:
 * 1. Missing / unclosed braces, parentheses, and brackets
 * 2. Unrendered or raw LaTeX commands (e.g., \frac, \sqrt, \text, \alpha, \theta)
 * 3. Dangling backslashes or broken escape sequences
 * 4. Corrupted numbers / NaN / undefined values
 * 5. Double operators or formatting anomalies
 */

export interface FormulaValidationError {
  type: 'unclosed_brace' | 'unrendered_latex' | 'dangling_backslash' | 'mismatched_brackets' | 'nan_or_undefined' | 'malformed_operator';
  message: string;
  pattern: string;
  matchedText?: string;
  severity: 'error' | 'warning';
}

export interface FormulaValidationResult {
  isValid: boolean;
  rawString: string;
  cleanedString: string;
  errors: FormulaValidationError[];
  repairedString: string;
  wasAutoRepaired: boolean;
}

export interface SheetValidationReport {
  chapterId: string;
  chapterName: string;
  totalFormulasChecked: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  isReadyForPdf: boolean;
  details: {
    section: string;
    itemTitle: string;
    raw: string;
    result: FormulaValidationResult;
  }[];
}

// Regex patterns to detect formatting defects
const UNRENDERED_LATEX_REGEX = /\\(frac|sqrt|text|mathbf|mathrm|mathit|alpha|beta|gamma|delta|epsilon|varepsilon|theta|lambda|mu|nu|pi|rho|sigma|tau|phi|omega|Delta|Omega|Lambda|Sigma|Theta|Pi|int|iint|iiint|oint|partial|nabla|sum|prod|infty|pm|mp|times|cdot|approx|equiv|neq|leq|geq|sim|propto|rightarrow|leftarrow|Rightarrow|Leftarrow|to|hat|vec|overline|dot|ddot|box|boxed|degree|angstrom|AA)(\b|[^a-zA-Z])/i;

const DANGLING_BACKSLASH_REGEX = /\\(\s|$|[^a-zA-Z0-9_{}()\[\]])/;

const NAN_OR_UNDEFINED_REGEX = /\b(NaN|undefined|null|\[object Object\])\b/i;

const MALFORMED_OPERATOR_REGEX = /(\^{2,}|\/{2,}|\+{2,}|\*{3,}|={3,})/;

/**
 * Validates a single formula string for PDF rendering readiness
 */
export function validateFormulaString(raw: string): FormulaValidationResult {
  const errors: FormulaValidationError[] = [];
  const str = raw || '';

  // 1. Check for NaN, undefined, or object strings
  if (NAN_OR_UNDEFINED_REGEX.test(str)) {
    const match = str.match(NAN_OR_UNDEFINED_REGEX);
    errors.push({
      type: 'nan_or_undefined',
      message: `Found corrupt value '${match?.[0]}' in formula string`,
      pattern: 'NAN_OR_UNDEFINED_REGEX',
      matchedText: match?.[0],
      severity: 'error',
    });
  }

  // 2. Check for unclosed curly braces { }
  let openBraceCount = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{' && (i === 0 || str[i - 1] !== '\\')) openBraceCount++;
    if (str[i] === '}' && (i === 0 || str[i - 1] !== '\\')) openBraceCount--;
  }
  if (openBraceCount !== 0) {
    errors.push({
      type: 'unclosed_brace',
      message: openBraceCount > 0 ? `Missing ${openBraceCount} closing brace(s) '}'` : `Extra ${Math.abs(openBraceCount)} closing brace(s) '}'`,
      pattern: 'BRACE_BALANCE_CHECK',
      severity: 'error',
    });
  }

  // 3. Check for mismatched parentheses ( ) and brackets [ ]
  let openParenCount = 0;
  let openBracketCount = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') openParenCount++;
    if (str[i] === ')') openParenCount--;
    if (str[i] === '[') openBracketCount++;
    if (str[i] === ']') openBracketCount--;
  }
  if (openParenCount !== 0 || openBracketCount !== 0) {
    errors.push({
      type: 'mismatched_brackets',
      message: `Mismatched grouping delimiters (parens: ${openParenCount}, brackets: ${openBracketCount})`,
      pattern: 'BRACKET_BALANCE_CHECK',
      severity: 'warning',
    });
  }

  // 4. Check for unrendered raw LaTeX commands in plain text strings
  // (Notice: If it is supposed to be cleaned ASCII text, raw LaTeX commands indicate incomplete sanitization)
  const latexMatch = str.match(UNRENDERED_LATEX_REGEX);
  if (latexMatch) {
    errors.push({
      type: 'unrendered_latex',
      message: `Unrendered LaTeX command '\\${latexMatch[1]}' detected`,
      pattern: 'UNRENDERED_LATEX_REGEX',
      matchedText: latexMatch[0],
      severity: 'warning',
    });
  }

  // 5. Check for dangling backslashes
  const danglingMatch = str.match(DANGLING_BACKSLASH_REGEX);
  if (danglingMatch) {
    errors.push({
      type: 'dangling_backslash',
      message: `Dangling backslash escape character detected`,
      pattern: 'DANGLING_BACKSLASH_REGEX',
      matchedText: danglingMatch[0],
      severity: 'warning',
    });
  }

  // 6. Check for malformed operators
  const opMatch = str.match(MALFORMED_OPERATOR_REGEX);
  if (opMatch) {
    errors.push({
      type: 'malformed_operator',
      message: `Malformed sequential operator '${opMatch[0]}' detected`,
      pattern: 'MALFORMED_OPERATOR_REGEX',
      matchedText: opMatch[0],
      severity: 'warning',
    });
  }

  // Attempt auto-repair if errors exist
  const repairedString = autoRepairFormulaString(str, openBraceCount, openParenCount);
  const wasAutoRepaired = errors.length > 0 && repairedString !== str;

  const hasCriticalErrors = errors.some((e) => e.severity === 'error');

  return {
    isValid: !hasCriticalErrors,
    rawString: str,
    cleanedString: str.trim(),
    errors,
    repairedString,
    wasAutoRepaired,
  };
}

/**
 * Auto-repairs detected formatting defects
 */
export function autoRepairFormulaString(
  str: string,
  openBraceDelta = 0,
  openParenDelta = 0
): string {
  let repaired = str || '';

  // 1. Remove undefined / NaN tokens
  repaired = repaired.replace(/\b(undefined|NaN|null|\[object Object\])\b/gi, '');

  // 2. Fix unclosed curly braces
  if (openBraceDelta > 0) {
    repaired = repaired + '}'.repeat(openBraceDelta);
  } else if (openBraceDelta < 0) {
    // Remove extra trailing closing braces
    for (let i = 0; i < Math.abs(openBraceDelta); i++) {
      const lastIdx = repaired.lastIndexOf('}');
      if (lastIdx !== -1) {
        repaired = repaired.slice(0, lastIdx) + repaired.slice(lastIdx + 1);
      }
    }
  }

  // 3. Fix unclosed parentheses
  if (openParenDelta > 0) {
    repaired = repaired + ')'.repeat(openParenDelta);
  }

  // 4. Clean dangling backslashes
  repaired = repaired.replace(/\\+(\s|$)/g, '$1');

  // 5. Clean double operators
  repaired = repaired.replace(/\^{2,}/g, '^');
  repaired = repaired.replace(/\/{2,}/g, '/');
  repaired = repaired.replace(/\+{2,}/g, '+');
  repaired = repaired.replace(/\*{3,}/g, '*');

  return repaired.trim();
}

/**
 * Pre-generation validation of a complete JEE Chapter Sheet
 */
export function validateChapterSheetData(
  chapterId: string,
  chapterName: string,
  sheetData: {
    coreFormulas?: Array<{ sectionTitle: string; items: Array<{ name: string; formula: string; conditionOrMeaning?: string }> }>;
    specialCases?: Array<{ title: string; resultFormula: string; condition?: string; notes?: string }>;
    shortcuts?: string[];
    traps?: string[];
  }
): SheetValidationReport {
  const details: SheetValidationReport['details'] = [];
  let totalCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Validate core formulas
  sheetData.coreFormulas?.forEach((sec) => {
    sec.items?.forEach((item) => {
      totalCount++;
      const res = validateFormulaString(item.formula);
      if (res.errors.some((e) => e.severity === 'error')) errorCount++;
      if (res.errors.some((e) => e.severity === 'warning')) warningCount++;
      if (res.errors.length > 0) {
        details.push({
          section: `Core: ${sec.sectionTitle}`,
          itemTitle: item.name,
          raw: item.formula,
          result: res,
        });
      }
    });
  });

  // Validate special cases
  sheetData.specialCases?.forEach((sc) => {
    totalCount++;
    const res = validateFormulaString(sc.resultFormula);
    if (res.errors.some((e) => e.severity === 'error')) errorCount++;
    if (res.errors.some((e) => e.severity === 'warning')) warningCount++;
    if (res.errors.length > 0) {
      details.push({
        section: 'Special Cases',
        itemTitle: sc.title,
        raw: sc.resultFormula,
        result: res,
      });
    }
  });

  // Validate shortcuts
  sheetData.shortcuts?.forEach((sh, idx) => {
    totalCount++;
    const res = validateFormulaString(sh);
    if (res.errors.some((e) => e.severity === 'error')) errorCount++;
    if (res.errors.some((e) => e.severity === 'warning')) warningCount++;
    if (res.errors.length > 0) {
      details.push({
        section: 'Shortcuts',
        itemTitle: `Shortcut #${idx + 1}`,
        raw: sh,
        result: res,
      });
    }
  });

  // Validate traps
  sheetData.traps?.forEach((tr, idx) => {
    totalCount++;
    const res = validateFormulaString(tr);
    if (res.errors.some((e) => e.severity === 'error')) errorCount++;
    if (res.errors.some((e) => e.severity === 'warning')) warningCount++;
    if (res.errors.length > 0) {
      details.push({
        section: 'Exam Traps',
        itemTitle: `Trap Alert #${idx + 1}`,
        raw: tr,
        result: res,
      });
    }
  });

  const validCount = totalCount - errorCount;
  const isReadyForPdf = errorCount === 0;

  return {
    chapterId,
    chapterName,
    totalFormulasChecked: totalCount,
    validCount,
    errorCount,
    warningCount,
    isReadyForPdf,
    details,
  };
}
