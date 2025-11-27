// scripts/converter.js

import { conversionData } from "./units.js";
 
/**
 * Convert a value from one unit to another
 * MUST BE ASYNC to handle custom async converters (like Currency).
 */
export async function convert(category, fromUnit, toUnit, value) {
    const cat = conversionData[category];
    if (!cat) throw new Error(`Category "${category}" not found`);

    // 1. ASYNC CHECK: Use the custom converter function if defined (e.g., Currency)
    if (typeof cat.convert === "function") {
        try {
            return await cat.convert(fromUnit, toUnit, value);
        } catch (e) {
            console.error(`Custom conversion failed for ${category}:`, e);
            return NaN;
        }
    }
    
    // --- Standard Linear Conversion Logic ---
    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];
    if (!from || !to)
        throw new Error(`Units "${fromUnit}" or "${toUnit}" not found in "${category}"`);
 
    value = Number(value);
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
 
    // Step 3: Apply configurable precision
    const precision = cat.precision ?? 6;
    const factor = 10 ** precision;
    const epsilon = Number.EPSILON;
    
    return Math.round((result + epsilon) * factor) / factor;
}
 
/**
 * List all unit details (key, name, symbol) for a category
 * MUST BE ASYNC to handle custom async listers (like Currency).
 */
export async function listUnits(category) {
    const cat = conversionData[category];
    if (!cat) return [];
 
    // ASYNC CHECK: Use the custom listing function if defined (e.g., Currency)
    if (typeof cat.list === "function") {
        try {
            return await cat.list();
        } catch (e) {
            console.warn(`Custom unit listing failed for ${category}:`, e);
            // Return empty or a default list if fetching fails
            return [];
        }
    }
 
    // Standard static unit listing
    const units = cat.units;
    return Object.keys(units).map(key => ({
        key,
        name: units[key].name,
        symbol: units[key].symbol || units[key].name
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
 
    // FIX: Only swap the *values* if the result is a valid number, not '---' or empty.
    // However, the cleanest fix is simply to rely on the callback to re-run the conversion.
    // If we swap the unit dropdowns, the `change` event might fire, but since we call 
    // `callback()` (which is `performConversion`), we just need the new units set.
    // If the user wants to convert the *result* back to the *input*, they should have 
    // a valid number. We perform the value swap only if `toValue` is a convertible number.
    if (!isNaN(parseFloat(el.toValue.value))) {
        const tmpValue = el.fromValue.value;
        el.fromValue.value = el.toValue.value;
        el.toValue.value = tmpValue;
    }
 
    el.fromValue.focus();
 
    // Reruns the conversion based on the new inputs and new units
    callback();
}
