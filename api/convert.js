const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');
const busboy = require('busboy');
const { convert } = require('../server/lib/converter');

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let mdText = '';
    let template = 'slate-pro';
    let format = 'docx';

    const bb = busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

    const fileData = {};

    bb.on('field', (fieldname, val) => {
      if (fieldname === 'text') mdText = val;
      if (fieldname === 'template') template = val;
      if (fieldname === 'format') format = val;
    });

    bb.on('file', (fieldname, file, info) => {
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        fileData[fieldname] = Buffer.concat(chunks);
      });
    });

    return new Promise((resolve) => {
      bb.on('close', async () => {
        try {
          if (fileData.file) {
            mdText = fileData.file.toString('utf8');
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
