// converter.js
import { units } from './units.js';
import { fetchRates, getCachedRates } from './currency.js';

/**
 * Convert any unit or currency
 * @param {string} category - e.g., "length", "temperature", "currency"
 * @param {number} value - value to convert
 * @param {string} from - unit key
 * @param {string} to - unit key
 * @returns {Promise<number>} converted value
 */
export async function convert(category, value, from, to) {
  if (category === 'currency') {
    return convertCurrency(value, from, to);
  }

  const fromUnit = units[category][from];
  const toUnit = units[category][to];
  if (!fromUnit || !toUnit) throw new Error('Invalid unit');

  const baseValue = fromUnit.toBase(value);
  return toUnit.fromBase(baseValue);
}

/**
 * Currency conversion
 */
export async function convertCurrency(amount, from, to) {
  let ratesData = getCachedRates();
  if (!ratesData) ratesData = await fetchRates();

  const rates = ratesData.rates;
  if (!rates[from] || !rates[to]) throw new Error('Invalid currency');

  const result = (amount / rates[from]) * rates[to];
  return Math.round(result * 100) / 100; // round 2 decimals
}
