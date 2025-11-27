// scripts/ui.js - MAIN SCRIPT (now imports data and uses async functions)

// 1. FIX: Import data from units.js
import { conversionData } from "./units.js"; 
// 2. FIX: Import async functions
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
// 1. Initialization and Setup
// -----------------------------------------------------------------
 
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryList();
    // FIX: loadCategory must be called without awaiting, but it runs async logic
    loadCategory(currentCategory); 
    setupEventListeners();
    updateCurrencyWarning();
});
 
function setupEventListeners() {
    // Debounced conversion for input changes
    DOM.converterForm.addEventListener('input', debounce(performConversion, 250));
    // Immediate conversion for unit selection changes
    DOM.fromUnit.addEventListener('change', performConversion);
    DOM.toUnit.addEventListener('change', performConversion);
    
    DOM.swapButton.addEventListener('click', (e) => {
        e.preventDefault();
        // swapUnits calls performConversion() internally
        swapUnits(DOM, performConversion); 
    });
}
// ... (renderCategoryList is unchanged)

// -----------------------------------------------------------------
// 2. Category Management
// -----------------------------------------------------------------
 
/**
 * Loads a new category, updating the UI and fetching units.
 * FIX: This must be ASYNC because listUnits is now async.
 */
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    const cat = conversionData[categoryKey];
 
    // 1. Update active state in category list (omitted for brevity)
    DOM.categoryList.querySelectorAll('a').forEach(link => {
        if (link.dataset.category === categoryKey) {
            link.classList.add('bg-indigo-700', 'text-white');
            link.classList.remove('text-gray-300', 'hover:bg-indigo-800');
        } else {
            link.classList.remove('bg-indigo-700', 'text-white');
            link.classList.add('text-gray-300', 'hover:bg-indigo-800');
        }
    });

    // 2. Fetch units
    // FIX: MUST AWAIT listUnits
    const units = await listUnits(categoryKey);
 
    // 3. Populate dropdowns
    populateUnitDropdowns(units);
    
    // 4. Update currency warning visibility
    updateCurrencyWarning(categoryKey);
 
    // 5. Trigger initial conversion
    // FIX: MUST AWAIT performConversion
    await performConversion();
}
 
/**
 * Populates both 'from' and 'to' unit dropdowns.
 */
function populateUnitDropdowns(units) {
    // ... (unchanged)
}
 
/**
 * Toggles the visibility of the currency API update warning.
 */
function updateCurrencyWarning(category = currentCategory) {
    // ... (unchanged)
}
 
// -----------------------------------------------------------------
// 3. Conversion and History
// -----------------------------------------------------------------
 
/**
 * Performs the conversion based on current UI state.
 * FIX: MUST BE ASYNC because it calls the async convert() function.
 */
async function performConversion() {
    const fromUnit = DOM.fromUnit.value;
    const toUnit = DOM.toUnit.value;
    const value = DOM.fromValue.value;
    const category = currentCategory;
    
    if (!value || isNaN(Number(value)) || !fromUnit || !toUnit) {
        DOM.toValue.value = '---';
        return;
    }
 
    let result;
    const cat = conversionData[category];
 
    try {
        // FIX: MUST AWAIT the convert function
        result = await convert(category, fromUnit, toUnit, value);
 
        if (isNaN(result) || result === Infinity || result === -Infinity) {
            // FIX: Clearer error message for the user
            DOM.toValue.value = 'Error / No Rates'; 
            return;
        }
 
        DOM.toValue.value = result;
        // The result must be passed to history, as we can't await inside addHistoryEntry easily
        addHistoryEntry(category, fromUnit, toUnit, value, result, cat.precision);
 
    } catch (error) {
        console.error("Conversion failed:", error);
        DOM.toValue.value = 'Error';
    }
}
 
/**
 * Adds a successful conversion to the history list.
 */
function addHistoryEntry(category, fromUnit, toUnit, value, result, precision) {
    // ... (History creation logic largely unchanged, but we now know `result` is a number)

    // Note on listCurrencies: The history display logic requires unit name/symbol.
    // If using the raw `listUnits` (which is async), we would need to await it here,
    // which complicates `addHistoryEntry`. A simple fix is to find the unit object 
    // within the conversionData structure if available, or just use the code/key.

    const cat = conversionData[category];
    const units = cat.units;
    
    // Fallback: If Currency, use key, otherwise get unit info synchronously.
    const fromUnitObj = units[fromUnit] || { name: fromUnit, symbol: fromUnit };
    const toUnitObj = units[toUnit] || { name: toUnit, symbol: toUnit };

    // ... (rest of history entry creation)

    // Optional: Clicking history reloads the conversion
    newEntry.addEventListener('click', async () => {
        // FIX: AWAIT loadCategory
        await loadCategory(category); 
        DOM.fromValue.value = value;
        DOM.fromUnit.value = fromUnit;
        DOM.toUnit.value = toUnit;
        // FIX: AWAIT performConversion
        await performConversion(); 
    });

    // ... (prepend)
}
 
// ... (debounce function is unchanged)
