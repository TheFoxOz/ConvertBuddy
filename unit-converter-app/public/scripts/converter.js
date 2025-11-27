import { units, categories } from './units.js';
import { fetchRates, getCachedRates } from './currency.js';
import { saveHistory, loadHistory, clearHistory } from './history.js';

const DOM = {
  categorySelect: document.getElementById('category'),
  fromUnit: document.getElementById('from-unit'),
  toUnit: document.getElementById('to-unit'),
  valueInput: document.getElementById('value'),
  resultOutput: document.getElementById('result'),
  swapButton: document.getElementById('swap'),
  historyList: document.getElementById('history-list'),
  clearHistoryButton: document.getElementById('clear-history'),
  currencyWarning: document.getElementById('currency-warning'),
};

let currentCategory = DOM.categorySelect.value;

// Populate categories
categories.forEach(cat => {
  const option = document.createElement('option');
  option.value = cat.key;
  option.textContent = cat.name;
  DOM.categorySelect.appendChild(option);
});

// Populate units for a category
function populateUnitDropdowns(categoryKey) {
  DOM.fromUnit.innerHTML = '';
  DOM.toUnit.innerHTML = '';

  const unitList = Object.values(units[categoryKey] || {});
  unitList.forEach(u => {
    const fromOption = document.createElement('option');
    fromOption.value = u.key;
    fromOption.textContent = u.name;
    DOM.fromUnit.appendChild(fromOption);

    const toOption = document.createElement('option');
    toOption.value = u.key;
    toOption.textContent = u.name;
    DOM.toUnit.appendChild(toOption);
  });
}

// Convert value
async function convert() {
  const val = parseFloat(DOM.valueInput.value);
  if (isNaN(val)) {
    DOM.resultOutput.textContent = '';
    return;
  }

  const from = DOM.fromUnit.value;
  const to = DOM.toUnit.value;

  let result;

  if (currentCategory === 'currency') {
    const ratesData = await fetchRates();
    const rates = ratesData.rates;
    const fromRate = rates[from];
    const toRate = rates[to];
    if (!fromRate || !toRate) {
      DOM.resultOutput.textContent = 'Invalid currency';
      return;
    }
    result = (val / fromRate) * toRate;
  } else {
    const fromUnit = units[currentCategory][from];
    const toUnit = units[currentCategory][to];
    const baseValue = fromUnit.toBase(val);
    result = toUnit.fromBase(baseValue);
  }

  DOM.resultOutput.textContent = result.toFixed(4);
  saveHistory(currentCategory, from, to, val, result);
  renderHistory();
}

// Swap units
function swapUnits() {
  const temp = DOM.fromUnit.value;
  DOM.fromUnit.value = DOM.toUnit.value;
  DOM.toUnit.value = temp;
  convert();
}

// Render history
function renderHistory() {
  DOM.historyList.innerHTML = '';
  const history = loadHistory();
  history.slice(-50).reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `[${entry.category}] ${entry.value} ${entry.from} → ${entry.result} ${entry.to}`;
    li.addEventListener('click', () => {
      DOM.categorySelect.value = entry.category;
      currentCategory = entry.category;
      populateUnitDropdowns(currentCategory);
      DOM.fromUnit.value = entry.from;
      DOM.toUnit.value = entry.to;
      DOM.valueInput.value = entry.value;
      convert();
    });
    DOM.historyList.appendChild(li);
  });
}

// Update currency last updated warning
function updateCurrencyWarning() {
  if (currentCategory !== 'currency') {
    DOM.currencyWarning.textContent = '';
    return;
  }
  const ratesData = getCachedRates();
  if (ratesData?.timestamp) {
    const lastUpdated = new Date(ratesData.timestamp).toLocaleString();
    DOM.currencyWarning.textContent = `Rates last updated: ${lastUpdated}`;
  } else {
    DOM.currencyWarning.textContent = 'Rates not loaded yet';
  }
}

// Event listeners
DOM.categorySelect.addEventListener('change', () => {
  currentCategory = DOM.categorySelect.value;
  populateUnitDropdowns(currentCategory);
  convert();
  updateCurrencyWarning();
});

DOM.fromUnit.addEventListener('change', convert);
DOM.toUnit.addEventListener('change', convert);
DOM.valueInput.addEventListener('input', convert);
DOM.swapButton.addEventListener('click', swapUnits);
DOM.clearHistoryButton.addEventListener('click', () => {
  clearHistory();
  renderHistory();
});

// Initialize
populateUnitDropdowns(currentCategory);
renderHistory();
updateCurrencyWarning();
convert();
