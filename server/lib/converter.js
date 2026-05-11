const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const HTMLtoDOCX = require('html-to-docx');
const { marked } = require('marked');
const { getTemplate } = require('./templateRegistry');

/**
 * Convert a markdown file to DOCX or PDF.
 * @param {object} opts
 * @param {string} opts.inputPath   - Absolute path to input .md file
 * @param {string} opts.templateId  - Template name (e.g. 'slate-pro')
 * @param {'docx'|'pdf'} opts.format
 * @param {string} opts.outputPath  - Absolute path for output file
 */
async function convert({ inputPath, templateId, format, outputPath }) {
  const template = getTemplate(templateId);

  if (format === 'docx') {
    return convertToDocx({ inputPath, template, outputPath });
  } else if (format === 'pdf') {
    return convertToPdf({ inputPath, template, outputPath });
  } else {
    throw new Error(`Unsupported format: "${format}"`);
  }
}

async function convertToDocx({ inputPath, template, outputPath }) {
  const mdText = fs.readFileSync(inputPath, 'utf8');
  const css = fs.readFileSync(template.cssPath, 'utf8');
  const bodyHtml = marked.parse(mdText);
  const fullHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${bodyHtml}</body></html>`;

  const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
    font: template.fonts.split('+')[0].trim(),
    fontSize: 24,
    margins: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
  });

  fs.writeFileSync(outputPath, docxBuffer);
}

async function convertToPdf({ inputPath, template, outputPath }) {
  const mdText = fs.readFileSync(inputPath, 'utf8');
  const css = fs.readFileSync(template.cssPath, 'utf8');
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
 * @param {string} templateId
 * @returns {string} Full HTML with template CSS injected
 */
function renderPreview(mdText, templateId) {
  const template = getTemplate(templateId);
  const css = fs.readFileSync(template.cssPath, 'utf8');
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
