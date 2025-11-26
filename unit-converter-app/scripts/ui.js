import { conversionData } from './units.js';
import { convertValue, swapUnits } from './converter.js';
import { fetchCurrencyRates } from './currency.js';

export function initializeElements() {
    const el = {};
    el.categorySelect = document.getElementById('category-select');
    el.categoryIcon = document.getElementById('category-icon');
    el.fromValue = document.getElementById('from-value');
    el.fromUnit = document.getElementById('from-unit');
    el.toValue = document.getElementById('to-value');
    el.toUnit = document.getElementById('to-unit');
    el.swapButton = document.getElementById('swap-button');
    el.currencyInfo = document.getElementById('currency-info');
    el.loading = document.getElementById('loading-spinner');
    return el;
}

export function populateCategories(el) {
    const categories = Object.keys(conversionData);
    el.categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    return el.categorySelect.value;
}

export function populateUnits(el, currentCategory) {
    const units = conversionData[currentCategory].units;
    const options = Object.keys(units).map(name => `<option value="${name}">${name}${units[name].symbol ? ` (${units[name].symbol})` : ""}</option>`).join('');
    el.fromUnit.innerHTML = options;
    el.toUnit.innerHTML = options;
    el.fromUnit.value = Object.keys(units)[0];
    el.toUnit.value = Object.keys(units)[1] || Object.keys(units)[0];
}

export function setupEventListeners(el, currentCategory) {
    el.categorySelect.addEventListener('change', () => {
        currentCategory = el.categorySelect.value;
        el.categoryIcon.innerHTML = `<i class="${conversionData[currentCategory].icon}"></i>`;
        populateUnits(el, currentCategory);
        convertValue(el, currentCategory);
    });
    el.fromValue.addEventListener('input', () => convertValue(el, currentCategory));
    el.fromUnit.addEventListener('change', () => convertValue(el, currentCategory));
    el.toUnit.addEventListener('change', () => convertValue(el, currentCategory));
    el.swapButton.addEventListener('click', () => swapUnits(el, () => convertValue(el, currentCategory)));
}

export async function initApp(el) {
    let currentCategory = populateCategories(el);
    populateUnits(el, currentCategory);
    setupEventListeners(el, currentCategory);
    await fetchCurrencyRates("b55c79e2ac77eeb4091f0253", "https://v6.exchangerate-api.com/v6/", el);
    convertValue(el, currentCategory);
}
