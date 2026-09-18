/**
 * High-DPI Mathematical Equation Renderer for PDF generation.
 * Renders LaTeX and scientific physics formulas into crystal-clear, authentic
 * mathematical typography (true horizontal fraction bars, radicals with vinculum,
 * superscripts, subscripts, Greek letters, and math operators) onto high-DPI canvases
 * and embeds them as native PDF image XObjects into jsPDF.
 *
 * Guaranteed ZERO raw HTML in the PDF stream, ensuring 100% compatibility across
 * all PDF readers (Adobe Acrobat, Foxit, Apple Preview, Google Drive, Chrome, PDF.js, etc.).
 */

export interface MathRenderResult {
  dataUrl: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

export interface MathRenderOptions {
  fontSize?: number; // base font size in pixels (default: 20)
  scale?: number; // Canvas oversampling scale for print crispness (default: 3 for 300 DPI)
  textColor?: string; // Text & stroke color (default: '#0f172a')
  bgColor?: string; // Background color (default: 'transparent' or '#f8fafc')
  paddingX?: number; // Horizontal padding in pixels (default: 12)
  paddingY?: number; // Vertical padding in pixels (default: 8)
  fontFamily?: string;
  maxWidthMm?: number;
}

// Unicode mappings for Greek letters and mathematical symbols
const GREEK_MAP: Record<string, string> = {
  theta: 'θ',
  Theta: 'Θ',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  Gamma: 'Γ',
  delta: 'δ',
  Delta: 'Δ',
  epsilon: 'ε',
  varepsilon: 'ε',
  zeta: 'ζ',
  eta: 'η',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  Lambda: 'Λ',
  mu: 'μ',
  nu: 'ν',
  xi: 'ξ',
  Xi: 'Ξ',
  pi: 'π',
  Pi: 'Π',
  rho: 'ρ',
  sigma: 'σ',
  Sigma: 'Σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  varphi: 'φ',
  Phi: 'Φ',
  chi: 'χ',
  psi: 'ψ',
  Psi: 'Ψ',
  omega: 'ω',
  Omega: 'Ω',
};

const SYMBOL_MAP: Record<string, string> = {
  pm: '±',
  mp: '∓',
  times: '×',
  cdot: '·',
  div: '÷',
  ast: '*',
  star: '★',
  circ: '°',
  degree: '°',
  approx: '≈',
  sim: '∼',
  neq: '≠',
  ne: '≠',
  leq: '≤',
  le: '≤',
  geq: '≥',
  ge: '≥',
  ll: '≪',
  gg: '≫',
  subset: '⊂',
  supset: '⊃',
  subseteq: '⊆',
  supseteq: '⊇',
  in: '∈',
  notin: '∉',
  ni: '∋',
  forall: '∀',
  exists: '∃',
  nabla: '∇',
  partial: '∂',
  infty: '∞',
  aleph: 'ℵ',
  hbar: 'ℏ',
  ell: 'ℓ',
  Re: 'ℜ',
  Im: 'ℑ',
  wp: '℘',
  emptyset: '∅',
  to: '→',
  rightarrow: '→',
  leftarrow: '←',
  Rightarrow: '⇒',
  implies: '⟹',
  iff: '⟺',
  Leftrightarrow: '⇔',
  leftrightarrow: '↔',
  uparrow: '↑',
  downarrow: '↓',
  updownarrow: '↕',
  int: '∫',
  iint: '∬',
  iiint: '∭',
  oint: '∮',
  sum: '∑',
  prod: '∏',
  coprod: '∐',
  propto: '∝',
  angle: '∠',
  perp: '⊥',
  parallel: '∥',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  'n': 'ⁿ',
  'i': 'ⁱ',
  'x': 'ˣ',
  'y': 'ʸ',
  'z': 'ᶻ',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  'a': 'ₐ',
  'e': 'ₑ',
  'h': 'ₕ',
  'i': 'ᵢ',
  'j': 'ⱼ',
  'k': 'ₖ',
  'l': 'ₗ',
  'm': 'ₘ',
  'n': 'ₙ',
  'o': 'ₒ',
  'p': 'ₚ',
  'r': 'ᵣ',
  's': 'ₛ',
  't': 'ₜ',
  'u': 'ᵤ',
  'v': 'ᵥ',
  'x': 'ₓ',
  'y': 'ᵧ',
  'z': '₂',
};

// Recognized mathematical functions (rendered upright / roman)
const MATH_FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'sinh', 'cosh', 'tanh', 'coth',
  'arcsin', 'arccos', 'arctan',
  'ln', 'log', 'exp', 'lg',
  'lim', 'max', 'min', 'inf', 'sup',
  'det', 'dim', 'ker', 'deg', 'gcd',
  'hom', 'arg', 'opt', 'avg', 'rms',
  'net', 'total', 'ext', 'int', 'photo', 'sat', 'strike', 'slack',
  'top', 'bottom', 'apex', 'rest', 'rad', 'rel', 'incline', 'com', 'eff'
]);

/**
 * Preprocesses a raw formula string into standard LaTeX-like tokens for uniform parsing.
 * Converts slash fractions (A) / (B), square roots sqrt(...), unicode powers (²), etc.
 */
