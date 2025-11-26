import { conversionData } from "./units.js";

export const currencySymbols = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹",
    KRW: "₩", CHF: "Fr", AUD: "$", CAD: "$", NZD: "$", RUB: "₽",
    MXN: "$", SGD: "$", HKD: "$", BRL: "R$", IDR: "Rp", ZAR: "R"
};

export async function fetchCurrencyRates(API_KEY, BASE_URL, el) {
    const STORAGE_KEY = "currencyRates";
    el.loading.classList.remove("hidden");

    let rates = {};
    const cached = localStorage.getItem(STORAGE_KEY);

    if (cached) {
        try { rates = JSON.parse(cached); } catch {}
    }

    try {
        const res = await fetch(`${BASE_URL}${API_KEY}/latest/USD`);
        const data = await res.json();

        if (data.result === "success") {
            rates = data.conversion_rates;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
            el.currencyInfo.textContent = "Live rates";
        }
    } catch {
        el.currencyInfo.textContent = cached ? "Cached rates" : "No rates available";
    }

    conversionData.Currency.units = Object.fromEntries(
        Object.entries(rates).map(([code, rate]) => [
            code,
            { name: code, toBase: 1 / rate, symbol: currencySymbols[code] || code }
        ])
    );

    el.loading.classList.add("hidden");
}
