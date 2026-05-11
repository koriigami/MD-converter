const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount routes at both /api and root (for Vercel serverless compatibility)
const convertRoutes = require('./routes/convert');
app.use('/api', convertRoutes);
app.use(convertRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MD Converter running at http://localhost:${PORT}`);
  });
}

module.exports = app;
