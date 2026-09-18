import jsPDF from 'jspdf';
import { ALL_CONCEPTS, CHAPTERS, CATEGORIES } from '../data/allConcepts';
import { JEE_CHAPTER_SHEETS, JeeChapterSheet } from '../data/jeeFormulaSheetData';
import { PhysicsConcept, Chapter } from '../types';
import {
  validateFormulaString,
  autoRepairFormulaString,
  validateChapterSheetData,
  SheetValidationReport,
} from './formulaValidator';
import {
  drawMathFormulaBox,
  measureMathFormulaBox,
  formatLatexToMathText,
} from './mathPdfRenderer';

/**
 * Robust LaTeX-to-Clean-Readable-Mathematical-ASCII converter.
 * Converts LaTeX equations and special physics characters to 100% printable,
 * uncorrupted mathematical text for jsPDF Standard Type1 fonts.
 */
export function cleanLatexForPdf(latex: string): string {
  if (!latex) return '';

  let str = String(latex);

  // Strip math delimiters
  str = str.replace(/\$\$/g, '').replace(/\$/g, '');
  str = str.replace(/^\\\[|\\\]$/g, '');
  str = str.replace(/^\\\(|\\\)$/g, '');

  // 1. Remove KaTeX/LaTeX formatting environments & wrappers
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

  str = str.replace(/\\left\(|\\right\)/g, (m) => (m.includes('(') ? '(' : ')'));
  str = str.replace(/\\left\[|\\right\]/g, (m) => (m.includes('[') ? '[' : ']'));
  str = str.replace(/\\left\\\{|\\right\\\}/g, (m) => (m.includes('{') ? '{' : '}'));
  str = str.replace(/\\left|\\right/g, '');
  str = str.replace(/\\quad|\\qquad|\\,|\\;|\\!/g, ' ');
  str = str.replace(/\\\\[0-9a-zA-Z]*|\\\\/g, '  |  ');

  // Clean common LaTeX operators in indices
  str = str.replace(/\\max\b/g, 'max');
  str = str.replace(/\\min\b/g, 'min');
  str = str.replace(/\\prime\b/g, "'");

  // 2. Fractions: Balanced brace parser for \frac{numerator}{denominator}
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
              str = str.substring(0, idx) + `(${num}) / (${den})` + str.substring(denEnd + 1);
              fracFound = true;
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    str = str.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1) / ($2)');
  }
  str = str.replace(/\\frac\s*([a-zA-Z0-9])\s*([a-zA-Z0-9])/g, '($1) / ($2)');

  // 3. Square roots & n-th roots: Balanced brace parser for \sqrt{...}
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
          const prefix = nRoot ? `root_${nRoot}` : 'sqrt';
          str = str.substring(0, sIdx) + `${prefix}(${rad})` + str.substring(radEnd + 1);
          sqrtFound = true;
        }
      }
    }
  }

  str = str.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, 'root_$1($2)');
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');
  str = str.replace(/\\sqrt\s*([a-zA-Z0-9])/g, 'sqrt($1)');

  // 4. Vectors, hats, derivatives, integrals
  str = str.replace(/\\vec\{([^{}]+)\}/g, 'vec($1)');
  str = str.replace(/\\hat\{([^{}]+)\}/g, '$1_hat');
  str = str.replace(/\\dot\{([^{}]+)\}/g, 'd($1)/dt');
  str = str.replace(/\\ddot\{([^{}]+)\}/g, 'd2($1)/dt2');
  str = str.replace(/\\bar\{([^{}]+)\}/g, 'avg($1)');
  str = str.replace(/\\tilde\{([^{}]+)\}/g, '~$1');
  str = str.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, 'INTEGRAL[$1 to $2]');
  str = str.replace(/\\int_\{([^{}]+)\}/g, 'INTEGRAL[$1]');
  str = str.replace(/\\int/g, 'INTEGRAL ');
  str = str.replace(/\\oint/g, 'OINT ');
  str = str.replace(/\\partial/g, 'd/');
  str = str.replace(/\\nabla/g, 'grad');
  str = str.replace(/\\infty/g, 'inf');

  // 5. Greek Letter mappings (LaTeX to real standard mathematical symbols)
  const latexGreekMap: Record<string, string> = {
    '\\theta': 'θ',
    '\\Theta': 'Θ',
    '\\omega': 'ω',
    '\\Omega': 'Ω',
    '\\lambda': 'λ',
    '\\Lambda': 'Λ',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\Gamma': 'Γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\epsilon': 'ε',
    '\\varepsilon': 'ε',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\Sigma': 'Σ',
    '\\tau': 'τ',
    '\\phi': 'φ',
    '\\Phi': 'Φ',
    '\\psi': 'ψ',
    '\\Psi': 'Ψ',
    '\\eta': 'η',
    '\\pi': 'π',
    '\\Pi': 'Π',
    '\\zeta': 'ζ',
    '\\chi': 'χ',
    '\\kappa': 'κ',
  };

  for (const [tex, name] of Object.entries(latexGreekMap)) {
    str = str.split(tex).join(name);
  }

  // 6. LaTeX Operators and Relational symbols
  str = str.replace(/\\cdot/g, ' · ');
  str = str.replace(/\\times/g, ' × ');
  str = str.replace(/\\pm/g, ' ± ');
  str = str.replace(/\\mp/g, ' ∓ ');
  str = str.replace(/\\approx/g, ' ≈ ');
  str = str.replace(/\\sim/g, ' ~ ');
  str = str.replace(/\\neq/g, ' ≠ ');
  str = str.replace(/\\leq/g, ' ≤ ');
  str = str.replace(/\\geq/g, ' ≥ ');
  str = str.replace(/\\ll/g, ' ≪ ');
  str = str.replace(/\\gg/g, ' ≫ ');
  str = str.replace(/\\implies/g, ' ⟹ ');
  str = str.replace(/\\iff/g, ' ⟺ ');
  str = str.replace(/\\to/g, ' → ');
  str = str.replace(/\\propto/g, ' ∝ ');
  str = str.replace(/\\circ/g, '°');
  str = str.replace(/\\degree/g, '°');

  // 7. Math functions
  str = str.replace(/\\sin/g, 'sin');
  str = str.replace(/\\cos/g, 'cos');
  str = str.replace(/\\tan/g, 'tan');
  str = str.replace(/\\cot/g, 'cot');
  str = str.replace(/\\sec/g, 'sec');
  str = str.replace(/\\csc/g, 'csc');
  str = str.replace(/\\ln/g, 'ln');
  str = str.replace(/\\log/g, 'log');
  str = str.replace(/\\exp/g, 'exp');
  str = str.replace(/\\arcsin/g, 'arcsin');
  str = str.replace(/\\arccos/g, 'arccos');
  str = str.replace(/\\arctan/g, 'arctan');

  // 8. Superscripts and Subscripts
  str = str.replace(/\^2\b|\^\{2\}/g, '²');
  str = str.replace(/\^3\b|\^\{3\}/g, '³');
  str = str.replace(/\^4\b|\^\{4\}/g, '⁴');
  str = str.replace(/\^0\b|\^\{0\}/g, '⁰');
  str = str.replace(/\^1\b|\^\{1\}/g, '¹');
  str = str.replace(/\^\{-1\}/g, '⁻¹');
  str = str.replace(/\^\{-2\}/g, '⁻²');
  str = str.replace(/_0\b|_\{0\}/g, '₀');
  str = str.replace(/_1\b|_\{1\}/g, '₁');
  str = str.replace(/_2\b|_\{2\}/g, '₂');
  str = str.replace(/_x\b|_\{x\}/g, 'ₓ');
  str = str.replace(/_y\b|_\{y\}/g, 'ᵧ');

  // 9. Remove leftover backslashes or unmatched braces
  str = str.replace(/\{|\}/g, '');
  str = str.replace(/\\/g, '');

  // 10. Clean and compress spacing
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Sanitizes text for PDF rendering.
 * Preserves authentic Greek letters, mathematical operators, superscripts, and subscripts
 * when preserveMathSymbols is true (default).
 */
