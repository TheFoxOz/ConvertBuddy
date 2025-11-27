// history.js
import { saveHistoryToFirestore, loadHistoryFromFirestore, clearHistoryFromFirestore } from './firestore.js';

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Add a new history item
export async function addToHistory(record) {
  await saveHistoryToFirestore(record);
  displayHistoryItem(record);
}

// Show one history line in UI
function displayHistoryItem(record) {
  const li = document.createElement("li");
  li.textContent = `${record.value} ${record.fromUnit} → ${record.result} ${record.toUnit} (${record.category})`;
  historyList.appendChild(li);
}

// Load the entire history on startup
export async function loadHistory() {
  const history = await loadHistoryFromFirestore();
  historyList.innerHTML = "";

  if (!history || history.length === 0) {
    historyList.innerHTML = "<li>No history yet</li>";
    return;
  }

  history.forEach(displayHistoryItem);
}

// Clear all history
clearHistoryBtn.addEventListener("click", async () => {
  await clearHistoryFromFirestore();
  historyList.innerHTML = "<li>History cleared</li>";
});
