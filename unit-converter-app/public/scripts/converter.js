// scripts/converter.js
import { conversionData } from "./units.js";

/**
 * Convert a value from one unit to another
 * MUST BE ASYNC to handle custom async converters (like Currency).
 */
export async function convert(category, fromUnit, toUnit, value) {
  const cat = conversionData[category];
  if (!cat) throw new Error(`Category "${category}" not found`);

  // If category has a custom convert (Currency), use it
  if (typeof cat.convert === "function") {
    try {
      return await cat.convert(fromUnit, toUnit, value);
    } catch (e) {
      console.error(`Custom conversion failed for ${category}:`, e);
      return NaN;
    }
  }

  // Standard linear conversions
  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) throw new Error(`Units "${fromUnit}" or "${toUnit}" not found in "${category}"`);

  value = Number(value);
  if (isNaN(value)) return NaN;

  let base;
  try {
    base = typeof from.toBase === "function" ? from.toBase(value) : value * from.toBase;
  } catch (e) {
    console.warn(`Error converting from ${fromUnit} to base:`, e);
    return NaN;
  }

  let result;
  try {
    result = typeof to.fromBase === "function" ? to.fromBase(base) : base / to.toBase;
  } catch (e) {
    console.warn(`Error converting base to ${toUnit}:`, e);
    return NaN;
  }

  const precision = cat.precision ?? 6;
  const factor = 10 ** precision;
  const epsilon = Number.EPSILON;
  return Math.round((result + epsilon) * factor) / factor;
}

/**
 * List units for a category as an array of { key, name, symbol }.
 * Works asynchronously for categories like Currency.
 */
export async function listUnits(category) {
  const cat = conversionData[category];
  if (!cat) return [];

  if (typeof cat.list === "function") {
    try {
      // expected to return array of { key, name, symbol }
      return await cat.list();
    } catch (e) {
      console.warn(`Custom list failed for ${category}:`, e);
      return [];
    }
  }

  // Static units (object)
  const units = cat.units || {};
  return Object.keys(units).map(key => ({
    key,
    name: units[key].name ?? key,
    symbol: units[key].symbol ?? units[key].name ?? key
  }));
}

/**
 * Swap from/to unit selects and optionally swap values (UI delegate)
 */
export function swapUnits(domElements, rerunCallback) {
  // swap the selected units
  const tmp = domElements.fromUnit.value;
  domElements.fromUnit.value = domElements.toUnit.value;
  domElements.toUnit.value = tmp;

  // only swap values if toValue is a valid number
  const toVal = parseFloat(domElements.toValue.value);
  if (!Number.isNaN(toVal)) {
    const tmpVal = domElements.fromValue.value;
    domElements.fromValue.value = domElements.toValue.value;
    domElements.toValue.value = tmpVal;
  }

  domElements.fromValue?.focus();

  // rerun conversion
  if (typeof rerunCallback === "function") rerunCallback();
}
