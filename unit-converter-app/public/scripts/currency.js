// scripts/currency.js
import { conversionData } from "./units.js";

/**
 * Fetches currency rates and populates conversionData.Currency.units.
 * Provides full list from API and fallback if API fails.
 */
export async function fetchCurrencyRates() {
    try {
        const res = await fetch("https://api.exchangerate.host/latest?base=USD");
        if (!res.ok) throw new Error("API call failed: " + res.status);

        const data = await res.json();

        conversionData.Currency.units = Object.fromEntries(
            Object.entries(data.rates).map(([code, rate]) => [
                code,
                { 
                    // Format name for dropdown display (e.g., USD (USD))
                    name: `${code} (${code})`, 
                    toBase: rate, 
                    symbol: code 
                }
            ])
        );
        console.log("Currency rates loaded:", Object.keys(conversionData.Currency.units).length);

    } catch (e) {
        console.warn("Currency API failed, using static fallback:", e.message);

        // Fallback: A small set of currencies with manual symbols for display
        conversionData.Currency.units = {
            USD: { name: `USD ($)`, toBase: 1, symbol: "$" },
            EUR: { name: `EUR (€)`, toBase: 1.1, symbol: "€" },
            GBP: { name: `GBP (£)`, toBase: 1.3, symbol: "£" }
        };
    }
}
