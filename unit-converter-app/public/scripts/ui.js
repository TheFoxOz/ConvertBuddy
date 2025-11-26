// scripts/ui.js
import { convertValue, swapUnits } from "./converter.js";
import { getHistory } from "./firestore.js";
import { conversionData } from "./units.js";

export function initializeElements() {
    return {
        category: document.getElementById("category-select"),
        fromValue: document.getElementById("from-value"),
        toValue: document.getElementById("to-value"),
        fromUnit: document.getElementById("from-unit"),
        toUnit: document.getElementById("to-unit"),
        swapButton: document.getElementById("swap-button"),
        categoryIcon: document.getElementById("category-icon"),
        currencyInfo: document.getElementById("currency-info"),
        historySection: null
    };
}

export function initApp(el) {
    populateCategories(el);
    updateUnits(el);
    attachListeners(el);
    loadHistory();
}

function populateCategories(el) {
    Object.keys(conversionData).forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        el.category.appendChild(option);
    });
}

function updateUnits(el) {
    const category = el.category.value;
    const units = conversionData[category].units;

    el.fromUnit.innerHTML = "";
    el.toUnit.innerHTML = "";

    Object.keys(units).forEach(u => {
        const opt1 = document.createElement("option");
        const opt2 = document.createElement("option");

        opt1.value = u;
        opt1.textContent = units[u].name;

        opt2.value = u;
        opt2.textContent = units[u].name;

        el.fromUnit.appendChild(opt1);
        el.toUnit.appendChild(opt2);
    });

    convertValue(el, category);
}

function attachListeners(el) {
    el.category.addEventListener("change", () => {
        updateUnits(el);
    });

    el.fromValue.addEventListener("input", () => {
        convertValue(el, el.category.value);
    });

    el.fromUnit.addEventListener("change", () => {
        convertValue(el, el.category.value);
    });

    el.toUnit.addEventListener("change", () => {
        convertValue(el, el.category.value);
    });

    el.swapButton.addEventListener("click", () => {
        swapUnits(el, () => convertValue(el, el.category.value));
    });
}

async function loadHistory() {
    const history = await getHistory();

    console.log("User history:", history);
}