export function preprocessFormula(formula: string): string {
  if (!formula) return '';
  let str = String(formula).trim();

  // Strip math delimiters $$, $, \[, \], \(, \)
  str = str.replace(/\$\$/g, '').replace(/\$/g, '');
  str = str.replace(/^\\\[|\\\]$/g, '');
  str = str.replace(/^\\\(|\\\)$/g, '');

  // Strip environment and text wrappers
  str = str.replace(/\\begin\{[^{}]*\}|\\end\{[^{}]*\}/g, '');
  str = str.replace(/\\boxed\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathrm\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathit\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathbf\{([^{}]*)\}/g, '$1');

  // Unicode superscripts to ^2 etc.
  str = str.replace(/²/g, '^2').replace(/³/g, '^3').replace(/¹/g, '^1').replace(/⁰/g, '^0');

  // Convert ASCII sqrt(...) to \sqrt{...}
  str = str.replace(/sqrt\(([^()]+)\)/g, '\\sqrt{$1}');

  // Convert slash fractions like (A) / (B), (A) / B, A / (B) into \frac{A}{B}
  // Repeated pass for nested or multiple fractions
  for (let p = 0; p < 3; p++) {
    str = str.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    str = str.replace(/\(([^()]+)\)\s*\/\s*([a-zA-Z0-9_\^·]+)/g, '\\frac{$1}{$2}');
    str = str.replace(/([a-zA-Z0-9_\^·]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
  }

  // Handle (1/2) -> \frac{1}{2}
  str = str.replace(/\(1\/2\)/g, '\\frac{1}{2}');
  str = str.replace(/1\/2/g, '\\frac{1}{2}');

  // Clean double spaces
  str = str.replace(/\s+/g, ' ').trim();
  return str;
}
export function formatLatexToMathText(input: string): string {
  if (!input) return '';
  let str = String(input).trim();

  // Strip LaTeX math delimiters
  str = str.replace(/\$\$/g, '').replace(/\$/g, '');
  str = str.replace(/^\\\[|\\\]$/g, '');
  str = str.replace(/^\\\(|\\\)$/g, '');

  // Strip LaTeX environment wrappers
  str = str.replace(/\\begin\{[^{}]*\}|\\end\{[^{}]*\}/g, '');
  str = str.replace(/\\boxed\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathbf\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathrm\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathit\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\mathbb\{([^{}]*)\}/g, '$1');
  str = str.replace(/\\boldsymbol\{([^{}]*)\}/g, '$1');

  // Handle escaped percent e.g. \% -> %
  str = str.replace(/\\%/g, '%');

  // Repeatedly peel text wrappers (handles nested \text{...} or \mathrm{...})
  let textMatch = true;
  let maxTextLoops = 6;
  while (textMatch && maxTextLoops-- > 0) {
    textMatch = false;
    if (/\\(?:text|mathrm|mathbf|mathit)\{([^{}]*)\}/.test(str)) {
      str = str.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]*)\}/g, '$1');
      textMatch = true;
    }
  }

  // Bracket wrappers
  str = str.replace(/\\left\(|\\right\)/g, (m) => (m.includes('(') ? '(' : ')'));
  str = str.replace(/\\left\[|\\right\]/g, (m) => (m.includes('[') ? '[' : ']'));
  str = str.replace(/\\left\\\{|\\right\\\}/g, (m) => (m.includes('{') ? '{' : '}'));
  str = str.replace(/\\left|\\right/g, '');
  str = str.replace(/\\quad|\\qquad/g, '   ');
  str = str.replace(/\\,|\\;|\\!/g, ' ');
  str = str.replace(/\\\\[0-9a-zA-Z]*|\\\\/g, '  |  ');

  // Clean common LaTeX operators in indices
  str = str.replace(/\\max\b/g, 'max');
  str = str.replace(/\\min\b/g, 'min');
  str = str.replace(/\\prime\b/g, '′');

  // Fractions: Common pre-baked fractions
  str = str.replace(/\\frac\{1\}\{2\}/g, '½');
  str = str.replace(/\\frac\{1\}\{4\}/g, '¼');
  str = str.replace(/\\frac\{3\}\{4\}/g, '¾');
  str = str.replace(/\(1\/2\)/g, '½');

  // Robust balanced brace parser for \frac{numerator}{denominator}
  let fracFound = true;
  let maxFracLoops = 10;
  while (fracFound && maxFracLoops-- > 0) {
    fracFound = false;
    const idx = str.indexOf('\\frac');
    if (idx !== -1) {
      let p = idx + 5;
      while (p < str.length && /\s/.test(str[p])) p++;
      if (str[p] === '{') {
        let depth = 0;
        let numStart = p + 1;
        let numEnd = -1;
        for (let j = p; j < str.length; j++) {
          if (str[j] === '{') depth++;
          else if (str[j] === '}') {
            depth--;
            if (depth === 0) {
              numEnd = j;
              break;
            }
          }
        }
        if (numEnd !== -1) {
          let denP = numEnd + 1;
          while (denP < str.length && /\s/.test(str[denP])) denP++;
          if (str[denP] === '{') {
            let denDepth = 0;
            let denStart = denP + 1;
            let denEnd = -1;
            for (let k = denP; k < str.length; k++) {
              if (str[k] === '{') denDepth++;
              else if (str[k] === '}') {
                denDepth--;
                if (denDepth === 0) {
                  denEnd = k;
                  break;
                }
              }
            }
            if (denEnd !== -1) {
              const num = str.substring(numStart, numEnd).trim();
              const den = str.substring(denStart, denEnd).trim();
              str = str.substring(0, idx) + `(${num})/(${den})` + str.substring(denEnd + 1);
              fracFound = true;
            }
          }
        }
      }
    }
  }

  // Fallback regex for remaining simple fractions
  str = str.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');

  // Robust balanced brace parser for \sqrt{...}
  let sqrtFound = true;
  let maxSqrtLoops = 8;
  while (sqrtFound && maxSqrtLoops-- > 0) {
    sqrtFound = false;
    const sIdx = str.indexOf('\\sqrt');
    if (sIdx !== -1) {
      let p = sIdx + 5;
      while (p < str.length && /\s/.test(str[p])) p++;
      let nRoot = '';
      if (str[p] === '[') {
        const closeB = str.indexOf(']', p);
        if (closeB !== -1) {
          nRoot = str.substring(p + 1, closeB);
          p = closeB + 1;
          while (p < str.length && /\s/.test(str[p])) p++;
        }
      }
      if (str[p] === '{') {
        let depth = 0;
        let radStart = p + 1;
        let radEnd = -1;
        for (let j = p; j < str.length; j++) {
          if (str[j] === '{') depth++;
          else if (str[j] === '}') {
            depth--;
            if (depth === 0) {
              radEnd = j;
              break;
            }
          }
        }
        if (radEnd !== -1) {
          const rad = str.substring(radStart, radEnd).trim();
          const prefix = nRoot ? `${nRoot}√` : '√';
          str = str.substring(0, sIdx) + `${prefix}(${rad})` + str.substring(radEnd + 1);
          sqrtFound = true;
        }
      }
    }
  }

  // Square roots fallback
  str = str.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, '$1√($2)');
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
  str = str.replace(/\\sqrt\s*([a-zA-Z0-9])/g, '√$1');

  // Vectors
  str = str.replace(/\\vec\{([^{}]+)\}/g, '$1⃗');
  str = str.replace(/\\hat\{([^{}]+)\}/g, '$1̂');

  // Greek letters
  for (const [key, val] of Object.entries(GREEK_MAP)) {
    const re = new RegExp(`\\\\${key}\\b`, 'g');
    str = str.replace(re, val);
  }

  // Math symbols
  for (const [key, val] of Object.entries(SYMBOL_MAP)) {
    const re = new RegExp(`\\\\${key}\\b`, 'g');
    str = str.replace(re, ` ${val} `);
  }

  // Superscripts: x^2 -> x², x^{2} -> x²
  str = str.replace(/\^\{([^{}]+)\}|\^([0-9a-zA-Z+-])/g, (_, p1, p2) => {
    const content = p1 || p2;
    let converted = '';
    for (const ch of content) {
      converted += SUPERSCRIPT_MAP[ch] || `^${ch}`;
    }
    return converted;
  });

  // Subscripts: x_1 -> x₁, x_{max} -> xₘₐₓ
  str = str.replace(/_\{([^{}]+)\}|_([0-9a-zA-Z+-])/g, (_, p1, p2) => {
    const content = p1 || p2;
    let converted = '';
    for (const ch of content) {
      converted += SUBSCRIPT_MAP[ch] || `_${ch}`;
    }
    return converted;
  });

  // Clean extra backslashes and redundant braces
  str = str.replace(/\\([a-zA-Z]+)/g, '$1');
  str = str.replace(/\{|\}/g, '');
  str = str.replace(/\s+/g, ' ').trim();

  // Normalize minus signs (use real mathematical minus U+2212 where appropriate)
  str = str.replace(/ - /g, ' − ');

  return str;
}

