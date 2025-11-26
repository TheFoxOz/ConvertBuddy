// scripts/currency.js
import { conversionData } from "./units.js";
 
const API_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_KEY = "currencyRates";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
 
export async function fetchCurrencyRates() {
    let cached = {};
    const now = Date.now();
 
    // CHANGE: Added try/catch around JSON.parse for defensive programming
    try {
        cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch (e) {
        console.warn("Error parsing cached currency rates, forcing live fetch.", e);
        // We will proceed with an empty cache object
    }
 
    if (cached.timestamp && (now - cached.timestamp < CACHE_EXPIRY) && cached.rates) {
        console.log("Using cached currency rates");
        return cached.rates;
    }
 
    // Fetch live rates
    try {
        const res = await fetch(API_URL);
        // ... (rest of the successful fetch logic is unchanged)
        if (!res.ok) throw new Error("Failed to fetch currency rates");
        const data = await res.json();
        if (data.result !== "success") throw new Error("API returned error");
 
        const rates = data.rates;
 
        // Save to localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: now,
            rates
        }));
 
        console.log("Live currency rates fetched");
        return rates;
    } catch (err) {
        console.warn("Currency fetch failed, using cache if available", err);
        return cached.rates || {};
    }
}
