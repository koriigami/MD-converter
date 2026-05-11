const { renderPreview } = require('../server/lib/converter');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { template = 'slate-pro' } = req.query;
  let mdText = req.body;

  // Handle both string and Buffer body types
  if (Buffer.isBuffer(mdText)) {
    mdText = mdText.toString('utf8');
  }

  if (!mdText || typeof mdText !== 'string') {
    return res.status(400).json({ error: 'No markdown text provided' });
  }

  try {
    const html = renderPreview(mdText, template);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
