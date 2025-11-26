// scripts/currency.js
import { conversionData } from "./units.js";
/**
 * Fetches currency rates and populates conversionData.Currency.units
 * Provides full list from API and fallback if API fails.
 */
export async function fetchCurrencyRates() {
    try {
        const res = await fetch("https://api.exchangerate.host/latest?base=USD");
        if (!res.ok) throw new Error("API call failed: " + res.status);

        const data = await res.json();

        // FIX: The full list is assigned here
        conversionData.Currency.units = Object.fromEntries(
            Object.entries(data.rates).map(([code, rate]) => [
                code,
                { name: code, toBase: rate, symbol: code }
            ])
        );
        console.log("Currency rates loaded:", Object.keys(conversionData.Currency.units).length);

    } catch (e) {
        console.warn("Currency API failed, using fallback:", e.message);

        // Fallback remains the small set
        conversionData.Currency.units = {
            USD: { name: "US Dollar", toBase: 1, symbol: "$" },
            EUR: { name: "Euro", toBase: 1.1, symbol: "€" },
            GBP: { name: "British Pound", toBase: 1.3, symbol: "£" }
        };
    }
}
