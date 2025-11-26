// scripts/converter.js
import { conversionData } from "./units.js";
import { saveHistory } from "./firestore.js";

/**
 * Performs the unit conversion and saves the history entry.
 * @param {object} el - The object containing all relevant DOM elements.
 * @param {string} category - The current conversion category (e.g., "Length").
 * @param {function} onComplete - Callback to refresh the UI history after saving.
 */
export function convertValue(el, category, onComplete) {
    const data = conversionData[category];
    const from = data.units[el.fromUnit.value];
    const to = data.units[el.toUnit.value];
    const input = parseFloat(el.fromValue.value);

    if (isNaN(input)) {
        el.toValue.value = "Invalid Input";
        return; // Prevents history save for invalid input
    }

    let converted;

    if (category === "Temperature") {
        // Non-linear conversion: To Base -> From Base
        converted = to.fromBase(from.toBase(input));
    } else {
        // Linear conversion: Input * From Base / To Base
        converted = input * from.toBase / to.toBase;
    }

    let formatted;

    if (category === "Temperature") {
        // Temperature uses fixed decimals for consistency
        formatted = converted.toFixed(2);
    } else {
        // Use toLocaleString for better UX (no scientific notation, handles grouping)
        formatted = converted.toLocaleString(undefined, {
            maximumFractionDigits: 12, // High precision
            useGrouping: true // e.g., 1,000,000
        });
    }

    const output = (to.symbol ? to.symbol + " " : "") + formatted;
    el.toValue.value = output;

    // Save history entry
    saveHistory({
        category,
        fromUnit: el.fromUnit.value,
        toUnit: el.toUnit.value,
        input,
        output,
        timestamp: Date.now()
    });
    
    // Call the callback function to refresh the UI history
    if (onComplete) {
        onComplete(); 
    }
}

/**
 * Swaps the 'from' and 'to' units and values.
 * @param {object} el - The object containing all relevant DOM elements.
 * @param {function} callback - Function to run after swapping (i.e., convertValue).
 */
export function swapUnits(el, callback) {
    // Swap units
    const tempUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tempUnit;

    // Sanitize the output value (which may contain grouping commas) and set it as the new input
    const numeric = parseFloat(el.toValue.value.replace(/[^\d.-]/g, ""));
    el.fromValue.value = isNaN(numeric) ? "" : numeric;

    callback();
}
