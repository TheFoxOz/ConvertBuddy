// scripts/ui.js

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
// 1. Initialization and Setup
// -----------------------------------------------------------------

/**
 * Initializes the application by setting up the category list and loading the default category.
 */
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryList();
    loadCategory(currentCategory);
    setupEventListeners();
    updateCurrencyWarning();
});

/**
 * Sets up global event listeners for form actions and the swap button.
 */
function setupEventListeners() {
    DOM.converterForm.addEventListener('input', debounce(performConversion, 250));
    DOM.fromUnit.addEventListener('change', performConversion);
    DOM.toUnit.addEventListener('change', performConversion);
    
    DOM.swapButton.addEventListener('click', (e) => {
        e.preventDefault();
        swapUnits(DOM, performConversion);
    });
}

/**
 * Creates the sidebar list of available conversion categories.
 */
function renderCategoryList() {
    const categories = Object.keys(conversionData);
    DOM.categoryList.innerHTML = categories.map(key => {
        const cat = conversionData[key];
        const isActive = key === currentCategory ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-indigo-800';
        return `
            <a href="#" data-category="${key}" class="p-3 my-1 rounded-lg flex items-center ${isActive} transition-colors">
                <i class="${cat.icon} w-6 text-center"></i>
                <span class="ml-3 font-medium">${cat.name}</span>
            </a>
        `;
    }).join('');

    // Attach click handler to category links
    DOM.categoryList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newCategory = e.currentTarget.dataset.category;
            if (newCategory !== currentCategory) {
                loadCategory(newCategory);
            }
        });
    });
}

// -----------------------------------------------------------------
// 2. Category Management
// -----------------------------------------------------------------

/**
 * Loads a new category, updating the UI and fetching units.
 * @param {string} categoryKey - The key of the new category.
 */
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    const cat = conversionData[categoryKey];

    // 1. Update active state in category list
    DOM.categoryList.querySelectorAll('a').forEach(link => {
        if (link.dataset.category === categoryKey) {
            link.classList.add('bg-indigo-700', 'text-white');
            link.classList.remove('text-gray-300', 'hover:bg-indigo-800');
        } else {
            link.classList.remove('bg-indigo-700', 'text-white');
            link.classList.add('text-gray-300', 'hover:bg-indigo-800');
        }
    });

    // 2. Fetch units (uses custom list function for Currency, listUnits for others)
    let units;
    if (cat.list) {
        // Use custom list function (e.g., listCurrencies)
        units = await cat.list(categoryKey);
    } else {
        // Use standard list function
        units = listUnits(categoryKey);
    }

    // 3. Populate dropdowns
    populateUnitDropdowns(units);
    
    // 4. Update currency warning visibility
    updateCurrencyWarning(categoryKey);

    // 5. Trigger initial conversion
    performConversion();
}

/**
 * Populates both 'from' and 'to' unit dropdowns.
 * @param {Array<Object>} units - Array of unit objects {key, name, symbol}.
 */
function populateUnitDropdowns(units) {
    if (units.length === 0) {
        DOM.fromUnit.innerHTML = '<option value="">No Units Available</option>';
        DOM.toUnit.innerHTML = '<option value="">No Units Available</option>';
        return;
    }
    
    const optionsHTML = units.map(unit => 
        `<option value="${unit.key}">${unit.name} (${unit.symbol})</option>`
    ).join('');

    DOM.fromUnit.innerHTML = optionsHTML;
    DOM.toUnit.innerHTML = optionsHTML;

    // Set a default selection (e.g., the first two units or stored preferences)
    DOM.fromUnit.value = units[0]?.key;
    // Ensure 'to' unit is different from 'from' unit if possible
    DOM.toUnit.value = units.length > 1 ? units[1]?.key : units[0]?.key;
}

/**
 * Toggles the visibility of the currency API update warning.
 * @param {string} category - The current category key.
 */
function updateCurrencyWarning(category = currentCategory) {
    const isCurrency = category === 'Currency';
    DOM.currencyWarning.classList.toggle('hidden', !isCurrency);

    if (isCurrency) {
        const cached = getCachedRates();
        if (cached && cached.timestamp) {
            const date = new Date(cached.timestamp);
            DOM.lastUpdatedText.textContent = `Rates last updated: ${date.toLocaleString()}`;
        } else {
            DOM.lastUpdatedText.textContent = "Rates are not yet available or failed to fetch. Try refreshing.";
        }
    }
}

// -----------------------------------------------------------------
// 3. Conversion and History
// -----------------------------------------------------------------

/**
 * Performs the conversion based on current UI state.
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
        if (cat.convert) {
            // Use custom conversion function (e.g., convertCurrency)
            result = await cat.convert(fromUnit, toUnit, value);
        } else {
            // Use standard conversion function (convert in converter.js)
            result = convert(category, fromUnit, toUnit, value);
        }

        if (isNaN(result)) {
            DOM.toValue.value = 'Error';
            return;
        }

        DOM.toValue.value = result;
        addHistoryEntry(category, fromUnit, toUnit, value, result, cat.precision);

    } catch (error) {
        console.error("Conversion failed:", error);
        DOM.toValue.value = 'Error';
    }
}

/**
 * Adds a successful conversion to the history list.
 * @param {string} category 
 * @param {string} fromUnit 
 * @param {string} toUnit 
 * @param {string} value 
 * @param {number} result 
 * @param {number} precision 
 */
function addHistoryEntry(category, fromUnit, toUnit, value, result, precision) {
    // Limit history size (e.g., to 10 entries)
    if (DOM.historyList.children.length >= 10) {
        DOM.historyList.removeChild(DOM.historyList.lastChild);
    }
    
    // Get unit names/symbols for history display
    const cat = conversionData[category];
    
    // Use listUnits (or cat.list if it exists) to get unit details
    const units = cat.list ? cat.list(category) : listUnits(category);
    
    // Find the full unit object for better display
    const fromUnitObj = units.find(u => u.key === fromUnit) || { name: fromUnit, symbol: fromUnit };
    const toUnitObj = units.find(u => u.key === toUnit) || { name: toUnit, symbol: toUnit };

    // Format the result for cleaner history display
    const formattedResult = result.toFixed(precision).replace(/\.?0+$/, "");
    
    const newEntry = document.createElement('li');
    newEntry.className = "p-3 border-b border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-700 transition-colors";
    newEntry.innerHTML = `
        <p class="text-sm text-gray-400">${cat.name}</p>
        <p class="font-medium">
            ${value} ${fromUnitObj.symbol} 
            <i class="fas fa-arrow-right text-indigo-400 mx-2"></i> 
            ${formattedResult} ${toUnitObj.symbol}
        </p>
    `;
    
    // Optional: Clicking history reloads the conversion
    newEntry.addEventListener('click', () => {
        loadCategory(category).then(() => {
            DOM.fromValue.value = value;
            DOM.fromUnit.value = fromUnit;
            DOM.toUnit.value = toUnit;
            performConversion(); // Re-run the conversion
        });
    });

    DOM.historyList.prepend(newEntry);
}


// -----------------------------------------------------------------
// 4. Utility Functions
// -----------------------------------------------------------------

/**
 * Debounce function to limit how often a function is called.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 */
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
