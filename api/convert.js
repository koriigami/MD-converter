const { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } = require('docx');
const { marked } = require('marked');
const busboy = require('busboy');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let mdText = '';
    const bb = busboy({ headers: req.headers });

    return new Promise((resolve) => {
      bb.on('field', (fieldname, val) => {
        if (fieldname === 'text') mdText = val;
      });

      bb.on('close', async () => {
        try {
          if (!mdText) {
            res.status(400).json({ error: 'No markdown text provided' });
            return resolve();
          }

          // Parse markdown and generate DOCX inline (no file I/O)
          const tokens = marked.lexer(mdText);
          const paragraphs = [];

          for (const token of tokens) {
            if (token.type === 'heading') {
              const level = token.depth === 1 ? HeadingLevel.HEADING_1 : token.depth === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
              paragraphs.push(new Paragraph({
                text: token.text,
                heading: level,
                spacing: { after: 200 },
              }));
            } else if (token.type === 'paragraph') {
              paragraphs.push(new Paragraph({
                children: [new TextRun(token.text)],
                spacing: { after: 100 },
              }));
            } else if (token.type === 'list') {
              for (const item of token.items) {
                paragraphs.push(new Paragraph({
                  children: [new TextRun(`• ${item.text}`)],
                  spacing: { after: 50 },
                }));
              }
            }
          }

          const doc = new Document({
            sections: [{
              properties: {
                page: {
                  margins: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
                },
              },
              children: paragraphs.length > 0 ? paragraphs : [new Paragraph('Empty document')],
            }],
          });

          const buffer = await Packer.toBuffer(doc);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
          res.setHeader('Content-Disposition', 'attachment; filename="document.docx"');
          res.send(buffer);

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
