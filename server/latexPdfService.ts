import fs from 'fs';
import { jsPDF } from 'jspdf';
import { CHAPTERS, ALL_CONCEPTS, CATEGORIES } from '../src/data/allConcepts';
import { JEE_CHAPTER_SHEETS, JeeChapterSheet } from '../src/data/jeeFormulaSheetData';
import { preprocessAndWrapFormula, unwrapFormula } from '../src/utils/latexPreprocessor';
import { formatLatexToMathText } from '../src/utils/mathPdfRenderer';
import { sanitizeUnicodeForPdf } from '../src/utils/pdfGenerator';

export interface ServerPdfResult {
  buffer: Buffer;
  fileName: string;
  chapterName: string;
  pageCount: number;
}

let cachedFreeSerif: string | null = null;
let cachedFreeSerifBold: string | null = null;
let cachedFreeSerifItalic: string | null = null;

export function loadFreeSerifFonts(doc: jsPDF): boolean {
  try {
    const regPath = '/usr/share/fonts/truetype/freefont/FreeSerif.ttf';
    const boldPath = '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf';
    const italicPath = '/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf';

    if (!cachedFreeSerif && fs.existsSync(regPath)) {
      cachedFreeSerif = fs.readFileSync(regPath).toString('base64');
    }
    if (!cachedFreeSerifBold && fs.existsSync(boldPath)) {
      cachedFreeSerifBold = fs.readFileSync(boldPath).toString('base64');
    }
    if (!cachedFreeSerifItalic && fs.existsSync(italicPath)) {
      cachedFreeSerifItalic = fs.readFileSync(italicPath).toString('base64');
    }

    if (cachedFreeSerif) {
      doc.addFileToVFS('FreeSerif.ttf', cachedFreeSerif);
      doc.addFont('FreeSerif.ttf', 'FreeSerif', 'normal');
      if (cachedFreeSerifBold) {
        doc.addFileToVFS('FreeSerifBold.ttf', cachedFreeSerifBold);
        doc.addFont('FreeSerifBold.ttf', 'FreeSerif', 'bold');
      }
      if (cachedFreeSerifItalic) {
        doc.addFileToVFS('FreeSerifItalic.ttf', cachedFreeSerifItalic);
        doc.addFont('FreeSerifItalic.ttf', 'FreeSerif', 'italic');
      }
      (doc as any)._hasFreeSerif = true;
      return true;
    }
  } catch (err) {
    console.warn('Could not load FreeSerif font into jsPDF:', err);
  }
  return false;
}

/**
 * Match a chapter ID to its rich JEE_CHAPTER_SHEETS entry
 */
