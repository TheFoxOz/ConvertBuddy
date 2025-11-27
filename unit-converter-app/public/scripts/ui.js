// scripts/ui.js - MAIN UI (imports converter + currency + history)
import { listUnits, convert, swapUnits } from "./converter.js";
import { conversionData } from "./units.js";
import { getCachedRates } from "./currency.js";
import { saveHistory, getHistory, clearHistory } from "./history.js";

// DOM refs (match your index.html IDs)
const DOM = {
  categoryList: document.getElementById('category-list'),
  converterForm: document.getElementById('converter-form'),
  fromValue: document.getElementById('from-value'),
  toValue: document.getElementById('to-value'),
  fromUnit: document.getElementById('from-unit'),
  toUnit: document.getElementById('to-unit'),
  historyList: document.getElementById('history-list'),
  swapButton: document.getElementById('swap-btn'),
  currencyWarning: document.getElementById('currency-warning'),
  lastUpdatedText: document.getElementById('last-updated-text')
};

let currentCategory = Object.keys(conversionData)[0] || 'Length';

// init
document.addEventListener('DOMContentLoaded', async () => {
  renderCategoryList();
  await loadCategory(currentCategory);
  setupEventListeners();
  await renderHistory();
  updateCurrencyWarning();
});

function setupEventListeners() {
  if (DOM.converterForm) DOM.converterForm.addEventListener('input', debounce(performConversion, 250));
  if (DOM.fromUnit) DOM.fromUnit.addEventListener('change', performConversion);
  if (DOM.toUnit) DOM.toUnit.addEventListener('change', performConversion);
  if (DOM.swapButton) DOM.swapButton.addEventListener('click', (e) => { e.preventDefault(); swapUnits(DOM, performConversion); });

  // History clear (if you have a button wired into UI)
  const clearBtn = document.getElementById('clear-history-button');
  if (clearBtn) clearBtn.addEventListener('click', async () => { await clearHistory(); await renderHistory(); });
}

function renderCategoryList() {
  if (!DOM.categoryList) return;
  DOM.categoryList.innerHTML = '';

  Object.keys(conversionData).forEach(catKey => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = "#";
    a.dataset.category = catKey;
    a.className = "px-3 py-1 rounded hover:bg-indigo-800 text-gray-300 transition-colors";
    a.textContent = conversionData[catKey].name || catKey;
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      await loadCategory(catKey);
    });
    li.appendChild(a);
    DOM.categoryList.appendChild(li);
  });
}

async function loadCategory(categoryKey) {
  currentCategory = categoryKey;
  // update active class
  DOM.categoryList.querySelectorAll('a').forEach(a => {
    if (a.dataset.category === categoryKey) {
      a.classList.add('bg-indigo-700', 'text-white');
      a.classList.remove('text-gray-300');
    } else {
      a.classList.remove('bg-indigo-700','text-white');
      a.classList.add('text-gray-300');
    }
  });

  const units = await listUnits(categoryKey); // returns array of {key,name,symbol}
  populateUnitDropdowns(units);

  updateCurrencyWarning(categoryKey);

  // run an initial conversion (if value present)
  await performConversion();
}

function populateUnitDropdowns(unitsArray) {
  if (!DOM.fromUnit || !DOM.toUnit) return;

  DOM.fromUnit.innerHTML = '';
  DOM.toUnit.innerHTML = '';

  // unitsArray is expected array of {key,name,symbol}
  unitsArray.forEach(u => {
    const o1 = document.createElement('option');
    o1.value = u.key;
    o1.textContent = u.name || u.key;
    DOM.fromUnit.appendChild(o1);

    const o2 = document.createElement('option');
    o2.value = u.key;
    o2.textContent = u.name || u.key;
    DOM.toUnit.appendChild(o2);
  });

  // try sensible defaults: keep first unit selected and second last
  if (DOM.fromUnit.options.length > 0) DOM.fromUnit.selectedIndex = 0;
  if (DOM.toUnit.options.length > 1) DOM.toUnit.selectedIndex = Math.min(1, DOM.toUnit.options.length - 1);
}

async function performConversion() {
  if (!DOM.fromValue || !DOM.toValue || !DOM.fromUnit || !DOM.toUnit) return;

  const fromUnit = DOM.fromUnit.value;
  const toUnit = DOM.toUnit.value;
  const value = DOM.fromValue.value;
  const category = currentCategory;

  if (!value || isNaN(Number(value)) || !fromUnit || !toUnit) {
    DOM.toValue.value = '---';
    return;
  }

  try {
    const result = await convert(category, fromUnit, toUnit, value);
    if (isNaN(result) || !isFinite(result)) {
      DOM.toValue.value = 'Error / No Rates';
      return;
    }

    // Use category precision if available
    const precision = conversionData[category]?.precision ?? 6;
    const factor = 10 ** precision;
    DOM.toValue.value = Math.round((result + Number.EPSILON) * factor) / factor;

    // Build history entry and save
    const entry = {
      category,
      fromUnit,
      toUnit,
      value: Number(value),
      result: Number(result),
      timestamp: Date.now()
    };
    await saveHistory(entry);
    await renderHistory();
  } catch (e) {
    console.error("performConversion error:", e);
    DOM.toValue.value = 'Error';
  }
}

async function renderHistory() {
  if (!DOM.historyList) return;
  DOM.historyList.innerHTML = '';

  const history = await getHistory(50); // array of entries
  history.slice(0,50).forEach(entry => {
    const li = document.createElement('li');
    li.className = 'p-2 border-b border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-100';
    const label = `${entry.value} ${entry.fromUnit} → ${entry.result} ${entry.toUnit} [${entry.category}]`;
    li.textContent = label;
    li.addEventListener('click', async () => {
      // restore
      await loadCategory(entry.category);
      DOM.fromValue.value = entry.value;
      DOM.fromUnit.value = entry.fromUnit;
      DOM.toUnit.value = entry.toUnit;
      await performConversion();
    });
    DOM.historyList.appendChild(li);
  });
}

function updateCurrencyWarning(category = currentCategory) {
  if (!DOM.currencyWarning) return;
  if (String(category).toLowerCase().includes('currency')) {
    DOM.currencyWarning.style.display = 'block';
    const cached = getCachedRates();
    const ts = cached?.timestamp ? new Date(cached.timestamp).toLocaleString() : 'Unknown';
    if (DOM.lastUpdatedText) DOM.lastUpdatedText.textContent = `Last updated: ${ts}`;
  } else {
    DOM.currencyWarning.style.display = 'none';
  }
}

// small debounce helper
function debounce(fn, delay = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