export function sanitizeUnicodeForPdf(text: string, options?: { preserveMathSymbols?: boolean }): string {
  if (!text) return '';

  let str = String(text);
  const preserveMath = options?.preserveMathSymbols !== false;

  if (!preserveMath) {
    // Legacy ASCII fallback only
    const unicodeGreek: Record<string, string> = {
      'θ': 'theta',
      'Θ': 'Theta',
      'ω': 'omega',
      'Ω': 'Omega',
      'λ': 'lambda',
      'Λ': 'Lambda',
      'α': 'alpha',
      'β': 'beta',
      'γ': 'gamma',
      'Γ': 'Gamma',
      'δ': 'delta',
      'Δ': 'Delta',
      'ε': 'epsilon',
      'μ': 'mu',
      'ν': 'nu',
      'ρ': 'rho',
      'σ': 'sigma',
      'Σ': 'Sigma',
      'τ': 'tau',
      'φ': 'phi',
      'Φ': 'Phi',
      'ψ': 'psi',
      'Ψ': 'Psi',
      'η': 'eta',
      'π': 'pi',
      'Π': 'Pi',
      'ζ': 'zeta',
      'χ': 'chi',
      'κ': 'kappa',
    };
    for (const [u, r] of Object.entries(unicodeGreek)) {
      str = str.split(u).join(r);
    }

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
      'ₘ': '_m',
      'ₙ': '_n',
      'ₓ': '_x',
      'ᵧ': '_y',
      'ᵣ': '_r',
      'ᵢ': '_i',
      'ⱼ': '_j',
      'ₖ': '_k',
      'ₑ': '_e',
      'ₚ': '_p',
      'ₛ': '_s',
      'ₜ': '_t',
    };
    for (const [u, r] of Object.entries(subscriptMap)) {
      str = str.split(u).join(r);
    }

    const superscriptMap: Record<string, string> = {
      '²': '^2',
      '³': '^3',
      '⁴': '^4',
      '⁵': '^5',
      '⁶': '^6',
      '⁷': '^7',
      '⁸': '^8',
      '⁹': '^9',
      '⁰': '^0',
      '¹': '^1',
      '⁻¹': '^(-1)',
      '⁻²': '^(-2)',
      '⁻³': '^(-3)',
      '⁻⁴': '^(-4)',
      '⁺': '^+',
      '⁻': '^-',
      '½': '(1/2)',
      '⅓': '(1/3)',
      '¼': '(1/4)',
    };
    for (const [u, r] of Object.entries(superscriptMap)) {
      str = str.split(u).join(r);
    }

    const symbolMap: Record<string, string> = {
      '√': 'sqrt',
      '∫': 'INTEGRAL ',
      '∮': 'OINT ',
      '∂': 'd/',
      '∇': 'grad',
      '±': ' +/- ',
      '∓': ' -/+ ',
      '≈': ' ~= ',
      '≠': ' != ',
      '≤': ' <= ',
      '≥': ' >= ',
      '·': ' * ',
      '×': ' x ',
      '⟹': ' => ',
      '⟺': ' <=> ',
      '→': ' -> ',
      '←': ' <- ',
      '∞': 'inf',
      '°': ' deg',
      '∝': ' is proportional to ',
    };
    for (const [u, r] of Object.entries(symbolMap)) {
      str = str.split(u).join(r);
    }
  }

  // Common typography normalization
  str = str.replace(/[’‘]/g, "'");
  str = str.replace(/[“”]/g, '"');
  str = str.replace(/[–—]/g, '-');
  str = str.replace(/…/g, '...');
  str = str.replace(/\u00A0/g, ' ');

  // Emojis that crash PDF fonts
  const emojiMap: Record<string, string> = {
    '⚡': '[FAST]',
    '⚠️': '[TRAP]',
    '🔬': '[ADV]',
    '📋': '[PARAM]',
    '📚': '[NOTE]',
    '⭐': '[*]',
    '✓': '[OK]',
  };
  for (const [u, r] of Object.entries(emojiMap)) {
    str = str.split(u).join(r);
  }
  str = str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  if (!preserveMath) {
    str = str.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  } else {
    // Only strip control codes (ASCII 0-31 except tab/newline), keeping all Unicode mathematical characters
    str = str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
  }

  // Auto-repair any remaining unclosed braces or dangling symbols
  str = autoRepairFormulaString(str);

  // Compress whitespace
  return str.replace(/\s+/g, ' ').trim();
}

