const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const { getTemplate } = require('./templateRegistry');

const execFileAsync = promisify(execFile);

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
  const args = [
    inputPath,
    '--from', 'markdown',
    '--to', 'docx',
    '--reference-doc', template.referenceDocPath,
    '--output', outputPath,
  ];

  try {
    await execFileAsync('pandoc', args);
  } catch (err) {
    throw new Error(`Pandoc DOCX conversion failed: ${err.message}`);
  }
}

async function convertToPdf({ inputPath, template, outputPath }) {
  // Step 1: pandoc → HTML (standalone, no external CSS link)
  const htmlArgs = [
    inputPath,
    '--from', 'markdown',
    '--to', 'html5',
    '--standalone',
    '--output', '-',   // stdout
  ];

  let rawHtml;
  try {
    const { stdout } = await execFileAsync('pandoc', htmlArgs);
    rawHtml = stdout;
  } catch (err) {
    throw new Error(`Pandoc HTML conversion failed: ${err.message}`);
  }

  // Step 2: inject template CSS into the HTML
  const css = fs.readFileSync(template.cssPath, 'utf8');
  const styledHtml = rawHtml.replace(
    '</head>',
    `<style>\n${css}\n</style>\n</head>`
  );

  // Step 3: Puppeteer → PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
