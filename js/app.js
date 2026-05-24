/* ============================================================
   app.js — App init, mode switching, theme toggle,
            keyboard support, service worker registration
   ============================================================
   Loaded LAST in index.html so all other JS files are ready.
   ============================================================ */

// ── Mode switching ─────────────────────────────────────────
function setMode(mode) {
  const tabs = document.querySelectorAll('.mode-btn');
  const idx  = { std: 0, sci: 1, conv: 2 }[mode];
  tabs.forEach(t => t.classList.remove('active'));
  tabs[idx].classList.add('active');

  document.getElementById('panel-std').style.display  = mode === 'std'  ? 'grid'  : 'none';
  document.getElementById('panel-sci').style.display  = mode === 'sci'  ? 'grid'  : 'none';
  document.getElementById('panel-conv').style.display = mode === 'conv' ? 'block' : 'none';

  if (mode === 'conv') updateConvUnits();
}

// ── Dark / Light theme toggle ──────────────────────────────
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('theme-btn').textContent = isDark ? '☀️' : '🌙';
  // Remember preference
  localStorage.setItem('calc_theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
  const saved = localStorage.getItem('calc_theme');
  // Also respect system preference if no manual choice made
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.body.classList.add('dark');
    document.getElementById('theme-btn').textContent = '☀️';
  }
}

// ── Keyboard support ───────────────────────────────────────
document.addEventListener('keydown', e => {
  // Don't intercept when typing in converter input
  const isConv = document.getElementById('panel-conv').style.display !== 'none';
  if (isConv && e.target.tagName === 'INPUT') return;

  const k = e.key;
  if ('0123456789'.includes(k))     digit(k);
  else if (k === '.')               dot();
  else if (k === '+')               op('+');
  else if (k === '-')               op('-');
  else if (k === '*')               op('*');
  else if (k === '/') { e.preventDefault(); op('/'); }
  else if (k === 'Enter' || k === '=') eq();
  else if (k === 'Backspace')       bksp();
  else if (k === 'Escape')          ac();
  else if (k === '%')               pct();
  else if (k === '(' || k === ')')  digit(k);
});

// ── Service Worker registration (PWA offline support) ──────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.warn('SW registration failed:', err));
  }
}

// ── App initialisation ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();              // apply saved or system theme
  setMode('std');           // start in standard mode
  updateConvUnits();        // pre-load converter dropdowns
  loadHistoryFromStorage(); // restore history from last session
  registerServiceWorker();  // enable PWA / offline caching
});
