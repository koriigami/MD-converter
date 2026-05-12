/* global state */
let PRESETS = {};
let PALETTES = {};
let TYPOGRAPHY = {};
const state = {
  presetId: 'notion',
  paletteId: null,
  typographyId: null,
  accent: null,
  format: 'docx',
  mdText: '',
  converting: false,
};

let previewTimer = null;
const STORAGE_KEY = 'md-converter-state';

// ── Bootstrap ──────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('/api/presets');
    PRESETS = await res.json();
    PRESETS = PRESETS.reduce((map, p) => ({ ...map, [p.id]: p }), {});
  } catch {
    setStatus('Could not reach server', 'error');
    return;
  }

  // Load saved state from localStorage
  loadState();

  renderPresetsList();
  renderCustomizeControls();
  bindEvents();
  updatePreviewName();
  renderEmptyPreview();
  schedulePreview(0);
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.presetId = parsed.presetId || 'notion';
      state.paletteId = parsed.paletteId || null;
      state.typographyId = parsed.typographyId || null;
      state.accent = parsed.accent || null;
      state.format = parsed.format || 'docx';
    } catch {
      // Invalid JSON, use defaults
    }
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    presetId: state.presetId,
    paletteId: state.paletteId,
    typographyId: state.typographyId,
    accent: state.accent,
    format: state.format,
  }));
}

// ── Preset rendering ───────────────────────────────────────
function renderPresetsList() {
  const list = document.getElementById('presetsList');
  list.innerHTML = Object.values(PRESETS).map((preset) => {
    const isSelected = preset.id === state.presetId ? ' selected' : '';
    return `
      <button
        class="preset-item${isSelected}"
        data-preset-id="${preset.id}"
      >
        <div class="preset-thumbnail"
             style="
               --preset-bg: ${getPresetPaletteBg(preset.id)};
               --preset-accent: ${getPresetAccent(preset.id)};
               --preset-text: ${getPresetText(preset.id)};
             "
        >
          <div class="thumbnail-stripe"></div>
          <div class="thumbnail-lines">
            <div class="thumbnail-line"></div>
            <div class="thumbnail-line"></div>
          </div>
        </div>
        <div class="preset-info">
          <span class="preset-name">${preset.name}</span>
          <span class="preset-vibe">${preset.vibe}</span>
        </div>
      </button>
    `;
  }).join('');

  list.querySelectorAll('.preset-item').forEach((btn) => {
    btn.addEventListener('click', () => selectPreset(btn.dataset.presetId));
  });
}

function selectPreset(presetId) {
  state.presetId = presetId;
  state.paletteId = null;
  state.typographyId = null;
  state.accent = null;
  saveState();
  renderPresetsList();
  renderCustomizeControls();
  updatePreviewName();
  schedulePreview(0);
}

function getPresetPaletteBg(presetId) {
  // Hardcoded palette backgrounds for mini-thumbnails
  const paletteMap = {
    notion: '#F8F8F8', medium: '#FBF8F3', linear: '#1E232B', github: '#F5F7FA',
    stripe: '#FFFFFF', substack: '#FDF6EC', ia_writer: '#FFFFFF', obsidian: '#0F1117',
    latex: '#FFFFFF', hbr: '#FBF8F3', dropbox_paper: '#FFFFFF', ghost: '#FFFFFF',
    vercel: '#0F1117', framer: '#F8F8F8', figma_docs: '#F5F7FA',
  };
  return paletteMap[presetId] || '#FFFFFF';
}

function getPresetAccent(presetId) {
  // Hardcoded accents for mini-thumbnails
  const accentMap = {
    notion: '#666666', medium: '#000000', linear: '#7C3AED', github: '#0969DA',
    stripe: '#5469D4', substack: '#FF6A00', ia_writer: '#4A90E2', obsidian: '#7C3AED',
    latex: '#000000', hbr: '#CC0000', dropbox_paper: '#0061FF', ghost: '#15171A',
    vercel: '#FFFFFF', framer: '#A78BFA', figma_docs: '#000000',
  };
  return accentMap[presetId] || '#666666';
}

function getPresetText(presetId) {
  // Text color (body) for mini-thumbnail lines
  const isDarkPreset = ['linear', 'obsidian', 'vercel'].includes(presetId);
  return isDarkPreset ? '#EAEAEA' : '#1A1A1A';
}

// ── Customize controls rendering ────────────────────────────
function renderCustomizeControls() {
  renderPaletteSwatches();
  renderTypographyPills();
  renderAccentSwatches();
}

function renderPaletteSwatches() {
  const container = document.getElementById('paletteSwatches');
  const palettes = [
    { id: 'paper', bg: '#FFFFFF' },
    { id: 'ivory', bg: '#FBF8F3' },
    { id: 'sand', bg: '#FDF6EC' },
    { id: 'frost', bg: '#F5F7FA' },
    { id: 'chalk', bg: '#F8F8F8' },
    { id: 'slate', bg: '#1E232B' },
    { id: 'carbon', bg: '#1A1A1A' },
    { id: 'ink', bg: '#0F1117' },
  ];

  container.innerHTML = palettes.map((p) => {
    const isSelected = state.paletteId === p.id ? ' selected' : '';
    return `
      <button
        class="palette-swatch${isSelected}"
        data-palette-id="${p.id}"
        style="background: ${p.bg};"
        title="${p.id}"
      ></button>
    `;
  }).join('');

  container.querySelectorAll('.palette-swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.paletteId = btn.dataset.paletteId;
      saveState();
      renderPaletteSwatches();
      schedulePreview(0);
    });
  });
}