export function findJeeSheetOnServer(chapterId: string, chapterName: string): JeeChapterSheet | undefined {
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
 * Helper to format math expressions cleanly for the available server PDF font:
 * full Unicode Greek/math when FreeSerif TTF is loaded, or WinAnsi-clean notation when using Type1 Times/Helvetica.
 */
function formatForServerFont(rawOrLatex: string, hasSerif: boolean): string {
  const mathText = formatLatexToMathText(rawOrLatex);
  return hasSerif ? mathText : sanitizeUnicodeForPdf(mathText, { preserveMathSymbols: false });
}

/**
 * Balanced brace extraction for \frac{...}{...} in server stacked fraction layout.
 */
function extractBalancedServerFraction(innerMath: string): { lhs: string; num: string; den: string; tail: string } | null {
  const fracIdx = innerMath.indexOf('\\frac');
  if (fracIdx === -1) return null;

  let p = fracIdx + 5;
  while (p < innerMath.length && /\s/.test(innerMath[p])) p++;
  if (innerMath[p] !== '{') return null;

  let d1 = 0;
  let numEnd = -1;
  for (let i = p; i < innerMath.length; i++) {
    if (innerMath[i] === '{') d1++;
    else if (innerMath[i] === '}') {
      d1--;
      if (d1 === 0) { numEnd = i; break; }
    }
  }
  if (numEnd === -1) return null;

  let q = numEnd + 1;
  while (q < innerMath.length && /\s/.test(innerMath[q])) q++;
  if (innerMath[q] !== '{') return null;

  let d2 = 0;
  let denEnd = -1;
  for (let i = q; i < innerMath.length; i++) {
    if (innerMath[i] === '{') d2++;
    else if (innerMath[i] === '}') {
      d2--;
      if (d2 === 0) { denEnd = i; break; }
    }
  }
  if (denEnd === -1) return null;

  const lhs = innerMath.slice(0, fracIdx).trim();
  const num = innerMath.slice(p + 1, numEnd).trim();
  const den = innerMath.slice(q + 1, denEnd).trim();
  const tail = innerMath.slice(denEnd + 1).trim();

  // Skip stacked layout if numerator/denominator itself still has nested \frac to avoid ugly single-line stacking
  if (num.includes('\\frac') || den.includes('\\frac')) return null;
  return { lhs, num, den, tail };
}

/**
 * Pre-processes and draws an authentic mathematical equation inside a jsPDF document on the server.
 */
export function drawServerLatexFormulaBox(
  doc: jsPDF,
  rawFormula: string,
  x: number,
  y: number,
  width: number,
  options?: {
    eqNumber?: string;
    bgColor?: number[];
    borderColor?: number[];
    textColor?: number[];
  }
): number {
  const bg = options?.bgColor || [241, 245, 249];
  const border = options?.borderColor || [203, 213, 225];
  const textColor = options?.textColor || [15, 23, 42];

  const hasSerif = (doc as any)._hasFreeSerif ?? false;
  const mathFont = hasSerif ? 'FreeSerif' : 'times';
  const badgeReserve = options?.eqNumber ? 22 : 6;
  const maxContentX = x + width - badgeReserve;

  const wrappedEquation = preprocessAndWrapFormula(rawFormula, 'equation');
  const innerMath = unwrapFormula(wrappedEquation);
  const mathText = formatForServerFont(innerMath, hasSerif);

  const fracParts = extractBalancedServerFraction(innerMath);
  let fittedStacked = false;

  if (fracParts && width > 65) {
    const lhs = fracParts.lhs ? formatForServerFont(fracParts.lhs, hasSerif) + ' ' : '';
    const num = formatForServerFont(fracParts.num, hasSerif);
    const den = formatForServerFont(fracParts.den, hasSerif);
    const tail = fracParts.tail ? formatForServerFont(fracParts.tail, hasSerif) : '';

    doc.setFont(mathFont, 'italic');
    doc.setFontSize(8.6);
    const lhsWidth = lhs ? doc.getTextWidth(lhs) : 0;
    doc.setFontSize(7.6);
    const numW = doc.getTextWidth(num);
    const denW = doc.getTextWidth(den);
    const fracW = Math.max(numW, denW) + 3;
    doc.setFontSize(8.4);
    const tailW = tail ? doc.getTextWidth(' ' + tail) : 0;

    // Only use stacked layout if it fits cleanly inside box width without colliding with (eqNumber)
    if (x + 4 + lhsWidth + 1.5 + fracW + tailW < maxContentX) {
      fittedStacked = true;
      const boxH = 10.2;
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.setDrawColor(border[0], border[1], border[2]);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, width, boxH, 0.8, 0.8, 'FD');

      if (options?.eqNumber) {
        doc.setFont(mathFont, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`(${options.eqNumber})`, x + width - 4, y + boxH / 2 + 1.2, { align: 'right' });
      }

      doc.setFont(mathFont, 'italic');
      doc.setFontSize(8.6);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      if (lhs) {
        doc.text(lhs, x + 4, y + boxH / 2 + 1.1);
      }

      const fracX = x + 4 + lhsWidth + (lhs ? 1.5 : 0);
      doc.setFontSize(7.6);
      doc.text(num, fracX + (fracW - numW) / 2, y + 3.5);

      doc.setDrawColor(textColor[0], textColor[1], textColor[2]);
      doc.setLineWidth(0.25);
      doc.line(fracX, y + 5.1, fracX + fracW, y + 5.1);

      doc.text(den, fracX + (fracW - denW) / 2, y + 8.4);

      if (tail) {
        doc.setFont(mathFont, 'italic');
        doc.setFontSize(8.4);
        doc.text(` ${tail}`, fracX + fracW + 1.5, y + boxH / 2 + 1.1);
      }

      return boxH;
    }
  }

  if (!fittedStacked) {
    doc.setFont(mathFont, 'italic');
    doc.setFontSize(8.5);
    const maxTextW = Math.max(40, width - badgeReserve - 6);
    const fLines = doc.splitTextToSize(mathText, maxTextW);
    const fBoxH = Math.max(6.8, fLines.length * 4.0 + 3.0);

    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, width, fBoxH, 0.8, 0.8, 'FD');

    if (options?.eqNumber) {
      doc.setFont(mathFont, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`(${options.eqNumber})`, x + width - 4, y + fBoxH / 2 + 1.2, { align: 'right' });
    }

    doc.setFont(mathFont, 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    fLines.forEach((fl: string, flIdx: number) => {
      doc.text(fl, x + 4, y + 3.9 + flIdx * 4.0);
    });

    return fBoxH;
  }

  return 8.0;
}

