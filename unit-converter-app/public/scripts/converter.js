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
    // Returning NaN on invalid numeric input/error (from previous step)
    if (isNaN(value))
        return NaN;

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

    return Math.round(result * 1e6) / 1e6;
}

/**
 * List all units for a category
 */
export function listUnits(category) {
    return Object.keys(conversionData[category]?.units || []);
}

/**
 * Swap from/to units and values in UI
 */
export function swapUnits(el, callback) {
    const tmpUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tmpUnit;

    const tmpValue = el.fromValue.value;
    el.fromValue.value = el.toValue.value;
    el.toValue.value = tmpValue;

    // UX IMPROVEMENT: Focus the input field after swapping
    el.fromValue.focus();

    callback();
}

/**
 * Convert value and optionally save history
 */
// This function is now defined in ui.js to allow for the non-blocking change (see ui.js)
