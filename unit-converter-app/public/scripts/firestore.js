// scripts/firestore.js

let db = null;
let deviceId = null;

// Initialize Firestore reference
export function initFirestore(firestoreInstance) {
    db = firestoreInstance;

    // Generate / load device ID in localStorage
    deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("deviceId", deviceId);
    }
}

// Save history entry
export async function saveHistory(entry) {
    // Always save locally
    saveHistoryLocal(entry);

    // Firestore not available
    if (!db) return;

    try {
        const { 
            collection, addDoc 
        } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js");

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
        } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js");

        const q = query(
            collection(db, `devices/${deviceId}/history`),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        const history = snapshot.docs.map(doc => doc.data());

        return history.length ? history : local;
    } catch (error) {
        console.warn("Firestore read failed, fallback to local", error);
        return local;
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
