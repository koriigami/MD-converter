const { convert } = require('../server/lib/converter');
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse URL-encoded body (URLSearchParams from frontend)
  const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : (req.body || '');
  const params = new URLSearchParams(bodyStr);

  const text = params.get('text');
  const preset = params.get('preset') || 'notion';
  const palette = params.get('palette') || undefined;
  const typography = params.get('typography') || undefined;
  const accent = params.get('accent') || undefined;
  const format = params.get('format') || 'docx';

  if (!['docx', 'pdf'].includes(format)) {
    return res.status(400).json({ error: 'format must be "docx" or "pdf"' });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'No markdown text provided' });
  }

  const ext = format;
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

    const fileBuffer = fs.readFileSync(outputPath);
    res.end(fileBuffer);

    fs.rmSync(outputPath, { force: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