function renderTypographyPills() {
  const container = document.getElementById('typographyPills');
  const typographies = [
    'humanist', 'editorial', 'technical', 'academic',
    'expressive', 'geometric', 'classic', 'modern_serif',
  ];

  container.innerHTML = typographies.map((t) => {
    const label = t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ');
    const isSelected = state.typographyId === t ? ' selected' : '';
    return `
      <button
        class="typography-pill${isSelected}"
        data-typography-id="${t}"
        title="${t}"
      >${label}</button>
    `;
  }).join('');

  container.querySelectorAll('.typography-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.typographyId = btn.dataset.typographyId;
      saveState();
      renderTypographyPills();
      schedulePreview(0);
    });
  });
}

function renderAccentSwatches() {
  const container = document.getElementById('accentSwatches');
  const accents = [
    '#666666', '#000000', '#7C3AED', '#0969DA',
    '#5469D4', '#FF6A00', '#4A90E2', '#CC0000',
    '#0061FF', '#15171A',
  ];

  container.innerHTML = accents.map((a) => {
    const isSelected = state.accent === a ? ' selected' : '';
    return `
      <button
        class="accent-swatch${isSelected}"
        data-accent="${a}"
        style="background: ${a};"
        title="${a}"
      ></button>
    `;
  }).join('');

  container.querySelectorAll('.accent-swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.accent = btn.dataset.accent;
      saveState();
      renderAccentSwatches();
      schedulePreview(0);
    });
  });
}

// ── Event binding ──────────────────────────────────────────
function bindEvents() {
  const input = document.getElementById('mdInput');
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const overlay = document.getElementById('dropOverlay');
  const btnDocx = document.getElementById('btnDocx');
  const btnPdf = document.getElementById('btnPdf');

  // Typing
  input.addEventListener('input', () => {
    state.mdText = input.value;
    schedulePreview(500);
  });

  // File picker
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) readFile(file);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    overlay.classList.add('visible');
  });
  dropZone.addEventListener('dragleave', (e) => {
    if (!dropZone.contains(e.relatedTarget)) overlay.classList.remove('visible');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    overlay.classList.remove('visible');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
    else setStatus('Drop a .md file', 'error');
  });

  // Format toggle
  btnDocx.addEventListener('click', () => setFormat('docx'));
  btnPdf.addEventListener('click', () => setFormat('pdf'));

  // Convert button
  document.getElementById('convertBtn').addEventListener('click', triggerConvert);

  // Keyboard shortcut: Cmd+Enter / Ctrl+Enter
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !state.converting) {
      triggerConvert();
    }
  });
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    document.getElementById('mdInput').value = text;
    state.mdText = text;
    schedulePreview(0);
  };
  reader.readAsText(file);
}

function setFormat(fmt) {
  state.format = fmt;
  document.getElementById('btnDocx').classList.toggle('active', fmt === 'docx');
  document.getElementById('btnPdf').classList.toggle('active', fmt === 'pdf');
  saveState();
}

// ── Preview ────────────────────────────────────────────────
function schedulePreview(delay) {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, delay);
}

async function updatePreview() {
  if (!state.mdText.trim()) {
    renderEmptyPreview();
    return;
  }

  try {
    const params = new URLSearchParams({
      preset: state.presetId,
      ...(state.paletteId && { palette: state.paletteId }),
      ...(state.typographyId && { typography: state.typographyId }),
      ...(state.accent && { accent: state.accent }),
    });

    const res = await fetch(`/api/preview?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: state.mdText,
    });

    if (!res.ok) return;
    const html = await res.text();
    document.getElementById('previewFrame').srcdoc = html;
  } catch {
    /* silent: preview is non-critical */
  }
}

function renderEmptyPreview() {
  document.getElementById('previewFrame').srcdoc = `<!DOCTYPE html><html><head>
  <style>
    body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;font-family:system-ui;color:#bbb;gap:10px;
    background:#fafafa;}
    p{font-size:13px;} span{font-size:28px;}
  </style></head><body>
  <span>✦</span>
  <p>Preview appears here</p>
  </body></html>`;
}

function updatePreviewName() {
  const preset = PRESETS[state.presetId];
  const nameEl = document.getElementById('previewPresetName');
  if (nameEl && preset) {
    const label = state.paletteId || state.typographyId || state.accent
      ? `${preset.name} (customized)`
      : preset.name;
    nameEl.textContent = label;
  }
}

// ── Convert ────────────────────────────────────────────────
async function triggerConvert() {
  if (state.converting) return;
  if (!state.mdText.trim()) {
    setStatus('Add some markdown first', 'error');
    return;
  }

  setConverting(true);
  setStatus('Converting…');

  try {
    const body = new URLSearchParams();
    body.append('text', state.mdText);
    body.append('preset', state.presetId);
    if (state.paletteId) body.append('palette', state.paletteId);
    if (state.typographyId) body.append('typography', state.typographyId);
    if (state.accent) body.append('accent', state.accent);
    body.append('format', state.format);

    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Conversion failed' }));
      throw new Error(error);
    }

    const blob = await res.blob();
    const ext = state.format;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${ext}`;
    a.click();
    URL.revokeObjectURL(url);

    setStatus(`✓ Downloaded document.${ext}`, 'success');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setConverting(false);
  }
}

function setConverting(on) {
  state.converting = on;
  const btn = document.getElementById('convertBtn');
  const label = document.getElementById('convertLabel');
  const spinner = document.getElementById('convertSpinner');
  btn.disabled = on;
  label.textContent = on ? 'Converting…' : 'Convert & Download';
  spinner.hidden = !on;
}

function setStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className = 'status-msg' + (type ? ` ${type}` : '');
  if (type === 'success' || type === 'error') {
    setTimeout(() => { el.textContent = ''; el.className = 'status-msg'; }, 4500);
  }
}

init();