/* =========================================================================
   MATHEMATICAL LAYOUT & CANVAS RENDERING ENGINE
   ========================================================================= */

interface LayoutBox {
  width: number;
  height: number;
  ascent: number; // distance above baseline
  descent: number; // distance below baseline
  draw: (ctx: CanvasRenderingContext2D, x: number, yBaseline: number) => void;
}

/**
 * Creates an italic serif font string for math variables, or upright font for functions/numbers
 */
function getMathFont(fontSize: number, isItalic = true, isBold = false): string {
  const style = isItalic ? 'italic ' : 'normal ';
  const weight = isBold ? 'bold ' : 'normal ';
  return `${style}${weight}${fontSize}px "Cambria Math", "Times New Roman", "DejaVu Serif", "Nimbus Roman No9 L", serif`;
}

/**
 * Tokenizes a mathematical formula expression into structured layout boxes
 */
function buildMathLayout(
  expression: string,
  fontSize: number,
  textColor: string,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  const expr = expression.trim();
  if (!expr) {
    return {
      width: 0,
      height: fontSize,
      ascent: fontSize * 0.8,
      descent: fontSize * 0.2,
      draw: () => {},
    };
  }

  // 1. Check for top-level comma or semicolon or \quad separation
  const parts = splitTopLevel(expr, [', \\quad', '\\quad', ',', ';']);
  if (parts.length > 1) {
    const childBoxes: LayoutBox[] = [];
    parts.forEach((part, idx) => {
      childBoxes.push(buildMathLayout(part, fontSize, textColor, ctx));
      if (idx < parts.length - 1) {
        // Separator box
        ctx.font = getMathFont(fontSize, false, false);
        const sep = ',   ';
        const sepW = ctx.measureText(sep).width;
        childBoxes.push({
          width: sepW,
          height: fontSize,
          ascent: fontSize * 0.8,
          descent: fontSize * 0.2,
          draw: (c, x, yB) => {
            c.font = getMathFont(fontSize, false, false);
            c.fillStyle = textColor;
            c.fillText(',', x, yB);
          },
        });
      }
    });
    return combineHorizontalBoxes(childBoxes);
  }

  // 2. Parse general expression tokens sequentially
  const items: LayoutBox[] = [];
  let i = 0;

  while (i < expr.length) {
    // Skip whitespace
    if (/\s/.test(expr[i])) {
      items.push({
        width: fontSize * 0.28,
        height: fontSize,
        ascent: fontSize * 0.8,
        descent: fontSize * 0.2,
        draw: () => {},
      });
      i++;
      continue;
    }

    // Fraction: \frac{num}{den}
    if (expr.startsWith('\\frac', i)) {
      i += 5;
      while (i < expr.length && /\s/.test(expr[i])) i++;
      const numStr = extractEnclosedBraces(expr, i);
      i += numStr.rawLength;
      while (i < expr.length && /\s/.test(expr[i])) i++;
      const denStr = extractEnclosedBraces(expr, i);
      i += denStr.rawLength;

      const fracBox = createFractionBox(numStr.content, denStr.content, fontSize, textColor, ctx);
      items.push(fracBox);
      continue;
    }

    // Square Root: \sqrt{radicand} or \sqrt[n]{radicand}
    if (expr.startsWith('\\sqrt', i)) {
      i += 5;
      while (i < expr.length && /\s/.test(expr[i])) i++;
      let indexStr = '';
      if (expr[i] === '[') {
        const closeIdx = expr.indexOf(']', i);
        if (closeIdx !== -1) {
          indexStr = expr.substring(i + 1, closeIdx);
          i = closeIdx + 1;
        }
      }
      while (i < expr.length && /\s/.test(expr[i])) i++;
      const rad = extractEnclosedBraces(expr, i);
      i += rad.rawLength;

      const sqrtBox = createSqrtBox(rad.content, indexStr, fontSize, textColor, ctx);
      items.push(sqrtBox);
      continue;
    }

    // Vector: \vec{v} or \hat{u}
    if (expr.startsWith('\\vec', i) || expr.startsWith('\\hat', i)) {
      const isHat = expr.startsWith('\\hat', i);
      i += 4;
      const target = extractEnclosedBraces(expr, i);
      i += target.rawLength;
      const inner = buildMathLayout(target.content, fontSize, textColor, ctx);
      const vecBox: LayoutBox = {
        width: inner.width,
        height: inner.height + fontSize * 0.3,
        ascent: inner.ascent + fontSize * 0.3,
        descent: inner.descent,
        draw: (c, x, yB) => {
          inner.draw(c, x, yB);
          c.save();
          c.strokeStyle = textColor;
          c.fillStyle = textColor;
          c.lineWidth = Math.max(1, fontSize * 0.07);
          const arrowY = yB - inner.ascent - fontSize * 0.15;
          const arrowW = Math.max(8, inner.width * 0.8);
          const startX = x + (inner.width - arrowW) / 2;
          if (isHat) {
            // Caret ^
            c.beginPath();
            c.moveTo(startX, arrowY);
            c.lineTo(startX + arrowW / 2, arrowY - fontSize * 0.2);
            c.lineTo(startX + arrowW, arrowY);
            c.stroke();
          } else {
            // Vector arrow ->
            c.beginPath();
            c.moveTo(startX, arrowY);
            c.lineTo(startX + arrowW, arrowY);
            c.stroke();
            // Arrowhead
            c.beginPath();
            c.moveTo(startX + arrowW, arrowY);
            c.lineTo(startX + arrowW - fontSize * 0.22, arrowY - fontSize * 0.14);
            c.lineTo(startX + arrowW - fontSize * 0.22, arrowY + fontSize * 0.14);
            c.closePath();
            c.fill();
          }
          c.restore();
        },
      };
      items.push(vecBox);
      continue;
    }

    // Parenthesized or Braced Group: ( ... ) or [ ... ]
    if (expr[i] === '(' || expr[i] === '[' || expr[i] === '{') {
      const openCh = expr[i];
      const closeCh = openCh === '(' ? ')' : openCh === '[' ? ']' : '}';
      const match = extractEnclosedDelimiters(expr, i, openCh, closeCh);
      i += match.rawLength;

      const inner = buildMathLayout(match.content, fontSize, textColor, ctx);
      const parenBox = wrapInDelimiters(inner, openCh, closeCh, fontSize, textColor, ctx);
      items.push(parenBox);
      continue;
    }

    // Subscript or Superscript attached to previous item or variable
    if (expr[i] === '^' || expr[i] === '_') {
      let supStr = '';
      let subStr = '';

      while (i < expr.length && (expr[i] === '^' || expr[i] === '_')) {
        const type = expr[i];
        i++;
        let content = '';
        if (expr[i] === '{') {
          const enc = extractEnclosedBraces(expr, i);
          content = enc.content;
          i += enc.rawLength;
        } else if (i < expr.length && !/\s/.test(expr[i])) {
          content = expr[i];
          i++;
        }
        if (type === '^') supStr = content;
        else subStr = content;
      }

      // Attach to previous item if possible, or create standalone
      const prev = items.pop();
      if (prev) {
        items.push(attachScripts(prev, supStr, subStr, fontSize, textColor, ctx));
      } else {
        const dummy: LayoutBox = {
          width: 0,
          height: fontSize,
          ascent: fontSize * 0.8,
          descent: fontSize * 0.2,
          draw: () => {},
        };
        items.push(attachScripts(dummy, supStr, subStr, fontSize, textColor, ctx));
      }
      continue;
    }

    // Binary / Relational Operators (=, +, -, ±, ×, ·, etc.)
    const opMatch = matchOperator(expr, i);
    if (opMatch) {
      i += opMatch.length;
      items.push(createOperatorBox(opMatch.symbol, fontSize, textColor, ctx));
      continue;
    }

    // LaTeX Command (\sin, \theta, \alpha, etc.)
    if (expr[i] === '\\') {
      const cmdMatch = expr.substring(i + 1).match(/^[a-zA-Z]+/);
      if (cmdMatch) {
        const cmd = cmdMatch[0];
        i += 1 + cmd.length;

        // Mathematical Function: \sin, \cos, \ln, etc.
        if (MATH_FUNCTIONS.has(cmd.toLowerCase())) {
          items.push(createTextBox(cmd, fontSize, textColor, false, false, ctx));
          continue;
        }

        // Greek Letter: \theta, \alpha, \lambda
        if (GREEK_MAP[cmd]) {
          const greekCh = GREEK_MAP[cmd];
          items.push(createTextBox(greekCh, fontSize, textColor, true, false, ctx));
          continue;
        }

        // Math Symbol: \times, \cdot, \pm, \infty
        if (SYMBOL_MAP[cmd]) {
          const sym = SYMBOL_MAP[cmd];
          items.push(createOperatorBox(sym, fontSize, textColor, ctx));
          continue;
        }

        // Text wrapper: \text{...} or \mathrm{...}
        if (cmd === 'text' || cmd === 'mathrm' || cmd === 'mathbf') {
          while (i < expr.length && /\s/.test(expr[i])) i++;
          const t = extractEnclosedBraces(expr, i);
          i += t.rawLength;
          items.push(createTextBox(t.content, fontSize, textColor, false, cmd === 'mathbf', ctx));
          continue;
        }

        // Unrecognized command - treat as text
        items.push(createTextBox(cmd, fontSize, textColor, false, false, ctx));
        continue;
      } else {
        i++;
        continue;
      }
    }

    // Numbers (e.g., 0, 1, 2, 45, 9.8) - rendered upright
    const numMatch = expr.substring(i).match(/^[0-9]+(\.[0-9]+)?/);
    if (numMatch) {
      const numStr = numMatch[0];
      i += numStr.length;
      items.push(createTextBox(numStr, fontSize, textColor, false, false, ctx));
      continue;
    }

    // Single Math Variable (e.g. u, v, t, x, y, g, m, R, H) - rendered italic
    const ch = expr[i];
    i++;
    const isLetter = /^[a-zA-Z]$/.test(ch);
    items.push(createTextBox(ch, fontSize, textColor, isLetter, false, ctx));
  }

  return combineHorizontalBoxes(items);
}

