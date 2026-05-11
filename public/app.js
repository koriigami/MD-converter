/* global state */
let TEMPLATES = [];
const state = {
  templateId: 'slate-pro',
  format: 'docx',
  mdText: '',
  converting: false,
};

let previewTimer = null;

// ── Bootstrap ──────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('/api/templates');
    TEMPLATES = await res.json();
  } catch {
    setStatus('Could not reach server', 'error');
    return;
  }

  renderStrip();
  bindEvents();
  applyAccent(currentTemplate());
  updateWordmarkDoc();
  renderEmptyPreview();
}

function currentTemplate() {
  return TEMPLATES.find((t) => t.id === state.templateId) || TEMPLATES[0];
}

// ── Template strip ─────────────────────────────────────────
function renderStrip() {
  const strip = document.getElementById('templateStrip');
  strip.innerHTML = TEMPLATES.map((t) => `
    <div
      class="template-card${t.id === state.templateId ? ' selected' : ''}"
      data-id="${t.id}"
      style="--card-accent:${t.accent}"
      title="${t.vibe}"
    >
      <div class="card-name">${t.name}</div>
      <div class="card-fonts">${t.fonts}</div>
      <div class="card-vibe">${t.vibe}</div>
    </div>
  `).join('');

  strip.querySelectorAll('.template-card').forEach((card) => {
    card.addEventListener('click', () => selectTemplate(card.dataset.id));
  });
}

function selectTemplate(id) {
  state.templateId = id;
  document.querySelectorAll('.template-card').forEach((c) => {
    c.classList.toggle('selected', c.dataset.id === id);
  });
  const t = currentTemplate();
  applyAccent(t);
  updateWordmarkDoc();
  schedulePreview(0);
}

function applyAccent(t) {
  if (!t) return;
  // Use uiAccent (brighter version) for UI chrome, accent for doc color swatch
  const uiColor = t.uiAccent || t.accent;
  document.documentElement.style.setProperty('--accent', uiColor);
}

function updateWordmarkDoc() {
  const t = currentTemplate();
  const el = document.getElementById('wordmarkDoc');
  if (el && t) {
    el.textContent = state.format === 'pdf' ? 'PDF' : 'DOCX';
  }
  const nameEl = document.getElementById('previewTemplateName');
  if (nameEl && t) nameEl.textContent = t.name;
}

// ── Events ─────────────────────────────────────────────────
function bindEvents() {
  const input    = document.getElementById('mdInput');
  const fileInput = document.getElementById('fileInput');
  const dropZone  = document.getElementById('dropZone');
  const overlay   = document.getElementById('dropOverlay');
  const btnDocx   = document.getElementById('btnDocx');
  const btnPdf    = document.getElementById('btnPdf');

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
  btnPdf.addEventListener('click',  () => setFormat('pdf'));

  // Convert
  document.getElementById('convertBtn').addEventListener('click', triggerConvert);
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
  document.getElementById('btnPdf').classList.toggle('active',  fmt === 'pdf');
  updateWordmarkDoc();
}

// ── Preview ─────────────────────────────────────────────────
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
    const res = await fetch(`/api/preview?template=${state.templateId}`, {
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

// ── Convert ─────────────────────────────────────────────────
async function triggerConvert() {
  if (state.converting) return;
  if (!state.mdText.trim()) {
    setStatus('Add some markdown first', 'error');
    return;
  }

  setConverting(true);
  setStatus('Converting…');

  try {
    const body = new FormData();
    body.append('text',     state.mdText);
    body.append('template', state.templateId);
    body.append('format',   state.format);

    const res = await fetch('/api/convert', { method: 'POST', body });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Conversion failed' }));
      throw new Error(error);
    }

    const blob = await res.blob();
    const ext  = state.format;
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
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
  const btn     = document.getElementById('convertBtn');
  const label   = document.getElementById('convertLabel');
  const spinner = document.getElementById('convertSpinner');
  btn.disabled         = on;
  label.textContent    = on ? 'Converting…' : 'Convert & Download';
  spinner.hidden       = !on;
}

function setStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  el.textContent  = msg;
  el.className    = 'status-msg' + (type ? ` ${type}` : '');
  if (type === 'success' || type === 'error') {
    setTimeout(() => { el.textContent = ''; el.className = 'status-msg'; }, 4500);
  }
}

init();
