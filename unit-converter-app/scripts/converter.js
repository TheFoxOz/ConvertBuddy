import { conversionData } from './units.js';

export function convertValue(el, currentCategory) {
    const category = conversionData[currentCategory];
    const from = category.units[el.fromUnit.value];
    const to = category.units[el.toUnit.value];
    const input = parseFloat(el.fromValue.value);

    if (isNaN(input)) { el.toValue.value = "Invalid Input"; return; }

    let converted;
    if (currentCategory === "Temperature") {
        converted = to.fromBase(from.toBase(input));
    } else {
        converted = input * from.toBase / to.toBase;
    }

    const formatted = currentCategory === "Temperature" ? converted.toFixed(2) : Number(converted.toPrecision(12)).toString();
    el.toValue.value = (to.symbol ? to.symbol + " " : "") + formatted;
}

export function swapUnits(el, convertCallback) {
    const tempUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tempUnit;

    const numericToVal = parseFloat(el.toValue.value.replace(/[^\d.-]/g, ""));
    el.fromValue.value = isNaN(numericToVal) ? "" : numericToVal;

    convertCallback();
}
