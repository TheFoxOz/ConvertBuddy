import { conversionData } from './units.js';

export const currencySymbols = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹",
    KRW: "₩", CHF: "Fr", AUD: "$", CAD: "$", NZD: "$", RUB: "₽",
    MXN: "$", SGD: "$", HKD: "$", BRL: "R$", IDR: "Rp", ZAR: "R"
};

export async function fetchCurrencyRates(CURRENCY_API_KEY, CURRENCY_API_BASE_URL, el) {
    const STORAGE_KEY = "universalConverterRates";
    el.loading.classList.remove("hidden");

    let currencyRates = {};
    const storedRates = localStorage.getItem(STORAGE_KEY);
    if (storedRates) {
        try { currencyRates = JSON.parse(storedRates); } catch {}
    }

    try {
        const res = await fetch(`${CURRENCY_API_BASE_URL}${CURRENCY_API_KEY}/latest/USD`);
        const data = await res.json();
        if (data.result === "success") {
            currencyRates = data.conversion_rates;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currencyRates));
        }
    } catch { console.warn("Currency API failed — using cached rates."); }

    conversionData.Currency.units = Object.fromEntries(
        Object.entries(currencyRates).map(([code, rate]) => [
            code,
            { name: code, toBase: 1 / rate, symbol: currencySymbols[code] ?? code }
        ])
    );

    el.currencyInfo.textContent = storedRates ? "Cached rates" : "Live rates";
    el.loading.classList.add("hidden");
}
