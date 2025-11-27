// scripts/history.js - FINAL FIXED: No unused imports + safe DOM + English
import {
    saveHistoryToFirestore,
    loadHistoryFromFirestore,
    clearHistoryFromFirestore
} from "./firestore.js";

// Only import what's needed for clicks
import { loadCategory, performConversion } from "./ui.js";

const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-button");

// Safe DOM refs (check if elements exist)
const DOM = {
    fromValue: document.getElementById('from-value'),
    fromUnit: document.getElementById('from-unit'),
    toUnit: document.getElementById('to-unit'),
};

function renderEntry(entry, prepend = true) {
    if (!historyList) return; // Safe guard

    const li = document.createElement("li");
    li.className = 'text-sm text-gray-700 flex justify-between cursor-pointer hover:bg-emerald-50 p-2 rounded';

    const valueSpan = document.createElement('span');
    const fromVal = Number(entry.value).toLocaleString("en-US", { maximumFractionDigits: 6 });
    const toVal = Number(entry.result).toLocaleString("en-US", { maximumFractionDigits: 6 });
    valueSpan.textContent = `${fromVal} ${entry.fromUnit} → ${toVal} ${entry.toUnit}`;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-gray-500 text-xs';
    timeSpan.textContent = new Date(entry.timestamp).toLocaleTimeString("en-US", { 
        hour: 'numeric', 
        minute: '2-digit' 
    });

    li.appendChild(valueSpan);
    li.appendChild(timeSpan);

    // Safe click handler
    li.addEventListener('click', async () => {
        if (!DOM.fromValue || !loadCategory || !performConversion) return;
        await loadCategory(entry.category);
        DOM.fromValue.value = entry.value;
        DOM.fromUnit.value = entry.fromUnit;
        DOM.toUnit.value = entry.toUnit;
        await performConversion();
    });

    if (prepend && historyList.firstChild) {
        historyList.insertBefore(li, historyList.firstChild);
    } else {
        historyList.appendChild(li);
    }
}

export async function loadHistory() {
    if (!historyList) return;

    historyList.innerHTML = "<li class='text-gray-500'>Loading…</li>";

    const history = await loadHistoryFromFirestore();

    historyList.innerHTML = "";

    if (!history.length) {
        historyList.innerHTML = "<li class='text-gray-500 text-center py-4'>No history yet</li>";
        return;
    }

    history.forEach(entry => renderEntry(entry, false));
}

export function addToHistory(entry) {
    if (!historyList) return;
    renderEntry(entry, true);
    saveHistoryToFirestore(entry);
}

async function handleClearHistory() {
    if (!confirm("Clear all history? This cannot be undone.")) return;

    await clearHistoryFromFirestore();
    if (historyList) {
        historyList.innerHTML = "<li class='text-gray-500 text-center py-4'>History cleared</li>";
    }
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", handleClearHistory);
}
