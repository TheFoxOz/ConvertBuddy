// scripts/ui.js - FIXED: Exports for history.js + Weight default + Robust error handling
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
  swapButton: document.getElementById("swap-btn"),
  currencyWarning: document.getElementById("currency-warning"),
  lastUpdatedText: document.getElementById("last-updated-text"),
};

let currentCategory = "Weight"; // Changed to Weight by default
let lastSavedEntry = null;

document.addEventListener("DOMContentLoaded", async () => {
  await renderCategorySelect();
  await loadCategory(currentCategory);
  setupEventListeners();
  await loadHistory();
  updateCurrencyWarning();
});

// EXPORTS FOR history.js (this fixes the SyntaxError)
export { loadCategory, performConversionOnly as performConversion }; // Export the main conversion func

function setupEventListeners() {
  DOM.converterForm.addEventListener("input", debounce(performConversionOnly, 300));
  DOM.fromValue.addEventListener("blur", performConversionAndSave);
  DOM.fromUnit.addEventListener("change", performConversionAndSave);
  DOM.toUnit.addEventListener("change", performConversionAndSave);
  DOM.categorySelect.addEventListener("change", (e) => loadCategory(e.target.value));
  DOM.swapButton.addEventListener("click", (e) => {
    e.preventDefault();
    swapUnits(DOM, performConversionAndSave);
  });
}

async function renderCategorySelect() {
  DOM.categorySelect.innerHTML = "";
  Object.keys(conversionData).forEach((key) => {
    const opt = new Option(conversionData[key].name, key);
    DOM.categorySelect.add(opt);
  });
  DOM.categorySelect.value = currentCategory;
}

export async function loadCategory(key) {
  currentCategory = key;
  DOM.categorySelect.value = key;

  try {
    const units = await listUnits(key);
    if (units.length === 0) {
      console.warn(`No units for category: ${key}`);
      DOM.fromUnit.innerHTML = '<option>No units available</option>';
      DOM.toUnit.innerHTML = '<option>No units available</option>';
      return;
    }
    populateUnitDropdowns(units);
  } catch (err) {
    console.error("Failed to load units:", err);
    DOM.fromUnit.innerHTML = '<option>Error loading units</option>';
    DOM.toUnit.innerHTML = '<option>Error loading units</option>';
  }

  updateCurrencyWarning(key);
  await performConversionOnly();
}

function populateUnitDropdowns(units) {
  [DOM.fromUnit, DOM.toUnit].forEach((select) => {
    select.innerHTML = "";
    units.forEach((u) => select.add(new Option(u.name || u.key, u.key)));
  });
  DOM.fromUnit.selectedIndex = 0;
  if (DOM.toUnit.options.length > 1) DOM.toUnit.selectedIndex = 1;
}

async function performConversionOnly() {
  const raw = DOM.fromValue.value.trim();
  if (!raw || isNaN(raw)) {
    DOM.toValue.value = "---";
    return;
  }

  try {
    const result = await convert(currentCategory, DOM.fromUnit.value, DOM.toUnit.value, raw);
    if (!isFinite(result)) {
      DOM.toValue.value = "Error";
      return;
    }

    const precision = conversionData[currentCategory]?.precision ?? 6;
    const rounded = Number(result.toFixed(precision));

    DOM.toValue.value = rounded.toLocaleString("en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

    DOM.toValue.dataset.raw = rounded;
  } catch (err) {
    console.error("Conversion error:", err);
    DOM.toValue.value = "Error";
  }
}

async function performConversionAndSave() {
  await performConversionOnly();
  if (!DOM.toValue.dataset.raw) return;

  const entry = {
    category: currentCategory,
    fromUnit: DOM.fromUnit.value,
    toUnit: DOM.toUnit.value,
    value: Number(DOM.fromValue.value),
    result: Number(DOM.toValue.dataset.raw),
    timestamp: Date.now(),
  };

  if (JSON.stringify(entry) !== JSON.stringify(lastSavedEntry)) {
    addToHistory(entry);
    lastSavedEntry = entry;
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

  DOM.lastUpdatedText.textContent = `Rates last updated: ${date}`;
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
