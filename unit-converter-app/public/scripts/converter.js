// scripts/converter.js
import { conversionData } from "./units.js";
 
/**
 * Convert a value from one unit to another
 */
export function convert(category, fromUnit, toUnit, value) {
    const cat = conversionData[category];
    if (!cat) throw new Error(`Category "${category}" not found`);

    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];
    if (!from || !to)
        throw new Error(`Units "${fromUnit}" or "${toUnit}" not found in "${category}"`);

    value = Number(value);
    // Returning NaN on invalid numeric input/error
    if (isNaN(value))
        return NaN;

    let base;
    try {
        // Step 1: Convert input value to the category's base unit
        base = typeof from.toBase === "function" ? from.toBase(value) : value * from.toBase;
    } catch (e) {
        console.warn(`Error converting from ${fromUnit} to base:`, e);
        return NaN;
    }

    let result;
    try {
        // Step 2: Convert base value to the target unit
        result = typeof to.fromBase === "function" ? to.fromBase(base) : base / to.toBase;
    } catch (e) {
        console.warn(`Error converting base to ${toUnit}:`, e);
        return NaN;
    }

    // Step 3: Apply configurable precision (defaulting to 6 if missing)
    const precision = cat.precision ?? 6;
    const factor = 10 ** precision;
    
    // FIX: Add a small offset (epsilon) to prevent floating point errors
    // e.g., turning 0.9999999999999999 into 1 when rounding
    const epsilon = Number.EPSILON;
    
    return Math.round((result + epsilon) * factor) / factor;
}
 
/**
 * List all unit details (key, name, symbol) for a category
 */
export function listUnits(category) {
    const units = conversionData[category]?.units;
    if (!units) return [];
    
    // Return an array of objects containing key, name, and symbol
    return Object.keys(units).map(key => ({
        key,
        name: units[key].name,
        symbol: units[key].symbol || units[key].name // Fallback to name if symbol is missing
    }));
}
 
/**
 * Swap from/to units and values in UI
 */
export function swapUnits(el, callback) {
    // Swap units
    const tmpUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tmpUnit;

    // Swap values (if 'to' is not empty)
    // Note: It's important to swap `toValue` only if it's a valid conversion result (not '---' or empty)
    if (el.toValue.value && el.toValue.value !== '---') {
        const tmpValue = el.fromValue.value;
        el.fromValue.value = el.toValue.value;
        el.toValue.value = tmpValue;
    }


    // UX IMPROVEMENT: Focus the input field after swapping
    el.fromValue.focus();

    callback();
}
