// scripts/firestore.js - Version finale & stable
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ----------------------------
// Device ID (unique per browser)
// ----------------------------
const DEVICE_ID_KEY = "deviceId";
let deviceId = localStorage.getItem(DEVICE_ID_KEY);

if (!deviceId) {
  deviceId = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

// Firestore collection reference
const historyRef = () => collection(db, `devices/${deviceId}/history`);

// ----------------------------
// Local fallback (offline storage)
// ----------------------------
function saveHistoryLocal(entry) {
  const key = "converterHistory";
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(key) || "[]");
  } catch (e) {
    console.warn("Corrupted local history, resetting");
  }
  existing.unshift(entry);
  // Keep only last 50 entries
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
}

function getHistoryLocal() {
  try {
    return JSON.parse(localStorage.getItem("converterHistory") || "[]");
  } catch (e) {
    console.warn("Failed to parse local history");
    return [];
  }
}

// ----------------------------
// SAVE history
// ----------------------------
export async function saveHistoryToFirestore(entry) {
  saveHistoryLocal(entry); // Always save locally first

  if (!db) return;

  try {
    await addDoc(historyRef(), entry);
  } catch (err) {
    console.warn("Firestore write failed → using local only", err);
  }
}

// ----------------------------
// LOAD history
// ----------------------------
export async function loadHistoryFromFirestore(limit = 50) {
  const local = getHistoryLocal();

  if (!db) return local;

  try {
    const q = query(historyRef(), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const history = snapshot.docs.map(d => d.data());

    return history.length ? history.slice(0, limit) : local;
  } catch (err) {
    console.warn("Firestore read failed → using local", err);
    return local;
  }
}

// ----------------------------
// CLEAR history
// ----------------------------
export async function clearHistoryFromFirestore() {
  localStorage.removeItem("converterHistory");

  if (!db) return;

  try {
    const snapshot = await getDocs(historyRef());
    const batch = writeBatch(db);

    snapshot.docs.forEach(document => {
      batch.delete(document.ref);
    });

    await batch.commit();
  } catch (err) {
    console.error("Error clearing Firestore history:", err);
    throw err;
  }
}
