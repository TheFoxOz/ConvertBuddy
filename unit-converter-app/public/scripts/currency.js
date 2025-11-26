// scripts/currency.js

import { conversionData } from "./units.js";

const API_KEY = "YOUR_API_KEY"; // replace with your exchangerate-api or similar
const BASE = "USD";

export async function fetchCurrencyRates() {
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${BASE}`);
        if (!res.ok) throw new Error("Failed to fetch currency rates");
        const data = await res.json();

        if (data.result !== "success") throw new Error("API error");

        const rates = data.rates;

        // Fill Currency units dynamically
        conversionData.Currency.units = {};
        for (const currency in rates) {
            conversionData.Currency.units[currency] = {
                name: `${currency} (${currency})`,
                toBase: v => v / rates[currency],
                fromBase: v => v * rates[currency]
            };
        }

        console.log("Currency rates loaded:", Object.keys(conversionData.Currency.units).length);
        return conversionData.Currency.units;
    } catch (error) {
        console.error("Error fetching currency rates:", error);
        return {};
    }
}
