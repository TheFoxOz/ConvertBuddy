// scripts/ui.js
import { convertValue, swapUnits } from "./converter.js";
import { getHistory, clearHistory as firestoreClearHistory } from "./firestore.js"; 
import { conversionData } from "./units.js";
import { fetchCurrencyRates } from "./currency.js";

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
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
        firestoreClearHistory().then(() => {
            el.historyList.innerHTML = '<p class="text-sm text-gray-500">History cleared. Start converting!</p>';
        }).catch(error => {
            console.error("Error clearing history:", error);
            alert("Could not clear history due to an error.");
        });
    }
}

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
        clearHistoryButton: document.getElementById("clear-history-button")
    };
}

export async function initApp(el) {
    el.loadingInfo.textContent = "Loading live currency rates...";
    await fetchCurrencyRates();
    const currencyCount = Object.keys(conversionData.Currency.units).length;
    el.loadingInfo.textContent = `Successfully loaded ${currencyCount} currency rates.`;

    populateCategories(el);
    updateUnits(el);
    updateCategoryIcon(el);
    attachListeners(el);
    refreshHistory(el);
}

function populateCategories(el) {
    el.category.innerHTML = "";
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

        opt1.value = u; opt1.textContent = units[u].name;
        opt2.value = u; opt2.textContent = units[u].name;

        el.fromUnit.appendChild(opt1);
        el.toUnit.appendChild(opt2);
    });

    if (category === 'Currency') {
        const keys = Object.keys(units);
        el.fromUnit.value = keys.includes('GBP') ? 'GBP' : keys[0];
        el.toUnit.value = keys.includes('USD') ? 'USD' : keys[1] || keys[0];
    } else {
        el.fromUnit.selectedIndex = 0;
        el.toUnit.selectedIndex = Object.keys(units).length > 1 ? 1 : 0;
    }

    convertValue(el, category, () => refreshHistory(el), false);
}

function attachListeners(el) {
    const conversionCallback = () => convertValue(el, el.category.value, () => refreshHistory(el));
    const debouncedConversion = debounce(conversionCallback, 300);

    el.category.addEventListener("change", () => {
        updateUnits(el);
        updateCategoryIcon(el);
    });
    el.fromValue.addEventListener("input", debouncedConversion);
    el.fromUnit.addEventListener("change", conversionCallback);
    el.toUnit.addEventListener("change", conversionCallback);
    el.swapButton.addEventListener("click", () => swapUnits(el, conversionCallback));
    el.clearHistoryButton.addEventListener("click", () => handleClearHistory(el));
}

export async function refreshHistory(el) {
    const list = el.historyList;
    const history = await getHistory();
    list.innerHTML = "";
    history.slice(0, 10).forEach(entry => { 
        const item = document.createElement("div");
        item.className = "p-3 bg-gray-50 rounded-lg shadow border border-gray-200";
        item.innerHTML = `
            <div class="flex justify-between text-sm text-gray-700">
                <span class="font-semibold text-emerald-700">${entry.category}</span>
                <span class="text-gray-500">${formatTime(entry.timestamp)}</span>
            </div>
            <div class="mt-1 text-gray-800">
                ${entry.input} ${entry.fromUnit} → <span class="font-semibold">${entry.output}</span>
            </div>
        `;
        list.appendChild(item);
    });
    if (history.length === 0) {
        list.innerHTML = '<p class="text-sm text-gray-500">Your recent conversions will appear here.</p>';
    }
}

function updateCategoryIcon(el) {
    const iconEl = el.category.previousElementSibling;
    const category = el.category.value;
    const iconClass = conversionData[category].icon || 'fas fa-question';
    iconEl.className = iconClass + ' text-gray-400 p-3';
}