/**
 * Combines an array of layout boxes horizontally along a common baseline
 */
function combineHorizontalBoxes(boxes: LayoutBox[]): LayoutBox {
  if (boxes.length === 0) {
    return {
      width: 0,
      height: 10,
      ascent: 8,
      descent: 2,
      draw: () => {},
    };
  }

  let totalWidth = 0;
  let maxAscent = 0;
  let maxDescent = 0;

  for (const b of boxes) {
    totalWidth += b.width;
    if (b.ascent > maxAscent) maxAscent = b.ascent;
    if (b.descent > maxDescent) maxDescent = b.descent;
  }

  return {
    width: totalWidth,
    height: maxAscent + maxDescent,
    ascent: maxAscent,
    descent: maxDescent,
    draw: (ctx, startX, baselineY) => {
      let currX = startX;
      for (const b of boxes) {
        b.draw(ctx, currX, baselineY);
        currX += b.width;
      }
    },
  };
}

/**
 * Creates a text box for a word, symbol, number, or variable
 */
function createTextBox(
  text: string,
  fontSize: number,
  color: string,
  isItalic: boolean,
  isBold: boolean,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  ctx.font = getMathFont(fontSize, isItalic, isBold);
  const width = ctx.measureText(text).width;
  const ascent = fontSize * 0.78;
  const descent = fontSize * 0.22;

  return {
    width,
    height: fontSize,
    ascent,
    descent,
    draw: (c, x, yB) => {
      c.font = getMathFont(fontSize, isItalic, isBold);
      c.fillStyle = color;
      c.fillText(text, x, yB);
    },
  };
}