/**
 * Generates a complete, professional Chapter Formula Sheet PDF on the server using jsPDF.
 * Applies pre-processing that wraps formulas in proper \begin{equation} or \( ... \) delimiters.
 */
export function generateServerChapterPdf(chapterId: string): ServerPdfResult {
  const chapter = CHAPTERS.find((ch) => ch.id === chapterId) || CHAPTERS[0];
  const concepts = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id);
  const category = CATEGORIES.find((cat) => cat.id === chapter.category);
  const jeeSheet = findJeeSheetOnServer(chapter.id, chapter.name);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  loadFreeSerifFonts(doc);
  const hasSerif = (doc as any)._hasFreeSerif ?? false;

  // Single reusable scratch document for measuring stacked formula heights without per-card jsPDF+font allocations
  const measureDoc = new jsPDF({ unit: 'mm', format: 'a4' });
  if (hasSerif) loadFreeSerifFonts(measureDoc);

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let currentPage = 1;

  // Academic High-Contrast Palette
  const primaryNavy = [15, 23, 42];
  const accentCyan = [6, 182, 212];
  const darkIndigo = [49, 46, 129];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const bgCard = [248, 250, 252];
  const cardBorder = [203, 213, 225];

  const drawPageDecoration = () => {
    // Top running header
    doc.setDrawColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, 8, pageWidth - margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`JEE ADVANCED & MAIN PHYSICS FORMULA COMPENDIUM  |  ${sanitizeUnicodeForPdf(chapter.name).toUpperCase()}`, margin, 6.5);
    doc.text(`LaTeX-Rendered Engine`, pageWidth - margin, 6.5, { align: 'right' });

    // Bottom running footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('High-Yield Formula Engine (Server-Side LaTeX \\begin{equation} Precision)', margin, pageHeight - 5);
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 12) {
      doc.addPage();
      currentPage++;
      y = margin;
      drawPageDecoration();
    }
  };

  drawPageDecoration();

  // 1. Chapter Title Banner
  const bannerH = 17;
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, bannerH, 1.5, 1.5, 'F');

  // Cyan left indicator
  doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.rect(margin, y, 2.5, bannerH, 'F');

  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeUnicodeForPdf(chapter.name), margin + 6, y + 6.8);

  // Subtitle / category
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const catName = category ? category.name : 'Physics';
  const weightInfo = (jeeSheet as any)?.jeeExamWeight ? ` • JEE Weight: ${(jeeSheet as any).jeeExamWeight}` : '';
  doc.text(`${catName.toUpperCase()} • COMPREHENSIVE FORMULA SHEET${weightInfo} • \\begin{equation} Delimited`, margin + 6, y + 12);

  y += bannerH + 3.5;

  // 2. High-Yield Revision Shortcuts & Traps (if available in JEE sheet) - dynamically measured
  if (jeeSheet?.jeeQuickRevision) {
    const rev = jeeSheet.jeeQuickRevision;
    const hasShortcuts = rev.shortcuts && rev.shortcuts.length > 0;
    const hasTraps = rev.trapsAndPitfalls && rev.trapsAndPitfalls.length > 0;

    if (hasShortcuts || hasTraps) {
      doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
      doc.setFontSize(7.4);

      const scText = hasShortcuts ? formatForServerFont(preprocessAndWrapFormula(rev.shortcuts[0], 'inline'), hasSerif) : '';
      const trapText = hasTraps ? formatForServerFont(preprocessAndWrapFormula(rev.trapsAndPitfalls[0], 'inline'), hasSerif) : '';

      const scLines = scText ? doc.splitTextToSize(scText, contentWidth - 37) : [];
      const trapLines = trapText ? doc.splitTextToSize(trapText, contentWidth - 37) : [];

      const revBoxH = Math.max(
        10,
        3.5 +
          (scLines.length > 0 ? scLines.length * 3.4 + 2 : 0) +
          (trapLines.length > 0 ? trapLines.length * 3.4 + 2 : 0) +
          2
      );

      checkPageBreak(revBoxH + 2);

      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(153, 246, 228);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, revBoxH, 1, 1, 'FD');

      let revY = y + 4.2;
      if (scLines.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.0);
        doc.setTextColor(6, 95, 70);
        doc.text('[EXAM SHORTCUT]', margin + 3.5, revY);

        doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
        doc.setFontSize(7.4);
        doc.setTextColor(15, 23, 42);
        scLines.forEach((ln: string, li: number) => doc.text(ln, margin + 32, revY + li * 3.4));
        revY += scLines.length * 3.4 + 2.2;
      }

      if (trapLines.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.0);
        doc.setTextColor(159, 18, 57);
        doc.text('[COMMON PITFALL]', margin + 3.5, revY);

        doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
        doc.setFontSize(7.4);
        doc.setTextColor(136, 19, 55);
        trapLines.forEach((ln: string, li: number) => doc.text(ln, margin + 32, revY + li * 3.4));
      }

      y += revBoxH + 3;
    }
  }

  // 3. Core Formulas from JEE Chapter Sheet
  const sectionsList = jeeSheet?.coreFormulas || (jeeSheet as any)?.sections || [];
  if (sectionsList.length > 0) {
    let eqCounter = 1;

    sectionsList.forEach((sec: any, sIdx: number) => {
      checkPageBreak(12);

      // Section Header
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 6, 0.8, 0.8, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
      const secTitle = sec.sectionTitle || sec.title || `Section ${sIdx + 1}`;
      doc.text(`SECTION ${sIdx + 1}: ${sanitizeUnicodeForPdf(secTitle).toUpperCase()}`, margin + 3, y + 4.2);

      y += 8;

      (sec.items || []).forEach((item: any, iIdx: number) => {
        const nameClean = sanitizeUnicodeForPdf(item.name);
        const condClean = formatForServerFont(preprocessAndWrapFormula(item.conditionOrMeaning, 'inline'), hasSerif);
        const unitClean = item.siUnit ? ` [SI: ${sanitizeUnicodeForPdf(item.siUnit)}]` : '';

        // Measure formula height using reusable scratch doc
        const formulaBlockH = drawServerLatexFormulaBox(measureDoc, item.formula, 0, 0, contentWidth - 5, { eqNumber: `${sIdx + 1}.${iIdx + 1}` });

        // Measure note lines
        doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'italic');
        doc.setFontSize(7.2);
        const noteFullText = `Condition: ${condClean}${unitClean}`;
        const nLines = doc.splitTextToSize(noteFullText, contentWidth - 10);
        const noteBlockH = nLines.length * 3.4;

        const totalCardH = 4.5 + formulaBlockH + noteBlockH + 4;
        checkPageBreak(totalCardH);

        // Container card
        doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentWidth, totalCardH, 1, 1, 'FD');

        // Item title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`[${iIdx + 1}] ${nameClean}`, margin + 3.5, y + 4);

        // Inner Formula Highlight Box with wrapped LaTeX \begin{equation} delimiters
        const fBoxY = y + 5.5;
        drawServerLatexFormulaBox(doc, item.formula, margin + 2.5, fBoxY, contentWidth - 5, {
          eqNumber: `${sIdx + 1}.${iIdx + 1}`,
          bgColor: [255, 255, 255],
          borderColor: [203, 213, 225],
          textColor: [15, 23, 42],
        });

        // Note & Condition text
        const noteY = fBoxY + formulaBlockH + 2.8;
        doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        nLines.forEach((nl: string, nlIdx: number) => {
          doc.text(nl, margin + 3.5, noteY + nlIdx * 3.4);
        });

        y += totalCardH + 1.8;
        eqCounter++;
      });

      y += 2;
    });
  }

  // 4. Special Cases & Boundary Conditions
  if (jeeSheet && jeeSheet.specialCases && jeeSheet.specialCases.length > 0) {
    checkPageBreak(12);

    doc.setFillColor(254, 243, 199); // Amber tint
    doc.setDrawColor(252, 211, 77);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 6, 0.8, 0.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text('HIGH-YIELD SPECIAL CASES & BOUNDARY CONDITIONS', margin + 3, y + 4.2);

    y += 8;

    jeeSheet.specialCases.forEach((sc, scIdx) => {
      const titleClean = sanitizeUnicodeForPdf(sc.title);
      const condClean = formatForServerFont(preprocessAndWrapFormula(sc.condition, 'inline'), hasSerif);
      const noteClean = formatForServerFont(preprocessAndWrapFormula(sc.notes, 'inline'), hasSerif);

      const resHeight = drawServerLatexFormulaBox(measureDoc, sc.resultFormula, 0, 0, contentWidth - 5, {
        eqNumber: `Case ${scIdx + 1}`,
        bgColor: [254, 243, 199],
        borderColor: [252, 211, 77],
        textColor: [120, 53, 15],
      });

      doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
      doc.setFontSize(7.2);
      const fullNote = `Condition: ${condClean} — ${noteClean}`;
      const nLines = doc.splitTextToSize(fullNote, contentWidth - 10);
      const nHeight = nLines.length * 3.4;

      const cardH = 4.5 + resHeight + nHeight + 4;
      checkPageBreak(cardH);

      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(252, 211, 77);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, cardH, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(146, 64, 14);
      doc.text(`Case ${scIdx + 1}: ${titleClean}`, margin + 3.5, y + 4);

      const rBoxY = y + 5.2;
      drawServerLatexFormulaBox(doc, sc.resultFormula, margin + 2.5, rBoxY, contentWidth - 5, {
        eqNumber: `Case ${scIdx + 1}`,
        bgColor: [254, 243, 199],
        borderColor: [252, 211, 77],
        textColor: [120, 53, 15],
      });

      const nY = rBoxY + resHeight + 2.6;
      doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(180, 83, 9);
      nLines.forEach((nl: string, nIdx: number) => {
        doc.text(nl, margin + 3.5, nY + nIdx * 3.4);
      });

      y += cardH + 1.8;
    });

    y += 2;
  }

  // 5. Concept Breakdown & Formulas (from ALL_CONCEPTS)
  if (concepts.length > 0) {
    checkPageBreak(12);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 6, 0.8, 0.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
    doc.text('CONCEPTUAL BREAKDOWN & FOUNDATIONAL DERIVATIONS', margin + 3, y + 4.2);

    y += 8;

    concepts.forEach((concept, cIdx) => {
      checkPageBreak(14);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text(`${cIdx + 1}. ${sanitizeUnicodeForPdf(concept.title)}`, margin + 2, y + 4);
      y += 6;

      concept.formulas.forEach((f, fIdx) => {
        const nameClean = sanitizeUnicodeForPdf(f.name);
        const explClean = formatForServerFont(preprocessAndWrapFormula(f.explanation, 'inline'), hasSerif);

        const formulaBlockH = drawServerLatexFormulaBox(measureDoc, f.latex, 0, 0, contentWidth - 5, { eqNumber: `${cIdx + 1}.${fIdx + 1}` });

        doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'italic');
        doc.setFontSize(7.2);
        const nLines = doc.splitTextToSize(explClean, contentWidth - 10);
        const noteBlockH = nLines.length * 3.4;

        const totalCardH = 4.5 + formulaBlockH + noteBlockH + 4;
        checkPageBreak(totalCardH);

        doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentWidth, totalCardH, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`• ${nameClean}`, margin + 3.5, y + 4);

        const fBoxY = y + 5.5;
        drawServerLatexFormulaBox(doc, f.latex, margin + 2.5, fBoxY, contentWidth - 5, {
          eqNumber: `${cIdx + 1}.${fIdx + 1}`,
          bgColor: [255, 255, 255],
          borderColor: [203, 213, 225],
          textColor: [15, 23, 42],
        });

        const noteY = fBoxY + formulaBlockH + 2.8;
        doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        nLines.forEach((nl: string, nlIdx: number) => {
          doc.text(nl, margin + 3.5, noteY + nlIdx * 3.4);
        });

        y += totalCardH + 1.8;
      });

      y += 2;
    });
  }

  const fileName = `${chapter.name.replace(/[^a-zA-Z0-9]/g, '-')}-JEE-Formula-Sheet.pdf`;
  const pdfArrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(pdfArrayBuffer);

  return {
    buffer,
    fileName,
    chapterName: chapter.name,
    pageCount: doc.getNumberOfPages(),
  };
}

