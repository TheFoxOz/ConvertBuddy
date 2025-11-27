// converter.js
import { getCachedRates, fetchCurrencyRates } from './currency.js';
import units from './units.js';

/**
 * Convert any unit or currency
 * @param {string} category - e.g., "Length", "Temperature", "Currency"
 * @param {number} value - input value
 * @param {string} from - unit to convert from
 * @param {string} to - unit to convert to
 * @returns {number} converted value
 */
export async function convert(category, value, from, to) {
  if (!units[category]) throw new Error(`Unknown category: ${category}`);

  if (category === 'Currency') {
    return await convertCurrency(value, from, to);
  }

  const { units: categoryUnits } = units[category];
  if (!categoryUnits[from] || !categoryUnits[to]) throw new Error(`Unknown units`);

  const baseValue = toBase(category, value, from);
  return fromBase(category, baseValue, to);
}

// Convert to base unit
function toBase(category, value, unit) {
  const u = units[category].units[unit];
  return typeof u.toBase === 'function' ? u.toBase(value) : value * u.toBase;
}

// Convert from base unit
function fromBase(category, value, unit) {
  const u = units[category].units[unit];
  return typeof u.fromBase === 'function' ? u.fromBase(value) : value * u.fromBase;
}

/**
 * Currency conversion using cached rates
 */
export async function convertCurrency(amount, from, to) {
  let rates = getCachedRates();

  if (!rates || !rates[from] || !rates[to]) {
    rates = await fetchCurrencyRates();
  }

  if (!rates[from] || !rates[to]) {
    throw new Error('Currency rates not available');
  }

  const converted = (amount / rates[from]) * rates[to];
  return Math.round(converted * 100) / 100; // round to 2 decimals
}