/**
 * Creates an operator box with standard mathematical padding
 */
function createOperatorBox(
  symbol: string,
  fontSize: number,
  color: string,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  ctx.font = getMathFont(fontSize, false, false);
  const symW = ctx.measureText(symbol).width;
  const pad = fontSize * 0.28;
  const totalW = symW + pad * 2;

  return {
    width: totalW,
    height: fontSize,
    ascent: fontSize * 0.78,
    descent: fontSize * 0.22,
    draw: (c, x, yB) => {
      c.font = getMathFont(fontSize, false, false);
      c.fillStyle = color;
      c.fillText(symbol, x + pad, yB);
    },
  };
}

/**
 * Creates an authentic fraction box with centered numerator, centered denominator,
 * and a crisp horizontal fraction bar line.
 */
function createFractionBox(
  numExpr: string,
  denExpr: string,
  fontSize: number,
  textColor: string,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  const subFontSize = Math.max(9, fontSize * 0.85);
  const numBox = buildMathLayout(numExpr, subFontSize, textColor, ctx);
  const denBox = buildMathLayout(denExpr, subFontSize, textColor, ctx);

  const padH = fontSize * 0.35;
  const width = Math.max(numBox.width, denBox.width) + padH * 2;
  const barThickness = Math.max(1.2, fontSize * 0.075);
  const barGap = fontSize * 0.18;

  // Baseline of entire fraction is at the fraction bar
  const ascent = numBox.height + barGap + barThickness / 2;
  const descent = denBox.height + barGap + barThickness / 2;
  const height = ascent + descent;

  return {
    width,
    height,
    ascent,
    descent,
    draw: (c, x, yB) => {
      // Fraction bar positioned at the math baseline
      const barY = yB - fontSize * 0.25;

      // Draw horizontal fraction line
      c.save();
      c.strokeStyle = textColor;
      c.lineWidth = barThickness;
      c.beginPath();
      c.moveTo(x, barY);
      c.lineTo(x + width, barY);
      c.stroke();
      c.restore();

      // Draw numerator centered above bar
      const numX = x + (width - numBox.width) / 2;
      const numBaseline = barY - barGap - numBox.descent;
      numBox.draw(c, numX, numBaseline);

      // Draw denominator centered below bar
      const denX = x + (width - denBox.width) / 2;
      const denBaseline = barY + barGap + denBox.ascent;
      denBox.draw(c, denX, denBaseline);
    },
  };
}

