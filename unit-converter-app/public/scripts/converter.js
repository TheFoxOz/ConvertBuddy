import { conversionData } from "./units.js";
import { addConversionToHistory } from "./firestore.js"; 
// The above function will safely do nothing if Firestore is not initialized.

export function convertValue(el, category) {
    const data = conversionData[category];
    const fromUnitKey = el.fromUnit.value;
    const toUnitKey = el.toUnit.value;

    const from = data.units[fromUnitKey];
    const to = data.units[toUnitKey];
    const input = parseFloat(el.fromValue.value);

    if (isNaN(input)) {
        el.toValue.value = "Invalid Input";
        return;
    }

    let converted;

    // ---------------------------
    // TEMPERATURE
    // ---------------------------
    if (category === "Temperature") {
        converted = to.fromBase(from.toBase(input));
    }

    // ---------------------------
    // NORMAL MULTIPLICATIVE UNITS
    // ---------------------------
    else {
        converted = input * (from.toBase / to.toBase);
    }

    // ---------------------------
    // FORMATTING
    // ---------------------------
    const formatted =
        category === "Temperature"
            ? converted.toFixed(2)
            : Number(converted.toPrecision(12)).toString();

    const finalOutput = (to.symbol ? to.symbol + " " : "") + formatted;
    el.toValue.value = finalOutput;

    // ---------------------------
    // SAVE TO HISTORY (Firestore or local fallback)
    // ---------------------------
    addConversionToHistory({
        category,
        fromUnit: fromUnitKey,
        toUnit: toUnitKey,
        input,
        output: finalOutput,
        timestamp: Date.now()
    });
}

export function swapUnits(el, callback) {
    const temp = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = temp;

    const numeric = parseFloat(el.toValue.value.replace(/[^\d.-]/g, ""));
    el.fromValue.value = isNaN(numeric) ? "" : numeric;

    callback();
}
