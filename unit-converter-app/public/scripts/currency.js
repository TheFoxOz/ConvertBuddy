// scripts/currency.js - FIXED: Better error handling and fallback currencies
import { initializeFirebase } from "./firebase.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const API_KEY = "b55c79e2ac77eeb4091f0253";
const BASE_CURRENCY = "USD";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const CACHE_DOC = "latest_rates";
const CACHE_COLLECTION = "currency_cache";
const ONE_DAY = 24 * 60 * 60 * 1000;

let ratesCache = null;

// Comprehensive fallback currency list
const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.53, CAD: 1.39,
  CHF: 0.88, CNY: 7.24, SEK: 10.87, NZD: 1.67, MXN: 17.08, SGD: 1.34,
  HKD: 7.83, NOK: 10.95, KRW: 1315.50, TRY: 32.65, INR: 83.12, RUB: 92.50,
  BRL: 4.97, ZAR: 18.65, DKK: 6.87, PLN: 3.98, THB: 34.85, IDR: 15678.50,
  HUF: 353.20, CZK: 22.45, ILS: 3.64, CLP: 973.50, PHP: 55.80, AED: 3.67,
  COP: 3925.00, SAR: 3.75, MYR: 4.47, RON: 4.57
};

async function getDb() {
  try {
    const { db } = await initializeFirebase();
    return db;
  } catch (e) {
    console.warn("Firebase not available for currency cache:", e);
    return null;
  }
}

export async function getRates() {
  // Check memory cache first
  if (ratesCache && Date.now() - ratesCache.timestamp < ONE_DAY) {
    console.log("[Currency] Using memory cache");
    return ratesCache.rates;
  }

  // Try Firestore cache
  const db = await getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, CACHE_COLLECTION, CACHE_DOC));
      if (snap.exists()) {
        const data = snap.data();
        if (Date.now() - data.timestamp < ONE_DAY) {
          console.log("[Currency] Using Firestore cache");
          ratesCache = data;
          return data.rates;
        }
      }
    } catch (e) {
      console.warn("Failed to read currency cache from Firestore:", e);
    }
  }

  // Try to fetch fresh rates
  return await refreshRates();
}

async function refreshRates() {
  try {
    console.log("[Currency] Fetching fresh rates from API...");
    const res = await fetch(API_URL);
    
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error("API returned invalid data");
    }

    const newCache = {
      rates: data.conversion_rates,
      timestamp: Date.now(),
      base: data.base_code,
    };

    ratesCache = newCache;
    console.log("[Currency] Loaded", Object.keys(newCache.rates).length, "currencies");

    // Try to save to Firestore (non-blocking)
    const db = await getDb();
    if (db) {
      setDoc(doc(db, CACHE_COLLECTION, CACHE_DOC), newCache).catch(e => 
        console.warn("Failed to save rates to Firestore:", e)
      );
    }

    return newCache.rates;
  } catch (e) {
    console.error("Currency API failed:", e);
    
    // Use old cache if available
    if (ratesCache?.rates) {
      console.log("[Currency] Using stale cache");
      return ratesCache.rates;
    }
    
    // Ultimate fallback
    console.log("[Currency] Using fallback rates");
    ratesCache = {
      rates: FALLBACK_RATES,
      timestamp: Date.now(),
      base: "USD"
    };
    return FALLBACK_RATES;
  }
}

export async function convertCurrency(from, to, amount) {
  if (from === to) return amount;
  
  try {
    const rates = await getRates();
    const fromRate = rates[from];
    const toRate = rates[to];
    
    if (!fromRate || !toRate) {
      throw new Error(`Missing rate: ${from} → ${to}`);
    }
    
    return (amount / fromRate) * toRate;
  } catch (e) {
    console.error("Currency conversion failed:", e);
    throw e;
  }
}

export async function listCurrencies() {
  try {
    const rates = await getRates();
    const currencies = Object.keys(rates)
      .map(code => ({ key: code, name: code, symbol: code }))
      .sort((a, b) => a.key.localeCompare(b.key));
    
    console.log("[Currency] Loaded", currencies.length, "currencies for dropdown");
    return currencies;
  } catch (e) {
    console.error("Failed to list currencies:", e);
    // Return fallback list
    return Object.keys(FALLBACK_RATES)
      .map(code => ({ key: code, name: code, symbol: code }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }
}

export function getCachedRates() {
  return ratesCache;
}

// Pre-load rates (non-blocking)
getRates().catch(e => console.warn("Pre-load failed:", e));
