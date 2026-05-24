/* ============================================================
   history.js — Calculation history: store, render, clear, reuse
   ============================================================ */

// ── History state ──────────────────────────────────────────
// Each entry: { expr: "3 + 4", result: "7" }
let historyLog = [];

const MAX_HISTORY = 50;   // keep last 50 entries

// ── Add an entry ───────────────────────────────────────────
// Called from calculator.js after eq() or sciOp() completes.
function pushHistory(expr, result) {
  historyLog.unshift({ expr, result });        // newest first
  if (historyLog.length > MAX_HISTORY) {
    historyLog.pop();                          // drop oldest
  }
  renderHistory();
  saveHistoryToStorage();
}

// ── Render to DOM ──────────────────────────────────────────
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  if (historyLog.length === 0) {
    list.innerHTML = '<div class="history-empty">No calculations yet</div>';
    return;
  }

  list.innerHTML = historyLog.map((entry, index) => `
    <div class="history-item" onclick="reuseHistory(${index})" title="Tap to reuse">
      <span class="history-expr">${escapeHtml(entry.expr)}</span>
      <span class="history-result">${escapeHtml(entry.result)}</span>
    </div>
  `).join('');
}

// ── Reuse a history entry (tap to load result) ─────────────
function reuseHistory(index) {
  const entry = historyLog[index];
  if (!entry) return;
  // Load the result back into the calculator display
  cur   = entry.result;   // cur is defined in calculator.js
  fresh = false;
  show(cur);              // show() is defined in calculator.js
}

// ── Clear all history ──────────────────────────────────────
function clearHistory() {
  historyLog = [];
  renderHistory();
  localStorage.removeItem('calc_history');
}

// ── Persist to localStorage ────────────────────────────────
function saveHistoryToStorage() {
  try {
    localStorage.setItem('calc_history', JSON.stringify(historyLog));
  } catch (e) {
    // Storage full or unavailable — silently skip
  }
}

// ── Restore from localStorage on startup ──────────────────
function loadHistoryFromStorage() {
  try {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      historyLog = JSON.parse(saved);
      renderHistory();
    }
  } catch (e) {
    historyLog = [];
  }
}

// ── XSS safety helper ─────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}