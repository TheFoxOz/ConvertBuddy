// scripts/currency.js

const API_KEY = "YOUR_EXCHANGERATE_API_KEY"; // <-- replace with your real key
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/GBP`;

export async function fetchCurrencyRates() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch currency rates");

        const data = await res.json();
        if (!data.conversion_rates) throw new Error("Malformed API response");

        return data.conversion_rates; // { USD: 1.26, EUR: 1.15, ... }

    } catch (err) {
        console.error("Currency API error:", err);
        alert("Could not load live currency rates. Try again later.");
        return {};
    }
}
