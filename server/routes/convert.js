const express = require('express');
const multer = require('multer');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { convert, renderPreview } = require('../lib/converter');
const { templates } = require('../lib/templateRegistry');

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

// List all available templates
router.get('/templates', (req, res) => {
  res.json(
    templates.map(({ id, name, vibe, fonts, accent, accentLabel }) => ({
      id, name, vibe, fonts, accent, accentLabel,
    }))
  );
});

// Live preview endpoint (returns full HTML)
router.post('/preview', express.text({ type: 'text/plain', limit: '2mb' }), (req, res) => {
  const { template = 'slate-pro' } = req.query;
  const mdText = req.body;
  if (!mdText) return res.status(400).json({ error: 'No markdown text provided' });

  try {
    const html = renderPreview(mdText, template);
    res.type('html').send(html);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Main conversion endpoint
router.post('/convert', upload.single('file'), async (req, res) => {
  const { template = 'slate-pro', format = 'docx' } = req.body;

  if (!['docx', 'pdf'].includes(format)) {
    return res.status(400).json({ error: 'format must be "docx" or "pdf"' });
  }

  let inputPath;
  let cleanupInput = false;

  if (req.file) {
    // Uploaded file
    inputPath = req.file.path;
    cleanupInput = true;
  } else if (req.body.text) {
    // Pasted text — write to temp file
    inputPath = path.join(os.tmpdir(), `md-${Date.now()}.md`);
    fs.writeFileSync(inputPath, req.body.text, 'utf8');
    cleanupInput = true;
  } else {
    return res.status(400).json({ error: 'Provide a file upload or text field' });
  }

  const ext = format === 'docx' ? 'docx' : 'pdf';
  const outputPath = path.join(os.tmpdir(), `converted-${Date.now()}.${ext}`);

  try {
    await convert({ inputPath, templateId: template, format, outputPath });

    const mimeType = format === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="document.${ext}"`);

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    res.on('finish', () => {
      fs.rmSync(outputPath, { force: true });
      if (cleanupInput) fs.rmSync(inputPath, { force: true });
    });
  } catch (err) {
    if (cleanupInput) fs.rmSync(inputPath, { force: true });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
