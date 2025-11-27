// scripts/ui.js
import { convert, listUnits, swapUnitsValues } from './converter.js';
import { getCachedRates } from './currency.js';
import { saveHistory, getHistory, clearHistory } from './firestore.js';

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

let currentCategory = 'Length';

// -----------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    await renderCategoryList();
    await loadCategory(currentCategory);
    setupEventListeners();
});

// -----------------------------------------------------------------
// Event Listeners
// -----------------------------------------------------------------
function setupEventListeners() {
    if (DOM.converterForm) {
        DOM.converterForm.addEventListener('input', debounce(performConversion, 250));
    }
    if (DOM.fromUnit) DOM.fromUnit.addEventListener('change', performConversion);
    if (DOM.toUnit) DOM.toUnit.addEventListener('change', performConversion);

    if (DOM.swapButton) {
        DOM.swapButton.addEventListener('click', (e) => {
            e.preventDefault();
            const [from, to] = swapUnitsValues(DOM.fromValue.value, DOM.toValue.value);
            DOM.fromValue.value = from;
            DOM.toValue.value = to;
            performConversion();
        });
    }
}

// -----------------------------------------------------------------
// Category Management
// -----------------------------------------------------------------
async function renderCategoryList() {
    if (!DOM.categoryList) return;
    DOM.categoryList.innerHTML = '';

    Object.keys(units).forEach(catKey => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = "#";
        link.textContent = catKey;
        link.dataset.category = catKey;
        link.className = "px-3 py-1 rounded hover:bg-indigo-800 text-gray-300 transition-colors";
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            await loadCategory(catKey);
        });
        li.appendChild(link);
        DOM.categoryList.appendChild(li);
    });
}

async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    if (!units[categoryKey]) return;

    // Update dropdowns
    const categoryUnits = await listUnits(categoryKey);
    populateUnitDropdowns(categoryUnits);

    updateCurrencyWarning();
    await performConversion();
}

function populateUnitDropdowns(categoryUnits) {
    if (!DOM.fromUnit || !DOM.toUnit) return;

    DOM.fromUnit.innerHTML = '';
    DOM.toUnit.innerHTML = '';

    Object.keys(categoryUnits).forEach(unitKey => {
        const fromOption = document.createElement('option');
        fromOption.value = unitKey;
        fromOption.textContent = categoryUnits[unitKey].name || unitKey;
        DOM.fromUnit.appendChild(fromOption);

        const toOption = document.createElement('option');
        toOption.value = unitKey;
        toOption.textContent = categoryUnits[unitKey].name || unitKey;
        DOM.toUnit.appendChild(toOption);
    });
}

// -----------------------------------------------------------------
// Conversion + History
// -----------------------------------------------------------------
async function performConversion() {
    if (!DOM.fromValue || !DOM.toValue) return;

    const fromUnit = DOM.fromUnit.value;
    const toUnit = DOM.toUnit.value;
    const value = DOM.fromValue.value;
    if (!value || isNaN(Number(value)) || !fromUnit || !toUnit) {
        DOM.toValue.value = '---';
        return;
    }

    try {
        const result = await convert(currentCategory, fromUnit, toUnit, value);
        DOM.toValue.value = (result !== null) ? result.toFixed(4) : 'Error';

        // Save history
        const entry = {
            category: currentCategory,
            fromUnit,
            toUnit,
            value,
            result: result || 0,
            timestamp: Date.now()
        };
        await saveHistory(entry);
        await renderHistory();

    } catch (err) {
        console.error("Conversion failed:", err);
        DOM.toValue.value = 'Error';
    }
}

async function renderHistory() {
    if (!DOM.historyList) return;
    DOM.historyList.innerHTML = '';

    const history = await getHistory(50);
    history.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'p-2 border-b border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-100';
        li.textContent = `${entry.value} ${entry.fromUnit} → ${entry.result} ${entry.toUnit}`;

        li.addEventListener('click', async () => {
            await loadCategory(entry.category);
            DOM.fromValue.value = entry.value;
            DOM.fromUnit.value = entry.fromUnit;
            DOM.toUnit.value = entry.toUnit;
            await performConversion();
        });
