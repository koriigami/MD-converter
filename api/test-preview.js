module.exports = (req, res) => {
  try {
    const { renderPreview } = require('../server/lib/converter');
    res.json({ status: 'success', loaded: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
