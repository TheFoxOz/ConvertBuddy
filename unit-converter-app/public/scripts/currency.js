// scripts/currency.js - Version corrigée et fonctionnelle
import { initializeFirebase } from "./firebase.js";

const API_KEY = "b55c79e2ac77eeb4091f0253";
const BASE_CURRENCY = "USD";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const CACHE_DOC = "latest_rates";
const CACHE_COLLECTION = "currency_cache";
const ONE_DAY = 24 * 60 * 60 * 1000;

let ratesCache = null;

/**
 * Récupère les taux (cache ou frais)
 */
export async function getRates() {
  if (ratesCache && Date.now() - ratesCache.timestamp < ONE_DAY) {
    return ratesCache.rates;
  }

  const { db } = await initializeFirebase();

  if (db) {
    try {
      const doc = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
      const docRef = doc.doc(db, CACHE_COLLECTION, CACHE_DOC);
      const snapshot = await doc.getDoc(docRef);

      if (snapshot.exists()) {
        ratesCache = snapshot.data();
        if (Date.now() - ratesCache.timestamp < ONE_DAY) {
          return ratesCache.rates;
        }
      }
    } catch (e) {
      console.warn("Firestore cache read failed", e);
    }
  }

  // Sinon → fetch API
  return await refreshRates();
}

/**
 * Force le rafraîchissement des taux
 */
async function refreshRates() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.result !== "success") throw new Error("API failed");

    const newCache = {
      rates: data.conversion_rates,
      timestamp: Date.now(),
      base: data.base_code
    };

    ratesCache = newCache;

    // Sauvegarde en arrière-plan
    const { db } = await initializeFirebase();
    if (db) {
      try {
        const firestore = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
        await firestore.setDoc(firestore.doc(db, CACHE_COLLECTION, CACHE_DOC), newCache);
      } catch (e) {
        console.warn("Failed to save rates to Firestore", e);
      }
    }

    return newCache.rates;
  } catch (e) {
    console.error("Currency refresh failed", e);
    if (ratesCache) return ratesCache.rates; // fallback
    throw e;
  }
}

// === Exports publics ===

export async function convertCurrency(from, to, amount) {
  if (from === to) return amount;

  const rates = await getRates();
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) throw new Error(`Currency not supported: ${from} → ${to}`);

  return (amount / fromRate) * toRate;
}

export async function listCurrencies() {
  try {
    const rates = await getRates();
    return Object.keys(rates)
      .map(code => ({ key: code, name: code, symbol: code }))
      .sort((a, b) => a.key.localeCompare(b.key));
  } catch {
    // Fallback minimal
    return [
      { key: "USD", name: "USD", symbol: "USD" },
      { key: "EUR", name: "EUR", symbol: "EUR" },
      { key: "GBP", name: "GBP", symbol: "GBP" },
    ];
  }
}

export function getCachedRates() {
  return ratesCache;
}

// Pré-charge au démarrage
getRates().catch(() => {});
