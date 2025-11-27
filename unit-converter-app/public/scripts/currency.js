// scripts/currency.js

// --- CONFIG ---
const API_KEY = "b55c79e2ac77eeb4091f0253";
const BASE_CURRENCY = "USD";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
const CURRENCY_CACHE_KEY = "currencyRates";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// --------------

// Fetches and caches rates (returns { rates, timestamp, base })
export async function fetchCurrencyRates() {
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
    localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(cacheData));
    return cacheData;
  } catch (e) {
    console.warn("Failed to fetch currency rates:", e);
    return null;
  }
}

// Convert two currency codes using cached or freshly fetched rates.
export async function convertCurrency(fromCode, toCode, value) {
  let ratesData = getCachedRates();
  if (!ratesData || !ratesData.rates) {
    const fetched = await fetchCurrencyRates();
    if (fetched) ratesData = getCachedRates();
    else throw new Error("Currency rates unavailable");
  }

  value = Number(value);
  if (isNaN(value)) return NaN;

  const rates = ratesData.rates;
  const fromRate = rates[fromCode];
  const toRate = rates[toCode];
  if (!fromRate || !toRate) throw new Error(`Rate missing for ${fromCode} or ${toCode}`);

  // Convert = (value / fromRate) * toRate  (both rates relative to BASE_CURRENCY)
  const result = (value / fromRate) * toRate;
  const precision = 4;
  const factor = 10 ** precision;
  return Math.round((result + Number.EPSILON) * factor) / factor;
}

export function getCachedRates() {
  const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse currency cache:", e);
    localStorage.removeItem(CURRENCY_CACHE_KEY);
    return null;
  }
}

// Returns array of currencies available (from cache) or fallback 3.
export function listCurrencies() {
  const cached = getCachedRates();
  if (!cached || !cached.rates) {
    return [
      { key: "USD", name: "US Dollar", symbol: "USD" },
      { key: "EUR", name: "Euro", symbol: "EUR" },
      { key: "GBP", name: "British Pound", symbol: "GBP" }
    ];
  }
  return Object.keys(cached.rates).map(code => ({ key: code, name: code, symbol: code })).sort((a,b) => a.key.localeCompare(b.key));
}

// Auto-refresh cache in background if missing or stale (fire-and-forget)
const cached = getCachedRates();
if (!cached || (Date.now() - (cached.timestamp || 0) > ONE_DAY_MS)) {
  // don't await here; background refresh is fine
  fetchCurrencyRates();
}
