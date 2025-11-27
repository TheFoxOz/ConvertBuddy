// scripts/ui.js - MAIN SCRIPT

// --- Imports ---
import { conversionData } from "./units.js"; 
import { convert, listUnits, swapUnits } from "./converter.js";
import { getCachedRates } from "./currency.js";

// --- Global DOM Elements ---
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

let currentCategory = 'Length'; // Default category

// -----------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryList();
    loadCategory(currentCategory);
    setupEventListeners();
    updateCurrencyWarning();
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
            swapUnits(DOM, performConversion);
        });
    }
}

// -----------------------------------------------------------------
// Category Management
// -----------------------------------------------------------------
function renderCategoryList() {
    if (!DOM.categoryList) return;
    DOM.categoryList.innerHTML = '';

    Object.keys(conversionData).forEach(catKey => {
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

/**
 * Loads a new category, updates UI and dropdowns.
 */
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    const cat = conversionData[categoryKey];
    if (!cat) return;

    // Update active category styling
    if (DOM.categoryList) {
        DOM.categoryList.querySelectorAll('a').forEach(link => {
            if (link.dataset.category === categoryKey) {
                link.classList.add('bg-indigo-700', 'text-white');
                link.classList.remove('text-gray-300', 'hover:bg-indigo-800');
            } else {
                link.classList.remove('bg-indigo-700', 'text-white');
                link.classList.add('text-gray-300', 'hover:bg-indigo-800');
            }
        });
    }

    // Fetch units
    const units = await listUnits(categoryKey);

    // Populate dropdowns
    populateUnitDropdowns(units);

    // Update currency warning
    updateCurrencyWarning(categoryKey);

    // Initial conversion
    await performConversion();
}

/**
 * Populates 'from' and 'to' dropdowns.
 */
function populateUnitDropdowns(units) {
    if (!DOM.fromUnit || !DOM.toUnit) return;

    DOM.fromUnit.innerHTML = '';
    DOM.toUnit.innerHTML = '';

    Object.keys(units).forEach(unitKey => {
        const fromOption = document.createElement('option');
        fromOption.value = unitKey;
        fromOption.textContent = units[unitKey].name || unitKey;
        DOM.fromUnit.appendChild(fromOption);

        const toOption = document.createElement('option');
        toOption.value = unitKey;
        toOption.textContent = units[unitKey].name || unitKey;
        DOM.toUnit.appendChild(toOption);
    });
}

// -----------------------------------------------------------------
// Conversion and History
// -----------------------------------------------------------------
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

        DOM.toValue.value = result;

        // Add to history
        addHistoryEntry(category, fromUnit, toUnit, value, result, conversionData[category].precision);

    } catch (err) {
        console.error("Conversion failed:", err);
        DOM.toValue.value = 'Error';
    }
}

/**
 * Adds a conversion to history
 */
function addHistoryEntry(category, fromUnit, toUnit, value, result, precision = 2) {
    if (!DOM.historyList) return;

    const li = document.createElement('li');
    li.className = 'p-2 border-b border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-100';
    li.textContent = `${value} ${fromUnit} → ${result} ${toUnit}`;

    li.addEventListener('click', async () => {
        await loadCategory(category);
        DOM.fromValue.value = value;
        DOM.fromUnit.value = fromUnit;
        DOM.toUnit.value = toUnit;
        await performConversion();
    });

    DOM.historyList.prepend(li);
}

// -----------------------------------------------------------------
// Currency warning
// -----------------------------------------------------------------
function updateCurrencyWarning(category = currentCategory) {
    if (!DOM.currencyWarning) return;
    if (category.toLowerCase().includes('currency')) {
        DOM.currencyWarning.style.display = 'block';
        const lastUpdated = getCachedRates()?.date || 'Unknown';
        if (DOM.lastUpdatedText) DOM.lastUpdatedText.textContent = `Last updated: ${lastUpdated}`;
    } else {
        DOM.currencyWarning.style.display = 'none';
    }
}

// -----------------------------------------------------------------
// Utility
// -----------------------------------------------------------------
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
