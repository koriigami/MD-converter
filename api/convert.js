module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    available: true,
    message: 'MD Converter is deployed and running on Vercel!',
    note: 'For document conversion (DOCX/PDF), download and run the tool locally with: npm start',
    downloadLink: 'https://github.com/koriigami/md-converter',
    templates: 20,
    availableLocally: ['DOCX conversion', 'PDF conversion', 'Live preview', 'All 20 style presets']
  });
};
