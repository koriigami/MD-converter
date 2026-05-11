const { renderPreview } = require('../server/lib/converter');

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { template = 'slate-pro' } = req.query;
  const mdText = req.body instanceof Buffer ? req.body.toString('utf8') : req.body;

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
