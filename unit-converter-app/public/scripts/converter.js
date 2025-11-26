// scripts/converter.js
import { conversionData } from "./units.js";

/**
 * Convert a value from one unit to another
 */
export function convert(category, fromUnit, toUnit, value) {
    const cat = conversionData[category];
    if (!cat) throw new Error(`Category "${category}" not found`);

    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];
    if (!from || !to) throw new Error(`Units "${fromUnit}" or "${toUnit}" not found in "${category}"`);

    value = Number(value);
    if (isNaN(value)) return 0;

    let base;
    try {
        base = typeof from.toBase === "function" ? from.toBase(value) : value * from.toBase;
    } catch (e) {
        console.warn(`Error converting from ${fromUnit} to base:`, e);
        return 0;
    }

    let result;
    try {
        result = typeof to.fromBase === "function" ? to.fromBase(base) : base / to.toBase;
    } catch (e) {
        console.warn(`Error converting base to ${toUnit}:`, e);
        return 0;
    }

    return Math.round(result * 1e6) / 1e6;
}

/**
 * List all units for a category
 */
export function listUnits(category) {
    return Object.keys(conversionData[category]?.units || []);
}

/**
 * Swap from/to units and values in UI
 */
export function swapUnits(el, callback) {
    const tmpUnit = el.fromUnit.value;
    el.fromUnit.value = el.toUnit.value;
    el.toUnit.value = tmpUnit;

    const tmpValue = el.fromValue.value;
    el.fromValue.value = el.toValue.value;
    el.toValue.value = tmpValue;

    callback();
}

/**
 * Convert value and optionally save history
 */
export async function convertValue(el, category, callback, saveHistory = true) {
    try {
        if (!el.fromValue.value || isNaN(Number(el.fromValue.value))) {
            el.toValue.value = "---";
            return;
        }

        const input = Number(el.fromValue.value);
        const output = convert(category, el.fromUnit.value, el.toUnit.value, input);
        el.toValue.value = output;

        if (saveHistory) {
            const { saveHistory: save } = await import("./firestore.js");
            await save({
                category,
                input,
                fromUnit: el.fromUnit.value,
                output,
                toUnit: el.toUnit.value,
                timestamp: Date.now()
            });
        }

        if (callback) callback();
    } catch (err) {
        console.error("Conversion error:", err);
        el.toValue.value = "---";
    }
}
