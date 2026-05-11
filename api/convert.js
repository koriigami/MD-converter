const fs = require('fs');
const os = require('os');
const path = require('path');
const busboy = require('busboy');
const { convert } = require('../server/lib/converter');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let mdText = '';
    let template = 'slate-pro';
    let format = 'docx';
    const fileBuffers = {};

    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: 10 * 1024 * 1024 }
    });

    return new Promise((resolve) => {
      bb.on('field', (fieldname, val) => {
        if (fieldname === 'text') mdText = val;
        if (fieldname === 'template') template = val;
        if (fieldname === 'format') format = val;
      });

      bb.on('file', (fieldname, file) => {
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          fileBuffers[fieldname] = Buffer.concat(chunks);
        });
      });

      bb.on('close', async () => {
        try {
          // Use file if provided, otherwise use text field
          if (fileBuffers.file) {
            mdText = fileBuffers.file.toString('utf8');
          }

          if (!mdText) {
            res.status(400).json({ error: 'Provide file or text field' });
            return resolve();
          }

          if (!['docx', 'pdf'].includes(format)) {
            res.status(400).json({ error: 'format must be "docx" or "pdf"' });
            return resolve();
          }

          const inputPath = path.join(os.tmpdir(), `md-${Date.now()}.md`);
          const ext = format === 'docx' ? 'docx' : 'pdf';
          const outputPath = path.join(os.tmpdir(), `converted-${Date.now()}.${ext}`);

          fs.writeFileSync(inputPath, mdText, 'utf8');

          await convert({ inputPath, templateId: template, format, outputPath });

          const fileBuffer = fs.readFileSync(outputPath);
          const mimeType = format === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/pdf';

          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Disposition', `attachment; filename="document.${ext}"`);
          res.send(fileBuffer);

          fs.rmSync(inputPath, { force: true });
          fs.rmSync(outputPath, { force: true });

          resolve();
        } catch (err) {
          res.status(500).json({ error: err.message });
          resolve();
        }
      });

      bb.on('error', (err) => {
        res.status(400).json({ error: err.message });
        resolve();
      });

      req.pipe(bb);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