/**
 * Creates an authentic square root box with radical checkmark and horizontal vinculum overbar.
 */
function createSqrtBox(
  radicandExpr: string,
  indexExpr: string,
  fontSize: number,
  textColor: string,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  const radBox = buildMathLayout(radicandExpr, fontSize, textColor, ctx);
  const barThickness = Math.max(1.2, fontSize * 0.075);
  const radW = fontSize * 0.65;
  const padR = fontSize * 0.15;
  const width = radW + radBox.width + padR;

  const topOverhead = fontSize * 0.25;
  const ascent = radBox.ascent + topOverhead;
  const descent = radBox.descent + fontSize * 0.1;
  const height = ascent + descent;

  return {
    width,
    height,
    ascent,
    descent,
    draw: (c, x, yB) => {
      const topY = yB - ascent + barThickness;
      const botY = yB + descent - barThickness;
      const hookX = x + fontSize * 0.1;
      const midX = x + fontSize * 0.35;
      const peakX = x + radW;

      // Draw radical symbol & overbar
      c.save();
      c.strokeStyle = textColor;
      c.lineWidth = barThickness;
      c.lineCap = 'round';
      c.lineJoin = 'miter';

      c.beginPath();
      // small start notch
      c.moveTo(hookX, yB - fontSize * 0.1);
      // dip to bottom
      c.lineTo(midX, botY);
      // climb to top peak
      c.lineTo(peakX, topY);
      // horizontal overbar over entire radicand
      c.lineTo(x + width, topY);
      c.stroke();
      c.restore();

      // If degree root like \sqrt[3]{x}
      if (indexExpr) {
        c.save();
        c.font = getMathFont(fontSize * 0.55, false, false);
        c.fillStyle = textColor;
        c.fillText(indexExpr, x + fontSize * 0.05, topY + fontSize * 0.4);
        c.restore();
      }

      // Draw inner radicand
      radBox.draw(c, peakX + fontSize * 0.05, yB);
    },
  };
}

/**
 * Wraps a math box in matching scalable parentheses, brackets, or braces
 */
function wrapInDelimiters(
  inner: LayoutBox,
  openDelim: string,
  closeDelim: string,
  fontSize: number,
  textColor: string,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  const delimW = fontSize * 0.35;
  const width = inner.width + delimW * 2;
  const ascent = inner.ascent;
  const descent = inner.descent;

  return {
    width,
    height: inner.height,
    ascent,
    descent,
    draw: (c, x, yB) => {
      const topY = yB - ascent;
      const botY = yB + descent;
      const h = botY - topY;

      c.save();
      c.strokeStyle = textColor;
      c.lineWidth = Math.max(1, fontSize * 0.065);
      c.lineCap = 'round';

      if (openDelim === '(') {
        c.beginPath();
        c.bezierCurveTo(x + delimW * 0.8, topY, x + delimW * 0.2, topY + h * 0.3, x + delimW * 0.2, topY + h * 0.5);
        c.bezierCurveTo(x + delimW * 0.2, topY + h * 0.7, x + delimW * 0.8, botY, x + delimW * 0.8, botY);
        c.stroke();
      } else if (openDelim === '[') {
        c.beginPath();
        c.moveTo(x + delimW * 0.8, topY);
        c.lineTo(x + delimW * 0.2, topY);
        c.lineTo(x + delimW * 0.2, botY);
        c.lineTo(x + delimW * 0.8, botY);
        c.stroke();
      }

      inner.draw(c, x + delimW, yB);

      const rightX = x + width;
      if (closeDelim === ')') {
        c.beginPath();
        c.bezierCurveTo(rightX - delimW * 0.8, topY, rightX - delimW * 0.2, topY + h * 0.3, rightX - delimW * 0.2, topY + h * 0.5);
        c.bezierCurveTo(rightX - delimW * 0.2, topY + h * 0.7, rightX - delimW * 0.8, botY, rightX - delimW * 0.8, botY);
        c.stroke();
      } else if (closeDelim === ']') {
        c.beginPath();
        c.moveTo(rightX - delimW * 0.8, topY);
        c.lineTo(rightX - delimW * 0.2, topY);
        c.lineTo(rightX - delimW * 0.2, botY);
        c.lineTo(rightX - delimW * 0.8, botY);
        c.stroke();
      }
      c.restore();
    },
  };
}

