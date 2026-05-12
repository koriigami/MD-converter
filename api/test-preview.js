module.exports = (req, res) => {
  try {
    const { renderPreview } = require('../server/lib/converter');
    res.json({ status: 'loaded', type: typeof renderPreview });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, stack: err.stack });
  }
};
