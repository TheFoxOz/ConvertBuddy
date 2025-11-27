// scripts/currency.js
 
// --- CONFIGURATION ---
const API_KEY = "b55c79e2ac77eeb4091f0253";
const BASE_CURRENCY = "USD"; // The base currency the API returns rates against
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const CURRENCY_CACHE_KEY = "currencyRates";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// ---------------------
 
/**
 * Fetches currency rates from the API, falling back to cache if necessary.
 * Rates are stored in localStorage for immediate access by the application 
 * even if the Service Worker doesn't respond immediately.
 * @returns {Promise<object | null>} A promise that resolves with the rates object, or null on failure.
 */
async function fetchCurrencyRates() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            console.error(`API response failed with status: ${response.status}`);
            return null;
        }
 
        const data = await response.json();
 
        // Check for success status and presence of rates (key for this API is 'conversion_rates')
        if (data.result !== "success" || !data.conversion_rates) {
            console.error("Currency API returned an unsuccessful result or missing rates.");
            return null;
        }
 
        // Store rates and the timestamp in localStorage for synchronous access in the app
        const cacheData = {
            rates: data.conversion_rates, // Key name adjusted for the new API
            timestamp: Date.now(),
            base: data.base_code || BASE_CURRENCY
        };
        localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(cacheData));
        
        return data.conversion_rates;
        
    } catch (error) {
        console.warn("Failed to fetch currency rates (network/API error).", error);
        return null;
    }
}
 
/**
 * Converts a value between two currency codes.
 * This function uses rates stored in localStorage or attempts a fresh fetch if missing/stale.
 * @param {string} fromCode - The currency code to convert from (e.g., 'USD').
 * @param {string} toCode - The currency code to convert to (e.g., 'EUR').
 * @param {number} value - The numerical value to convert.
 * @returns {number} The converted value, rounded to 4 decimal places.
 */
export async function convertCurrency(fromCode, toCode, value) {
    let ratesData = getCachedRates();
 
    if (!ratesData) {
        // If no rates in localStorage, try a fresh fetch
        const fetchedRates = await fetchCurrencyRates();
        if (fetchedRates) {
            // ratesData must be populated if the fetch was successful
            ratesData = getCachedRates();
        } else {
            // Cannot convert without rates
            throw new Error("Currency rates are unavailable.");
        }
    }
    
    // Ensure value is a number
    value = Number(value);
    if (isNaN(value) || value <= 0) return NaN;
 
    const rates = ratesData.rates;
    // const baseCode = ratesData.base; // Already known to be BASE_CURRENCY (USD)
 
    // 1. Convert FROM currency to the base currency (USD)
    // Formula: BaseValue = InputValue / FromRate
    const fromRate = rates[fromCode];
    if (!fromRate) throw new Error(`Currency rate not available for ${fromCode}`);
    const baseValue = value / fromRate;
 
    // 2. Convert base currency (USD) to the TO currency
    // Formula: Result = BaseValue * ToRate
    const toRate = rates[toCode];
    if (!toRate) throw new Error(`Currency rate not available for ${toCode}`);
    const result = baseValue * toRate;
 
    // Round the result to standard currency precision (4 decimal places is common)
    const precision = 4;
    const factor = 10 ** precision;
    const epsilon = Number.EPSILON; 
    
    return Math.round((result + epsilon) * factor) / factor;
}
 
/**
 * Retrieves rates from localStorage.
 */
export function getCachedRates() {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Error parsing currency cache:", e);
            localStorage.removeItem(CURRENCY_CACHE_KEY);
            return null;
        }
    }
    return null;
}
 
/**
 * Lists all available currency codes and names.
 * @returns {Array<{key: string, name: string, symbol: string}>}
 */
export function listCurrencies() {
    const ratesData = getCachedRates();
    if (!ratesData) {
        // Fallback list if rates aren't available yet
        return [
            { key: "USD", name: "US Dollar", symbol: "USD" },
            { key: "EUR", name: "Euro", symbol: "EUR" },
            { key: "GBP", name: "British Pound", symbol: "GBP" }
        ];
    }
    
    const rates = ratesData.rates;
    // Map the rate codes to a structured format (using the code as both name and symbol for simplicity)
    return Object.keys(rates).map(code => ({
        key: code,
        name: code,
        symbol: code 
    })).sort((a, b) => a.key.localeCompare(b.key));
}
 
// Automatically initiate the fetch when the script loads to populate the cache
const cached = getCachedRates();
if (!cached || (Date.now() - cached.timestamp > ONE_DAY_MS)) {
    fetchCurrencyRates();
}
