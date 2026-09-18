/**
 * LaTeX Pre-processing and Delimiter Wrapping Engine
 *
 * Ensures all physics mathematical formulas are strictly normalized and wrapped in proper
 * LaTeX mathematical environments (\begin{equation} ... \end{equation} for display equations
 * and \( ... \) for inline expressions) rather than loose, unescaped, or degraded raw strings.
 *
 * Automatically converts raw Unicode math symbols (like θ, α, ω, λ, ·, ², ±, √) into
 * standard, publication-ready LaTeX syntax (\theta, \alpha, \omega, \lambda, \cdot, ^2, \pm, \sqrt{})
 * so that mathematical expressions render as genuine textbook equations.
 */

export type LatexDelimiterMode = 'equation' | 'inline';

/**
 * Unicode Greek characters to standard LaTeX commands
 */
export const UNICODE_TO_LATEX_GREEK: Record<string, string> = {
  'θ': '\\theta',
  'Θ': '\\Theta',
  'ω': '\\omega',
  'Ω': '\\Omega',
  'λ': '\\lambda',
  'Λ': '\\Lambda',
  'α': '\\alpha',
  'β': '\\beta',
  'γ': '\\gamma',
  'Γ': '\\Gamma',
  'δ': '\\delta',
  'Δ': '\\Delta',
  'ε': '\\varepsilon',
  'μ': '\\mu',
  'ν': '\\nu',
  'ρ': '\\rho',
  'σ': '\\sigma',
  'Σ': '\\Sigma',
  'τ': '\\tau',
  'φ': '\\phi',
  'Φ': '\\Phi',
  'ψ': '\\psi',
  'Ψ': '\\Psi',
  'η': '\\eta',
  'π': '\\pi',
  'Π': '\\Pi',
  'ζ': '\\zeta',
  'χ': '\\chi',
  'κ': '\\kappa',
  'ξ': '\\xi',
  'Ξ': '\\Xi',
};

/**
 * Normalizes a raw physics formula into clean, standard LaTeX math syntax (without outer delimiters).
 */
