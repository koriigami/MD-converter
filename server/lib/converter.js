const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const HTMLtoDOCX = require('html-to-docx');

const PRESETS = require('./presetConfig');
const PALETTES = require('./paletteConfig');
const TYPOGRAPHY = require('./typographyConfig');
const { composeCss } = require('./cssComposer');

let cachedMarked;
async function getMarked() {
  if (!cachedMarked) {
    cachedMarked = await import('marked');
  }
  return cachedMarked;
}

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
    return convertToDocx({ mdText, effectiveTypographyId, outputPath });
  } else if (format === 'pdf') {
    return convertToPdf({ mdText, presetId, effectivePaletteId, effectiveTypographyId, effectiveAccent, isDark, outputPath });
  } else {
    throw new Error(`Unsupported format: "${format}"`);
  }
}

// Maps each typography preset to the best Word-compatible system fonts
const DOCX_FONT_MAP = {
  editorial:    'Georgia',
  academic:     'Times New Roman',
  classic:      'Book Antiqua',
  modern_serif: 'Georgia',
  humanist:     'Calibri',
  geometric:    'Trebuchet MS',
  technical:    'Calibri',
  expressive:   'Verdana',
};

async function convertToDocx({ mdText, effectiveTypographyId, outputPath }) {
  const markedModule = await getMarked();
  const bodyHtml = markedModule.parse(mdText);

  const font = DOCX_FONT_MAP[effectiveTypographyId] || 'Calibri';

  const fileBuffer = await HTMLtoDOCX(bodyHtml, null, {
    table:      { row: { cantSplit: true } },
    footer:     false,
    header:     false,
    pageNumber: false,
    font,
    fontSize:   22,
    margins:    { top: 1440, bottom: 1440, left: 1800, right: 1800 },
  });

  fs.writeFileSync(outputPath, fileBuffer);
}

async function convertToPdf({ mdText, presetId, effectivePaletteId, effectiveTypographyId, effectiveAccent, isDark, outputPath }) {
  const css = composeCss({
    paletteId: effectivePaletteId,
    typographyId: effectiveTypographyId,
    accent: effectiveAccent,
    isDark,
  });
  const markedModule = await getMarked();
  const bodyHtml = markedModule.parse(mdText);
  const styledHtml = `<!DOCTYPE html><html><head><style>${css}\n@page { margin: 15mm 0; }</style></head><body class="preview-body"><div class="doc-content">${bodyHtml}</div></body></html>`;

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
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
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
 * @returns {Promise<string>} Full HTML with composed CSS injected
 */
async function renderPreview(mdText, presetId, paletteId, typographyId, accent) {
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

  const markedModule = await getMarked();
  const bodyHtml = markedModule.parse(mdText);

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
