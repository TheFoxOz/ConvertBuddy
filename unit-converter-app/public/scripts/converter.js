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
    // CHANGE 1: Return NaN for invalid numeric input
    if (isNaN(value))
        return NaN; // Changed from 0

    let base;
    try {
        base = typeof from.toBase === "function" ? from.toBase(value) : value * from.toBase;
    } catch (e) {
        console.warn(`Error converting from ${fromUnit} to base:`, e);
        // CHANGE 2: Return NaN on conversion error
        return NaN; // Changed from 0
    }

    let result;
    try {
        result = typeof to.fromBase === "function" ? to.fromBase(base) : base / to.toBase;
    } catch (e) {
        console.warn(`Error converting base to ${toUnit}:`, e);
        // CHANGE 3: Return NaN on conversion error
        return NaN; // Changed from 0
    }

    return Math.round(result * 1e6) / 1e6;
}

// ... (listUnits, swapUnits, convertValue remain unchanged in this file)
