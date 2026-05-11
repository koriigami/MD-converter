# MD Converter - Deployment Guide

## Vercel Deployment

The application is deployed on Vercel at: **https://md-converter-bay.vercel.app**

### Vercel Features
- **Static UI:** The web interface is fully functional and accessible at the URL above
- **Template API:** `/api/templates` returns all 20 style presets
- **Status:** View deployment status at `/api/convert` (POST request)

### Local Usage (Full Features)
For full DOCX and PDF conversion, run the tool locally:

```bash
npm install
npm start
# Open http://localhost:3000 in your browser
```

## Local Development

### Running Locally
```bash
npm start              # Runs server on port 3000
npm run dev          # Runs with file watching (requires Node --watch)
npm run gen-templates # Regenerate template CSS and reference.docx files
```

### CLI Tool
```bash
npm link              # Makes `md-convert` available globally
md-convert proposal.md --template brass-bold --format docx
md-convert article.md --template warm-ivory --format pdf
md-convert --list     # Show all available templates
```

## Architecture

### Backend Stack
- **Express.js** - Web server
- **Marked** - Markdown parser
- **docx** - DOCX generation (native library)
- **Puppeteer + @sparticuz/chromium** - PDF rendering
- **Busboy** - Multipart form parsing

### Project Structure
```
md-converter/
├── server/
│   ├── index.js              # Express app entry
│   ├── lib/
│   │   ├── converter.js      # DOCX/PDF conversion logic
│   │   └── templateRegistry.js # 20 style definitions
│   └── routes/
│       └── convert.js        # API routes
├── api/
│   ├── templates.js          # GET /api/templates
│   ├── preview.js            # POST /api/preview
│   └── convert.js            # POST /api/convert (info endpoint on Vercel)
├── public/
│   ├── index.html            # Web UI
│   ├── app.js                # Client-side logic
│   └── style.css             # UI styles
├── templates/
│   └── [20 style folders]/   # CSS and reference.docx per template
├── bin/
│   └── md-convert.js         # CLI tool
└── package.json
```

## Style Presets (20 Available)

1. **Slate Pro** - Clean professional default
2. **Midnight Navy** - Corporate, premium
3. **Forest Brief** - Natural, consultancy
4. **Obsidian** - Minimal, technical
5. **Warm Ivory** - Editorial, long-form
6. **Latte** - Cozy, lifestyle editorial
7. **Solar** - Startup-y, energetic
8. **Crimson Edge** - Bold, reports, impact
9. **Sage Calm** - Wellness, lifestyle
10. **Violet Pulse** - Creative briefs, branding
11. **Arctic** - Light, clean tech
12. **Ink Press** - Magazine editorial
13. **Blush Rose** - Lifestyle, fashion
14. **Emerald Report** - Financial, structured
15. **Sand Dune** - Consultancy, warm
16. **Code Doc** - Technical documentation
17. **Portfolio Dark** - Dark mode, portfolio
18. **Whisper** - Ultra-minimal, max whitespace
19. **Brass Bold** - Premium proposals
20. **Carbon** - Modern tech, dark charcoal

## Known Limitations

### Vercel Deployment
- **DOCX/PDF Conversion:** Not available on Vercel (serverless constraints; use locally)
- **File I/O:** Vercel's ephemeral filesystem and native binding issues prevent full backend functionality
- **Use Case:** The deployment serves as a UI showcase and template listing; conversion happens locally

### Local Usage
- **Pandoc Required:** For CLI tool (`bin/md-convert.js`)
  - Install: `brew install pandoc` (macOS) or `apt-get install pandoc` (Linux)
  - Docker: `docker run -v $(pwd):/work pandoc ...`
- **Puppeteer:** Chromium download happens on first run (~100MB)

## Git History

The project has been migrated from `/Users/koriigami/KD-2026/Personal-Projects/MD-converter` into a standalone git repository with the following key commits:

```
feat: Initial MD-converter project with 20 style presets
refactor: Replace Pandoc with html-to-docx and serverless packages
fix: Mount API routes before static file serving
feat: Add native Vercel serverless API handlers
refactor: Simplify to native Vercel handlers
fix: Add proper Vercel routing config for API and static files
```

## Next Steps

1. **Clone/Download:** Get the code from `/Users/koriigami/KD-2026/Personal-Projects/MD-converter`
2. **Install:** `npm install`
3. **Run Local:** `npm start` then visit `http://localhost:3000`
4. **Deploy Updates:** `npx vercel --prod --yes`

---

**Last Updated:** May 11, 2026
**Deployment URL:** https://md-converter-bay.vercel.app
**GitHub:** (pending repository setup)
