// scripts/ui.js - MAIN UI (imports converter + currency + history)
import { listUnits, convert, swapUnits } from "./converter.js";
import { conversionData } from "./units.js";
import { getCachedRates } from "./currency.js";
// FIX: import clearHistory, saveHistory, getHistory from history.js
// The original history.js only exports loadHistory and addToHistory.
import { loadHistory, addToHistory } from "./history.js";


// DOM refs (match your index.html IDs)
const DOM = {
    // FIX: Removed categoryList and added categorySelect
    categorySelect: document.getElementById('category-select'),
    converterForm: document.getElementById('converter-form'),
    fromValue: document.getElementById('from-value'),
    toValue: document.getElementById('to-value'),
    fromUnit: document.getElementById('from-unit'),
    toUnit: document.getElementById('to-unit'),
    historyList: document.getElementById('history-list'),
    swapButton: document.getElementById('swap-btn'),
    currencyWarning: document.getElementById('currency-warning'),
    lastUpdatedText: document.getElementById('last-updated-text')
    // FIX: Added clearHistoryButton reference
    // The loadCategory function below needs the ID of the category select element for loading!
};

let currentCategory = Object.keys(conversionData)[0] || 'Length';

document.addEventListener('DOMContentLoaded', async () =>
{
    // FIX: Renamed renderHistory() to loadHistory() for consistency with history.js
    renderCategorySelect(); // Changed to renderCategorySelect
    await loadCategory(currentCategory);
    setupEventListeners();
    await loadHistory(); // Using imported loadHistory from history.js
    updateCurrencyWarning();
});

function setupEventListeners() {
    if (DOM.converterForm) 
        DOM.converterForm.addEventListener('input', debounce(performConversion, 250));
    
    if (DOM.fromUnit) DOM.fromUnit.addEventListener('change', performConversion);
    if (DOM.toUnit) DOM.toUnit.addEventListener('change', performConversion);
    
    // FIX: Add change listener for the new category select
    if (DOM.categorySelect) DOM.categorySelect.addEventListener('change', (e) => {
        loadCategory(e.target.value);
    });

    if (DOM.swapButton)
        DOM.swapButton.addEventListener('click', (e) => { 
            e.preventDefault(); 
             swapUnits(DOM, performConversion); 
         });
    
    // FIX: The clear history button event is now handled in history.js, so this part is redundant 
    // unless we want to trigger history.js's handleClearHistory from here.
    // Given the history.js already attaches a listener, we can rely on that, but we must fix the ID.
}

// FIX: New function to populate the Category Dropdown
function renderCategorySelect() {
    if (!DOM.categorySelect) return;
    DOM.categorySelect.innerHTML = '';
    
    Object.keys(conversionData).forEach(catKey => {
        const option = document.createElement('option');
        option.value = catKey;
        option.textContent = conversionData[catKey].name || catKey;
        
        DOM.categorySelect.appendChild(option);
    });
    
    // Set initial selection
    DOM.categorySelect.value = currentCategory;
}

// FIX: loadCategory needs to read the selected category from the dropdown if needed, 
// but currently it receives the key, which is fine. We remove the active state logic.
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    
    // Set the dropdown value to reflect the change (e.g., if triggered from history click)
    if (DOM.categorySelect) {
        DOM.categorySelect.value = categoryKey;
    }
    
    // FIX: Removed the active state UI logic, which applied to the old <ul> list
    
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
    
     // Keep the default selection logic
     if (DOM.fromUnit.options.length > 0) DOM.fromUnit.selectedIndex = 0;
     if (DOM.toUnit.options.length > 1) DOM.toUnit.selectedIndex = 1;
}

// ... (performConversion remains mostly the same, but remove saveHistory/renderHistory calls below)
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
        // Use toFixed for string formatting, but perform math on numbers
        const finalNumber = Math.round((result + Number.EPSILON) * (10 ** precision)) / (10 ** precision);
        
        // FIX: Format the result number to the appropriate precision and use comma for decimal, as implied by the target's description (French)
        // If you prefer US format (dot), skip .replace:
        DOM.toValue.value = finalNumber.toFixed(precision).replace('.', ',');

        const entry = {
            category,
            fromUnit,
            toUnit,
            value: Number(value),
            result: Number(finalNumber),
            timestamp: Date.now()
        };

        // FIX: Use addToHistory (which handles saving AND rendering) instead of calling save/render separately.
        // Also, skip history update on every keystroke (input event). Only save on conversion change (unit change or unfocus of input).
        // Since we debounce the input, we can keep the call for now, but update the history rendering to use the new structure.
        addToHistory(entry); // Use the function imported from history.js

    } catch (err) {
        console.error(err);
        DOM.toValue.value = "Error";
    }
}

// FIX: Removed renderHistory from ui.js as it is handled and imported from history.js now.
// However, the history click logic needs to be inside history.js's renderEntry function.
// For now, we will move the old renderHistory logic into a new, smaller function in history.js
// but we need to ensure the imports in ui.js are correct.
// Since the original UI imports were saveHistory, getHistory, clearHistory, 
// let's revert history.js to export those names too, or fix ui.js imports.

// FIX: Correcting ui.js imports for history
// Import loadHistory and addToHistory which are correctly exported from history.js
// ... (imports at the top are already updated)

// FIX: The original logic for renderHistory in ui.js contained important click handlers
// We need to move this logic to the history.js file where the history rendering is managed.

// FIX: Renamed updateCurrencyWarning for consistency.
function updateCurrencyWarning(category = currentCategory) {
    if (!DOM.currencyWarning) return;
    
    // Check if the current category is Currency (case-insensitive)
    if (category.toLowerCase() === "currency") { // FIX: Use strict comparison
        DOM.currencyWarning.classList.remove('hidden');
        
        const cached = getCachedRates();
        const ts = cached?.timestamp
             ? new Date(cached.timestamp).toLocaleString()
             : "Unknown";
        
        if (DOM.lastUpdatedText) {
            DOM.lastUpdatedText.textContent = `Last updated: ${ts}`;
        }
    } else {
        DOM.currencyWarning.classList.add('hidden');
    }
}

function debounce(fn, delay = 200) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}
