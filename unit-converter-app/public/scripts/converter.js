import { conversionData } from "./units.js";

/**
 * Transforms the conversionData object into a structured array 
 * for easier UI population.
 * @returns {Array<Object>} Array of categories with their units.
 */
export function getUnitCategories() {
    const categoriesArray = [];

    for (const catKey in conversionData) {
        if (Object.hasOwnProperty.call(conversionData, catKey)) {
            const category = conversionData[catKey];
            const unitsList = [];

            // Populate units, checking if units are defined or need listing (like currency)
            const unitsSource = category.units || (category.list ? category.list() : {});

            for (const unitKey in unitsSource) {
                if (Object.hasOwnProperty.call(unitsSource, unitKey)) {
                    const unitDef = unitsSource[unitKey];
                    
                    unitsList.push({
                        key: unitKey,
                        name: unitDef.name, 
                        symbol: unitDef.symbol
                    });
                }
            }

            categoriesArray.push({
                key: catKey,
                name: category.name,
                icon: category.icon,
                precision: category.precision,
                units: unitsList
            });
        }
    }
    return categoriesArray;
}


/**
 * Converts a value from one unit to another within the same category.
 * @param {number} value - The numerical value to convert.
 * @param {string} sourceUnitName - The name of the source unit (e.g., 'Mile').
 * @param {string} targetUnitName - The name of the target unit (e.g., 'Kilometer').
 * @returns {{value: (number|string), symbol: string} | null} Converted value and symbol, or null on error.
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
        const unitsSource = category.units || (category.list ? category.list() : {});
        
        if (unitsSource[sourceUnitName]) {
            sourceCat = category;
            sourceUnitDef = unitsSource[sourceUnitName];
        }
        
        if (unitsSource[targetUnitName]) {
            targetCat = category;
            targetUnitDef = unitsSource[targetUnitName];
        }
    }

    if (!sourceUnitDef || !targetUnitDef || sourceCat !== targetCat) {
        return null; // Incompatible units or not found
    }

    const category = sourceCat;
    let convertedValue;

    // 2. Handle Dynamic/External Conversions (e.g., Currency)
    if (category.convert) {
        // The convert function handles the entire conversion (source to target)
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
            const factor = targetUnitDef.toBase;
            convertedValue = baseValue / factor;
        }
    }

    // 4. Round the result based on category precision, handling scientific notation for extremes
    const precision = category.precision;
    
    if (Math.abs(convertedValue) >= 1e12 || (Math.abs(convertedValue) > 0 && Math.abs(convertedValue) <= 1e-6)) {
        return {
            value: convertedValue.toExponential(precision),
            symbol: targetUnitDef.symbol
        };
    }
    
    const roundedValue = parseFloat(convertedValue.toFixed(precision));

    // 5. Return the result and the target symbol
    return {
        value: roundedValue,
        symbol: targetUnitDef.symbol
    };
}
