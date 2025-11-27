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

document.addEventListener('DOMContentLoaded', async () => {
  renderCategoryList();
  await loadCategory(currentCategory);
  setupEventListeners();
  await renderHistory();
  updateCurrencyWarning();
});

function setupEventListeners() {
  if (DOM.converterForm) 
    DOM.converterForm.addEventListener('input', debounce(performConversion, 250));

  if (DOM.fromUnit) DOM.fromUnit.addEventListener('change', performConversion);
  if (DOM.toUnit) DOM.toUnit.addEventListener('change', performConversion);

  if (DOM.swapButton)
    DOM.swapButton.addEventListener('click', (e) => { 
      e.preventDefault(); 
      swapUnits(DOM, performConversion); 
    });

  const clearBtn = document.getElementById('clear-history-button');
  if (clearBtn)
    clearBtn.addEventListener('click', async () => { 
      await clearHistory(); 
      await renderHistory(); 
    });
}

function renderCategoryList() {
  if (!DOM.categoryList) return;
  DOM.categoryList.innerHTML = '';

  Object.keys(conversionData).forEach(catKey => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = "#";
    a.dataset.category = catKey;

    // EMERALD GREEN ACCENTS
    a.className = "px-3 py-1 rounded hover:bg-emerald-800 text-emerald-200 transition-colors";
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

  // active state
  DOM.categoryList.querySelectorAll('a').forEach(a => {
    if (a.dataset.category === categoryKey) {
      a.classList.add('bg-emerald-700', 'text-white');
      a.classList.remove('text-emerald-200');
    } else {
      a.classList.remove('bg-emerald-700', 'text-white');
      a.classList.add('text-emerald-200');
    }
  });

  const units = await listUnits(categoryKey);
  populateUnitDropdowns(units);
  updateCurrencyWarning(categoryKey);
  await performConversion();
}

function populateUnitDropdowns(unitsArray) {
  if (!DOM.fromUnit || !DOM.toUnit) return;

  DOM.fromUnit.innerHTML = '';
  DOM.toUnit.innerHTML = '';

  unitsArray.forEach(u => {
    const opt1 = document.createElement('option');
    opt1.value = u.key;
    opt1.textContent = u.name || u.key;
    DOM.fromUnit.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = u.key;
    opt2.textContent = u.name || u.key;
    DOM.toUnit.appendChild(opt2);
  });

  if (DOM.fromUnit.options.length > 0) DOM.fromUnit.selectedIndex = 0;
  if (DOM.toUnit.options.length > 1) DOM.toUnit.selectedIndex = 1;
}

async function performConversion() {
  const fromUnit = DOM.fromUnit.value;
  const toUnit = DOM.toUnit.value;
  const value = DOM.fromValue.value;
  const category = currentCategory;

  if (!value || isNaN(Number(value))) {
    DOM.toValue.value = "---";
    return;
  }

  try {
    const result = await convert(category, fromUnit, toUnit, value);

    if (!isFinite(result)) {
      DOM.toValue.value = "Error";
      return;
    }

    const precision = conversionData[category]?.precision ?? 6;
    const factor = 10 ** precision;
    const final = Math.round((result + Number.EPSILON) * factor) / factor;

    DOM.toValue.value = final;

    const entry = {
      category,
      fromUnit,
      toUnit,
      value: Number(value),
      result: Number(final),
      timestamp: Date.now()
    };

    await saveHistory(entry);
    await renderHistory();

  } catch (err) {
    console.error(err);
    DOM.toValue.value = "Error";
  }
}

async function renderHistory() {
  if (!DOM.historyList) return;

  DOM.historyList.innerHTML = '';

  const history = await getHistory(50);

  history.forEach(entry => {
    const li = document.createElement('li');

    // EMERALD HISTORY ITEM
    li.className = 'p-2 border-b border-emerald-300 text-emerald-700 cursor-pointer hover:bg-emerald-100';

    li.textContent = `${entry.value} ${entry.fromUnit} → ${entry.result} ${entry.toUnit} [${entry.category}]`;

    li.addEventListener('click', async () => {
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

  if (category.toLowerCase().includes("currency")) {
    DOM.currencyWarning.style.display = "block";

    const cached = getCachedRates();
    const ts = cached?.timestamp
      ? new Date(cached.timestamp).toLocaleString()
      : "Unknown";

    if (DOM.lastUpdatedText) {
      DOM.lastUpdatedText.textContent = `Last updated: ${ts}`;
    }
  } else {
    DOM.currencyWarning.style.display = "none";
  }
}

function debounce(fn, delay = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
