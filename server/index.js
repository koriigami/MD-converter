const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', require('./routes/convert'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MD Converter running at http://localhost:${PORT}`);
  });
}

module.exports = app;