export interface PdfDocumentResult {
  doc: jsPDF;
  blobUrl: string;
  pageCount: number;
  fileName: string;
  chapterName: string;
  categoryName: string;
  validationReport?: SheetValidationReport;
}

/**
 * Match a chapter ID to its rich JEE_CHAPTER_SHEETS entry if present
 */
export function findJeeSheet(chapterId: string, chapterName: string): JeeChapterSheet | undefined {
  const normId = chapterId.toLowerCase().trim();
  const normName = chapterName.toLowerCase().trim();

  return JEE_CHAPTER_SHEETS.find((s) => {
    if (s.id.toLowerCase() === normId) return true;
    if (s.name.toLowerCase() === normName) return true;
    if (s.aliases.some((a) => a.toLowerCase() === normId || a.toLowerCase() === normName)) return true;
    if (normId.includes(s.id) || s.id.includes(normId)) return true;
    return false;
  });
}

/**
 * Build the jsPDF instance with crystal-clear formatting, zero text overlap,
 * dynamic multi-line card calculations, and verified readable equations.
 */
export function buildChapterPdfDoc(chapterId: string): PdfDocumentResult {
  const chapter = CHAPTERS.find((ch) => ch.id === chapterId) || CHAPTERS[0];
  const concepts = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id);
  const category = CATEGORIES.find((cat) => cat.id === chapter.category);
  const jeeSheet = findJeeSheet(chapter.id, chapter.name);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let currentPage = 1;

  // Palette: High-Contrast Academic Theme
  const primaryNavy = [15, 23, 42]; // #0f172a
  const accentCyan = [6, 182, 212]; // #06b6d4
  const darkIndigo = [49, 46, 129]; // #312e81
  const textDark = [15, 23, 42]; // #0f172a
  const textBody = [30, 41, 59]; // #1e293b
  const textMuted = [100, 116, 139]; // #64748b
  const bgCard = [248, 250, 252]; // #f8fafc
  const cardBorder = [203, 213, 225]; // #cbd5e1
  const emeraldDark = [6, 95, 70]; // #065f46
  const roseDark = [159, 18, 57]; // #9f1239
  const amberDark = [146, 64, 14]; // #92400e

  // Header & Footer for every page
  const drawPageDecoration = () => {
    // Top running header
    doc.setDrawColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, 8, pageWidth - margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`JEE 3D PHYSICS LAB • FORMULA & SHORTCUT REVISION SHEET`, margin, 6.2);
    doc.text(
      `${sanitizeUnicodeForPdf(chapter.name.toUpperCase())} (${sanitizeUnicodeForPdf(category?.name || 'PHYSICS')})`,
      pageWidth - margin,
      6.2,
      { align: 'right' }
    );

    // Bottom running footer
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `JEE Main & Advanced Physics Compendium • Founded by Sanjay.J`,
      margin,
      pageHeight - 5.5
    );
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 5.5, { align: 'right' });
  };

  // Safe Page Break with header/footer preservation
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 8) {
      drawPageDecoration();
      doc.addPage();
      currentPage++;
      y = margin + 2;
    }
  };

  // Helper to render wrapped lines cleanly
  const renderTextLines = (
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    fontFamily: 'helvetica' | 'courier' = 'helvetica',
    color: number[] = textBody,
    lineHeight: number = 3.8
  ): number => {
    const clean = cleanLatexForPdf(text);
    doc.setFont(fontFamily, fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines: string[] = doc.splitTextToSize(clean, maxWidth);
    lines.forEach((line, idx) => {
      doc.text(line, x, startY + idx * lineHeight);
    });

    return lines.length * lineHeight;
  };

  // 1. TOP HEADER BANNER
  const bannerHeight = 24;
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, bannerHeight, 1.5, 1.5, 'F');

  // Cyan left accent border
  doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.rect(margin, y, 3, bannerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeUnicodeForPdf(chapter.name), margin + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.text(
    `BRANCH: ${sanitizeUnicodeForPdf(category?.name || 'PHYSICS').toUpperCase()}  |  TARGET: JEE MAIN & JEE ADVANCED (HIGH-YIELD)`,
    margin + 6,
    y + 12.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    sanitizeUnicodeForPdf(chapter.description || 'Comprehensive exam-oriented formula reference sheet.'),
    margin + 6,
    y + 18,
    { maxWidth: contentWidth - 12 }
  );

  y += bannerHeight + 4;

  // 2. SECTION: BASIC DEFINITIONS & DIMENSIONS TABLE (if available in JEE sheet)
  if (jeeSheet && jeeSheet.basicDefinitions && jeeSheet.basicDefinitions.length > 0) {
    checkPageBreak(26);

    // Section title pill
    doc.setFillColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`1. FUNDAMENTAL DEFINITIONS & GOVERNING QUANTITIES`, margin + 3, y + 4.2);
    y += 7.5;

    jeeSheet.basicDefinitions.forEach((def) => {
      const termClean = sanitizeUnicodeForPdf(def.term);
      const defClean = cleanLatexForPdf(def.definition);
      const symClean = cleanLatexForPdf(def.symbol);
      const unitClean = cleanLatexForPdf(def.siUnit);

      // Measure definition text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const lines = doc.splitTextToSize(`${defClean}  [Symbol: ${symClean}  |  SI Unit: ${unitClean}]`, contentWidth - 10);
      const rowHeight = Math.max(7, lines.length * 3.5 + 4);

      checkPageBreak(rowHeight + 1);

      doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, rowHeight, 1, 1, 'FD');

      doc.setFillColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      doc.rect(margin, y, 1.5, rowHeight, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      doc.text(`* ${termClean}:`, margin + 3.5, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      lines.forEach((l: string, lIdx: number) => {
        doc.text(l, margin + 4, y + 4 + (lIdx === 0 ? 0 : lIdx * 3.5) + (lIdx === 0 ? 0 : 0));
      });

      y += rowHeight + 1.5;
    });

    y += 2;
  }

  // 3. SECTION: CORE FORMULAS & SPECIAL CASES
  // Check if we have rich core formulas in jeeSheet OR in ALL_CONCEPTS
  if (jeeSheet && jeeSheet.coreFormulas && jeeSheet.coreFormulas.length > 0) {
    checkPageBreak(25);

    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`2. MASTER FORMULA VAULT (JEE MAIN & ADVANCED)`, margin + 3, y + 4.2);
    y += 7.5;

    jeeSheet.coreFormulas.forEach((sec, sIdx) => {
      checkPageBreak(20);

      // Subsection Title
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, 5.5, 0.8, 0.8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      doc.text(`§ ${sIdx + 1}. ${sanitizeUnicodeForPdf(sec.sectionTitle)}`, margin + 3, y + 3.8);
      y += 6.5;

      sec.items.forEach((item, iIdx) => {
        const nameClean = sanitizeUnicodeForPdf(item.name);
        const condClean = sanitizeUnicodeForPdf(formatLatexToMathText(item.conditionOrMeaning));
        const unitClean = item.siUnit ? sanitizeUnicodeForPdf(formatLatexToMathText(item.siUnit)) : '';

        // Measure formula height using genuine math renderer
        const formulaBlockH = measureMathFormulaBox(item.formula, contentWidth - 5);

        // Measure note lines
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.8);
        const noteText = `Condition / Physical Meaning: ${condClean}${unitClean ? `  |  SI Unit: ${unitClean}` : ''}`;
        const nLines = doc.splitTextToSize(noteText, contentWidth - 8);
        const noteBlockH = nLines.length * 3.2;

        const totalCardH = 5 + formulaBlockH + noteBlockH + 3.5;
        checkPageBreak(totalCardH);

        // Outer card box
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.setLineWidth(0.25);
        doc.roundedRect(margin, y, contentWidth, totalCardH, 1, 1, 'FD');

        // Left accent stripe
        doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
        doc.rect(margin, y, 1.5, totalCardH, 'F');

        // Formula Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`[${iIdx + 1}] ${nameClean}`, margin + 3.5, y + 4);

        // Inner Formula Highlight Box with authentic mathematical equations
        const fBoxY = y + 5.5;
        drawMathFormulaBox(doc, item.formula, margin + 2.5, fBoxY, contentWidth - 5, [15, 23, 42], [241, 245, 249], [203, 213, 225]);

        // Note & Condition text
        const noteY = fBoxY + formulaBlockH + 2.8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        nLines.forEach((nl: string, nlIdx: number) => {
          doc.text(nl, margin + 3.5, noteY + nlIdx * 3.2);
        });

        y += totalCardH + 1.5;
      });

      y += 1.5;
    });
  } else {
    // Fallback using concepts in ALL_CONCEPTS
    checkPageBreak(25);

    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`2. MASTER FORMULA VAULT (JEE MAIN & ADVANCED)`, margin + 3, y + 4.2);
    y += 7.5;

    concepts.forEach((concept, cIdx) => {
      checkPageBreak(22);

      // Concept Title
      doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'FD');
      doc.setFillColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      doc.rect(margin, y, 1.5, 6, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      doc.text(`${cIdx + 1}. ${sanitizeUnicodeForPdf(concept.title)}`, margin + 3.5, y + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`[${sanitizeUnicodeForPdf(concept.topic)}]`, pageWidth - margin - 3, y + 4.2, { align: 'right' });

      y += 7.5;

      concept.formulas.forEach((f, fIdx) => {
        const nameClean = sanitizeUnicodeForPdf(f.name);
        const explClean = sanitizeUnicodeForPdf(formatLatexToMathText(f.explanation));

        // Measure formula height using genuine math renderer
        const formulaBlockH = measureMathFormulaBox(f.latex, contentWidth - 5);

        // Measure explanation lines
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.8);
        const nLines = doc.splitTextToSize(`Physical Interpretation: ${explClean}`, contentWidth - 8);
        const noteBlockH = nLines.length * 3.2;

        const totalCardH = 5 + formulaBlockH + noteBlockH + 3.5;
        checkPageBreak(totalCardH);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.setLineWidth(0.25);
        doc.roundedRect(margin, y, contentWidth, totalCardH, 1, 1, 'FD');

        doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
        doc.rect(margin, y, 1.5, totalCardH, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`• ${nameClean}`, margin + 3.5, y + 4);

        const fBoxY = y + 5.5;
        drawMathFormulaBox(doc, f.latex, margin + 2.5, fBoxY, contentWidth - 5, [15, 23, 42], [241, 245, 249], [203, 213, 225]);

        const noteY = fBoxY + formulaBlockH + 2.8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        nLines.forEach((nl: string, nlIdx: number) => {
          doc.text(nl, margin + 3.5, noteY + nlIdx * 3.2);
        });

        y += totalCardH + 1.8;
      });

      y += 2;
    });
  }

  // 4. SECTION: SPECIAL CASES & LIMITING SCENARIOS
  if (jeeSheet && jeeSheet.specialCases && jeeSheet.specialCases.length > 0) {
    checkPageBreak(25);

    doc.setFillColor(amberDark[0], amberDark[1], amberDark[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`3. HIGH-YIELD SPECIAL CASES & BOUNDARY CONDITIONS`, margin + 3, y + 4.2);
    y += 7.5;

    jeeSheet.specialCases.forEach((sc) => {
      const titleClean = sanitizeUnicodeForPdf(sc.title);
      const condClean = sanitizeUnicodeForPdf(formatLatexToMathText(sc.condition));
      const noteClean = sanitizeUnicodeForPdf(formatLatexToMathText(sc.notes));

      // Measure mathematical formula height
      const resHeight = measureMathFormulaBox(sc.resultFormula, contentWidth - 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      const noteLines = doc.splitTextToSize(`Context: ${condClean}  |  Note: ${noteClean}`, contentWidth - 8);
      const noteHeight = noteLines.length * 3.2;

      const cardH = 5 + resHeight + noteHeight + 3.5;
      checkPageBreak(cardH);

      doc.setFillColor(255, 251, 235); // Amber-50
      doc.setDrawColor(253, 230, 138); // Amber-200
      doc.setLineWidth(0.25);
      doc.roundedRect(margin, y, contentWidth, cardH, 1, 1, 'FD');

      doc.setFillColor(amberDark[0], amberDark[1], amberDark[2]);
      doc.rect(margin, y, 1.5, cardH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(amberDark[0], amberDark[1], amberDark[2]);
      doc.text(`Case: ${titleClean}`, margin + 3.5, y + 4);

      const rBoxY = y + 5.2;
      drawMathFormulaBox(doc, sc.resultFormula, margin + 2.5, rBoxY, contentWidth - 5, [120, 53, 15], [254, 243, 199], [252, 211, 77]);

      const nY = rBoxY + resHeight + 2.6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(146, 64, 14);
      noteLines.forEach((nl: string, nIdx: number) => {
        doc.text(nl, margin + 3.5, nY + nIdx * 3.2);
      });

      y += cardH + 1.8;
    });

    y += 2;
  }

  // 5. SECTION: HIGH-YIELD JEE SHORTCUTS & RATIO TRICKS (Green Box)
  const shortcuts = jeeSheet?.jeeQuickRevision?.shortcuts || concepts.flatMap((c) => c.jeeMain?.keyShortcuts || []);
  if (shortcuts.length > 0) {
    checkPageBreak(25);

    doc.setFillColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`4. HIGH-YIELD JEE SHORTCUTS & RATIO TRICKS (TIME-SAVERS)`, margin + 3, y + 4.2);
    y += 7.5;

    shortcuts.slice(0, 5).forEach((sc, idx) => {
      const scClean = cleanLatexForPdf(sc);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const lines = doc.splitTextToSize(scClean, contentWidth - 10);
      const cardH = lines.length * 3.4 + 4;

      checkPageBreak(cardH);

      doc.setFillColor(236, 253, 245); // Emerald-50
      doc.setDrawColor(167, 243, 208); // Emerald-200
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, cardH, 1, 1, 'FD');

      doc.setFillColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
      doc.rect(margin, y, 1.5, cardH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
      doc.text(`[S${idx + 1}]`, margin + 3, y + 3.6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(6, 78, 59);
      lines.forEach((l: string, lIdx: number) => {
        doc.text(l, margin + 9, y + 3.6 + lIdx * 3.4);
      });

      y += cardH + 1.2;
    });

    y += 2;
  }

  // 6. SECTION: COMMON EXAM TRAPS & NEGATIVE MARKING PITFALLS (Rose Alert Box)
  const traps = jeeSheet?.jeeQuickRevision?.trapsAndPitfalls || concepts.flatMap((c) => c.jeeMain?.trapAlerts || []);
  if (traps.length > 0) {
    checkPageBreak(25);

    doc.setFillColor(roseDark[0], roseDark[1], roseDark[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`5. EXAM TRAP ALERTS & NEGATIVE MARKING PITFALLS`, margin + 3, y + 4.2);
    y += 7.5;

    traps.slice(0, 5).forEach((tr, idx) => {
      const trClean = cleanLatexForPdf(tr);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const lines = doc.splitTextToSize(trClean, contentWidth - 10);
      const cardH = lines.length * 3.4 + 4;

      checkPageBreak(cardH);

      doc.setFillColor(254, 242, 242); // Rose-50
      doc.setDrawColor(254, 202, 202); // Rose-200
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, cardH, 1, 1, 'FD');

      doc.setFillColor(roseDark[0], roseDark[1], roseDark[2]);
      doc.rect(margin, y, 1.5, cardH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(roseDark[0], roseDark[1], roseDark[2]);
      doc.text(`! [T${idx + 1}]`, margin + 3, y + 3.6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(136, 19, 55);
      lines.forEach((l: string, lIdx: number) => {
        doc.text(l, margin + 11, y + 3.6 + lIdx * 3.4);
      });

      y += cardH + 1.2;
    });

    y += 2;
  }

  // 7. SECTION: CONSTANTS & PARAMETERS TABLE
  const constants = jeeSheet?.unitsAndConstants || concepts.flatMap((c) => c.parameters).slice(0, 6).map((p) => ({
    quantityOrConstant: p.label,
    symbol: p.symbol,
    valueOrFormula: `Range [${p.min}, ${p.max}], Default = ${p.defaultVal}`,
    siUnit: p.unit || 'unitless',
  }));

  if (constants && constants.length > 0) {
    checkPageBreak(24);

    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.roundedRect(margin, y, contentWidth, 5.5, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);
    doc.text(`6. PHYSICAL CONSTANTS, SYMBOLS & SI UNITS TABLE`, margin + 3, y + 3.8);
    y += 6.5;

    // Header row
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text('Physical Quantity / Constant', margin + 3, y + 3.5);
    doc.text('Symbol', margin + 65, y + 3.5);
    doc.text('Standard Value / Formula', margin + 95, y + 3.5);
    doc.text('SI Unit', margin + 155, y + 3.5);
    y += 5;

    constants.forEach((item, idx) => {
      checkPageBreak(5);
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, contentWidth, 4.8, 'F');

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.line(margin, y + 4.8, margin + contentWidth, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(sanitizeUnicodeForPdf(item.quantityOrConstant), margin + 3, y + 3.3);

      doc.setFont('courier', 'bold');
      doc.text(cleanLatexForPdf(item.symbol), margin + 65, y + 3.3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textBody[0], textBody[1], textBody[2]);
      doc.text(cleanLatexForPdf(item.valueOrFormula), margin + 95, y + 3.3);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      doc.text(cleanLatexForPdf(item.siUnit), margin + 155, y + 3.3);

      y += 4.8;
    });
  }

  // Draw header/footer for the final page
  drawPageDecoration();

  // Create clean filename for downloads folder
  const cleanName = chapter.name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  const fileName = `${cleanName}-JEE-Formula-Sheet.pdf`;

  // Create Blob & URL for Preview Thumbnail
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const totalPages =
    (doc as any).internal?.getNumberOfPages ? (doc as any).internal.getNumberOfPages() : currentPage;

  // Pre-generation validation report
  const validationReport = validateChapterSheetData(
    chapter.id,
    chapter.name,
    jeeSheet
      ? {
          coreFormulas: jeeSheet.coreFormulas,
          specialCases: jeeSheet.specialCases,
          shortcuts: jeeSheet.jeeQuickRevision?.shortcuts,
          traps: jeeSheet.jeeQuickRevision?.trapsAndPitfalls,
        }
      : {
          coreFormulas: [
            {
              sectionTitle: 'Formulas',
              items: concepts.flatMap((c) =>
                c.formulas.map((f) => ({
                  name: f.name,
                  formula: f.latex,
                  conditionOrMeaning: f.explanation,
                }))
              ),
            },
          ],
          shortcuts: concepts.flatMap((c) => c.jeeMain?.keyShortcuts || []),
          traps: concepts.flatMap((c) => c.jeeMain?.trapAlerts || []),
        }
  );

  return {
    doc,
    blobUrl,
    pageCount: totalPages,
    fileName,
    chapterName: chapter.name,
    categoryName: category?.name || 'Physics',
    validationReport,
  };
}

/**
 * Generate and download a clean, concise, publication-grade PDF Formula Sheet for a single Chapter
 */
export function generateChapterPdf(chapterId: string): { fileName: string; chapterName: string } {
  const result = buildChapterPdfDoc(chapterId);
  result.doc.save(result.fileName);
  return { fileName: result.fileName, chapterName: result.chapterName };
}

/**
 * Build the Master PDF Doc for all 18 Chapters combined
 */
export function buildMasterPdfDoc(): PdfDocumentResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let currentPage = 1;

  const primaryNavy = [15, 23, 42];
  const accentCyan = [6, 182, 212];
  const darkIndigo = [49, 46, 129];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const cardBorder = [203, 213, 225];

  const drawPageDecoration = (chapterTitle = 'ALL CHAPTERS MASTER COMPENDIUM') => {
    doc.setDrawColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, 8, pageWidth - margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`JEE 3D PHYSICS LAB • MASTER FORMULA COMPENDIUM (18 CHAPTERS)`, margin, 6.2);
    doc.text(sanitizeUnicodeForPdf(chapterTitle.toUpperCase()), pageWidth - margin, 6.2, { align: 'right' });

    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `Complete JEE Main & Advanced Physics Syllabus Compendium • Founded by Sanjay.J`,
      margin,
      pageHeight - 5.5
    );
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 5.5, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number, chapterTitle?: string) => {
    if (y + neededHeight > pageHeight - margin - 8) {
      drawPageDecoration(chapterTitle);
      doc.addPage();
      currentPage++;
      y = margin + 2;
    }
  };

  // COVER PAGE
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.rect(margin, 35, contentWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('JEE PHYSICS MASTER', margin, 50);
  doc.text('FORMULA COMPENDIUM', margin, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.text('COMPLETE 18-CHAPTER REVISION VAULT • JEE MAIN & ADVANCED', margin, 73);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Contains all verified governing equations, special boundary cases, high-yield shortcuts,', margin, 81);
  doc.text('negative marking traps, and physical constant indexes across all syllabus units.', margin, 87);

  doc.setFillColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
  doc.roundedRect(margin, 100, contentWidth, 26, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('FOUNDED & ENGINEERED BY SANJAY.J', margin + 6, 110);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(226, 232, 240);
  doc.text('JEE 3D Physics Lab — Dynamic 3D Simulations, Real-Time KaTeX Analytics,', margin + 6, 116);
  doc.text('Governing Variable Equations, and Verified Coaching Institute Modules.', margin + 6, 121);

  // Table of Contents on Cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.text('INCLUDED CHAPTERS (18 COMPLETE SYLLABUS UNITS):', margin, 142);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);

  const col1 = CHAPTERS.slice(0, 9);
  const col2 = CHAPTERS.slice(9, 18);

  col1.forEach((ch, idx) => {
    doc.text(`${idx + 1}. ${sanitizeUnicodeForPdf(ch.name)}`, margin + 4, 152 + idx * 6.5);
  });
  col2.forEach((ch, idx) => {
    doc.text(`${idx + 10}. ${sanitizeUnicodeForPdf(ch.name)}`, margin + contentWidth / 2 + 4, 152 + idx * 6.5);
  });

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Publication Grade Vector PDF • Generated on Client Side from JEE 3D Physics Lab', margin, 280);

  // LOOP THROUGH ALL CHAPTERS
  CHAPTERS.forEach((chapter) => {
    doc.addPage();
    currentPage++;
    y = margin + 2;

    const concepts = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id);
    const category = CATEGORIES.find((cat) => cat.id === chapter.category);
    const jeeSheet = findJeeSheet(chapter.id, chapter.name);

    // Chapter Header Banner
    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');
    doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.rect(margin, y, 2.5, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizeUnicodeForPdf(chapter.name), margin + 6, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `${sanitizeUnicodeForPdf(category?.name || 'Physics')} — ${sanitizeUnicodeForPdf(chapter.description)}`,
      margin + 6,
      y + 13,
      { maxWidth: contentWidth - 10 }
    );

    y += 22;

    // Render either jeeSheet or concepts
    if (jeeSheet && jeeSheet.coreFormulas && jeeSheet.coreFormulas.length > 0) {
      jeeSheet.coreFormulas.forEach((sec, sIdx) => {
        checkPageBreak(18, chapter.name);

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.roundedRect(margin, y, contentWidth, 5, 0.8, 0.8, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
        doc.text(`Section ${sIdx + 1}: ${sanitizeUnicodeForPdf(sec.sectionTitle)}`, margin + 3, y + 3.5);
        y += 6;

        sec.items.forEach((item) => {
          const nameClean = sanitizeUnicodeForPdf(item.name);
          const condClean = sanitizeUnicodeForPdf(formatLatexToMathText(item.conditionOrMeaning));

          const fBoxH = measureMathFormulaBox(item.formula, contentWidth - 4);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6.5);
          const nLines = doc.splitTextToSize(condClean, contentWidth - 8);
          const nBoxH = nLines.length * 3;

          const totalH = 4 + fBoxH + nBoxH + 3;
          checkPageBreak(totalH, chapter.name);

          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
          doc.roundedRect(margin, y, contentWidth, totalH, 0.8, 0.8, 'FD');

          doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
          doc.rect(margin, y, 1.2, totalH, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(textDark[0], textDark[1], textDark[2]);
          doc.text(`* ${nameClean}:`, margin + 3, y + 3.5);

          const fY = y + 4.8;
          drawMathFormulaBox(doc, item.formula, margin + 2, fY, contentWidth - 4, [15, 23, 42], [241, 245, 249], [203, 213, 225]);

          const nY = fY + fBoxH + 2.4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
          nLines.forEach((nl: string, nlIdx: number) => {
            doc.text(nl, margin + 3, nY + nlIdx * 3);
          });

          y += totalH + 1.2;
        });
      });

      // Quick shortcuts & traps in master
      if (jeeSheet.jeeQuickRevision?.shortcuts && jeeSheet.jeeQuickRevision.shortcuts.length > 0) {
        checkPageBreak(12, chapter.name);
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(167, 243, 208);
        doc.roundedRect(margin, y, contentWidth, 8, 0.8, 0.8, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(6, 95, 70);
        doc.text(`[SHORTCUT]`, margin + 2, y + 3.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(6, 78, 59);
        doc.text(sanitizeUnicodeForPdf(formatLatexToMathText(jeeSheet.jeeQuickRevision.shortcuts[0])), margin + 20, y + 3.5, {
          maxWidth: contentWidth - 23,
        });

        if (jeeSheet.jeeQuickRevision.trapsAndPitfalls && jeeSheet.jeeQuickRevision.trapsAndPitfalls.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(159, 18, 57);
          doc.text(`[TRAP]`, margin + 2, y + 6.8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(136, 19, 55);
          doc.text(sanitizeUnicodeForPdf(formatLatexToMathText(jeeSheet.jeeQuickRevision.trapsAndPitfalls[0])), margin + 20, y + 6.8, {
            maxWidth: contentWidth - 23,
          });
        }
        y += 10;
      }
    } else {
      // Fallback using ALL_CONCEPTS
      concepts.forEach((concept, cIdx) => {
        checkPageBreak(20, chapter.name);

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.roundedRect(margin, y, contentWidth, 5, 0.8, 0.8, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
        doc.text(`${cIdx + 1}. ${sanitizeUnicodeForPdf(concept.title)}`, margin + 3, y + 3.5);
        y += 6;

        concept.formulas.forEach((f) => {
          const fBoxH = measureMathFormulaBox(f.latex, contentWidth - 4);
          const totalH = 5 + fBoxH + 4;

          checkPageBreak(totalH, chapter.name);

          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
          doc.roundedRect(margin, y, contentWidth, totalH, 0.8, 0.8, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(textDark[0], textDark[1], textDark[2]);
          doc.text(`* ${sanitizeUnicodeForPdf(f.name)}:`, margin + 3, y + 3.5);

          const fY = y + 4.8;
          drawMathFormulaBox(doc, f.latex, margin + 2, fY, contentWidth - 4, [15, 23, 42], [241, 245, 249], [203, 213, 225]);

          y += totalH + 1.2;
        });
      });
    }

    drawPageDecoration(chapter.name);
  });

  const fileName = 'JEE-Physics-Master-18-Chapters-Formula-Compendium.pdf';
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const totalPages =
    (doc as any).internal?.getNumberOfPages ? (doc as any).internal.getNumberOfPages() : currentPage;

  return {
    doc,
    blobUrl,
    pageCount: totalPages,
    fileName,
    chapterName: 'Master 18-Chapter Compendium',
    categoryName: 'Comprehensive Physics',
  };
}

/**
 * Generate and download the Complete JEE Master Physics Compendium PDF (All 18 Chapters)
 */
export function generateMasterCompendiumPdf(): { fileName: string; totalChapters: number } {
  const result = buildMasterPdfDoc();
  result.doc.save(result.fileName);
  return { fileName: result.fileName, totalChapters: CHAPTERS.length };
}
