/**
 * cssComposer.js
 * Composes a complete document CSS from palette + typography + accent selections.
 * Called during preview + conversion to build dynamic CSS (no pre-generation needed).
 */

const PALETTES = require('./paletteConfig');
const TYPOGRAPHY = require('./typographyConfig');

function composeCss({
  paletteId,
  typographyId,
  accent,
  isDark = false,
}) {
  const palette = PALETTES[paletteId];
  const typography = TYPOGRAPHY[typographyId];

  if (!palette || !typography) {
    throw new Error(`Invalid palette (${paletteId}) or typography (${typographyId})`);
  }

  const gfontsUrl = typography.gfonts
    ? `https://fonts.googleapis.com/css2?family=${typography.gfonts}&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap`
    : '';

  const bodyBg = palette.bg;
  const bodyText = palette.bodyText;
  const accentColor = accent;
  const tableHeadBg = accentColor;
  const tableHeadText = isDark ? '#ffffff' : '#ffffff';
  const tableRowBg = palette.tableRow;

  // Code block background (lighter on light, darker on dark)
  const codeBg = isDark ? palette.surface2 : palette.surface2;
  const codeText = bodyText;

  // Blockquote styling
  const blockquoteBorderColor = accentColor;
  const blockquoteBg = isDark
    ? `rgba(${hexToRgb(accentColor).join(',')}, 0.08)`
    : `rgba(${hexToRgb(accentColor).join(',')}, 0.05)`;

  const css = `
@import url('${gfontsUrl}');

html, body {
  margin: 0;
  padding: 0;
  background: ${bodyBg};
  color: ${bodyText};
  font-family: ${typography.bodyFont};
  font-size: ${typography.body};
  line-height: ${typography.lineHeight};
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: ${typography.headingFont};
  font-weight: 600;
  color: ${bodyText};
  margin: 1.2em 0 0.6em 0;
  line-height: 1.3;
}

h1 { font-size: ${typography.h1}; }
h2 { font-size: ${typography.h2}; margin-top: 1.5em; }
h3 { font-size: ${typography.h3}; }
h4 { font-size: 1.05rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.95rem; }

p {
  margin: 0.8em 0;
}

a {
  color: ${accentColor};
  text-decoration: none;
  border-bottom: 1px solid ${accentColor};
}

a:hover {
  opacity: 0.8;
}

strong, b {
  font-weight: 600;
}

em, i {
  font-style: italic;
}

code {
  font-family: ${typography.monoFont};
  background: ${codeBg};
  color: ${codeText};
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.95em;
}

pre {
  background: ${codeBg};
  color: ${codeText};
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
  font-family: ${typography.monoFont};
  font-size: 0.9em;
  line-height: 1.5;
}

pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  color: inherit;
}

blockquote {
  border-left: 3px solid ${blockquoteBorderColor};
  margin: 1em 0;
  padding: 0.8em 1em;
  background: ${blockquoteBg};
  color: ${bodyText};
  font-style: italic;
}

ul, ol {
  margin: 0.8em 0;
  padding-left: 2em;
}

li {
  margin: 0.3em 0;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

th {
  background: ${tableHeadBg};
  color: ${tableHeadText};
  padding: 0.6em;
  text-align: left;
  font-weight: 600;
  border: 1px solid ${tableHeadBg};
}

td {
  padding: 0.6em;
  border: 1px solid ${palette.border};
}

tr:nth-child(even) {
  background: ${tableRowBg};
}

hr {
  border: none;
  border-top: 1px solid ${palette.border};
  margin: 1.5em 0;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
  margin: 1em 0;
}

.doc-content {
  max-width: 100%;
  padding: 0.75in;
  margin: 0;
}

.document {
  max-width: 8.5in;
  margin: 0.5in;
  padding: 0.5in;
}
`;

  return css;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : [100, 100, 100];
}

module.exports = { composeCss };
