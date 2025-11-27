// scripts/history.js
import {
    saveHistoryToFirestore,
    loadHistoryFromFirestore,
    clearHistoryFromFirestore
} from "./firestore.js";
// FIX: Need access to loadCategory and performConversion for history click
import { loadCategory, performConversion, swapUnits } from "./ui.js"; 

// FIX: Correct DOM element IDs
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-button");
// FIX: Also need main form inputs for re-conversion
const DOM = {
    fromValue: document.getElementById('from-value'),
    fromUnit: document.getElementById('from-unit'),
    toUnit: document.getElementById('to-unit'),
    // Note: toValue is updated by performConversion
};


/**
 * Add a single entry to the DOM list (and includes click handler)
 */
function renderEntry(entry, prepend = true) { // FIX: Added prepend option
    const li = document.createElement("li");
    
    // FIX: Apply the new clean/minimal UI styling for history list item
    li.className = 'text-sm text-gray-700 flex justify-between cursor-pointer hover:bg-emerald-50';
    
    // FIX: Use the actual data for display instead of just textContent
    const valueSpan = document.createElement('span');
    valueSpan.textContent = `${entry.value} ${entry.fromUnit} → ${entry.result} ${entry.toUnit}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.textContent = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    li.appendChild(valueSpan);
    li.appendChild(timeSpan);

    // FIX: Re-insert the essential click logic moved from ui.js
    li.addEventListener('click', async () => {
        // We use the category key to ensure the unit dropdowns are updated first
        await loadCategory(entry.category); 
        
        // Then set the values
        DOM.fromValue.value = entry.value;
        DOM.fromUnit.value = entry.fromUnit;
        DOM.toUnit.value = entry.toUnit;
        
        // Finally, run the conversion to calculate the result
        await performConversion();
    });

    if (prepend && historyList.firstChild) {
        historyList.insertBefore(li, historyList.firstChild);
    } else {
        historyList.appendChild(li);
    }
}

/**
 * Reload history from Firestore or local fallback
 */
export async function loadHistory() {
    historyList.innerHTML = "<li>Chargement…</li>"; // FIX: French text
    
    const history = await loadHistoryFromFirestore();
    
    historyList.innerHTML = ""; // clear placeholder
    
    if (!history.length) {
        historyList.innerHTML = "<li class='text-gray-500'>Aucun historique.</li>"; // FIX: French text & styling
        return;
    }
    
    // FIX: Render history in order received (newest first from firestore query)
    history.forEach(entry => renderEntry(entry, false));
}

/**
 * Add a new conversion entry
 */
export function addToHistory(entry) {
    // Add to UI instantly (prepend to show latest at the top)
    renderEntry(entry, true); 
    
    // Save to Firestore + Local fallback
    saveHistoryToFirestore(entry);
}

/**
 * Clear history (Firestore + Local)
 */
async function handleClearHistory() {
    // FIX: French text
    const confirmClear = confirm("Voulez-vous vraiment effacer tout l'historique ?"); 
    
    if (!confirmClear) return;
    
    await clearHistoryFromFirestore();
    historyList.innerHTML = "<li class='text-gray-500'>Historique effacé.</li>";
}

// Event listener (Keep this as it clears the history)
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", handleClearHistory);
}

// Load history on page load (Keep this)
// Note: This loadHistory call executes before DOMContentLoaded in ui.js, 
// which might lead to errors if the DOM is not fully ready. 
// It's safer to leave this controlled by ui.js's DOMContentLoaded.
// Comment out the immediate call here:
// loadHistory();