/**
 * Generates the Master 18-Chapter Compendium PDF on the server
 */
export function generateServerMasterPdf(): ServerPdfResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  loadFreeSerifFonts(doc);
  const hasSerif = (doc as any)._hasFreeSerif ?? false;

  const measureDoc = new jsPDF({ unit: 'mm', format: 'a4' });
  if (hasSerif) loadFreeSerifFonts(measureDoc);

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let currentPage = 1;

  const drawMasterPageDecoration = (chTitle = 'Master Compendium') => {
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.4);
    doc.line(margin, 8, pageWidth - margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`JEE PHYSICS MASTER 18-CHAPTER FORMULA COMPENDIUM  |  ${sanitizeUnicodeForPdf(chTitle).toUpperCase()}`, margin, 6.5);
    doc.text('Server-Side LaTeX \\begin{equation}', pageWidth - margin, 6.5, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('High-Yield Formula Engine (Complete 18-Chapter JEE Syllabus)', margin, pageHeight - 5);
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  };

  const checkPageBreak = (neededH: number, chTitle: string) => {
    if (y + neededH > pageHeight - 12) {
      doc.addPage();
      currentPage++;
      y = margin;
      drawMasterPageDecoration(chTitle);
    }
  };

  drawMasterPageDecoration('Table of Contents');

  // Title Page / Master Header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setFillColor(6, 182, 212);
  doc.rect(margin, y, 3, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('JEE ADVANCED & MAIN PHYSICS', margin + 7, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Complete 18-Chapter High-Yield Formula Compendium & Revision Guide', margin + 7, y + 14.5);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Rendered with Server-Side LaTeX \\begin{equation} Equation Delimiters & Authentic Typography', margin + 7, y + 19.5);

  y += 28;

  // Iterate all chapters
  CHAPTERS.forEach((chapter, chIdx) => {
    const jeeSheet = findJeeSheetOnServer(chapter.id, chapter.name);
    const concepts = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id);

    checkPageBreak(20, chapter.name);

    // Chapter Header Banner
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(margin, y, 2.5, 9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`CHAPTER ${chIdx + 1}: ${sanitizeUnicodeForPdf(chapter.name).toUpperCase()}`, margin + 5, y + 6);

    y += 12;

    // Sections from JEE Sheet
    const masterSections = jeeSheet?.coreFormulas || (jeeSheet as any)?.sections || [];
    if (masterSections.length > 0) {
      masterSections.forEach((sec: any, sIdx: number) => {
        checkPageBreak(12, chapter.name);

        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, 5.5, 0.6, 0.6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(49, 46, 129);
        const secHeading = sec.sectionTitle || sec.title || `Section ${sIdx + 1}`;
        doc.text(`${sIdx + 1}. ${sanitizeUnicodeForPdf(secHeading)}`, margin + 3, y + 4);
        y += 7.5;

        (sec.items || []).forEach((item: any, iIdx: number) => {
          const nameClean = sanitizeUnicodeForPdf(item.name);
          const condClean = formatForServerFont(preprocessAndWrapFormula(item.conditionOrMeaning, 'inline'), hasSerif);

          const fBoxH = drawServerLatexFormulaBox(measureDoc, item.formula, 0, 0, contentWidth - 4, { eqNumber: `${chIdx + 1}.${sIdx + 1}.${iIdx + 1}` });

          doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'italic');
          doc.setFontSize(7.0);
          const nLines = doc.splitTextToSize(condClean, contentWidth - 8);
          const totalH = 4 + fBoxH + nLines.length * 3.0 + 3;

          checkPageBreak(totalH, chapter.name);

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(margin, y, contentWidth, totalH, 0.8, 0.8, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`* ${nameClean}:`, margin + 3, y + 3.5);

          const fY = y + 4.8;
          drawServerLatexFormulaBox(doc, item.formula, margin + 2, fY, contentWidth - 4, {
            eqNumber: `${chIdx + 1}.${sIdx + 1}.${iIdx + 1}`,
            bgColor: [255, 255, 255],
            borderColor: [203, 213, 225],
            textColor: [15, 23, 42],
          });

          const nY = fY + fBoxH + 2.4;
          doc.setFont(hasSerif ? 'FreeSerif' : 'helvetica', 'normal');
          doc.setFontSize(7.0);
          doc.setTextColor(100, 116, 139);
          nLines.forEach((nl: string, nlIdx: number) => {
            doc.text(nl, margin + 3, nY + nlIdx * 3.0);
          });

          y += totalH + 1.2;
        });

        y += 1.5;
      });
    }

    y += 4;
  });

  const fileName = 'JEE-Physics-Master-18-Chapters-Formula-Sheet.pdf';
  const pdfArrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(pdfArrayBuffer);

  return {
    buffer,
    fileName,
    chapterName: 'Master 18-Chapter Compendium',
    pageCount: doc.getNumberOfPages(),
  };
}
