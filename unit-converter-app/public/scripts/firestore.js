// scripts/firestore.js

// FIX: Import db from your main firebase module
import { db } from "./firebase.js";

let deviceId = null;

// Generate / load device ID in localStorage (moved from initFirestore)
deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
    // Check if crypto is available (standard for modern browsers)
    deviceId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("deviceId", deviceId);
}

// Save history entry
export async function saveHistory(entry) {
    // Always save locally
    saveHistoryLocal(entry);

    // Firestore not available or not properly initialized
    if (!db) return;

    try {
        const { 
            collection, addDoc 
        } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"); // FIX: Version update
        
        // Use deviceId in collection path
        await addDoc(
            collection(db, `devices/${deviceId}/history`),
            entry
        );
    } catch (error) {
        console.warn("Firestore write failed, fallback to local history only", error);
    }
}

// Read Firestore history
export async function getHistory() {
    const local = getHistoryLocal();

    if (!db) return local;

    try {
        const { 
            collection, getDocs, orderBy, query 
        } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"); // FIX: Version update

        const q = query(
            collection(db, `devices/${deviceId}/history`),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        const history = snapshot.docs.map(doc => doc.data());

        // Return combined list (or just Firestore if reliable)
        return history.length ? history : local;
    } catch (error) {
        console.warn("Firestore read failed, fallback to local", error);
        return local;
    }
}

/**
 * NEW: Clears all history entries for the current device in Firestore.
 */
export async function clearHistory() {
    if (!db) {
        console.warn("Firestore not available. Clearing local storage only.");
        localStorage.removeItem("converterHistory");
        return;
    }

    try {
        const {
            collection, getDocs, deleteDoc, writeBatch
        } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

        const historyRef = collection(db, `devices/${deviceId}/history`);
        const snapshot = await getDocs(historyRef);

        // Batch delete for efficiency
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();

        // Also clear local fallback history
        localStorage.removeItem("converterHistory");

    } catch (error) {
        console.error("Error clearing history in Firestore:", error);
        throw error;
    }
}

/* ------------------------------- */
/* LOCAL STORAGE FALLBACK          */
/* ------------------------------- */

function saveHistoryLocal(entry) {
    const key = "converterHistory";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift(entry);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50))); // Keep last 50
}

function getHistoryLocal() {
    return JSON.parse(localStorage.getItem("converterHistory") || "[]");
}
