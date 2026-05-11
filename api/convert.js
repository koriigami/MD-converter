const fs = require('fs');
const os = require('os');
const path = require('path');
const busboy = require('busboy');
const { convert } = require('../server/lib/converter');

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let mdText = '';
  let template = 'slate-pro';
  let format = 'docx';

  // Parse form data manually (no multer in Vercel)
  const bb = busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

  return new Promise((resolve, reject) => {
    bb.on('field', (fieldname, val) => {
      if (fieldname === 'text') mdText = val;
      if (fieldname === 'template') template = val;
      if (fieldname === 'format') format = val;
    });

    bb.on('file', async (fieldname, file) => {
      if (fieldname === 'file') {
        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          mdText = Buffer.concat(chunks).toString('utf8');
        });
      }
    });

    bb.on('close', async () => {
      try {
        if (!mdText) {
          return res.status(400).json({ error: 'Provide file or text field' });
        }

        if (!['docx', 'pdf'].includes(format)) {
          return res.status(400).json({ error: 'format must be "docx" or "pdf"' });
        }

        // Write markdown to temp file
        const inputPath = path.join(os.tmpdir(), `md-${Date.now()}.md`);
        const outputPath = path.join(os.tmpdir(), `converted-${Date.now()}.${format === 'docx' ? 'docx' : 'pdf'}`);

        fs.writeFileSync(inputPath, mdText, 'utf8');

        await convert({ inputPath, templateId: template, format, outputPath });

        const fileBuffer = fs.readFileSync(outputPath);
        const mimeType = format === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="document.${format === 'docx' ? 'docx' : 'pdf'}"`);
        res.send(fileBuffer);

        // Cleanup
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
};
