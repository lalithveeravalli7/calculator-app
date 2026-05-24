/* ============================================================
   calculator.js — State, input, arithmetic, scientific,
                   memory functions (M+ M− MR MC)
   ============================================================ */

// ── Calculator state ───────────────────────────────────────
let cur    = '0';   // current display string
let prev   = null;  // stored left-hand operand
let op_    = null;  // pending operator
let expr   = '';    // top expression line text
let fresh  = false; // true right after operator pressed

// ── Memory state ───────────────────────────────────────────
let memory = 0;            // stored memory value
let memHasValue = false;   // true when memory is non-zero

// ── DOM helpers ────────────────────────────────────────────
const getMain = () => document.getElementById('main');
const getExpr = () => document.getElementById('expr');
const getMem  = () => document.getElementById('mem-indicator');

// ── Display updater ────────────────────────────────────────
function show(value, isError = false) {
  getMain().textContent = value;
  getMain().className   = 'display-main' + (isError ? ' error' : '');
  getExpr().textContent = expr;
  getMem().textContent  = memHasValue ? `M = ${memory}` : '';
}

// ── Digit / decimal input ──────────────────────────────────
function digit(d) {
  if (d === '(' || d === ')') { cur += d; show(cur); return; }
  if (fresh) { cur = d; fresh = false; }
  else cur = (cur === '0' && d !== '.') ? d : cur + d;
  show(cur);
}

function dot() {
  if (!cur.includes('.')) { cur += '.'; show(cur); }
}

// ── Clear / backspace ──────────────────────────────────────
function ac() {
  cur = '0'; prev = null; op_ = null; expr = ''; fresh = false;
  show('0');
}

function bksp() {
  cur = cur.length > 1 ? cur.slice(0, -1) : '0';
  show(cur);
}

// ── Sign and percent ───────────────────────────────────────
function toggleSign() {
  cur = cur.startsWith('-') ? cur.slice(1) : (cur !== '0' ? '-' + cur : '0');
  show(cur);
}

function pct() {
  cur = String(parseFloat(cur) / 100);
  show(cur);
}

// ── Arithmetic operators ───────────────────────────────────
function op(o) {
  if (op_ && !fresh) { eq(true); }   // chain evaluation
  prev  = parseFloat(cur);
  op_   = o;
  const sym = { '/':'÷', '*':'×', '-':'−', '+':'+', '**':'xʸ' }[o] || o;
  expr  = cur + ' ' + sym;
  fresh = true;
  show(cur);
}

// ── Evaluate ───────────────────────────────────────────────
function eq(internal = false) {
  if (!op_ || prev === null) return;
  const a = prev, b = parseFloat(cur);
  const fullExpr = (expr || String(a)) + ' ' + cur;
  if (!internal) expr = fullExpr + ' =';

  try {
    let res;
    switch (op_) {
      case '+':  res = a + b;           break;
      case '-':  res = a - b;           break;
      case '*':  res = a * b;           break;
      case '**': res = Math.pow(a, b);  break;
      case '/':
        if (b === 0) {
          cur = 'Error'; op_ = null; prev = null;
          show('Error', true); return;
        }
        res = a / b; break;
      default: show('Error', true); return;
    }

    res   = +parseFloat(res.toPrecision(12));
    cur   = String(res);
    op_   = null;
    prev  = null;
    fresh = true;

    // Push to history (defined in history.js)
    if (!internal) pushHistory(fullExpr, cur);

    show(cur);
  } catch (e) { show('Error', true); }
}

// ── Scientific functions (trig in degrees) ─────────────────
function sciOp(fn) {
  const v = parseFloat(cur);
  const D = Math.PI / 180;
  let res;
  try {
    switch (fn) {
      case 'sin':  expr = `sin(${v}°)`;  res = Math.sin(v * D);  break;
      case 'cos':  expr = `cos(${v}°)`;  res = Math.cos(v * D);  break;
      case 'tan':  expr = `tan(${v}°)`;  res = Math.tan(v * D);  break;
      case 'log':  expr = `log₁₀(${v})`; res = Math.log10(v);    break;
      case 'ln':   expr = `ln(${v})`;     res = Math.log(v);      break;
      case 'sqrt': expr = `√(${v})`;      res = Math.sqrt(v);     break;
      case 'pow2': expr = `${v}²`;        res = v * v;            break;
      case 'pow3': expr = `${v}³`;        res = v * v * v;        break;
      case 'inv':  expr = `1/${v}`;       res = 1 / v;            break;
      case 'fact': expr = `${v}!`;        res = factorial(v);     break;
      case 'abs':  expr = `|${v}|`;       res = Math.abs(v);      break;
      default: return;
    }
    if (isNaN(res) || !isFinite(res)) { show('Error', true); return; }
    pushHistory(expr, String(+parseFloat(res.toPrecision(12))));
    cur = String(+parseFloat(res.toPrecision(12))); fresh = true;
    show(cur);
  } catch (e) { show('Error', true); }
}

function sciConst(name) {
  cur   = name === 'PI' ? String(Math.PI) : String(Math.E);
  fresh = false;
  show(cur);
}

// ── Factorial helper ───────────────────────────────────────
function factorial(n) {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ── Memory functions ───────────────────────────────────────

// M+ : add current value to memory
function mPlus() {
  memory += parseFloat(cur);
  memHasValue = memory !== 0;
  show(cur);
}

// M− : subtract current value from memory
function mMinus() {
  memory -= parseFloat(cur);
  memHasValue = memory !== 0;
  show(cur);
}

// MR : recall memory to display
function mRecall() {
  if (!memHasValue) return;
  cur   = String(memory);
  fresh = false;
  show(cur);
}

// MC : clear memory
function mClear() {
  memory = 0;
  memHasValue = false;
  show(cur);
}