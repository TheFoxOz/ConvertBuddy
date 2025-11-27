// scripts/history.js
// Thin wrapper to export the firestore history functions.
// Keeps callers simple: saveHistory, getHistory, clearHistory
import { saveHistory as _save, getHistory as _get, clearHistory as _clear } from "./firestore.js";

export async function saveHistory(entry) {
  // ensure timestamp
  entry.timestamp = entry.timestamp || Date.now();
  try {
    await _save(entry);
  } catch (e) {
    // swallow - firestore has its own fallback to local
    console.warn("saveHistory wrapper error:", e);
  }
}

export async function getHistory(limit = 50) {
  try {
    return await _get(limit);
  } catch (e) {
    console.warn("getHistory wrapper error:", e);
    return [];
  }
}

export async function clearHistory() {
  try {
    await _clear();
  } catch (e) {
    console.warn("clearHistory wrapper error:", e);
  }
}
