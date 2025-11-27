// scripts/ui.js - Version finale, robuste, propre et sans bug
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

let currentCategory = Object.keys(conversionData)[0] || "Length";
let lastSavedEntry = null;

document.addEventListener("DOMContentLoaded", async () => {
  renderCategorySelect();
  await loadCategory(currentCategory);
  setupEventListeners();
  await loadHistory();
  updateCurrencyWarning();
});

function setupEventListeners() {
  // Mise à jour fluide sans spam d'historique
  DOM.converterForm.addEventListener("input", debounce(performConversionOnly, 300));

  // Sauvegarde uniquement quand l’utilisateur a fini
  DOM.fromValue.addEventListener("blur", performConversionAndSave);
  DOM.fromUnit.addEventListener("change", performConversionAndSave);
  DOM.toUnit.addEventListener("change", performConversionAndSave);

  DOM.categorySelect.addEventListener("change", (e) => loadCategory(e.target.value));

  DOM.swapButton.addEventListener("click", (e) => {
    e.preventDefault();
    swapUnits(DOM, performConversionAndSave);
  });
}

function renderCategorySelect() {
  if (!DOM.categorySelect) return;
  DOM.categorySelect.innerHTML = "";
  Object.keys(conversionData).forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = conversionData[key].name;
    DOM.categorySelect.appendChild(opt);
  });
  DOM.categorySelect.value = currentCategory;
}

async function loadCategory(key) {
  currentCategory = key;
  if (DOM.categorySelect) DOM.categorySelect.value = key;

  const units = await listUnits(key);
  populateUnitDropdowns(units);
  updateCurrencyWarning(key);
  await performConversionOnly();
}

function populateUnitDropdowns(units) {
  [DOM.fromUnit, DOM.toUnit].forEach((select) => {
    select.innerHTML = "";
    units.forEach((u) => {
      const opt = new Option(u.name || u.key, u.key);
      select.add(opt);
    });
  });
  DOM.fromUnit.selectedIndex = 0;
  if (DOM.toUnit.options.length > 1) DOM.toUnit.selectedIndex = 1;
}

// Conversion sans sauvegarde (affichage rapide)
async function performConversionOnly() {
  const rawValue = DOM.fromValue.value.replace(/\s/g, "").replace(",", ".");
  if (!rawValue || isNaN(rawValue)) {
    DOM.toValue.value = "---";
    return;
  }

  try {
    const result = await convert(currentCategory, DOM.fromUnit.value, DOM.toUnit.value, rawValue);
    if (!isFinite(result)) {
      DOM.toValue.value = "Error";
      return;
    }

    const precision = conversionData[currentCategory]?.precision ?? 6;
    const rounded = Number(result.toFixed(precision));

    DOM.toValue.value = rounded.toLocaleString("en-GB", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

    DOM.toValue.dataset.raw = rounded;
  } catch (err) {
    console.error(err);
    DOM.toValue.value = "Error";
  }
}

// Conversion + sauvegarde intelligente
async function performConversionAndSave() {
  await performConversionOnly();

  const rawInput = DOM.fromValue.value.replace(/\s/g, "").replace(",", ".");
  if (!rawInput || !DOM.toValue.dataset.raw) return;

  const entry = {
    category: currentCategory,
    fromUnit: DOM.fromUnit.value,
    toUnit: DOM.toUnit.value,
    value: Number(rawInput),
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
    ? new Date(cached.timestamp).toLocaleString("en-GB")
    : "Never";
  if (DOM.lastUpdatedText) {
    DOM.lastUpdatedText.textContent = `Updated: ${date}`;
  }
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