/**
 * Attaches superscript and/or subscript to a target layout box
 */
function attachScripts(
  target: LayoutBox,
  supStr: string,
  subStr: string,
  fontSize: number,
  textColor: string,
  ctx: CanvasRenderingContext2D
): LayoutBox {
  const scriptFontSize = Math.max(8, fontSize * 0.65);
  const supBox = supStr ? buildMathLayout(supStr, scriptFontSize, textColor, ctx) : null;
  const subBox = subStr ? buildMathLayout(subStr, scriptFontSize, textColor, ctx) : null;

  const scriptWidth = Math.max(supBox?.width || 0, subBox?.width || 0);
  const width = target.width + scriptWidth + fontSize * 0.08;

  const supLift = fontSize * 0.45;
  const subDrop = fontSize * 0.28;

  const ascent = Math.max(target.ascent, (supBox?.ascent || 0) + supLift);
  const descent = Math.max(target.descent, (subBox?.descent || 0) + subDrop);

  return {
    width,
    height: ascent + descent,
    ascent,
    descent,
    draw: (c, x, yB) => {
      target.draw(c, x, yB);
      const scriptX = x + target.width + fontSize * 0.04;
      if (supBox) {
        supBox.draw(c, scriptX, yB - supLift);
      }
      if (subBox) {
        subBox.draw(c, scriptX, yB + subDrop);
      }
    },
  };
}

/* =========================================================================
   PARSER UTILITY HELPERS
   ========================================================================= */

function extractEnclosedBraces(str: string, startIndex: number): { content: string; rawLength: number } {
  if (startIndex >= str.length) return { content: '', rawLength: 0 };
  let openIndex = startIndex;
  while (openIndex < str.length && str[openIndex] !== '{') openIndex++;
  if (openIndex >= str.length) {
    const single = str[startIndex] || '';
    return { content: single, rawLength: single.length };
  }

  let depth = 0;
  let endIndex = openIndex;
  for (let i = openIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  const content = str.substring(openIndex + 1, endIndex);
  const rawLength = endIndex - startIndex + 1;
  return { content, rawLength };
}

function extractEnclosedDelimiters(
  str: string,
  startIndex: number,
  openChar: string,
  closeChar: string
): { content: string; rawLength: number } {
  let depth = 0;
  let endIndex = startIndex;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  const content = str.substring(startIndex + 1, endIndex);
  const rawLength = endIndex - startIndex + 1;
  return { content, rawLength };
}

function splitTopLevel(str: string, delimiters: string[]): string[] {
  const results: string[] = [];
  let depth = 0;
  let lastIdx = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '{' || ch === '(' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === ']') depth--;
    else if (depth === 0) {
      for (const delim of delimiters) {
        if (str.startsWith(delim, i)) {
          results.push(str.substring(lastIdx, i));
          i += delim.length - 1;
          lastIdx = i + 1;
          break;
        }
      }
    }
  }

  if (lastIdx < str.length) {
    results.push(str.substring(lastIdx));
  }

  return results.length > 1 ? results : [str];
}

function matchOperator(str: string, index: number): { symbol: string; length: number } | null {
  const ops = [
    { prefix: '\\pm', symbol: '±' },
    { prefix: '\\mp', symbol: '∓' },
    { prefix: '\\times', symbol: '×' },
    { prefix: '\\cdot', symbol: '·' },
    { prefix: '\\approx', symbol: '≈' },
    { prefix: '\\neq', symbol: '≠' },
    { prefix: '\\leq', symbol: '≤' },
    { prefix: '\\geq', symbol: '≥' },
    { prefix: '\\le', symbol: '≤' },
    { prefix: '\\ge', symbol: '≥' },
    { prefix: '\\implies', symbol: '⟹' },
    { prefix: '\\iff', symbol: '⟺' },
    { prefix: '\\to', symbol: '→' },
    { prefix: '==', symbol: '=' },
    { prefix: '<=', symbol: '≤' },
    { prefix: '>=', symbol: '≥' },
    { prefix: '!=', symbol: '≠' },
    { prefix: '~=', symbol: '≈' },
    { prefix: '=>', symbol: '⟹' },
    { prefix: '<=>', symbol: '⟺' },
    { prefix: '->', symbol: '→' },
    { prefix: '=', symbol: '=' },
    { prefix: '+', symbol: '+' },
    { prefix: '-', symbol: '−' },
    { prefix: '·', symbol: '·' },
    { prefix: '±', symbol: '±' },
    { prefix: '×', symbol: '×' },
    { prefix: '≈', symbol: '≈' },
    { prefix: '≠', symbol: '≠' },
    { prefix: '≤', symbol: '≤' },
    { prefix: '≥', symbol: '≥' },
    { prefix: '<', symbol: '<' },
    { prefix: '>', symbol: '>' },
  ];

  for (const op of ops) {
    if (str.startsWith(op.prefix, index)) {
      return { symbol: op.symbol, length: op.prefix.length };
    }
  }

  return null;
}

