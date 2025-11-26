// scripts/currency.js
import { conversionData } from "./units.js";

/**
 * Fetches the latest currency rates and populates conversionData.
 * Includes a robust fallback mechanism.
 */
export async function fetchCurrencyRates() {
    try {
        // Using a reliable, free API for demonstration
        const res = await fetch("https://api.exchangerate.host/latest?base=USD");
        
        if (!res.ok) {
             throw new Error("API call failed with status: " + res.status);
        }

        const data = await res.json();
        
        // Map the rates object into the format required by conversionData
        conversionData.Currency.units = Object.fromEntries(
            Object.entries(data.rates).map(([code, rate]) => [
                code,
                // Note: Symbols are often difficult to get consistently, using code as name/symbol is safer
                { name: code, toBase: rate, symbol: code } 
            ])
        );
        console.log("Currency rates loaded successfully.");

    } catch (e) {
        console.warn("Currency API failed or fetching error:", e.message);
        
        // Fallback: Use static, hardcoded rates if API fails
        conversionData.Currency.units = {
            USD: { name: "US Dollar", toBase: 1, symbol: "$" },
            EUR: { name: "Euro", toBase: 1.1, symbol: "€" },
            GBP: { name: "British Pound", toBase: 1.3, symbol: "£" }
        };
        console.log("Using static currency fallback rates.");
    }
}
