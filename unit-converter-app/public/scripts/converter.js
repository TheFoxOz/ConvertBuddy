// scripts/converter.js
import { conversionData } from "./units.js";
import { saveHistory } from "./firestore.js";

/**
 * Performs the unit conversion and optionally saves the history entry.
 * @param {object} el - DOM elements object
 * @param {string} category - Current conversion category
 * @param {function} onComplete - Callback to refresh UI history
 * @param {boolean} saveHistoryFlag - Whether to save this conversion to history (Default: true)
 */
export function convertValue(el, category, onComplete, saveHistoryFlag = true) {
    const data = conversionData[category];
    const from = data.units[el.fromUnit.value];
    const to = data.units[el.toUnit.value];
    const input = parseFloat(el.fromValue.value);

    if (isNaN(input)) {
        el.toValue.value = "";
        return;
    }

    let converted;
    if (category === "Temperature") {
        converted = to.fromBase(from.toBase(input));
    } else {
        converted = input * from.toBase / to.toBase;
    }

    const formatted = category === "Temperature"
        ? converted.toFixed(2)
        : Number(converted.toPrecision(12)).toString().replace(/\.?0+$/, "");

    el.toValue.value = (to.symbol ? to.symbol + " " : "") + formatted;

    if (saveHistoryFlag) { // Check flag before saving
        saveHistory({
            category,
            fromUnit: el.fromUnit.value,
            toUnit: el.toUnit.value,
            input,
            output: el.toValue.value,
            timestamp: Date.now()
        });
    }

    if (onComplete) onComplete();
}

/**
 * Swap 'from' and 'to' units and values safely
 */
export function swapUnits(el, callback) {
    const tempUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tempUnit;

    const numeric = parseFloat(el.toValue.value.replace(/[^\d.-]/g, ''));
    el.fromValue.value = isNaN(numeric) ? "" : numeric;

    if (callback) callback();
}
