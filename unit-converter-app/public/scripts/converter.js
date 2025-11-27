// scripts/converter.js - Main conversion logic
import { conversionData } from "./units.js";

/**
 * Lists all available units for a given category
 * @param {string} categoryKey - The category key (e.g., 'Length', 'Currency')
 * @returns {Promise<Array>} Array of unit objects
 */
export async function listUnits(categoryKey) {
    const category = conversionData[categoryKey];
    if (!category) {
        console.error(`Category "${categoryKey}" not found`);
        return [];
    }

    // Handle dynamic units (like Currency which needs to be fetched)
    if (category.list && typeof category.list === 'function') {
        return await category.list();
    }

    // Handle static units
    if (category.units) {
        return Object.keys(category.units).map(key => ({
            key,
            name: category.units[key].name || key,
            symbol: category.units[key].symbol || key
        }));
    }

    return [];
}

/**
 * Converts a value from one unit to another within a category
 * @param {string} categoryKey - The category key
 * @param {string} fromUnit - Source unit key
 * @param {string} toUnit - Target unit key
 * @param {number|string} value - Value to convert
 * @returns {Promise<number>} Converted value
 */
export async function convert(categoryKey, fromUnit, toUnit, value) {
    const category = conversionData[categoryKey];
    if (!category) {
        throw new Error(`Category "${categoryKey}" not found`);
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
        throw new Error('Invalid input value');
    }

    // Handle dynamic conversions (e.g., Currency with API)
    if (category.convert && typeof category.convert === 'function') {
        return await category.convert(fromUnit, toUnit, numValue);
    }

    // Handle static conversions
    const units = category.units;
    const fromUnitDef = units[fromUnit];
    const toUnitDef = units[toUnit];

    if (!fromUnitDef || !toUnitDef) {
        throw new Error(`Unit not found: ${fromUnit} or ${toUnit}`);
    }

    // Step 1: Convert to base unit
    let baseValue;
    if (typeof fromUnitDef.toBase === 'function') {
        baseValue = fromUnitDef.toBase(numValue);
    } else {
        baseValue = numValue * fromUnitDef.toBase;
    }

    // Step 2: Convert from base to target unit
    let result;
    if (typeof toUnitDef.fromBase === 'function') {
        result = toUnitDef.fromBase(baseValue);
    } else {
        result = baseValue / toUnitDef.toBase;
    }

    return result;
}

/**
 * Swaps the from/to units in the UI
 * @param {Object} DOM - DOM element references
 * @param {Function} callback - Function to call after swap (usually performConversion)
 */
export function swapUnits(DOM, callback) {
    const fromValue = DOM.fromValue.value;
    const fromUnit = DOM.fromUnit.value;
    const toUnit = DOM.toUnit.value;
    const toValue = DOM.toValue.value;

    // Swap the units
    DOM.fromUnit.value = toUnit;
    DOM.toUnit.value = fromUnit;

    // Swap the values
    DOM.fromValue.value = toValue.replace(',', '.'); // Handle French decimal format
    
    // Trigger conversion
    if (callback) callback();
}
