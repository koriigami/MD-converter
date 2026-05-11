import { templates } from '../server/lib/templateRegistry.js';

export default (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json(
    templates.map(({ id, name, vibe, fonts, accent, accentLabel }) => ({
      id, name, vibe, fonts, accent, accentLabel,
    }))
  );
};
