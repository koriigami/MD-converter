const { renderPreview } = require('../server/lib/converter');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { preset = 'notion', palette, typography, accent } = req.query;
  let mdText = req.body;

  if (Buffer.isBuffer(mdText)) {
    mdText = mdText.toString('utf8');
  }

  if (!mdText || typeof mdText !== 'string') {
    return res.status(400).json({ error: 'No markdown text provided' });
  }

  try {
    const html = await renderPreview(mdText, preset, palette, typography, accent);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
