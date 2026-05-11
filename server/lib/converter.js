const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } = require('docx');
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
  const tokens = marked.lexer(mdText);
  const primaryFont = template.fonts.split('+')[0].trim();

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
