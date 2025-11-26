// scripts/ui.js
import { convertValue, swapUnits } from
"./converter.js";
import { getHistory, clearHistory as firestoreClearHistory }
from "./firestore.js";
import { conversionData, updateCurrencyUnits } from
"./units.js"; // IMPORTED updateCurrencyUnits
import { fetchCurrencyRates } from
"./currency.js";

// -----------------
// Utils
// -----------------
function debounce(func, delay) {
    let timeoutId;
    return function
(...args) {
        clearTimeout(timeoutId);
        timeoutId =
setTimeout(() => func.apply(this, args), delay);
    };
}

function formatTime(timestamp) {
    const diff =
(Date.now() - timestamp) / 1000;
    if (diff < 60)
return "just now";
    if (diff <
3600) return Math.floor(diff / 60) + " min ago";
    if (diff <
86400) return Math.floor(diff / 3600) + " h ago";
    return new
Date(timestamp).toLocaleDateString();
}

function handleClearHistory(el) {
    if
(confirm("Are you sure you want to clear your conversion history?"))
{
        firestoreClearHistory()
            .then(()
=> {
                el.historyList.innerHTML = '<p class="text-sm text-gray-500">History cleared.</p>';
            })
            .catch(error => {
                console.error("Error clearing history:", error);
                alert("Could not clear history.");
            });
    }
}

// -----------------
// Elements init
// -----------------
export function initializeElements() {
    return {
        category:
document.getElementById("category-select"),
        fromValue:
document.getElementById("from-value"),
        toValue:
document.getElementById("to-value"),
        fromUnit:
document.getElementById("from-unit"),
        toUnit:
document.getElementById("to-unit"),
        swapButton:
document.getElementById("swap-button"),
        historyList:
document.getElementById("history-list"),
        loadingInfo:
document.getElementById("loading-info"),
        clearHistoryButton:
document.getElementById("clear-history-button"),
        categoryIcon:
document.querySelector("#category-select + i")
    };
}

// -----------------
// App init
// -----------------
export async function initApp(el) {
    el.loadingInfo.textContent = "Loading currency rates...";
    let liveRates =
{};

    try {
        liveRates =
await fetchCurrencyRates();
        localStorage.setItem("cachedCurrencyRates",
JSON.stringify(liveRates));
        el.loadingInfo.textContent = `Loaded ${Object.keys(liveRates).length} currencies`;
    } catch (error) {
        const cached =
localStorage.getItem("cachedCurrencyRates");
        if (cached) {
            liveRates
= JSON.parse(cached);
            el.loadingInfo.textContent = `Using cached ${Object.keys(liveRates).length} currencies`;
        } else {
            el.loadingInfo.textContent = `Currency rates unavailable`;
        }
    }

    if (liveRates
&& Object.keys(liveRates).length) {
        // CODE QUALITY IMPROVEMENT: Use the dedicated function from units.js
        updateCurrencyUnits(liveRates);
    }

    populateCategories(el);
    updateUnits(el);
    attachListeners(el);
    refreshHistory(el);
    
    // UX IMPROVEMENT: Focus on the input field when the app loads
    el.fromValue.focus(); 
}

// -----------------
// Categories & Units
// -----------------
function populateCategories(el) {
    el.category.innerHTML = "";
    Object.keys(conversionData).forEach(cat => {
        const option =
document.createElement("option");
        option.value =
cat;
        option.textContent = cat;
        el.category.appendChild(option);
    });
    updateCategoryIcon(el);
}

function updateCategoryIcon(el) {
    if
(!el.categoryIcon) return;
    const cat =
el.category.value;
    el.categoryIcon.className = conversionData[cat]?.icon || "fas fa-question";
}

function updateUnits(el) {
    const category =
el.category.value;
    const units =
conversionData[category].units;

    el.fromUnit.innerHTML = "";
    el.toUnit.innerHTML = "";

    Object.keys(units).forEach(key => {
        const opt1 =
document.createElement("option");
        const opt2 =
document.createElement("option");
        opt1.value =
opt2.value = key;
        opt1.textContent = opt2.textContent = units[key].name;
        el.fromUnit.appendChild(opt1);
        el.toUnit.appendChild(opt2);
    });

    if (category ===
"Currency") {
        el.fromUnit.value = "GBP";
        el.toUnit.value = "USD";
    } else {
        el.fromUnit.selectedIndex = 0;
        el.toUnit.selectedIndex = Object.keys(units).length > 1 ? 1 : 0;
    }

    convertValue(el, category, () =>
refreshHistory(el), false);
    updateCategoryIcon(el);
}

// -----------------
// Listeners
// -----------------
function attachListeners(el) {
    const
conversionCallback = () => convertValue(el, el.category.value, () =>
refreshHistory(el));
    const
debouncedConversion = debounce(conversionCallback, 300);

    el.category.addEventListener("change", () =>
updateUnits(el));
    el.fromValue.addEventListener("input", debouncedConversion);
    el.fromUnit.addEventListener("change", conversionCallback);
    el.toUnit.addEventListener("change", conversionCallback);
    el.swapButton.addEventListener("click", () => swapUnits(el,
conversionCallback));
    el.clearHistoryButton.addEventListener("click", () =>
handleClearHistory(el));
}

// -----------------
// History
// -----------------
export async function refreshHistory(el) {
    const history =
await getHistory();
    const list =
el.historyList;
    list.innerHTML =
"";

    if
(!history.length) {
        list.innerHTML
= '<p class="text-sm text-gray-500">Your recent conversions will appear here.</p>';
        return;
    }

    history.slice(0,
10).forEach(entry => {
        const item =
document.createElement("div");
        item.className
= "p-3 bg-gray-50 rounded-lg shadow border border-gray-200";
        item.innerHTML
= `
            <div
class="flex justify-between text-sm text-gray-700">
                <span class="font-semibold
text-emerald-700">${entry.category}</span>
                <span
class="text-gray-500">${formatTime(entry.timestamp)}</span>
            </div>
            <div
class="mt-1 text-gray-800">
                ${entry.input} ${entry.fromUnit} → <span
class="font-semibold">${entry.output}</span>
            </div>
        `;
        list.appendChild(item);
    });
}


// -----------------
// MODIFIED convertValue function
// -----------------
/**
 * Convert value and optionally save history
 */
export async function convertValue(el, category, callback, saveHistory = true) {
    try {
        // If the input is empty (handled here) or invalid (handled by convert), show "---"
        if (!el.fromValue.value) {
            el.toValue.value = "---";
            return;
        }

        const input = Number(el.fromValue.value);
        const output = convert(category, el.fromUnit.value, el.toUnit.value, input);

        // Check if the core convert function returned NaN (invalid input/conversion error)
        if (isNaN(output)) {
            el.toValue.value = "---";
            return;
        }

        el.toValue.value = output;

        if (saveHistory) {
            const { saveHistory: save } = await import("./firestore.js");
            // CODE QUALITY IMPROVEMENT: Do not await history saving to avoid blocking UI/UX.
            save({
                category,
                input,
                fromUnit: el.fromUnit.value,
                output,
                toUnit: el.toUnit.value,
                timestamp: Date.now()
            }).catch(error => {
                console.warn("Background history save failed:", error);
            });
        }

        if (callback) callback();
    } catch (err) {
        console.error("Conversion error:", err);
        el.toValue.value = "---";
    }
}
