/**
 * gen-templates.js
 *
 * Generates for each of the 20 style presets:
 *  1. templates/<id>/style.css  — used for HTML preview and Puppeteer PDF
 *  2. templates/<id>/reference.docx — used by Pandoc for DOCX output
 *
 * Usage: npm run gen-templates
 */

'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execFileAsync = promisify(execFile);
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// ── Extended style config (beyond what's in the registry) ────────────────────
// Each entry: fonts to import from Google, bg, bodyText, headingFont, bodyFont,
//             monoFont, h1Size, h2Size, h3Size, bodySize, accentHex, tableBg,
//             isDark (dark-background document)
const STYLE_CONFIG = {
  'slate-pro': {
    gfonts: 'Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400',
    bg: '#FAFAFA', bodyText: '#1E2530', accent: '#2D3A4A',
    headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '10.5pt',
    tableHead: '#2D3A4A', tableHeadText: '#ffffff', tableRow: '#F3F4F6',
  },
  'midnight-navy': {
    gfonts: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;1,400',
    bg: '#FEFEFE', bodyText: '#1A1A2E', accent: '#1A2744',
    headingFont: "'Playfair Display', serif", bodyFont: "'Source Sans 3', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.1rem', h2: '1.45rem', h3: '1.2rem', body: '10.5pt',
    tableHead: '#1A2744', tableHeadText: '#ffffff', tableRow: '#EEF1F7',
  },
  'forest-brief': {
    gfonts: 'DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400',
    bg: '#FAFDF9', bodyText: '#1A2A1E', accent: '#1E4D3B',
    headingFont: "'DM Sans', sans-serif", bodyFont: "'DM Sans', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '10.5pt',
    tableHead: '#1E4D3B', tableHeadText: '#ffffff', tableRow: '#F0F7F3',
  },
  'obsidian': {
    gfonts: 'JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Inter:ital,wght@0,400;0,500;0,600;1,400',
    bg: '#F8F8F8', bodyText: '#1C1C1E', accent: '#3A3A3C',
    headingFont: "'JetBrains Mono', monospace", bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '1.9rem', h2: '1.35rem', h3: '1.1rem', body: '10.5pt',
    tableHead: '#3A3A3C', tableHeadText: '#ffffff', tableRow: '#F2F2F2',
  },
  'warm-ivory': {
    gfonts: 'Lora:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400',
    bg: '#FBF8F3', bodyText: '#2C2016', accent: '#7A5C3E',
    headingFont: "'Lora', serif", bodyFont: "'Source Serif 4', serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.2rem', h2: '1.5rem', h3: '1.2rem', body: '11pt',
    tableHead: '#7A5C3E', tableHeadText: '#ffffff', tableRow: '#F5EFE6',
  },
  'latte': {
    gfonts: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400',
    bg: '#FDF8F1', bodyText: '#2A1E10', accent: '#6B4A2A',
    headingFont: "'Playfair Display', serif", bodyFont: "'Lato', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.2rem', h2: '1.5rem', h3: '1.2rem', body: '10.5pt',
    tableHead: '#6B4A2A', tableHeadText: '#ffffff', tableRow: '#F7EFE2',
  },
  'solar': {
    gfonts: 'Space+Grotesk:wght@300;400;500;600;700',
    bg: '#FFFDF7', bodyText: '#1E1800', accent: '#E07B1A',
    headingFont: "'Space Grotesk', sans-serif", bodyFont: "'Space Grotesk', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '10.5pt',
    tableHead: '#E07B1A', tableHeadText: '#ffffff', tableRow: '#FFF4E0',
  },
  'crimson-edge': {
    gfonts: 'Montserrat:ital,wght@0,400;0,600;0,700;1,400',
    bg: '#FEFEFE', bodyText: '#1A0808', accent: '#B81C1C',
    headingFont: "'Montserrat', sans-serif", bodyFont: "Georgia, 'Times New Roman', serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.1rem', h2: '1.45rem', h3: '1.2rem', body: '10.5pt',
    tableHead: '#B81C1C', tableHeadText: '#ffffff', tableRow: '#FDF0F0',
  },
  'sage-calm': {
    gfonts: 'Nunito:ital,wght@0,300;0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,500;1,400',
    bg: '#F9FBF8', bodyText: '#1E2A1E', accent: '#5A7A5C',
    headingFont: "'Nunito', sans-serif", bodyFont: "'Lora', serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '11pt',
    tableHead: '#5A7A5C', tableHeadText: '#ffffff', tableRow: '#EEF5EE',
  },
  'violet-pulse': {
    gfonts: 'DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400',
    bg: '#FDFAFF', bodyText: '#18102A', accent: '#5B3FA6',
    headingFont: "'DM Sans', sans-serif", bodyFont: "'DM Sans', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '10.5pt',
    tableHead: '#5B3FA6', tableHeadText: '#ffffff', tableRow: '#F2EDFF',
  },
  'arctic': {
    gfonts: 'Inter:ital,wght@0,300;0,400;0,500;0,600;1,400',
    bg: '#F6FAFF', bodyText: '#0F1E2E', accent: '#1A7BB4',
    headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '10.5pt',
    tableHead: '#1A7BB4', tableHeadText: '#ffffff', tableRow: '#E8F3FB',
  },
  'ink-press': {
    gfonts: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400',
    bg: '#FEFEFE', bodyText: '#111111', accent: '#111111',
    headingFont: "'Playfair Display', serif", bodyFont: "'Playfair Display', serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.4rem', h2: '1.6rem', h3: '1.25rem', body: '11pt',
    tableHead: '#111111', tableHeadText: '#ffffff', tableRow: '#F5F5F5',
  },
  'blush-rose': {
    gfonts: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Lato:ital,wght@0,400;0,700;1,400',
    bg: '#FFF8F9', bodyText: '#2A0E15', accent: '#C2687A',
    headingFont: "'Cormorant Garamond', serif", bodyFont: "'Lato', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.3rem', h2: '1.55rem', h3: '1.25rem', body: '10.5pt',
    tableHead: '#C2687A', tableHeadText: '#ffffff', tableRow: '#FDF0F2',
  },
  'emerald-report': {
    gfonts: 'IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400',
    bg: '#F7FDFB', bodyText: '#0A1E15', accent: '#1A6B4A',
    headingFont: "'IBM Plex Sans', sans-serif", bodyFont: "'IBM Plex Sans', sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
    h1: '1.9rem', h2: '1.35rem', h3: '1.1rem', body: '10.5pt',
    tableHead: '#1A6B4A', tableHeadText: '#ffffff', tableRow: '#EBF7F2',
  },
  'sand-dune': {
    gfonts: 'Raleway:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;1,400',
    bg: '#FBF7F0', bodyText: '#2A1E0A', accent: '#A0845C',
    headingFont: "'Raleway', sans-serif", bodyFont: "'Lora', serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.1rem', h2: '1.45rem', h3: '1.2rem', body: '11pt',
    tableHead: '#A0845C', tableHeadText: '#ffffff', tableRow: '#F5EFE3',
  },
  'code-doc': {
    gfonts: 'JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600',
    bg: '#F5F7F7', bodyText: '#0D1A1C', accent: '#0D7377',
    headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '1.9rem', h2: '1.35rem', h3: '1.1rem', body: '10.5pt',
    tableHead: '#0D7377', tableHeadText: '#ffffff', tableRow: '#E8F4F4',
  },
  'portfolio-dark': {
    gfonts: 'Space+Grotesk:wght@300;400;500;600;700',
    bg: '#0F1117', bodyText: '#E8ECEF', accent: '#4A9EFF',
    headingFont: "'Space Grotesk', sans-serif", bodyFont: "'Space Grotesk', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2rem', h2: '1.4rem', h3: '1.15rem', body: '10.5pt',
    tableHead: '#4A9EFF', tableHeadText: '#0F1117', tableRow: '#1A1E28',
    isDark: true,
  },
  'whisper': {
    gfonts: 'Inter:ital,wght@0,300;0,400;0,500;1,300',
    bg: '#FFFFFF', bodyText: '#333333', accent: '#888888',
    headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '1.85rem', h2: '1.3rem', h3: '1.1rem', body: '10.5pt',
    tableHead: '#F0F0F0', tableHeadText: '#333333', tableRow: '#FAFAFA',
  },
  'brass-bold': {
    gfonts: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600',
    bg: '#FDFBF5', bodyText: '#1C1508', accent: '#B8960C',
    headingFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    h1: '2.4rem', h2: '1.6rem', h3: '1.3rem', body: '10.5pt',
    tableHead: '#B8960C', tableHeadText: '#ffffff', tableRow: '#FBF6E0',
  },
  'carbon': {
    gfonts: 'Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600',
    bg: '#1A1A1A', bodyText: '#E0E0E0', accent: '#00BCD4',
    headingFont: "'Space Mono', monospace", bodyFont: "'Inter', sans-serif",
    monoFont: "'Space Mono', monospace",
    h1: '1.9rem', h2: '1.35rem', h3: '1.1rem', body: '10.5pt',
    tableHead: '#00BCD4', tableHeadText: '#1A1A1A', tableRow: '#242424',
    isDark: true,
  },
};

