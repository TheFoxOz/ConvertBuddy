// scripts/currency.js - Currency conversion with Firebase caching
import { initializeFirebase } from "./firebase.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Currency API Configuration
const API_KEY = "b55c79e2ac77eeb4091f0253";
const BASE_CURRENCY = "USD";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cache storage path in Firestore
const CACHE_COLLECTION = "currency_cache";
const CACHE_DOC_ID = "latest_rates";

/**
 * Fetches fresh currency rates from the API and caches them
 * @returns {Promise<Object|null>}
 */
export async function fetchCurrencyRates() {
  try {
    const { db } = await initializeFirebase();
    
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error("Currency API error:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.result !== "success" || !data.conversion_rates) {
      console.error("Invalid API response:", data);
      return null;
    }

    const cacheData = {
      rates: data.conversion_rates,
      timestamp: Date.now(),
      base: data.base_code || BASE_CURRENCY
    };

    // Save to Firestore
    if (db) {
      try {
        await setDoc(doc(db, CACHE_COLLECTION, CACHE_DOC_ID), cacheData);
        console.log("Currency rates cached successfully");
      } catch (error) {
        console.warn("Failed to cache rates:", error);
      }
    }

    return cacheData;
  } catch (error) {
    console.error("Failed to fetch currency rates:", error);
    return null;
  }
}

/**
 * Gets cached currency rates from Firestore
 * @returns {Promise<Object|null>}
 */
export async function getCachedRates() {
  try {
    const { db } = await initializeFirebase();
    
    if (!db) {
      console.warn("Firestore not available");
      return null;
    }

    const docRef = doc(db, CACHE_COLLECTION, CACHE_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cached = docSnap.data();
      
      // Check if stale (older than 1 day)
      const isStale = Date.now() - (cached.timestamp || 0) > ONE_DAY_MS;
      
      if (isStale) {
        console.log("Rates are stale, refreshing in background...");
        fetchCurrencyRates(); // Non-blocking refresh
      }
      
      return cached;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to get cached rates:", error);
    return null;
  }
}

/**
 * Converts currency from one code to another
 * @param {string} fromCode - Source currency code (e.g., 'USD')
 * @param {string} toCode - Target currency code (e.g., 'EUR')
 * @param {number} value - Amount to convert
 * @returns {Promise<number>}
 */
export async function convertCurrency(fromCode, toCode, value) {
  let ratesData = await getCachedRates();

  // If no cache, fetch fresh data
  if (!ratesData || !ratesData.rates) {
    console.log("No cache found, fetching fresh rates...");
    ratesData = await fetchCurrencyRates();
    
    if (!ratesData) {
      throw new Error("Currency rates unavailable");
    }
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return NaN;
  }

  const rates = ratesData.rates;
  const fromRate = rates[fromCode];
  const toRate = rates[toCode];

  if (!fromRate || !toRate) {
    throw new Error(`Rate not found for ${fromCode} or ${toCode}`);
  }

  // Convert via base currency: (value / fromRate) * toRate
  const result = (numValue / fromRate) * toRate;
  
  // Round to 4 decimal places
  return Math.round((result + Number.EPSILON) * 10000) / 10000;
}

/**
 * Returns list of available currencies
 * @returns {Promise<Array>}
 */
export async function listCurrencies() {
  const cached = await getCachedRates();
  
  if (!cached || !cached.rates) {
    // Fallback list while rates are loading
    return [
      { key: "USD", name: "US Dollar", symbol: "USD" },
      { key: "EUR", name: "Euro", symbol: "EUR" },
      { key: "GBP", name: "British Pound", symbol: "GBP" },
      { key: "JPY", name: "Japanese Yen", symbol: "JPY" },
      { key: "CAD", name: "Canadian Dollar", symbol: "CAD" }
    ];
  }

  // Convert rates to currency list
  return Object.keys(cached.rates)
    .map(code => ({
      key: code,
      name: code,
      symbol: code
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

// Initialize currency rates in background (non-blocking)
(async () => {
  const cached = await getCachedRates();
  if (!cached) {
    console.log("No cached rates, fetching initial data...");
    await fetchCurrencyRates();
  }
})();
