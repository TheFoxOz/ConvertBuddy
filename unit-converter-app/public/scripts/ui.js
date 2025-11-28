// scripts/ui.js - UPDATED: Manual convert button + smart decimal formatting
import { listUnits, convert, swapUnits } from "./converter.js";
import { conversionData } from "./units.js";
import { getCachedRates } from "./currency.js";
import { loadHistory, addToHistory } from "./history.js";

const DOM = {
  categorySelect: document.getElementById("category-select"),
  converterForm: document.getElementById("converter-form"),
  fromValue: document.getElementById("from-value"),
  toValue: document.getElementById("to-value"),
  fromUnit: document.getElementById("from-unit"),
  toUnit: document.getElementById("to-unit"),
  convertBtn: document.getElementById("convert-btn"), // NEW
  swapButton: document.getElementById("swap-btn"),
  currencyWarning: document.getElementById("currency-warning"),
  lastUpdatedText: document.getElementById("last-updated-text"),
};

let currentCategory = "Weight";
let lastSavedEntry = null;

document.addEventListener("DOMContentLoaded", async () => {
  await renderCategorySelect();
  await loadCategory(currentCategory);
  setupEventListeners();
  
  setTimeout(async () => {
    await loadHistory();
  }, 100);
  
  updateCurrencyWarning();
});

function setupEventListeners() {
  // CHANGED: Removed auto-convert on input, only on Convert button click
  if (DOM.convertBtn) {
    DOM.convertBtn.addEventListener("click", async () => {
      await performConversionAndSave();
    });
  }
  
  // Keep Enter key for quick conversion
  if (DOM.fromValue) {
    DOM.fromValue.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performConversionAndSave();
      }
    });
  }
  
  if (DOM.categorySelect) {
    DOM.categorySelect.addEventListener("change", (e) => loadCategory(e.target.value));
  }
  
  if (DOM.swapButton) {
    DOM.swapButton.addEventListener("click", (e) => {
      e.preventDefault();
      swapUnits(DOM, performConversionAndSave);
    });
  }
}

async function renderCategorySelect() {
  if (!DOM.categorySelect) return;
  DOM.categorySelect.innerHTML = "";
  Object.keys(conversionData).forEach((key) => {
    const opt = new Option(conversionData[key].name, key);
    DOM.categorySelect.add(opt);
  });
  DOM.categorySelect.value = currentCategory;
}

async function loadCategory(key) {
  currentCategory = key;
  if (DOM.categorySelect) DOM.categorySelect.value = key;

  try {
    const units = await listUnits(key);
    if (units.length === 0) {
      console.warn(`No units for category: ${key}`);
      if (DOM.fromUnit) DOM.fromUnit.innerHTML = '<option>No units available</option>';
      if (DOM.toUnit) DOM.toUnit.innerHTML = '<option>No units available</option>';
      return;
    }
    populateUnitDropdowns(units, key);
  } catch (err) {
    console.error("Failed to load units:", err);
    if (DOM.fromUnit) DOM.fromUnit.innerHTML = '<option>Error loading units</option>';
    if (DOM.toUnit) DOM.toUnit.innerHTML = '<option>Error loading units</option>';
  }

  updateCurrencyWarning(key);
  
  // Reset result when changing category
  if (DOM.toValue) DOM.toValue.value = "---";
}

function populateUnitDropdowns(units, categoryKey) {
  [DOM.fromUnit, DOM.toUnit].forEach((select) => {
    if (!select) return;
    select.innerHTML = "";
    units.forEach((u) => select.add(new Option(u.name || u.key, u.key)));
  });
  
  // Set smart defaults based on category
  if (categoryKey === "Weight") {
    if (DOM.fromUnit) {
      const kgIndex = Array.from(DOM.fromUnit.options).findIndex(opt => opt.value === "Kilogram");
      DOM.fromUnit.selectedIndex = kgIndex >= 0 ? kgIndex : 0;
    }
    if (DOM.toUnit) {
      const gIndex = Array.from(DOM.toUnit.options).findIndex(opt => opt.value === "Gram");
      DOM.toUnit.selectedIndex = gIndex >= 0 ? gIndex : 1;
    }
  } else {
    if (DOM.fromUnit) DOM.fromUnit.selectedIndex = 0;
    if (DOM.toUnit && DOM.toUnit.options.length > 1) DOM.toUnit.selectedIndex = 1;
  }
}

/**
 * NEW: Smart decimal formatter
 * - Removes trailing zeros
 * - Max 5 decimal places
 * - Examples: 0.75000 → 0.75, 0.78451 → 0.78451, 1000 → 1,000
 */
function formatNumber(num, maxDecimals = 5) {
  if (!isFinite(num)) return "Error";
  
  // Round to max decimals
  const rounded = Number(num.toFixed(maxDecimals));
  
  // Convert to string and remove trailing zeros
  let str = rounded.toString();
  
  // If number has decimal point, remove trailing zeros
  if (str.includes('.')) {
    str = str.replace(/\.?0+$/, '');
  }
  
  // Add thousand separators for readability
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return parts.join('.');
}

async function performConversionAndSave() {
  const raw = DOM.fromValue ? DOM.fromValue.value.trim() : '';
  if (!raw || isNaN(raw)) {
    if (DOM.toValue) DOM.toValue.value = "---";
    return;
  }

  try {
    const result = await convert(currentCategory, DOM.fromUnit.value, DOM.toUnit.value, raw);
    
    if (!isFinite(result)) {
      if (DOM.toValue) DOM.toValue.value = "Error";
      return;
    }

    // Use smart decimal formatting (max 5 decimals, no trailing zeros)
    const formatted = formatNumber(result, 5);
    
    if (DOM.toValue) {
      DOM.toValue.value = formatted;
      DOM.toValue.dataset.raw = result;
    }

    // Save to history
    const entry = {
      category: currentCategory,
      fromUnit: DOM.fromUnit.value,
      toUnit: DOM.toUnit.value,
      value: Number(raw),
      result: result,
      timestamp: Date.now(),
    };

    if (JSON.stringify(entry) !== JSON.stringify(lastSavedEntry)) {
      addToHistory(entry);
      lastSavedEntry = entry;
    }
  } catch (err) {
    console.error("Conversion error:", err);
    if (DOM.toValue) DOM.toValue.value = "Error";
  }
}

function updateCurrencyWarning(cat = currentCategory) {
  if (!DOM.currencyWarning || cat !== "Currency") {
    DOM.currencyWarning?.classList.add("hidden");
    return;
  }

  DOM.currencyWarning.classList.remove("hidden");
  const cached = getCachedRates();
  const date = cached?.timestamp
    ? new Date(cached.timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  if (DOM.lastUpdatedText) {
    DOM.lastUpdatedText.textContent = `Rates last updated: ${date}`;
  }
}

export { loadCategory, performConversionAndSave as performConversion };
