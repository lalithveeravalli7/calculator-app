/* ============================================================
   converter.js — Unit conversion data and logic
   ============================================================
   Convert A → B:  result = value × toBase[A] / toBase[B]
   Temperature uses a dedicated function (non-linear).
   ============================================================ */

const convData = {

  length: {
    units: ['meter','kilometer','centimeter','millimeter',
            'mile','yard','foot','inch','nautical mile'],
    toBase: {
      meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
      mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254,
      'nautical mile': 1852
    }
  },

  weight: {
    units: ['kilogram','gram','milligram','pound','ounce','tonne','stone'],
    toBase: {
      kilogram: 1, gram: 0.001, milligram: 1e-6,
      pound: 0.453592, ounce: 0.0283495, tonne: 1000, stone: 6.35029
    }
  },

  temp: { units: ['celsius','fahrenheit','kelvin'], toBase: null },

  area: {
    units: ['sq meter','sq kilometer','sq mile','sq yard','sq foot','hectare','acre'],
    toBase: {
      'sq meter': 1, 'sq kilometer': 1e6, 'sq mile': 2589988,
      'sq yard': 0.836127, 'sq foot': 0.092903, hectare: 10000, acre: 4046.86
    }
  },

  speed: {
    units: ['m/s','km/h','mph','knot','ft/s'],
    toBase: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444, 'ft/s': 0.3048 }
  },

  data: {
    units: ['byte','kilobyte','megabyte','gigabyte','terabyte','petabyte'],
    toBase: {
      byte: 1, kilobyte: 1024, megabyte: 1048576,
      gigabyte: 1073741824, terabyte: 1099511627776, petabyte: 1125899906842624
    }
  },

  time: {
    units: ['second','minute','hour','day','week','month','year'],
    toBase: {
      second: 1, minute: 60, hour: 3600, day: 86400,
      week: 604800, month: 2629800, year: 31557600
    }
  },

  currency: {
    units: ['USD','EUR','GBP','INR','JPY','AUD','CAD'],
    toBase: { USD: 1, EUR: 1.08, GBP: 1.27, INR: 0.012, JPY: 0.0067, AUD: 0.65, CAD: 0.74 }
  }
};

// ── Populate From / To dropdowns ──────────────────────────
function updateConvUnits() {
  const type    = document.getElementById('conv-type').value;
  const data    = convData[type];
  const fromSel = document.getElementById('conv-from');
  const toSel   = document.getElementById('conv-to');
  fromSel.innerHTML = toSel.innerHTML = '';
  data.units.forEach(u => {
    fromSel.innerHTML += `<option value="${u}">${u}</option>`;
    toSel.innerHTML   += `<option value="${u}">${u}</option>`;
  });
  toSel.selectedIndex = 1;
  doConvert();
}

// ── Convert and update result ─────────────────────────────
function doConvert() {
  const type  = document.getElementById('conv-type').value;
  const from  = document.getElementById('conv-from').value;
  const toU   = document.getElementById('conv-to').value;
  const value = parseFloat(document.getElementById('conv-input').value) || 0;
  let result;
  if (type === 'temp') {
    result = convertTemperature(value, from, toU);
  } else {
    const d = convData[type];
    result  = value * d.toBase[from] / d.toBase[toU];
  }
  document.getElementById('conv-result').textContent = formatResult(result);
}

// ── Temperature (non-linear) ──────────────────────────────
function convertTemperature(value, from, to) {
  let c = from === 'celsius'    ? value
        : from === 'fahrenheit' ? (value - 32) * 5 / 9
        :                          value - 273.15;
  return to === 'celsius'    ? c
       : to === 'fahrenheit' ? c * 9 / 5 + 32
       :                       c + 273.15;
}

// ── Smart number display ──────────────────────────────────
function formatResult(n) {
  if (isNaN(n) || !isFinite(n)) return 'Error';
  if (Math.abs(n) > 1e10 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(6);
  return String(parseFloat(n.toPrecision(10)));
}