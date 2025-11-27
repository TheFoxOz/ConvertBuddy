import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- FIREBASE SETUP ---
// Global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db;
let auth;
let isFirebaseInitialized = false;

// Function to initialize Firebase and sign in the user
async function initializeFirebase() {
    if (isFirebaseInitialized) return { db, auth };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        isFirebaseInitialized = true;
    } catch (error) {
        console.error("Firebase Auth failed:", error);
    }
    return { db, auth };
}

// --- CURRENCY CONFIG ---
// NOTE: Embedding API keys is insecure. This key is for demonstration only.
const API_KEY = "b55c79e2ac77eeb4091f0253"; 
const BASE_CURRENCY = "USD";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const EXCHANGE_RATES_DOC_PATH = `/artifacts/${appId}/public/data/currency_data/latest_rates`;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// -----------------------

/**
 * Fetches currency rates from the external API and caches them in Firestore.
 * @returns {Promise<Object | null>} Cached data object or null on failure.
 */
export async function fetchCurrencyRates() {
    await initializeFirebase();

    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) {
            console.error("Currency API responded:", resp.status);
            return null;
        }
        const data = await resp.json();

        if (data.result !== "success" || !data.conversion_rates) {
            console.error("Currency API returned invalid body", data);
            return null;
        }

        const cacheData = {
            rates: data.conversion_rates,
            timestamp: Date.now(),
            base: data.base_code || BASE_CURRENCY
        };

        // Write the fetched data to Firestore
        await setDoc(doc(db, EXCHANGE_RATES_DOC_PATH), cacheData);
        return cacheData;

    } catch (e) {
        console.warn("Failed to fetch or cache currency rates:", e);
        return null;
    }
}

/**
 * Retrieves cached rates from Firebase Firestore.
 * @returns {Promise<Object | null>} Cached data object or null if not found or stale.
 */
export async function getCachedRates() {
    await initializeFirebase();

    try {
        const docRef = doc(db, EXCHANGE_RATES_DOC_PATH);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const cached = docSnap.data();
            // Check for staleness
            if (Date.now() - (cached.timestamp || 0) > ONE_DAY_MS) {
                console.log("Cached rates are stale. Initiating refresh.");
                // Immediately return stale data but kick off a background refresh
                fetchCurrencyRates();
                return cached;
            }
            return cached;
        }
    } catch (e) {
        console.error("Failed to retrieve currency cache from Firestore:", e);
    }
    return null;
}

/**
 * Converts a currency value from source to target using cached or freshly fetched rates.
 * @param {string} fromCode - The currency code to convert from.
 * @param {string} toCode - The currency code to convert to.
 * @param {number} value - The numerical value to convert.
 * @returns {Promise<number>} The converted and rounded value.
 */
export async function convertCurrency(fromCode, toCode, value) {
    let ratesData = await getCachedRates();
    
    // If rates are missing (first run), fetch them blocking
    if (!ratesData || !ratesData.rates) {
        ratesData = await fetchCurrencyRates();
        if (!ratesData) throw new Error("Currency rates unavailable");
    }

    value = Number(value);
    if (isNaN(value)) return NaN;

    const rates = ratesData.rates;
    const fromRate = rates[fromCode];
    const toRate = rates[toCode];
    if (!fromRate || !toRate) throw new Error(`Rate missing for ${fromCode} or ${toCode}`);

    // Convert = (value / fromRate) * toRate (both rates relative to BASE_CURRENCY)
    const result = (value / fromRate) * toRate;
    const precision = 4;
    const factor = 10 ** precision;
    
    // Rounding to fixed precision
    return Math.round((result + Number.EPSILON) * factor) / factor;
}

/**
 * Returns an array of available currencies (from cache) or a fallback list.
 * @returns {Promise<Array<Object>>} Array of currency objects { key, name, symbol }.
 */
export async function listCurrencies() {
    const cached = await getCachedRates();
    if (!cached || !cached.rates) {
        // Fallback list
        return [
            { key: "USD", name: "US Dollar", symbol: "USD" },
            { key: "EUR", name: "Euro", symbol: "EUR" },
            { key: "GBP", name: "British Pound", symbol: "GBP" }
        ];
    }
    
    // Convert rate keys to currency list objects and sort
    return Object.keys(cached.rates)
        .map(code => ({ 
            key: code, 
            name: code, 
            symbol: code 
        }))
        .sort((a,b) => a.key.localeCompare(b.key));
}

// Initial background check and refresh (non-blocking)
async function initialLoad() {
    const cached = await getCachedRates();
    // If no cache exists, or if the cache is stale (stale check handled in getCachedRates)
    if (!cached) {
        console.log("No cache found. Fetching rates in background.");
        fetchCurrencyRates();
    }
}
initialLoad();
