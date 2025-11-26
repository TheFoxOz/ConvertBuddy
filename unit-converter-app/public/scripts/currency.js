// scripts/currency.js
import { conversionData } from "./units.js";

export async function fetchCurrencyRates() {
    try {
        const res = await fetch("https://api.exchangerate.host/latest?base=USD");
        if (!res.ok) throw new Error("API call failed with status: " + res.status);

        const data = await res.json();
        conversionData.Currency.units = Object.fromEntries(
            Object.entries(data.rates).map(([code, rate]) => [
                code,
                { name: code, toBase: rate, symbol: code }
            ])
        );
        console.log("Currency rates loaded successfully.");
    } catch (e) {
        console.warn("Currency API failed, using static fallback:", e.message);
        conversionData.Currency.units = {
            USD: { name: "US Dollar", toBase: 1, symbol: "$" },
            EUR: { name: "Euro", toBase: 1.1, symbol: "€" },
            GBP: { name: "British Pound", toBase: 1.3, symbol: "£" }
        };
        console.log("Using static currency fallback rates.");
    }
}
