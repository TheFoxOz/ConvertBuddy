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
        historyList: document.getElementById("history-list")
    };
}

export function initApp(el) {
    populateCategories(el);
    updateUnits(el);
    attachListeners(el);
    refreshHistory(el);
}

/* --------------------- */
/* CATEGORY + UNITS      */
/* --------------------- */

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

/* --------------------- */
/* LISTENERS             */
/* --------------------- */

function attachListeners(el) {
    el.category.addEventListener("change", () => {
        updateUnits(el);
        refreshHistory(el);
    });

    el.fromValue.addEventListener("input", () => {
        convertValue(el, el.category.value);
        refreshHistory(el);
    });

    el.fromUnit.addEventListener("change", () => {
        convertValue(el, el.category.value);
        refreshHistory(el);
    });

    el.toUnit.addEventListener("change", () => {
        convertValue(el, el.category.value);
        refreshHistory(el);
    });

    el.swapButton.addEventListener("click", () => {
        swapUnits(el, () => convertValue(el, el.category.value));
        refreshHistory(el);
    });
}

/* --------------------- */
/* HISTORY UI            */
/* --------------------- */

async function refreshHistory(el) {
    const list = el.historyList;
    const history = await getHistory();

    list.innerHTML = "";

    history.slice(0, 15).forEach(entry => {
        const item = document.createElement("div");
        item.className =
            "p-3 bg-gray-50 rounded-lg shadow border border-gray-200";

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
}

function formatTime(timestamp) {
    const diff = (Date.now() - timestamp) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " h ago";

    return new Date(timestamp).toLocaleDateString();
}
