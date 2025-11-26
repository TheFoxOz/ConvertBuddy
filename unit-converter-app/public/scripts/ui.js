import { conversionData } from "./units.js";
import { convertValue, swapUnits } from "./converter.js";
import { fetchCurrencyRates } from "./currency.js";

export function initializeElements() {
    return {
        categorySelect: document.getElementById("category-select"),
        categoryIcon: document.getElementById("category-icon"),
        fromValue: document.getElementById("from-value"),
        fromUnit: document.getElementById("from-unit"),
        toValue: document.getElementById("to-value"),
        toUnit: document.getElementById("to-unit"),
        swapButton: document.getElementById("swap-button"),
        currencyInfo: document.getElementById("currency-info"),
        loading: document.getElementById("loading-spinner")
    };
}

export function populateCategories(el) {
    const categories = Object.keys(conversionData);
    el.categorySelect.innerHTML = categories
        .map(c => `<option value="${c}">${c}</option>`)
        .join("");
    return el.categorySelect.value;
}

export function populateUnits(el, category) {
    const units = conversionData[category].units;
    const opts = Object.keys(units).map(
        name => `<option value="${name}">${name}${units[name].symbol ? ` (${units[name].symbol})` : ""}</option>`
    );

    el.fromUnit.innerHTML = opts.join("");
    el.toUnit.innerHTML = opts.join("");

    el.fromUnit.value = Object.keys(units)[0];
    el.toUnit.value = Object.keys(units)[1] || Object.keys(units)[0];
}

export function setupEventListeners(el, state) {

    el.categorySelect.addEventListener("change", () => {
        state.category = el.categorySelect.value;
        el.categoryIcon.innerHTML = `<i class="${conversionData[state.category].icon}"></i>`;
        populateUnits(el, state.category);
        convertValue(el, state.category);
    });

    el.fromValue.addEventListener("input", () => convertValue(el, state.category));
    el.fromUnit.addEventListener("change", () => convertValue(el, state.category));
    el.toUnit.addEventListener("change", () => convertValue(el, state.category));

    el.swapButton.addEventListener("click", () =>
        swapUnits(el, () => convertValue(el, state.category))
    );
}

export async function initApp(el) {
    const state = { category: populateCategories(el) };

    populateUnits(el, state.category);
    setupEventListeners(el, state);

    await fetchCurrencyRates(
        "b55c79e2ac77eeb4091f0253",
        "https://v6.exchangerate-api.com/v6/",
        el
    );

    convertValue(el, state.category);
}
