// scripts/converter.js
import { units, categories } from './units.js';
import { fetchRates, getCachedRates } from './currency.js';

// Convert a value from one unit to another
export async function convert(category, fromKey, toKey, value) {
    const val = parseFloat(value);
    if (isNaN(val)) return null;

    if (category === 'Currency') {
        const ratesData = await fetchRates();
        const rates = ratesData.rates;
        const fromRate = rates[fromKey];
        const toRate = rates[toKey];
        if (!fromRate || !toRate) return null;
        return (val / fromRate) * toRate;
    } else {
        const fromUnit = units[category][fromKey];
        const toUnit = units[category][toKey];
        const baseValue = fromUnit.toBase(val);
        return toUnit.fromBase(baseValue);
    }
}

// Return units for a category
export async function listUnits(category) {
    if (!units[category]) return {};
    return units[category];
}

// Swap two values
export function swapUnitsValues(fromValue, toValue) {
    return [toValue, fromValue];
}
