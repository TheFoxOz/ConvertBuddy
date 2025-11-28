// scripts/history.js - FIXED: Loading message & Clear All button
import {
    saveHistoryToFirestore,
    loadHistoryFromFirestore,
    clearHistoryFromFirestore
} from "./firestore.js";

import { loadCategory, performConversion } from "./ui.js";

const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-button");

const DOM = {
    fromValue: document.getElementById('from-value'),
    fromUnit: document.getElementById('from-unit'),
    toUnit: document.getElementById('to-unit'),
};

function renderEntry(entry, prepend = true) {
    if (!historyList) return;

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

    // FIXED: Show proper loading state
    historyList.innerHTML = "<li class='text-gray-500 text-center py-4'>Loading...</li>";

    try {
        const history = await loadHistoryFromFirestore();

        historyList.innerHTML = "";

        // FIXED: Show "No history yet" instead of staying on "Loading..."
        if (!history || history.length === 0) {
            historyList.innerHTML = "<li class='text-gray-500 text-center py-4'>No history yet</li>";
            return;
        }

        history.forEach(entry => renderEntry(entry, false));
    } catch (error) {
        console.error("Failed to load history:", error);
        historyList.innerHTML = "<li class='text-gray-500 text-center py-4'>No history yet</li>";
    }
}

export function addToHistory(entry) {
    if (!historyList) return;
    
    // Remove "No history yet" message if it exists
    const noHistoryMsg = historyList.querySelector('li');
    if (noHistoryMsg && noHistoryMsg.textContent.includes('No history yet')) {
        historyList.innerHTML = "";
    }
    
    renderEntry(entry, true);
    saveHistoryToFirestore(entry);
}

// FIXED: Properly async function that clears both local and Firestore
async function handleClearHistory() {
    if (!confirm("Clear all history? This cannot be undone.")) return;

    try {
        // Clear from Firestore and local storage
        await clearHistoryFromFirestore();
        
        // Update UI immediately
        if (historyList) {
            historyList.innerHTML = "<li class='text-gray-500 text-center py-4'>No history yet</li>";
        }
        
        console.log("History cleared successfully");
    } catch (error) {
        console.error("Failed to clear history:", error);
        alert("Failed to clear history. Please try again.");
    }
}

// FIXED: Attach event listener when DOM is ready
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", handleClearHistory);
}
