const express = require('express');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { convert, renderPreview } = require('../lib/converter');
const PRESETS = require('../lib/presetConfig');

const router = express.Router();

// List all available presets
router.get('/presets', (req, res) => {
  const presetList = Object.values(PRESETS).map(({ id, name, vibe, isDark }) => ({
    id,
    name,
    vibe,
    isDark,
  }));
  res.json(presetList);
});

// Live preview endpoint (returns full HTML)
router.post('/preview', express.text({ type: 'text/plain', limit: '2mb' }), (req, res) => {
  const { preset = 'notion', palette, typography, accent } = req.query;
  const mdText = req.body;
  if (!mdText) return res.status(400).json({ error: 'No markdown text provided' });

  try {
    const html = renderPreview(mdText, preset, palette, typography, accent);
    res.type('html').send(html);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Main conversion endpoint
router.post('/convert', express.urlencoded({ extended: false }), async (req, res) => {
  const { text, preset = 'notion', palette, typography, accent, format = 'docx' } = req.body;

  if (!['docx', 'pdf'].includes(format)) {
    return res.status(400).json({ error: 'format must be "docx" or "pdf"' });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'No markdown text provided' });
  }

  const ext = format === 'docx' ? 'docx' : 'pdf';
  const outputPath = path.join(os.tmpdir(), `converted-${Date.now()}.${ext}`);

  try {
    await convert({
      mdText: text,
      presetId: preset,
      paletteId: palette,
      typographyId: typography,
      accent,
      format,
      outputPath,
    });

    const mimeType = format === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="document.${ext}"`);

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    res.on('finish', () => {
      fs.rmSync(outputPath, { force: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