/* =========================================================================
   PUBLIC HIGH-DPI CANVAS IMAGE GENERATOR
   ========================================================================= */

/**
 * Renders any physics equation string into a high-DPI crystal-clear PNG data URL.
 * Supports fractions, roots, Greek letters, powers, indices, and vector notations.
 */
export function renderMathFormulaToImage(
  formula: string,
  options: MathRenderOptions = {}
): MathRenderResult | null {
  if (typeof document === 'undefined') {
    // Non-browser fallback
    return null;
  }

  const cleanFormula = preprocessFormula(formula);

  if (!cleanFormula) return null;

  const fontSize = options.fontSize || 22;
  const scale = options.scale || 3; // 3x oversampling = ~300 DPI vector-sharp quality
  const textColor = options.textColor || '#0f172a'; // Deep academic navy
  const bgColor = options.bgColor || 'rgba(255, 255, 255, 0)';
  const padX = options.paddingX || 14;
  const padY = options.paddingY || 10;

  // Offscreen measurement canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Build the layout tree
  const mathBox = buildMathLayout(cleanFormula, fontSize, textColor, ctx);

  const totalW = Math.ceil(mathBox.width + padX * 2);
  const totalH = Math.ceil(mathBox.height + padY * 2);

  // Set real pixel dimensions scaled for high DPI
  canvas.width = Math.max(30, totalW * scale);
  canvas.height = Math.max(20, totalH * scale);

  const drawCtx = canvas.getContext('2d');
  if (!drawCtx) return null;

  drawCtx.scale(scale, scale);

  // Background
  if (bgColor && bgColor !== 'transparent') {
    drawCtx.fillStyle = bgColor;
    drawCtx.fillRect(0, 0, totalW, totalH);
  }

  // Draw equation
  const startX = padX;
  const baselineY = padY + mathBox.ascent;
  mathBox.draw(drawCtx, startX, baselineY);

  // Dimensions in millimeters for standard 72pt/inch PDF units (1 pt = 0.352778 mm)
  // At standard 96 DPI: 1 px = 0.264583 mm
  const mmPerPx = 0.264583;
  let widthMm = totalW * mmPerPx;
  let heightMm = totalH * mmPerPx;

  if (options.maxWidthMm && widthMm > options.maxWidthMm) {
    const ratio = options.maxWidthMm / widthMm;
    widthMm = options.maxWidthMm;
    heightMm = heightMm * ratio;
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthMm,
    heightMm,
    widthPx: totalW,
    heightPx: totalH,
  };
}

/**
 * Measures the height in mm required for a formula box.
 */
export function measureMathFormulaBox(formula: string, widthMm: number): number {
  if (typeof document !== 'undefined') {
    const mathImg = renderMathFormulaToImage(formula, {
      maxWidthMm: widthMm - 6,
      fontSize: 22,
      scale: 3,
    });
    if (mathImg) {
      return Math.max(7.2, mathImg.heightMm + 3.2);
    }
  }
  return 8.5;
}

/**
 * Draws an authentic mathematical formula box into a jsPDF document.
 * If running in browser, embeds high-DPI (300 DPI) rendered mathematical equation
 * as a native PDF Image XObject (NO raw HTML).
 * Returns height in millimeters.
 */
export function drawMathFormulaBox(
  doc: any,
  formula: string,
  x: number,
  y: number,
  width: number,
  textColor: number[] = [15, 23, 42],
  themeBg: number[] = [241, 245, 249],
  themeBorder: number[] = [203, 213, 225]
): number {
  const mathImg = renderMathFormulaToImage(formula, {
    maxWidthMm: width - 6,
    fontSize: 22,
    scale: 3,
    textColor: `rgb(${textColor[0]}, ${textColor[1]}, ${textColor[2]})`,
    bgColor: `rgb(${themeBg[0]}, ${themeBg[1]}, ${themeBg[2]})`,
  });

  if (mathImg) {
    const fBoxH = Math.max(7.2, mathImg.heightMm + 3.2);
    doc.setFillColor(themeBg[0], themeBg[1], themeBg[2]);
    doc.setDrawColor(themeBorder[0], themeBorder[1], themeBorder[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, width, fBoxH, 0.8, 0.8, 'FD');

    // Embed genuine crisp mathematical equation image
    const imgX = x + 3;
    const imgY = y + (fBoxH - mathImg.heightMm) / 2;
    doc.addImage(mathImg.dataUrl, 'PNG', imgX, imgY, mathImg.widthMm, mathImg.heightMm);
    return fBoxH;
  }

  // Fallback for non-browser environment
  const mathText = formatLatexToMathText(formula);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  const fLines = doc.splitTextToSize(mathText, width - 8);
  const fBoxH = Math.max(5.5, fLines.length * 3.8 + 2.5);

  doc.setFillColor(themeBg[0], themeBg[1], themeBg[2]);
  doc.setDrawColor(themeBorder[0], themeBorder[1], themeBorder[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, fBoxH, 0.8, 0.8, 'FD');

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  fLines.forEach((fl: string, flIdx: number) => {
    doc.text(fl, x + 4, y + 3.4 + flIdx * 3.8);
  });

  return fBoxH;
}

