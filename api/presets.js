const PRESETS = require('../server/lib/presetConfig');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const presetList = Object.values(PRESETS).map(({ id, name, vibe, isDark }) => ({
    id,
    name,
    vibe,
    isDark,
  }));

  res.json(presetList);
};
