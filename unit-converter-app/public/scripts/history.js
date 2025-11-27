// scripts/history.js
import {
  saveHistoryToFirestore,
  loadHistoryFromFirestore,
  clearHistoryFromFirestore
} from "./firestore.js";

// DOM elements
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

/**
 * Add a single entry to the DOM list
 */
function renderEntry(entry) {
  const li = document.createElement("li");
  li.textContent = `${entry.input} → ${entry.output} (${entry.category})`;
  historyList.appendChild(li);
}

/**
 * Reload history from Firestore or local fallback
 */
export async function loadHistory() {
  historyList.innerHTML = "<li>Loading…</li>";

  const history = await loadHistoryFromFirestore();

  historyList.innerHTML = ""; // clear placeholder

  if (!history.length) {
    historyList.innerHTML = "<li>No history yet.</li>";
    return;
  }

  history.forEach(renderEntry);
}

/**
 * Add a new conversion entry
 */
export function addToHistory(entry) {
  // Add to UI instantly
  renderEntry(entry);

  // Save to Firestore + Local fallback
  saveHistoryToFirestore(entry);
}

/**
 * Clear history (Firestore + Local)
 */
async function handleClearHistory() {
  const confirmClear = confirm("Clear all history?");

  if (!confirmClear) return;

  await clearHistoryFromFirestore();
  historyList.innerHTML = "<li>History cleared.</li>";
}

// Event listener
clearHistoryBtn.addEventListener("click", handleClearHistory);

// Load history on page load
loadHistory();
