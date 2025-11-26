// scripts/converter.js

import { conversionData } from "./units.js";

/**
 * Convert a value from one unit to another
 * @param {string} category - e.g., 'Length', 'Weight', 'Temperature', 'Currency'
 * @param {string} fromUnit - unit to convert from
 * @param {string} toUnit - unit to convert to
 * @param {number} value - numeric value to convert
 * @returns {number} converted value
 */
export function convert(category, fromUnit, toUnit, value) {
    const cat = conversionData[category];
    if (!cat) throw new Error(`Category "${category}" not found`);
    
    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];

    if (!from || !to) throw new Error(`Units "${fromUnit}" or "${toUnit}" not found in "${category}"`);

    // Temperature / special functions
    if (typeof from.toBase === "function") {
        const base = from.toBase(value);
        return to.fromBase(base);
    } else {
        const base = value * from.toBase; // multiply by conversion factor
        return base / to.toBase;
    }
}

/**
 * List all units for a category
 * @param {string} category
 * @returns {Array} array of unit names
 */
export function listUnits(category) {
    return Object.keys(conversionData[category]?.units || {});
}
