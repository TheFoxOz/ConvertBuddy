// scripts/ui.js
import { convertValue, swapUnits } from "./converter.js";
import { getHistory, clearHistory as firestoreClearHistory } from "./firestore.js";
import { conversionData } from "./units.js";
import { fetchCurrencyRates } from "./currency.js";

/* --------------------- */
/* UTILS                 */
/* --------------------- */

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function formatTime(timestamp) {
    const diff = (Date.now() - timestamp) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " h ago";
    return new Date(timestamp).toLocaleDateString();
}

function handleClearHistory(el) {
    if (confirm("Are you sure you want to clear your entire conversion history (local and cloud)?")) {
        firestoreClearHistory()
            .then(() => {
                el.historyList.innerHTML =
                    '<p class="text-sm text-gray-500">History cleared. Start converting!</p>';
            })
            .catch((error) => {
                console.error("Error clearing history:", error);
                alert("Could not clear history due to an error.");
            });
    }
}

/* --------------------- */
/* ELEMENTS INIT         */
/* --------------------- */

export function initializeElements() {
    return {
        category: document.getElementById("category-select"),
        fromValue: document.getElementById("from-value"),
        toValue: document.getElementById("to-value"),
        fromUnit: document.getElementById("from-unit"),
        toUnit: document.getElementById("to-unit"),
        swapButton: document.getElementById("swap-button"),
        historyList: document.getElementById("history-list"),
        loadingInfo: document.getElementById("loading-info"),
        clearHistoryButton: document.getElementById("clear-history-button"),
        categoryIcon: document.querySelector("#category-select + i")
    };
}

/* --------------------- */
/* APP INIT              */
/* --------------------- */

export async function initApp(el) {
    el.loadingInfo.textContent = "Loading live currency rates...";

    // Fetch currency rates (Option A – exchangerate-api.com only)
    await fetchCurrencyRates();

    const currencyCount = Object.keys(conversionData.Currency.units).length;
    el.loadingInfo.textContent = `Loaded ${currencyCount} currencies from live API.`;

    populateCategories(el);
    updateUnits(el);
    attachListeners(el);
    refreshHistory(el);
}

/* --------------------- */
/* CATEGORY + UNITS      */
/* --------------------- */

function populateCategories(el) {
    el.category.innerHTML = "";

    Object.keys(conversionData).forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        el.category.appendChild(option);
    });

    updateCategoryIcon(el);
}

function updateCategoryIcon(el) {
    if (!el.categoryIcon) return;
    const cat = el.category.value;
    el.categoryIcon.className =
        conversionData[cat]?.icon || "fas fa-question";
}

function updateUnits(el) {
    const category = el.category.value;
    const units = conversionData[category].units;

    el.fromUnit.innerHTML = "";
    el.toUnit.innerHTML = "";

    Object.keys(units).forEach((unitKey) => {
        const opt1 = document.createElement("option");
        const opt2 = document.createElement("option");

        opt1.value = unitKey;
        opt1.textContent = units[unitKey].name;

        opt2.value = unitKey;
        opt2.textContent = units[unitKey].name;

        el.fromUnit.appendChild(opt1);
        el.toUnit.appendChild(opt2);
    });

    // Default units for currency
    if (category === "Currency") {
        el.fromUnit.value = "GBP";
        el.toUnit.value = "USD";
    } else {
        el.fromUnit.selectedIndex = 0;
        el.toUnit.selectedIndex =
            Object.keys(units).length > 1 ? 1 : 0;
    }

    convertValue(el, category, () => refreshHistory(el), false);
    updateCategoryIcon(el);
}

/* --------------------- */
/* LISTENERS             */
/* --------------------- */

function attachListeners(el) {
    const conversionCallback = () =>
        convertValue(el, el.category.value, () => refreshHistory(el));

    const debouncedConversion = debounce(conversionCallback, 300);

    el.category.addEventListener("change", () => updateUnits(el));
    el.fromValue.addEventListener("input", debouncedConversion);
    el.fromUnit.addEventListener("change", conversionCallback);
    el.toUnit.addEventListener("change", conversionCallback);
    el.swapButton.addEventListener("click", () =>
        swapUnits(el, conversionCallback)
    );
    el.clearHistoryButton.addEventListener("click", () =>
        handleClearHistory(el)
    );
}

/* --------------------- */
/* HISTORY               */
/* --------------------- */

export async function refreshHistory(el) {
    const list = el.historyList;
    const history = await getHistory();

    list.innerHTML = "";

    history.slice(0, 10).forEach((entry) => {
        const item = document.createElement("div");
        item.className =
            "p-3 bg-gray-50 rounded-lg shadow border border-gray-200";

        item.innerHTML = `
            <div class="flex justify-between text-sm text-gray-700">
                <span class="font-semibold text-emerald-700">${entry.category}</span>
                <span class="text-gray-500">${formatTime(entry.timestamp)}</span>
            </div>
            <div class="mt-1 text-gray-800">
                ${entry.input} ${entry.fromUnit} → 
                <span class="font-semibold">${entry.output}</span>
            </div>
        `;

        list.appendChild(item);
    });

    if (!history.length) {
        list.innerHTML =
            '<p class="text-sm text-gray-500">Your recent conversions will appear here.</p>';
    }
}