export function formatToStandardLatexMath(rawFormula: string): string {
  if (!rawFormula) return '';

  let str = String(rawFormula).trim();

  // Strip existing outer delimiters if present
  str = str.replace(/^\\begin\{equation\*?\}[\s\n]*|[\s\n]*\\end\{equation\*?\}$/g, '').trim();
  str = str.replace(/^\\begin\{align\*?\}[\s\n]*|[\s\n]*\\end\{align\*?\}$/g, '').trim();
  str = str.replace(/^\\\(|\\\)$/g, '').trim();
  str = str.replace(/^\\\[|\\\]$/g, '').trim();
  str = str.replace(/^\$\$([\s\S]*?)\$\$$/g, '$1').trim();
  str = str.replace(/^\$([^\$]*?)\$$/g, '$1').trim();

  // 1. Convert Unicode Greek characters to proper LaTeX commands
  for (const [uChar, latexCmd] of Object.entries(UNICODE_TO_LATEX_GREEK)) {
    // Replace standalone unicode char with space-padded LaTeX command
    str = str.split(uChar).join(` ${latexCmd} `);
  }

  // 2. Normalize Unicode superscripts to standard LaTeX (^2, ^3, etc.)
  // Multi-character negative powers first!
  str = str
    .replace(/⁻¹/g, '^{-1}')
    .replace(/⁻²/g, '^{-2}')
    .replace(/⁻³/g, '^{-3}')
    .replace(/⁻⁴/g, '^{-4}')
    .replace(/⁺¹/g, '^{+1}')
    .replace(/⁺²/g, '^{+2}');

  const superscriptMap: Record<string, string> = {
    '²': '^2',
    '³': '^3',
    '¹': '^1',
    '⁰': '^0',
    '⁴': '^4',
    '⁵': '^5',
    '⁶': '^6',
    '⁷': '^7',
    '⁸': '^8',
    '⁹': '^9',
    '⁺': '^{+}',
    '⁻': '^{-}',
  };
  for (const [sChar, repl] of Object.entries(superscriptMap)) {
    str = str.split(sChar).join(repl);
  }

  // 3. Normalize Unicode subscripts to standard LaTeX (_0, _1, etc.)
  const subscriptMap: Record<string, string> = {
    '₀': '_0',
    '₁': '_1',
    '₂': '_2',
    '₃': '_3',
    '₄': '_4',
    '₅': '_5',
    '₆': '_6',
    '₇': '_7',
    '₈': '_8',
    '₉': '_9',
    'ₓ': '_x',
    'ᵧ': '_y',
    'ᵣ': '_r',
    'ₘ': '_m',
    'ₑ': '_e',
    'ₚ': '_p',
    'ₙ': '_n',
  };
  for (const [sChar, repl] of Object.entries(subscriptMap)) {
    str = str.split(sChar).join(repl);
  }

  // 4. Mathematical Operators & Symbols
  str = str.replace(/·/g, ' \\cdot ');
  str = str.replace(/×/g, ' \\times ');
  str = str.replace(/±/g, ' \\pm ');
  str = str.replace(/∓/g, ' \\mp ');
  str = str.replace(/≈/g, ' \\approx ');
  str = str.replace(/≠/g, ' \\neq ');
  str = str.replace(/≤/g, ' \\le ');
  str = str.replace(/≥/g, ' \\ge ');
  str = str.replace(/°/g, '^\\circ ');
  str = str.replace(/ℏ/g, ' \\hbar ');
  str = str.replace(/⟹/g, ' \\implies ');
  str = str.replace(/⟺/g, ' \\iff ');
  str = str.replace(/→/g, ' \\to ');
  str = str.replace(/∞/g, ' \\infty ');
  str = str.replace(/∝/g, ' \\propto ');

  // 5. Functions (convert plain text sin, cos, etc. to proper LaTeX operators)
  // Ensure we do not double prefix e.g. \\sin
  str = str.replace(/(?<!\\)\b(sin|cos|tan|cot|sec|csc|ln|log|exp|arcsin|arccos|arctan)\b/g, '\\$1 ');

  // 6. Subscript naming patterns (H_max -> H_{\max}, R_max -> R_{\max}, etc.)
  str = str.replace(/_max\b/g, '_{\\max}');
  str = str.replace(/_min\b/g, '_{\\min}');
  str = str.replace(/_nth\b/g, '_{n\\text{th}}');
  str = str.replace(/_up\b/g, '_{\\text{up}}');
  str = str.replace(/_down\b/g, '_{\\text{down}}');
  str = str.replace(/_net\b/g, '_{\\text{net}}');
  str = str.replace(/_eff\b/g, '_{\\text{eff}}');
  str = str.replace(/_com\b/g, '_{\\text{cm}}');
  str = str.replace(/_ext\b/g, '_{\\text{ext}}');

  // 7. Square roots
  str = str.replace(/√\(([^()]+)\)/g, '\\sqrt{$1}');
  str = str.replace(/√([a-zA-Z0-9_\^·]+)/g, '\\sqrt{$1}');
  str = str.replace(/sqrt\(([^()]+)\)/g, '\\sqrt{$1}');

  // 8. Fractions: Convert slash division expressions to \frac{num}{den}
  // Standard fraction conversions
  str = str.replace(/\(1\/2\)/g, '\\frac{1}{2}');
  str = str.replace(/\b1\/2\b/g, '\\frac{1}{2}');
  str = str.replace(/\(1\/4\)/g, '\\frac{1}{4}');
  str = str.replace(/\b1\/4\b/g, '\\frac{1}{4}');
  str = str.replace(/\(3\/4\)/g, '\\frac{3}{4}');
  str = str.replace(/\b3\/4\b/g, '\\frac{3}{4}');

  for (let pass = 0; pass < 3; pass++) {
    // (A) / (B)
    str = str.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    // (A) / B
    str = str.replace(/\(([^()]+)\)\s*\/\s*([a-zA-Z0-9_\\^·\\]+)/g, '\\frac{$1}{$2}');
    // A / (B)
    str = str.replace(/([a-zA-Z0-9_\\^·\\]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    // Single term / single term: e.g. 2·u_y / g or u^2 / g (avoiding already formed \frac)
    str = str.replace(/(?<!\\frac\{[^{}]*\}\{)(?<!\\frac\{)([a-zA-Z0-9_\^·\\]+)\s*\/\s*([a-zA-Z0-9_\^·\\]+)(?!\})/g, '\\frac{$1}{$2}');
  }

  // Clean redundant whitespace
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Normalizes a raw mathematical string and wraps it in proper LaTeX delimiters.
 * Ensures consistent, publication-ready mathematical formatting.
 */
export function preprocessAndWrapFormula(
  rawFormula: string,
  mode: LatexDelimiterMode = 'equation'
): string {
  if (!rawFormula) return mode === 'equation' ? '\\begin{equation}\n\\end{equation}' : '\\(\\)';

  const cleaned = formatToStandardLatexMath(rawFormula);

  if (mode === 'equation') {
    return `\\begin{equation}\n  ${cleaned}\n\\end{equation}`;
  }
  return `\\(${cleaned}\\)`;
}

/**
 * Strips outer LaTeX delimiters to obtain raw inner mathematical expression
 */
export function unwrapFormula(formula: string): string {
  if (!formula) return '';
  let str = String(formula).trim();
  str = str.replace(/^\\begin\{equation\*?\}[\s\n]*|[\s\n]*\\end\{equation\*?\}$/g, '');
  str = str.replace(/^\\begin\{align\*?\}[\s\n]*|[\s\n]*\\end\{align\*?\}$/g, '');
  str = str.replace(/^\\\(|\\\)$/g, '');
  str = str.replace(/^\\\[|\\\]$/g, '');
  str = str.replace(/^\$\$|\$\$$/g, '');
  str = str.replace(/^\$|\$$/g, '');
  return str.trim();
}

/**
 * Inspects whether a formula string is wrapped in proper LaTeX delimiters
 */
export function isDelimitedFormula(formula: string): boolean {
  if (!formula) return false;
  const str = String(formula).trim();
  return (
    (/^\\begin\{equation\*?\}[\s\S]*\\end\{equation\*?\}$/.test(str)) ||
    (/^\\begin\{align\*?\}[\s\S]*\\end\{align\*?\}$/.test(str)) ||
    (/^\\\((\s*[\s\S]*?\s*)\\\)$/.test(str)) ||
    (/^\\\[(\s*[\s\S]*?\s*)\\\]$/.test(str))
  );
}
