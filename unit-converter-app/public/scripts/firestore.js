// firestore.js
let db = null;

export function initFirestore(firestoreInstance) {
    db = firestoreInstance;
}

// Save conversion
export async function addConversionToHistory(entry) {
    // If Firestore not initialized → LocalStorage fallback
    if (!db) {
        const history = JSON.parse(localStorage.getItem("history") || "[]");
        history.push(entry);
        localStorage.setItem("history", JSON.stringify(history));
        return;
    }

    try {
        const col = firestore.collection(db, "history");
        await firestore.addDoc(col, entry);
    } catch (err) {
        console.error("Firestore error → using localStorage fallback", err);
        const history = JSON.parse(localStorage.getItem("history") || "[]");
        history.push(entry);
        localStorage.setItem("history", JSON.stringify(history));
    }
}
