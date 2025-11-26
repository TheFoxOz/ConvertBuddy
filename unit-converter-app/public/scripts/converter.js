// scripts/converter.js
import { conversionData } from "./units.js";
import { saveHistory } from "./firestore.js";

/**
 * Performs the unit conversion and saves the history entry.
 * @param {object} el - DOM elements object
 * @param {string} category - Current conversion category
 * @param {function} onComplete - Callback to refresh UI history
 */
export function convertValue(el, category, onComplete) {
    const data = conversionData[category];
    const from = data.units[el.fromUnit.value];
    const to = data.units[el.toUnit.value];
    const input = parseFloat(el.fromValue.value);

    if (isNaN(input)) {
        el.toValue.value = ""; // Clear output for invalid input
        return; // Do not save invalid input
    }

    let converted;

    if (category === "Temperature") {
        converted = to.fromBase(from.toBase(input));
    } else {
        converted = input * from.toBase / to.toBase;
    }

    let formatted;
    
    if (category === "Temperature") {
        // Temperature uses fixed decimals for consistency
        formatted = converted.toFixed(2);
    } else {
        // Use toPrecision(12), then convert to string to prevent scientific notation, 
        // then remove trailing zeros.
        formatted = Number(converted.toPrecision(12)).toString().replace(/\.?0+$/, ""); 
    }

    // Only show symbol in output field, never in input
    el.toValue.value = (to.symbol ? to.symbol + " " : "") + formatted;

    // Save history
    saveHistory({
        category,
        fromUnit: el.fromUnit.value,
        toUnit: el.toUnit.value,
        input,
        output: el.toValue.value,
        timestamp: Date.now()
    });

    if (onComplete) onComplete();
}

/**
 * Swap 'from' and 'to' units and values safely
 * @param {object} el - DOM elements object
 * @param {function} callback - Function to run after swapping (i.e., convertValue).
 */
export function swapUnits(el, callback) {
    // Swap units
    const tempUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tempUnit;

    // Remove all non-numeric characters (including symbols and spaces) before assigning input
    // The previous regex /[^\d.-]/g is sufficient as it strips all non-digit, non-decimal, non-minus chars.
    const numeric = parseFloat(el.toValue.value.replace(/[^\d.-]/g, ''));
    el.fromValue.value = isNaN(numeric) ? "" : numeric;

    if (callback) callback();
}
