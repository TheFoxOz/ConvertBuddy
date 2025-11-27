// scripts/currency.js

const API_URL = "https://open.er-api.com/v6/latest/USD";
const CURRENCY_CACHE_KEY = "currencyRates";

/**
 * Fetches currency rates from the API, falling back to cache if necessary.
 * Rates are stored in localStorage for immediate access by the application 
 * even if the Service Worker doesn't respond immediately.
 * @returns {Promise<object | null>} A promise that resolves with the rates object, or null on failure.
 */
async function fetchCurrencyRates() {
    try {
        // The fetch handler in sw.js uses a Cache-Then-Network strategy for this URL.
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            console.error(`API response failed with status: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.result !== "success" || !data.rates) {
            console.error("Currency API returned an unsuccessful result or missing rates.");
            return null;
        }

        // Store rates and the timestamp in localStorage for synchronous access in the app
        const cacheData = {
            rates: data.rates,
            timestamp: Date.now(),
            base: data.base_code || 'USD'
        };
        localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(cacheData));
        
        return data.rates;
        
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
            ratesData = { rates: fetchedRates, base: 'USD' }; // Assume base USD from API
        } else {
            // Cannot convert without rates
            return NaN;
        }
    }
    
    // Ensure value is a number
    value = Number(value);
    if (isNaN(value) || value <= 0) return NaN;

    const rates = ratesData.rates;
    const baseCode = ratesData.base;

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
 * Note: Does not check for staleness here, that check happens in the caller (e.g., in ui.js).
 */
export function getCachedRates() {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
    if (raw) {
        return JSON.parse(raw);
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
        // If rates aren't available yet, return an empty array or a default list.
        // Returning default 'USD' and 'EUR' is a good practice until the data is fetched.
        return [
            { key: "USD", name: "US Dollar", symbol: "$" },
            { key: "EUR", name: "Euro", symbol: "€" },
            { key: "GBP", name: "British Pound", symbol: "£" }
        ];
    }
    
    const rates = ratesData.rates;
    // Map the rate codes to a structured format (using the code as both key and name/symbol for simplicity)
    return Object.keys(rates).map(code => ({
        key: code,
        name: code,      // You could map this to a friendly name list if available
        symbol: code     // Or map to a symbol if available (e.g., from a separate data file)
    })).sort((a, b) => a.key.localeCompare(b.key));
}

// Automatically initiate the fetch when the script loads to populate the cache
// but only if the data is missing or very old (e.g., older than 1 day)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const cached = getCachedRates();
if (!cached || (Date.now() - cached.timestamp > ONE_DAY_MS)) {
    fetchCurrencyRates();
}
