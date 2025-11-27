// scripts/firestore.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const DEVICE_ID_KEY = "deviceId";
let deviceId = localStorage.getItem(DEVICE_ID_KEY);
if (!deviceId) {
  deviceId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

// Local fallback helpers
function saveHistoryLocal(entry) {
  const key = "converterHistory";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.unshift(entry);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
}

function getHistoryLocal() {
  return JSON.parse(localStorage.getItem("converterHistory") || "[]");
}

// Save history (writes local + Firestore if available)
export async function saveHistory(entry) {
  saveHistoryLocal(entry);
  if (!db) return;
  try {
    await addDoc(collection(db, `devices/${deviceId}/history`), entry);
  } catch (e) {
    console.warn("Firestore write failed, local only:", e);
  }
}

// Get history (tries Firestore then falls back to local)
export async function getHistory(limit = 50) {
  const local = getHistoryLocal();
  if (!db) return local;
  try {
    const q = query(collection(db, `devices/${deviceId}/history`), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const history = snapshot.docs.map(doc => doc.data());
    return history.length ? history.slice(0, limit) : local;
  } catch (e) {
    console.warn("Firestore read failed, using local:", e);
    return local;
  }
}

// Clear history both local and Firestore
export async function clearHistory() {
  localStorage.removeItem("converterHistory");
  if (!db) return;
  try {
    const historyRef = collection(db, `devices/${deviceId}/history`);
    const snapshot = await getDocs(historyRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  } catch (e) {
    console.error("Error clearing Firestore history:", e);
    throw e;
  }
}
