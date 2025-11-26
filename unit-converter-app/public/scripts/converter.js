// scripts/converter.js

import { conversionData } from "./units.js";
import { saveHistoryEntry } from "./firestore.js";

/* ------------------------- */
/* MAIN CONVERSION FUNCTION  */
/* ------------------------- */

export function convertValue(el, category, onComplete, storeHistory = true) {
    const input = parseFloat(el.fromValue.value);
    if (isNaN(input)) {
        el.toValue.value = "";
        return;
    }

    let result;

    if (category === "Temperature") {
        result = convertTemperature(
            input,
            el.fromUnit.value,
            el.toUnit.value
        );
    } else if (category === "Currency") {
        result = convertCurrency(
            input,
            el.fromUnit.value,
            el.toUnit.value
        );
    } else {
        result = convertStandard(
            input,
            category,
            el.fromUnit.value,
            el.toUnit.value
        );
    }

    el.toValue.value = Number(result.toFixed(6));

    if (storeHistory) {
        saveHistoryEntry({
            category,
            input,
            output: Number(result.toFixed(6)),
            fromUnit: el.fromUnit.value,
            toUnit: el.toUnit.value,
            timestamp: Date.now()
        });
    }

    if (onComplete) onComplete();
}

/* ------------------------- */
/* STANDARD CONVERSIONS     */
/* ------------------------- */

function convertStandard(value, category, from, to) {
    const units = conversionData[category].units;

    const fromBase = units[from].toBase;
    const toBase = units[to].toBase;

    return (value * fromBase) / toBase;
}

/* ------------------------- */
/* TEMPERATURE CONVERSIONS  */
/* ------------------------- */

function convertTemperature(value, from, to) {
    // Convert to °C first
    let celsius;

    if (from === "Celsius") celsius = value;
    else if (from === "Fahrenheit") celsius = (value - 32) * (5 / 9);
    else if (from === "Kelvin") celsius = value - 273.15;

    // Convert from °C to target
    if (to === "Celsius") return celsius;
    if (to === "Fahrenheit") return celsius * (9 / 5) + 32;
    if (to === "Kelvin") return celsius + 273.15;

    return value;
}

/* ------------------------- */
/* CURRENCY CONVERSION      */
/* ------------------------- */

function convertCurrency(value, from, to) {
    const units = conversionData.Currency.units;

    const rateFrom = units[from].rate;
    const rateTo = units[to].rate;

    // Everything uses GBP as the API base
    return value * (rateTo / rateFrom);
}

/* ------------------------- */
/* SWAP UNITS BUTTON        */
/* ------------------------- */

export function swapUnits(el, callback) {
    const temp = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = temp;

    callback();
}
