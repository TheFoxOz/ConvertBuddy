// scripts/currency.js

// --- CONFIGURATION ---
const API_KEY = "b55c79e2ac77eeb4091f0253";
const BASE_CURRENCY = "USD";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const CURRENCY_CACHE_KEY = "currencyRates";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// ---------------------

/**
 * Fetches currency rates from the API and stores them in localStorage.
 * @returns {Promise<object | null>} Rates object or null on failure.
 */
async function fetchCurrencyRates() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API response failed: ${response.status}`);
        
        const data = await response.json();
        if (data.result !== "success" || !data.conversion_rates) {
            console.error("Currency API returned invalid data.");
            return null;
        }

        const cacheData = {
            rates: data.conversion_rates,
            timestamp: Date.now(),
            base: data.base_code || BASE_CURRENCY
        };
        localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(cacheData));
        return data.conversion_rates;

    } catch (error) {
        console.warn("Failed to fetch currency rates:", error);
        return null;
    }
}

/**
 * Converts a value between two currencies using cached or freshly fetched rates.
 * @param {string} fromCode
 * @param {string} toCode
 * @param {number} value
 * @returns {number} Converted value (rounded to 4 decimals)
 */
export async function convertCurrency(fromCode, toCode, value) {
    let ratesData = getCachedRates();

    if (!ratesData) {
        const fetched = await fetchCurrencyRates();
        ratesData = getCachedRates();
        if (!ratesData) throw new Error("Currency rates unavailable.");
    }

    value = Number(value);
    if (isNaN(value)) return NaN;

    const rates = ratesData.rates;

    const fromRate = rates[fromCode];
    const toRate = rates[toCode];
    if (!fromRate) throw new Error(`Rate not available for ${fromCode}`);
    if (!toRate) throw new Error(`Rate not available for ${toCode}`);

    const result = (value / fromRate) * toRate;
    return Math.round((result + Number.EPSILON) * 10000) / 10000;
}

/**
 * Retrieves cached currency rates.
 * @returns {object|null}
 */
export function getCachedRates() {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse cached currency data:", e);
        localStorage.removeItem(CURRENCY_CACHE_KEY);
        return null;
    }
}

/**
 * Returns a list of available currencies.
 * @returns {Array<{key:string,name:string,symbol:string}>}
 */
export function listCurrencies() {
    const ratesData = getCachedRates();
    if (!ratesData) {
        return [
            { key: "USD", name: "US Dollar", symbol: "USD" },
            { key: "EUR", name: "Euro", symbol: "EUR" },
            { key: "GBP", name: "British Pound", symbol: "GBP" }
        ];
    }

    return Object.keys(ratesData.rates)
        .map(code => ({ key: code, name: code, symbol: code }))
        .sort((a, b) => a.key.localeCompare(b.key));
}

// Auto-fetch on script load if cache is missing or stale
const cached = getCachedRates();
if (!cached || (Date.now() - cached.timestamp > ONE_DAY_MS)) {
    fetchCurrencyRates();
}
