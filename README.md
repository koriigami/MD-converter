# MD Converter

Personal tool to convert `.md` files into **DOCX** or **PDF** with 20 styled presets. Built with Node.js + Express + Pandoc + Puppeteer.

## Usage

### Web UI

```bash
npm start
# Open http://localhost:3000
```

Paste markdown or drop a `.md` file → pick a style preset → choose DOCX or PDF → **Convert & Download**.

### CLI

```bash
# Install globally
npm link

# Convert
md-convert proposal.md --template brass-bold --format docx
md-convert article.md  --template warm-ivory  --format pdf
md-convert pricing.md  --template forest-brief --out ~/Desktop/client-pricing.docx

# List all 20 presets
md-convert list
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--template` | `slate-pro` | Style preset name |
| `--format`   | `docx`      | `docx` or `pdf`  |
| `--out`      | same dir as input | Output file path |

## 20 Style Presets

| ID | Name | Font | Accent | Best For |
|----|------|------|--------|----------|
| `slate-pro` | Slate Pro | Inter | Dark Slate | General documents |
| `midnight-navy` | Midnight Navy | Playfair + Source Sans | Deep Navy | Corporate proposals |
| `forest-brief` | Forest Brief | DM Sans | Forest Green | Consultancy, client briefs |
| `obsidian` | Obsidian | JetBrains Mono + Inter | Near Black | Technical docs |
| `warm-ivory` | Warm Ivory | Lora + Source Serif 4 | Warm Tan | Long-form editorial |
| `latte` | Latte | Playfair + Lato | Coffee Brown | Lifestyle, cozy editorial |
| `solar` | Solar | Space Grotesk | Amber | Startup pitches |
| `crimson-edge` | Crimson Edge | Montserrat + Georgia | Crimson | Reports, high-impact |
| `sage-calm` | Sage Calm | Nunito + Lora | Sage Green | Wellness, lifestyle |
| `violet-pulse` | Violet Pulse | DM Sans | Violet | Creative briefs, branding |
| `arctic` | Arctic | Inter | Sky Blue | Clean tech docs |
| `ink-press` | Ink Press | Playfair Display | Ink Black | Magazine editorial |
| `blush-rose` | Blush Rose | Cormorant Garamond + Lato | Rose Pink | Lifestyle, fashion |
| `emerald-report` | Emerald Report | IBM Plex Sans | Emerald | Financial, structured |
| `sand-dune` | Sand Dune | Raleway + Lora | Sand | Warm consultancy |
| `code-doc` | Code Doc | JetBrains Mono + Inter | Teal | Technical documentation |
| `portfolio-dark` | Portfolio Dark | Space Grotesk | Electric Blue | Dark mode, portfolio |
| `whisper` | Whisper | Inter Light | Ghost Grey | Ultra-minimal |
| `brass-bold` | Brass Bold | Cormorant Garamond + Inter | Gold | Premium proposals |
| `carbon` | Carbon | Space Mono + Inter | Cyan | Modern tech, dark |

## Setup

### Requirements

- Node.js 18+
- [Pandoc](https://pandoc.org/) — `brew install pandoc`

### Install

```bash
npm install
npm run gen-templates   # generates CSS + reference.docx for all 20 presets
npm start
```

### Regenerate templates

To regenerate all template assets after editing `scripts/gen-templates.js`:

```bash
npm run gen-templates
```

## Deploy to Railway

1. Connect your GitHub repo in Railway
2. Railway auto-detects the `Dockerfile`
3. Set `PORT` env var if needed (defaults to `3000`)

The Dockerfile installs Node, Pandoc, and Chromium for PDF generation.
