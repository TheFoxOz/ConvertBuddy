// converter.js or utils.js

// Import the data structure defined in units.js
import { conversionData } from "./units.js"; 

/**
 * Converts a value from one unit to another based on the conversionData structure.
 * * @param {number} value - The numerical value to convert.
 * @param {string} sourceUnitName - The name of the source unit (e.g., 'Kilometer').
 * @param {string} targetUnitName - The name of the target unit (e.g., 'Mile').
 * @returns {{value: number, symbol: string}} An object containing the converted value and the target unit's symbol, or null if conversion fails.
 */
export function convertUnits(value, sourceUnitName, targetUnitName) {
    if (typeof value !== 'number' || isNaN(value)) {
        return { value: NaN, symbol: '' };
    }

    let sourceCat = null;
    let targetCat = null;
    let sourceUnitDef = null;
    let targetUnitDef = null;

    // 1. Find the Category and Unit Definitions for both source and target.
    for (const catName in conversionData) {
        const category = conversionData[catName];
        
        if (category.units[sourceUnitName]) {
            sourceCat = category;
            sourceUnitDef = category.units[sourceUnitName];
        }
        
        if (category.units[targetUnitName]) {
            targetCat = category;
            targetUnitDef = category.units[targetUnitName];
        }
    }

    // Check if units were found and belong to the same category
    if (!sourceUnitDef || !targetUnitDef || sourceCat !== targetCat) {
        console.error("Conversion Error: Units not found or belong to different categories.");
        return null;
    }

    // The category is the same for both
    const category = sourceCat;
    let convertedValue;

    // 2. Handle Dynamic/External Conversions (e.g., Currency)
    if (category.convert) {
        // This relies on an external/dynamic function (like convertCurrency)
        convertedValue = category.convert(value, sourceUnitName, targetUnitName);
    } 
    
    // 3. Handle Static Conversions (Linear and Non-Linear)
    else {
        // --- Step 3a: Convert Source to Base Unit ---
        let baseValue;
        const sourceToBase = sourceUnitDef.toBase;

        if (typeof sourceToBase === 'function') {
            // Non-linear conversion (e.g., Temperature, L/100km)
            baseValue = sourceToBase(value);
        } else {
            // Linear conversion (value * factor)
            baseValue = value * sourceToBase;
        }

        // --- Step 3b: Convert Base Unit to Target Unit ---
        const baseToTarget = targetUnitDef.fromBase;

        if (typeof baseToTarget === 'function') {
            // Non-linear conversion (e.g., Temperature, L/100km)
            convertedValue = baseToTarget(baseValue);
        } else {
            // Linear conversion (baseValue / factor)
            // Note: If targetUnitDef.toBase is X, then fromBase is 1/X
            const factor = targetUnitDef.toBase;
            convertedValue = baseValue / factor;
        }
    }

    // 4. Round the result based on category precision
    const precision = category.precision;
    const roundedValue = parseFloat(convertedValue.toFixed(precision));

    // 5. Return the result and the target symbol
    return {
        value: roundedValue,
        symbol: targetUnitDef.symbol
    };
}
