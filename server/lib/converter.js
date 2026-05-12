const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } = require('docx');

let marked;
try {
  marked = require('marked/lib/marked.cjs');
} catch {
  marked = require('marked').marked || require('marked').default;
}

const PRESETS = require('./presetConfig');
const PALETTES = require('./paletteConfig');
const TYPOGRAPHY = require('./typographyConfig');
const { composeCss } = require('./cssComposer');

/**
 * Convert a markdown file to DOCX or PDF.
 * @param {object} opts
 * @param {string} opts.mdText      - Markdown text content
 * @param {string} opts.presetId    - Preset name (e.g. 'notion')
 * @param {string} [opts.paletteId] - Override palette (optional)
 * @param {string} [opts.typographyId] - Override typography (optional)
 * @param {string} [opts.accent]    - Override accent color (optional)
 * @param {'docx'|'pdf'} opts.format
 * @param {string} [opts.outputPath] - For file output (optional for preview)
 */
async function convert({ mdText, presetId, paletteId, typographyId, accent, format, outputPath }) {
  const preset = PRESETS[presetId];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`);
  }

  // Resolve effective palette, typography, accent (overrides take precedence)
  const effectivePaletteId = paletteId || preset.paletteId;
  const effectiveTypographyId = typographyId || preset.typographyId;
  const effectiveAccent = accent || preset.accent;
  const isDark = preset.isDark;

  if (format === 'docx') {
    return convertToDocx({ mdText, presetId, effectivePaletteId, effectiveTypographyId, effectiveAccent, isDark, outputPath });
  } else if (format === 'pdf') {
    return convertToPdf({ mdText, presetId, effectivePaletteId, effectiveTypographyId, effectiveAccent, isDark, outputPath });
  } else {
    throw new Error(`Unsupported format: "${format}"`);
  }
}

async function convertToDocx({ mdText, presetId, effectivePaletteId, effectiveTypographyId, effectiveAccent, isDark, outputPath }) {
  const tokens = marked.lexer(mdText);
  const typography = TYPOGRAPHY[effectiveTypographyId];
  const primaryFont = typography.bodyFont.replace(/['\"]/g, '');

  // Parse markdown tokens into Word paragraphs
  const paragraphs = [];
  for (const token of tokens) {
    if (token.type === 'heading') {
      const level = token.depth === 1 ? HeadingLevel.HEADING_1 : token.depth === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
      paragraphs.push(new Paragraph({
        text: token.text,
        heading: level,
        spacing: { after: 200 },
      }));
    } else if (token.type === 'paragraph') {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: token.text, font: primaryFont })],
        spacing: { after: 100 },
      }));
    } else if (token.type === 'list') {
      for (const item of token.items) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `• ${item.text}`, font: primaryFont })],
          spacing: { after: 50 },
        }));
      }
    } else if (token.type === 'code') {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: token.text, font: 'Courier New' })],
        spacing: { after: 100 },
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margins: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      children: paragraphs.length > 0 ? paragraphs : [new Paragraph('Empty document')],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

async function convertToPdf({ mdText, presetId, effectivePaletteId, effectiveTypographyId, effectiveAccent, isDark, outputPath }) {
  const css = composeCss({
    paletteId: effectivePaletteId,
    typographyId: effectiveTypographyId,
    accent: effectiveAccent,
    isDark,
  });
  const bodyHtml = marked.parse(mdText);
  const styledHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body class="preview-body"><div class="doc-content">${bodyHtml}</div></body></html>`;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
}

/**
 * Render markdown as HTML string (for live preview in the web UI).
 * @param {string} mdText
 * @param {string} presetId
 * @param {string} [paletteId] - Optional palette override
 * @param {string} [typographyId] - Optional typography override
 * @param {string} [accent] - Optional accent override
 * @returns {string} Full HTML with composed CSS injected
 */
function renderPreview(mdText, presetId, paletteId, typographyId, accent) {
  const preset = PRESETS[presetId];
  if (!preset) {
    return `<html><body style="color: red;">Error: Unknown preset ${presetId}</body></html>`;
  }

  const effectivePaletteId = paletteId || preset.paletteId;
  const effectiveTypographyId = typographyId || preset.typographyId;
  const effectiveAccent = accent || preset.accent;

  const css = composeCss({
    paletteId: effectivePaletteId,
    typographyId: effectiveTypographyId,
    accent: effectiveAccent,
    isDark: preset.isDark,
  });

  const bodyHtml = marked.parse(mdText);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body class="preview-body">
  <div class="doc-content">${bodyHtml}</div>
</body>
</html>`;
}

module.exports = { convert, renderPreview };
