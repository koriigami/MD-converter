const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes BEFORE static file serving
const convertRoutes = require('./routes/convert');
app.use('/api', convertRoutes);

// Static files last (will serve index.html for SPA routing)
app.use(express.static(path.join(__dirname, '..', 'public')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MD Converter running at http://localhost:${PORT}`);
  });
}

module.exports = app;