// ── CSS generator ─────────────────────────────────────────────────────────────
function buildCss(id, c) {
  const borderColor = c.isDark
    ? `color-mix(in srgb, ${c.accent} 40%, transparent)`
    : `color-mix(in srgb, ${c.accent} 25%, transparent)`;
  const blockquoteBg = c.isDark
    ? `color-mix(in srgb, ${c.accent} 8%, #000)`
    : `color-mix(in srgb, ${c.accent} 6%, #fff)`;
  const codeBg = c.isDark ? '#2A2A2A' : '#F4F4F4';
  const codeText = c.isDark ? '#E0E0E0' : '#1A1A1A';
  const hrColor = c.isDark
    ? `color-mix(in srgb, ${c.accent} 35%, transparent)`
    : `color-mix(in srgb, ${c.accent} 30%, transparent)`;
  const linkColor = c.accent;

  return `/* Template: ${id} */
@import url('https://fonts.googleapis.com/css2?family=${c.gfonts}&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: ${c.bg};
  color: ${c.bodyText};
  font-family: ${c.bodyFont};
  font-size: ${c.body};
  line-height: 1.75;
  max-width: 780px;
  margin: 0 auto;
  padding: 52px 64px 72px;
  -webkit-font-smoothing: antialiased;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: ${c.headingFont};
  color: ${c.accent};
  line-height: 1.25;
  font-weight: 700;
}
h1 { font-size: ${c.h1}; margin: 1.8em 0 0.6em; }
h2 { font-size: ${c.h2}; margin: 1.5em 0 0.5em; }
h3 { font-size: ${c.h3}; margin: 1.3em 0 0.45em; }
h4 { font-size: 1rem;   margin: 1.2em 0 0.4em; font-weight: 600; }
h1:first-child, h2:first-child { margin-top: 0; }

/* Paragraph & inline */
p { margin-bottom: 0.9em; }
strong { color: ${c.accent}; }
em { font-style: italic; }
a {
  color: ${linkColor};
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}
a:hover { opacity: 0.75; }

/* Lists */
ul, ol { padding-left: 1.6em; margin-bottom: 0.9em; }
li { margin-bottom: 0.3em; }
li > ul, li > ol { margin-top: 0.3em; margin-bottom: 0; }

/* Horizontal rule */
hr {
  border: none;
  border-top: 1.5px solid ${hrColor};
  margin: 2em 0;
}

/* Blockquote */
blockquote {
  border-left: 3px solid ${c.accent};
  margin: 1.5em 0;
  padding: 0.8em 1.2em;
  background: ${blockquoteBg};
  border-radius: 0 4px 4px 0;
  font-style: italic;
  color: color-mix(in srgb, ${c.bodyText} 80%, transparent);
}
blockquote p { margin: 0; }

/* Code */
code {
  font-family: ${c.monoFont};
  font-size: 0.875em;
  background: ${codeBg};
  color: ${codeText};
  padding: 0.15em 0.4em;
  border-radius: 3px;
}
pre {
  background: ${codeBg};
  color: ${codeText};
  border-radius: 5px;
  padding: 1.1em 1.3em;
  margin: 1.2em 0;
  overflow-x: auto;
  border-left: 3px solid ${c.accent};
}
pre code {
  background: none;
  padding: 0;
  font-size: 0.855em;
  line-height: 1.6;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.6em 0;
  font-size: 0.9em;
}
th {
  background: ${c.tableHead};
  color: ${c.tableHeadText};
  font-family: ${c.headingFont};
  font-weight: 600;
  text-align: left;
  padding: 9px 12px;
  font-size: 0.875em;
  letter-spacing: 0.02em;
}
td {
  padding: 8px 12px;
  border-bottom: 1px solid ${borderColor};
  vertical-align: top;
}
tr:nth-child(even) td { background: ${c.tableRow}; }

/* Utility */
img { max-width: 100%; height: auto; border-radius: 4px; }
`;
}

// ── Reference DOCX generator ──────────────────────────────────────────────────
async function buildReferenceDocx(templateId, destPath) {
  // --print-default-data-file writes binary to stdout; capture it
  const { stdout } = await execFileAsync('pandoc', [
    '--print-default-data-file', 'reference.docx',
  ], { encoding: 'buffer' });
  fs.writeFileSync(destPath, stdout);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const ids = Object.keys(STYLE_CONFIG);
  console.log(`\nGenerating assets for ${ids.length} templates…\n`);

  for (const id of ids) {
    const dir = path.join(TEMPLATES_DIR, id);
    fs.mkdirSync(dir, { recursive: true });

    const c = STYLE_CONFIG[id];

    // 1. CSS
    const cssPath = path.join(dir, 'style.css');
    fs.writeFileSync(cssPath, buildCss(id, c), 'utf8');

    // 2. reference.docx
    const docxPath = path.join(dir, 'reference.docx');
    try {
      await buildReferenceDocx(id, docxPath);
      console.log(`  ✓ ${id}`);
    } catch (err) {
      console.error(`  ✗ ${id}: ${err.message}`);
    }
  }

  console.log('\nDone.\n');
}

main().catch((err) => { console.error(err); process.exit(1); });
