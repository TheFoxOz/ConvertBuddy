// scripts/converter.js
import { conversionData } from "./units.js";
import { saveHistory } from "./firestore.js";

export function convertValue(el, category) {
    const data = conversionData[category];
    const from = data.units[el.fromUnit.value];
    const to = data.units[el.toUnit.value];
    const input = parseFloat(el.fromValue.value);

    if (isNaN(input)) {
        el.toValue.value = "Invalid Input";
        return;
    }

    let converted;

    if (category === "Temperature") {
        converted = to.fromBase(from.toBase(input));
    } else {
        converted = input * from.toBase / to.toBase;
    }

    const formatted =
        category === "Temperature"
            ? converted.toFixed(2)
            : Number(converted.toPrecision(12)).toString();

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
}

export function swapUnits(el, callback) {
    const temp = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = temp;

    const numeric = parseFloat(el.toValue.value.replace(/[^\d.-]/g, ""));
    el.fromValue.value = isNaN(numeric) ? "" : numeric;

    callback();
}
